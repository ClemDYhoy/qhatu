import express from 'express';
import { Op, Sequelize } from 'sequelize';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

const router = express.Router();

// ============================================
// === UTILIDADES ===
// ============================================

/**
 * Parsea un número flotante de forma segura
 */
const parseNumber = (value, defaultValue = 0) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) || parsed < 0 ? defaultValue : parsed;
};

/**
 * Parsea un entero de forma segura
 */
const parseInt32 = (value, defaultValue = 0) => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) || parsed < 0 ? defaultValue : parsed;
};

/**
 * Obtiene IDs de una categoría y todas sus subcategorías
 */
const getCategoryAndSubcategories = async (categoryId) => {
  const catId = parseInt32(categoryId);
  if (catId <= 0) return [];

  try {
    const category = await Category.findByPk(catId, {
      attributes: ['categoria_id']
    });

    if (!category) return [];

    const subCategories = await Category.findAll({
      where: { padre_id: catId },
      attributes: ['categoria_id']
    });

    return [catId, ...subCategories.map(c => c.categoria_id)];
  } catch (error) {
    console.error('Error al obtener subcategorías:', error);
    return [catId];
  }
};

/**
 * Construye el objeto where para filtros de disponibilidad
 */
const buildAvailabilityFilter = (availability) => {
  const avail = availability.toLowerCase();
  
  switch (avail) {
    case 'in_stock':
      return { stock: { [Op.gt]: 0 } };
    
    case 'out':
    case 'out_of_stock':
      return { stock: 0 };
    
    case 'low':
    case 'low_stock':
      return {
        [Op.and]: [
          { stock: { [Op.gt]: 0 } },
          Sequelize.where(
            Sequelize.col('stock'),
            Op.lte,
            Sequelize.col('umbral_bajo_stock')
          )
        ]
      };
    
    case 'critical':
      return {
        [Op.and]: [
          { stock: { [Op.gt]: 0 } },
          Sequelize.where(
            Sequelize.col('stock'),
            Op.lte,
            Sequelize.col('umbral_critico_stock')
          )
        ]
      };
    
    default:
      return {};
  }
};

/**
 * Valida y sanitiza parámetros de ordenamiento
 */
const sanitizeOrderParams = (orderBy = 'nombre', order = 'ASC') => {
  const validFields = ['nombre', 'precio', 'stock', 'ventas', 'creado_en', 'actualizado_en'];
  const field = validFields.includes(orderBy) ? orderBy : 'nombre';
  const direction = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  return { field, direction };
};

/**
 * Calcula metadata de paginación
 */
const calculatePagination = (total, limit, offset) => {
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;
  
  return {
    total,
    limit,
    offset,
    currentPage,
    totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
};

// ============================================
// === RUTAS ESPECÍFICAS ===
// ============================================

/**
 * GET /api/products/featured
 * Productos destacados (destacado = 1)
 */
router.get('/featured', async (req, res) => {
  try {
    const limit = Math.min(parseInt32(req.query.limit, 7), 20);

    const products = await Product.findAll({
      where: {
        destacado: 1,
        stock: { [Op.gt]: 0 }
      },
      include: [{
        model: Category,
        as: 'categoria',
        attributes: ['categoria_id', 'nombre']
      }],
      order: [['ventas', 'DESC']], // Ordenar por más vendidos primero
      limit
    });

    res.json({
      success: true,
      data: products,
      count: products.length
    });

  } catch (error) {
    console.error('Error en /featured:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos destacados',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/products/best-sellers
 * Productos más vendidos basados en la tabla ventas_realizadas_items
 * Calcula las ventas REALES sumando cantidades vendidas
 */
router.get('/best-sellers', async (req, res) => {
  try {
    const limit = Math.min(parseInt32(req.query.limit, 7), 20);

    // Subconsulta para obtener el total de ventas por producto
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
      order: [['ventas', 'DESC']], // Ordenar por campo ventas
      limit
    });

    res.json({
      success: true,
      data: products,
      count: products.length
    });

  } catch (error) {
    console.error('Error en /best-sellers:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos más vendidos',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/products/low-stock
 * Productos con stock bajo (stock <= umbral_bajo_stock Y stock > 0)
 */
router.get('/low-stock', async (req, res) => {
  try {
    const limit = Math.min(parseInt32(req.query.limit, 7), 20);

    const products = await Product.findAll({
      where: {
        [Op.and]: [
          { stock: { [Op.gt]: 0 } },
          Sequelize.where(
            Sequelize.col('stock'),
            Op.lte,
            Sequelize.col('umbral_bajo_stock')
          )
        ]
      },
      include: [{
        model: Category,
        as: 'categoria',
        attributes: ['categoria_id', 'nombre']
      }],
      order: [['stock', 'ASC']], // Ordenar por menor stock primero
      limit
    });

    res.json({
      success: true,
      data: products,
      count: products.length
    });

  } catch (error) {
    console.error('Error en /low-stock:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos con stock bajo',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/products/by-category/:categoryId
 * Productos por categoría específica (incluye subcategorías)
 */
router.get('/by-category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const limit = Math.min(parseInt32(req.query.limit, 7), 20);

    const categoryIds = await getCategoryAndSubcategories(categoryId);
    
    if (categoryIds.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
    }

    const products = await Product.findAll({
      where: { 
        categoria_id: { [Op.in]: categoryIds },
        stock: { [Op.gt]: 0 }
      },
      include: [{
        model: Category,
        as: 'categoria',
        attributes: ['categoria_id', 'nombre', 'padre_id']
      }],
      order: [['ventas', 'DESC']], // Priorizar más vendidos
      limit
    });

    res.json({
      success: true,
      data: products,
      count: products.length,
      categoryId: parseInt32(categoryId)
    });

  } catch (error) {
    console.error('Error en /by-category/:categoryId:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos por categoría',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/products/recent
 * Productos recientes (ordenados por fecha de creación)
 */
router.get('/recent', async (req, res) => {
  try {
    const limit = Math.min(parseInt32(req.query.limit, 7), 20);

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
      limit
    });

    res.json({
      success: true,
      data: products,
      count: products.length
    });

  } catch (error) {
    console.error('Error en /recent:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos recientes',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/products/stats-by-category
 * Estadísticas de productos agrupados por categoría
 */
router.get('/stats-by-category', async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['categoria_id', 'nombre', 'padre_id']
    });

    const productCounts = await Product.findAll({
      attributes: [
        'categoria_id',
        [Sequelize.fn('COUNT', Sequelize.col('producto_id')), 'total_productos'],
        [Sequelize.fn('SUM', Sequelize.literal('CASE WHEN stock > 0 THEN 1 ELSE 0 END')), 'disponibles']
      ],
      group: ['categoria_id'],
      raw: true
    });

    const countsMap = productCounts.reduce((map, count) => {
      map[count.categoria_id] = {
        total: parseInt(count.total_productos) || 0,
        disponibles: parseInt(count.disponibles) || 0
      };
      return map;
    }, {});

    const mainCategories = categories
      .filter(cat => !cat.padre_id)
      .map(cat => {
        const subCategories = categories.filter(sub => sub.padre_id === cat.categoria_id);
        
        let totalCount = countsMap[cat.categoria_id]?.total || 0;
        let disponiblesCount = countsMap[cat.categoria_id]?.disponibles || 0;
        
        subCategories.forEach(sub => {
          totalCount += countsMap[sub.categoria_id]?.total || 0;
          disponiblesCount += countsMap[sub.categoria_id]?.disponibles || 0;
        });

        return {
          categoria_id: cat.categoria_id,
          nombre: cat.nombre,
          total_productos: totalCount,
          disponibles: disponiblesCount,
          agotados: totalCount - disponiblesCount,
          subcategorias: subCategories.map(sub => ({
            categoria_id: sub.categoria_id,
            nombre: sub.nombre,
            total_productos: countsMap[sub.categoria_id]?.total || 0,
            disponibles: countsMap[sub.categoria_id]?.disponibles || 0
          }))
        };
      })
      .filter(cat => cat.total_productos > 0);

    const totalGeneral = mainCategories.reduce((sum, cat) => sum + cat.total_productos, 0);

    res.json({
      success: true,
      data: {
        total_general: totalGeneral,
        categorias: mainCategories
      }
    });

  } catch (error) {
    console.error('Error en /stats-by-category:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas por categoría',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/products/price-range
 * Rango de precios min/max
 */
router.get('/price-range', async (req, res) => {
  try {
    const { categoria_id } = req.query;
    const where = {};

    if (categoria_id) {
      const categoryIds = await getCategoryAndSubcategories(categoria_id);
      if (categoryIds.length > 0) {
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
        max: parseNumber(result?.max, 1000)
      }
    });

  } catch (error) {
    console.error('Error en /price-range:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener rango de precios',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/products/search
 * Búsqueda rápida de productos
 */
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Parámetro de búsqueda "q" requerido'
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
      order: [['ventas', 'DESC']],
      limit: validLimit
    });

    res.json({
      success: true,
      data: products,
      query: q.trim(),
      count: products.length
    });

  } catch (error) {
    console.error('Error en /search:', error);
    res.status(500).json({
      success: false,
      error: 'Error en la búsqueda',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// === RUTA PRINCIPAL CON FILTROS ===
// ============================================

/**
 * GET /api/products
 * Lista de productos con filtros avanzados
 */
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
      destacado,
      low_stock,
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

    // === FILTROS ===

    // Búsqueda por texto
    if (search?.trim()) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${search.trim()}%` } },
        { descripcion: { [Op.like]: `%${search.trim()}%` } }
      ];
    }

    // Filtro por categoría (ID directo)
    if (categoria_id) {
      const categoryIds = await getCategoryAndSubcategories(categoria_id);
      if (categoryIds.length > 0) {
        where.categoria_id = { [Op.in]: categoryIds };
      }
    }
    // Filtro por nombre de categoría
    else if (category?.trim()) {
      const cat = await Category.findOne({
        where: Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('nombre')),
          'LIKE',
          `%${category.trim().toLowerCase()}%`
        )
      });

      if (cat) {
        const categoryIds = await getCategoryAndSubcategories(cat.categoria_id);
        where.categoria_id = { [Op.in]: categoryIds };
      }
    }

    // Rango de precios
    if (priceMin || priceMax) {
      where.precio = {};
      if (priceMin) where.precio[Op.gte] = parseNumber(priceMin);
      if (priceMax) where.precio[Op.lte] = parseNumber(priceMax);
    }

    // Disponibilidad
    if (availability) {
      Object.assign(where, buildAvailabilityFilter(availability));
    }

    // Productos destacados (soporta ambos parámetros)
    if (highlighted === 'true' || highlighted === '1' || 
        destacado === 'true' || destacado === '1' || destacado === 1) {
      where.destacado = 1;
    }

    // Stock bajo
    if (low_stock === 'true' || low_stock === '1') {
      where[Op.and] = [
        { stock: { [Op.gt]: 0 } },
        Sequelize.where(
          Sequelize.col('stock'),
          Op.lte,
          Sequelize.col('umbral_bajo_stock')
        )
      ];
    }

    // === ORDENAMIENTO Y PAGINACIÓN ===

    const { field, direction } = sanitizeOrderParams(orderBy, order);
    const limitNum = Math.min(parseInt32(limit, 12), 100);
    const offsetNum = parseInt32(offset, 0);

    // === CONSULTA ===

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include,
      order: [[field, direction]],
      limit: limitNum,
      offset: offsetNum,
      distinct: true
    });

    res.json({
      success: true,
      data: products,
      pagination: calculatePagination(count, limitNum, offsetNum)
    });

  } catch (error) {
    console.error('Error en GET /products:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/products/:id
 * Obtener un producto específico por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const productId = parseInt32(req.params.id);

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
    console.error('Error en GET /:id:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener producto',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;