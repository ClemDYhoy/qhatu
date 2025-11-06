import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { Op, Sequelize } from 'sequelize';

// Utilidades de validación
const parseNumber = (value, defaultValue = 0) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

const parseInt32 = (value, defaultValue = 0) => {
  const parsed = parseInt(value);
  return isNaN(parsed) || parsed < 0 ? defaultValue : parsed;
};

// Obtener todos los productos con filtros avanzados
export const getAllProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      categoria_id,
      minPrecio,
      maxPrecio,
      priceMin,
      priceMax,
      enStock,
      availability,
      destacado,
      highlighted,
      orderBy = 'nombre',
      order = 'ASC',
      limit = 12,
      offset = 0
    } = req.query;

    const where = {};
    const include = [{
      model: Category,
      as: 'categoria',
      attributes: ['categoria_id', 'nombre', 'padre_id']
    }];

    // Filtro de búsqueda por texto
    if (search && search.trim()) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${search.trim()}%` } },
        { descripcion: { [Op.like]: `%${search.trim()}%` } }
      ];
    }

    // Filtro por categoría (por ID directo)
    if (categoria_id) {
      const catId = parseInt32(categoria_id);
      if (catId > 0) {
        // Obtener categoría y sus subcategorías
        const subCategories = await Category.findAll({
          where: { padre_id: catId },
          attributes: ['categoria_id']
        });

        const categoryIds = [catId, ...subCategories.map(c => c.categoria_id)];
        where.categoria_id = { [Op.in]: categoryIds };
      }
    }
    // Filtro por categoría (por nombre)
    else if (category && category.trim()) {
      const cat = await Category.findOne({
        where: { nombre: { [Op.like]: `%${category.trim()}%` } }
      });

      if (cat) {
        // Incluir subcategorías
        const subCategories = await Category.findAll({
          where: { padre_id: cat.categoria_id },
          attributes: ['categoria_id']
        });

        const categoryIds = [cat.categoria_id, ...subCategories.map(c => c.categoria_id)];
        where.categoria_id = { [Op.in]: categoryIds };
      }
    }

    // Filtro por rango de precio (soporta ambas nomenclaturas)
    const minPrice = priceMin || minPrecio;
    const maxPrice = priceMax || maxPrecio;
    
    if (minPrice || maxPrice) {
      where.precio = {};
      if (minPrice) {
        const min = parseNumber(minPrice, 0);
        if (min >= 0) where.precio[Op.gte] = min;
      }
      if (maxPrice) {
        const max = parseNumber(maxPrice, 999999);
        if (max > 0) where.precio[Op.lte] = max;
      }
    }

    // Filtro por disponibilidad (soporta ambas nomenclaturas)
    const stockFilter = availability || enStock;
    if (stockFilter) {
      switch (stockFilter.toString().toLowerCase()) {
        case 'true':
        case 'in_stock':
          where.stock = { [Op.gt]: 0 };
          break;
        case 'false':
        case 'out':
        case 'out_of_stock':
          where.stock = 0;
          break;
        case 'low':
          where[Op.and] = [
            { stock: { [Op.gt]: 0 } },
            Sequelize.where(
              Sequelize.col('stock'),
              Op.lte,
              Sequelize.col('umbral_bajo_stock')
            )
          ];
          break;
        case 'critical':
          where[Op.and] = [
            { stock: { [Op.gt]: 0 } },
            Sequelize.where(
              Sequelize.col('stock'),
              Op.lte,
              Sequelize.col('umbral_critico_stock')
            )
          ];
          break;
      }
    }

    // Filtro por productos destacados (soporta ambas nomenclaturas)
    const featuredFilter = highlighted || destacado;
    if (featuredFilter === 'true' || featuredFilter === '1' || featuredFilter === true) {
      where.destacado = true;
    }

    // Validar y sanitizar ordenamiento
    const validOrderFields = ['nombre', 'precio', 'stock', 'ventas', 'creado_en', 'actualizado_en'];
    const sanitizedOrderBy = validOrderFields.includes(orderBy) ? orderBy : 'nombre';
    const sanitizedOrder = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';

    // Validar paginación
    const validLimit = Math.min(parseInt32(limit, 12), 100); // Máximo 100 productos por página
    const validOffset = parseInt32(offset, 0);

    // Ejecutar consulta
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include,
      order: [[sanitizedOrderBy, sanitizedOrder]],
      limit: validLimit,
      offset: validOffset,
      distinct: true
    });

    // Calcular metadata de paginación
    const totalPages = Math.ceil(count / validLimit);
    const currentPage = Math.floor(validOffset / validLimit) + 1;

    res.json({
      success: true,
      data: products,
      productos: products, // Compatibilidad con frontend antiguo
      total: count,
      pagination: {
        total: count,
        limit: validLimit,
        offset: validOffset,
        page: currentPage,
        currentPage,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
      }
    });

  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

// Obtener un producto por ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt32(id);

    if (productId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'ID de producto inválido'
      });
    }

    const product = await Product.findByPk(productId, {
      include: [{
        model: Category,
        as: 'categoria',
        attributes: ['categoria_id', 'nombre', 'padre_id']
      }]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener producto',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

// Obtener productos destacados
export const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    const validLimit = Math.min(parseInt32(limit, 4), 20);

    const products = await Product.findAll({
      where: {
        destacado: true,
        stock: { [Op.gt]: 0 }
      },
      include: [{
        model: Category,
        as: 'categoria',
        attributes: ['categoria_id', 'nombre', 'padre_id']
      }],
      order: [['ventas', 'DESC'], ['creado_en', 'DESC']],
      limit: validLimit
    });

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Error al obtener productos destacados:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos destacados',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

// Obtener productos más vendidos
export const getBestSellers = async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    const validLimit = Math.min(parseInt32(limit, 4), 20);

    const products = await Product.findAll({
      where: {
        stock: { [Op.gt]: 0 },
        ventas: { [Op.gt]: 0 }
      },
      include: [{
        model: Category,
        as: 'categoria',
        attributes: ['categoria_id', 'nombre', 'padre_id']
      }],
      order: [['ventas', 'DESC'], ['nombre', 'ASC']],
      limit: validLimit
    });

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Error al obtener más vendidos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener más vendidos',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

// Obtener productos recientes
export const getRecentProducts = async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    const validLimit = Math.min(parseInt32(limit, 4), 20);

    const products = await Product.findAll({
      where: {
        stock: { [Op.gt]: 0 }
      },
      include: [{
        model: Category,
        as: 'categoria',
        attributes: ['categoria_id', 'nombre', 'padre_id']
      }],
      order: [['creado_en', 'DESC']],
      limit: validLimit
    });

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Error al obtener productos recientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos recientes',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

// Obtener productos por categoría
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { limit = 12, offset = 0 } = req.query;
    
    const catId = parseInt32(categoryId);
    
    if (catId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'ID de categoría inválido'
      });
    }

    // Obtener categoría y sus subcategorías
    const subCategories = await Category.findAll({
      where: { padre_id: catId },
      attributes: ['categoria_id']
    });

    const categoryIds = [catId, ...subCategories.map(c => c.categoria_id)];

    const validLimit = Math.min(parseInt32(limit, 12), 100);
    const validOffset = parseInt32(offset, 0);

    const { count, rows: products } = await Product.findAndCountAll({
      where: {
        categoria_id: { [Op.in]: categoryIds }
      },
      include: [{
        model: Category,
        as: 'categoria',
        attributes: ['categoria_id', 'nombre', 'padre_id']
      }],
      order: [['nombre', 'ASC']],
      limit: validLimit,
      offset: validOffset,
      distinct: true
    });

    const totalPages = Math.ceil(count / validLimit);
    const currentPage = Math.floor(validOffset / validLimit) + 1;

    res.json({
      success: true,
      data: products,
      productos: products, // Compatibilidad
      total: count,
      pagination: {
        total: count,
        limit: validLimit,
        offset: validOffset,
        page: currentPage,
        currentPage,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
      }
    });

  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos por categoría',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

// Obtener rango de precios
export const getPriceRange = async (req, res) => {
  try {
    const { categoria_id } = req.query;
    const where = {};

    if (categoria_id) {
      const catId = parseInt32(categoria_id);
      if (catId > 0) {
        // Incluir subcategorías
        const subCategories = await Category.findAll({
          where: { padre_id: catId },
          attributes: ['categoria_id']
        });

        const categoryIds = [catId, ...subCategories.map(c => c.categoria_id)];
        where.categoria_id = { [Op.in]: categoryIds };
      }
    }

    const result = await Product.findOne({
      where,
      attributes: [
        [Sequelize.fn('MIN', Sequelize.col('precio')), 'min'],
        [Sequelize.fn('MAX', Sequelize.col('precio')), 'max']
      ],
      raw: true
    });

    res.json({
      success: true,
      data: {
        min: parseNumber(result?.min, 0),
        max: parseNumber(result?.max, 0)
      },
      // Compatibilidad con frontend antiguo
      min: parseNumber(result?.min, 0),
      max: parseNumber(result?.max, 0)
    });

  } catch (error) {
    console.error('Error al obtener rango de precios:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener rango de precios',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

// Buscar productos (endpoint adicional para búsqueda específica)
export const searchProducts = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: [],
        message: 'Consulta de búsqueda demasiado corta'
      });
    }

    const validLimit = Math.min(parseInt32(limit, 10), 50);

    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.like]: `%${q.trim()}%` } },
          { descripcion: { [Op.like]: `%${q.trim()}%` } }
        ],
        stock: { [Op.gt]: 0 }
      },
      include: [{
        model: Category,
        as: 'categoria',
        attributes: ['categoria_id', 'nombre']
      }],
      limit: validLimit,
      order: [
        ['destacado', 'DESC'],
        ['ventas', 'DESC'],
        ['nombre', 'ASC']
      ]
    });

    res.json({
      success: true,
      data: products,
      total: products.length
    });

  } catch (error) {
    console.error('Error en búsqueda de productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error en búsqueda de productos',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};