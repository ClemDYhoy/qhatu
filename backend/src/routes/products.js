import express from 'express';
import { Op, Sequelize } from 'sequelize';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

const router = express.Router();

// === Utilidades ===
const parseNumber = (value, defaultValue = 0) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) || parsed < 0 ? defaultValue : parsed;
};

const parseInt32 = (value, defaultValue = 0) => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) || parsed < 0 ? defaultValue : parsed;
};

// === Función auxiliar: Obtener IDs de categoría + subcategorías ===
const getCategoryAndSubcategories = async (categoryId) => {
  const catId = parseInt32(categoryId);
  if (catId <= 0) return [];

  const category = await Category.findByPk(catId, { attributes: ['categoria_id'] });
  if (!category) return [];

  const subCategories = await Category.findAll({
    where: { padre_id: catId },
    attributes: ['categoria_id']
  });

  return [catId, ...subCategories.map(c => c.categoria_id)];
};

// === GET /api/products - Lista con filtros avanzados ===
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

    // Búsqueda por texto
    if (search?.trim()) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${search.trim()}%` } },
        { descripcion: { [Op.like]: `%${search.trim()}%` } }
      ];
    }

    // Filtro por categoría (por ID)
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
      const avail = availability.toLowerCase();
      if (['in_stock', 'low', 'critical', 'out', 'out_of_stock'].includes(avail)) {
        if (avail === 'in_stock') where.stock = { [Op.gt]: 0 };
        else if (avail === 'out' || avail === 'out_of_stock') where.stock = 0;
        else if (avail === 'low') {
          where[Op.and] = [
            { stock: { [Op.gt]: 0 } },
            Sequelize.where(Sequelize.col('stock'), Op.lte, Sequelize.col('umbral_bajo_stock'))
          ];
        }
        else if (avail === 'critical') {
          where[Op.and] = [
            { stock: { [Op.gt]: 0 } },
            Sequelize.where(Sequelize.col('stock'), Op.lte, Sequelize.col('umbral_critico_stock'))
          ];
        }
      }
    }

    // Destacados
    if (highlighted === 'true' || highlighted === '1') {
      where.destacado = true;
    }

    // Ordenamiento seguro
    const validFields = ['nombre', 'precio', 'stock', 'ventas', 'creado_en'];
    const orderField = validFields.includes(orderBy) ? orderBy : 'nombre';
    const orderDir = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Paginación
    const limitNum = Math.min(parseInt32(limit, 12), 100);
    const offsetNum = parseInt32(offset, 0);

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include,
      order: [[orderField, orderDir]],
      limit: limitNum,
      offset: offsetNum,
      distinct: true
    });

    const totalPages = Math.ceil(count / limitNum);
    const currentPage = Math.floor(offsetNum / limitNum) + 1;

    res.json({
      success: true,
      data: products,
      pagination: {
        total: count,
        limit: limitNum,
        offset: offsetNum,
        currentPage,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
      }
    });

  } catch (error) {
    console.error('Error en GET /products:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno al obtener productos'
    });
  }
});

// === NUEVA RUTA: GET /api/products/category/:categoryId ===
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { limit = 12, offset = 0, orderBy = 'nombre', order = 'ASC' } = req.query;

    const categoryIds = await getCategoryAndSubcategories(categoryId);
    if (categoryIds.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
    }

    const limitNum = Math.min(parseInt32(limit, 12), 100);
    const offsetNum = parseInt32(offset, 0);
    const orderField = ['nombre', 'precio', 'stock', 'ventas'].includes(orderBy) ? orderBy : 'nombre';
    const orderDir = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const { count, rows: products } = await Product.findAndCountAll({
      where: { categoria_id: { [Op.in]: categoryIds } },
      include: [{
        model: Category,
        as: 'categoria',
        attributes: ['categoria_id', 'nombre', 'padre_id']
      }],
      order: [[orderField, orderDir]],
      limit: limitNum,
      offset: offsetNum
    });

    const totalPages = Math.ceil(count / limitNum);
    const currentPage = Math.floor(offsetNum / limitNum) + 1;

    res.json({
      success: true,
      data: products,
      categoryId: parseInt32(categoryId),
      pagination: {
        total: count,
        limit: limitNum,
        offset: offsetNum,
        currentPage,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
      }
    });

  } catch (error) {
    console.error('Error en GET /category/:categoryId:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos por categoría'
    });
  }
});

// === GET /api/products/featured ===
router.get('/featured', async (req, res) => {
  try {
    const limit = Math.min(parseInt32(req.query.limit, 4), 20);
    const products = await Product.findAll({
      where: { destacado: true, stock: { [Op.gt]: 0 } },
      include: { model: Category, as: 'categoria', attributes: ['categoria_id', 'nombre'] },
      order: [['ventas', 'DESC']],
      limit
    });

    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error en /featured:', error);
    res.status(500).json({ success: false, error: 'Error al obtener destacados' });
  }
});

// === GET /api/products/best-sellers ===
router.get('/best-sellers', async (req, res) => {
  try {
    const limit = Math.min(parseInt32(req.query.limit, 4), 20);
    const products = await Product.findAll({
      where: { stock: { [Op.gt]: 0 }, ventas: { [Op.gt]: 0 } },
      include: { model: Category, as: 'categoria', attributes: ['categoria_id', 'nombre'] },
      order: [['ventas', 'DESC']],
      limit
    });

    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error en /best-sellers:', error);
    res.status(500).json({ success: false, error: 'Error al obtener más vendidos' });
  }
});

// === GET /api/products/recent ===
router.get('/recent', async (req, res) => {
  try {
    const limit = Math.min(parseInt32(req.query.limit, 4), 20);
    const products = await Product.findAll({
      where: { stock: { [Op.gt]: 0 } },
      include: { model: Category, as: 'categoria', attributes: ['categoria_id', 'nombre'] },
      order: [['creado_en', 'DESC']],
      limit
    });

    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error en /recent:', error);
    res.status(500).json({ success: false, error: 'Error al obtener recientes' });
  }
});

// === GET /api/products/price-range ===
router.get('/price-range', async (req, res) => {
  try {
    const { categoria_id } = req.query;
    const where = {};

    if (categoria_id) {
      const catIds = await getCategoryAndSubcategories(categoria_id);
      if (catIds.length > 0) where.categoria_id = { [Op.in]: catIds };
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
    console.error('Error en /price-range:', error);
    res.status(500).json({ success: false, error: 'Error al obtener rango de precios' });
  }
});

// === GET /api/products/:id ===
router.get('/:id', async (req, res) => {
  try {
    const productId = parseInt32(req.params.id);
    if (productId <= 0) {
      return res.status(400).json({ success: false, error: 'ID inválido' });
    }

    const product = await Product.findByPk(productId, {
      include: { model: Category, as: 'categoria', attributes: ['categoria_id', 'nombre', 'padre_id'] }
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error en GET /:id:', error);
    res.status(500).json({ success: false, error: 'Error al obtener producto' });
  }
});

export default router;

