import express from 'express';
import { Op, Sequelize } from 'sequelize';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

const router = express.Router();

// Utilidades
const parseNumber = (value, defaultValue = 0) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

const parseInt32 = (value, defaultValue = 0) => {
  const parsed = parseInt(value);
  return isNaN(parsed) || parsed < 0 ? defaultValue : parsed;
};

// GET /api/products - Obtener productos con filtros avanzados
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      categoria_id,
      priceMin,
      priceMax,
      availability,
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

    // Filtro por rango de precio
    if (priceMin || priceMax) {
      where.precio = {};
      if (priceMin) {
        const min = parseNumber(priceMin, 0);
        if (min >= 0) where.precio[Op.gte] = min;
      }
      if (priceMax) {
        const max = parseNumber(priceMax, 999999);
        if (max > 0) where.precio[Op.lte] = max;
      }
    }

    // Filtro por disponibilidad
    if (availability) {
      switch (availability.toLowerCase()) {
        case 'in_stock':
          where.stock = { [Op.gt]: 0 };
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
        case 'out':
        case 'out_of_stock':
          where.stock = 0;
          break;
      }
    }

    // Filtro por productos destacados
    if (highlighted === 'true' || highlighted === '1') {
      where.destacado = true;
    }

    // Validar y sanitizar ordenamiento
    const validOrderFields = ['nombre', 'precio', 'stock', 'ventas', 'creado_en'];
    const sanitizedOrderBy = validOrderFields.includes(orderBy) ? orderBy : 'nombre';
    const sanitizedOrder = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';

    // Validar paginación
    const validLimit = parseInt32(limit, 12);
    const validOffset = parseInt32(offset, 0);

    // Ejecutar consulta
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include,
      order: [[sanitizedOrderBy, sanitizedOrder]],
      limit: Math.min(validLimit, 100), // Máximo 100 productos por página
      offset: validOffset,
      distinct: true
    });

    // Calcular metadata de paginación
    const totalPages = Math.ceil(count / validLimit);
    const currentPage = Math.floor(validOffset / validLimit) + 1;

    res.json({
      success: true,
      data: products,
      pagination: {
        total: count,
        limit: validLimit,
        offset: validOffset,
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
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/products/featured - Productos destacados
router.get('/featured', async (req, res) => {
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
        attributes: ['categoria_id', 'nombre']
      }],
      order: [['ventas', 'DESC']],
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
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/products/best-sellers - Más vendidos
router.get('/best-sellers', async (req, res) => {
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
        attributes: ['categoria_id', 'nombre']
      }],
      order: [['ventas', 'DESC']],
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
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/products/recent - Productos recientes
router.get('/recent', async (req, res) => {
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
        attributes: ['categoria_id', 'nombre']
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
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/products/price-range - Rango de precios
router.get('/price-range', async (req, res) => {
  try {
    const { categoria_id } = req.query;
    const where = {};

    if (categoria_id) {
      const catId = parseInt32(categoria_id);
      if (catId > 0) where.categoria_id = catId;
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
      }
    });

  } catch (error) {
    console.error('Error al obtener rango de precios:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener rango de precios',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/products/:id - Obtener producto por ID
router.get('/:id', async (req, res) => {
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
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;