import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { Op } from 'sequelize';

// Obtener todos los productos con filtros
export const getAllProducts = async (req, res) => {
  try {
    const {
      categoria_id,
      search,
      minPrecio,
      maxPrecio,
      enStock,
      orderBy = 'nombre',
      order = 'ASC',
      limit = 12,
      offset = 0
    } = req.query;

    // Construir condiciones de búsqueda
    const where = { activo: true };

    // Filtro por categoría
    if (categoria_id) {
      where.categoria_id = categoria_id;
    }

    // Filtro por búsqueda
    if (search) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },
        { descripcion: { [Op.like]: `%${search}%` } }
      ];
    }

    // Filtro por rango de precio
    if (minPrecio || maxPrecio) {
      where.precio = {};
      if (minPrecio) where.precio[Op.gte] = parseFloat(minPrecio);
      if (maxPrecio) where.precio[Op.lte] = parseFloat(maxPrecio);
    }

    // Filtro por stock
    if (enStock === 'true') {
      where.stock = { [Op.gt]: 0 };
    } else if (enStock === 'false') {
      where.stock = 0;
    }

    // Ejecutar consulta
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [{
        model: Category,
        as: 'categoria',
        attributes: ['categoria_id', 'nombre']
      }],
      order: [[orderBy, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      total: count,
      productos: products,
      page: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
      totalPages: Math.ceil(count / parseInt(limit))
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      error: 'Error al obtener productos',
      message: error.message
    });
  }
};

// Obtener un producto por ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [{
        model: Category,
        as: 'categoria',
        attributes: ['categoria_id', 'nombre']
      }]
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({
      error: 'Error al obtener producto',
      message: error.message
    });
  }
};

// Obtener productos destacados (más vendidos)
export const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 4 } = req.query;

    const products = await Product.findAll({
      where: {
        activo: true,
        destacado: true, // Asume que tienes este campo
        stock: { [Op.gt]: 0 }
      },
      include: [{
        model: Category,
        as: 'categoria',
        attributes: ['categoria_id', 'nombre']
      }],
      order: [['ventas', 'DESC']], // Ordena por ventas
      limit: parseInt(limit)
    });

    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos destacados:', error);
    res.status(500).json({
      error: 'Error al obtener productos destacados',
      message: error.message
    });
  }
};

// Obtener productos más vendidos
export const getBestSellers = async (req, res) => {
  try {
    const { limit = 4 } = req.query;

    const products = await Product.findAll({
      where: {
        activo: true,
        stock: { [Op.gt]: 0 }
      },
      include: [{
        model: Category,
        as: 'categoria',
        attributes: ['categoria_id', 'nombre']
      }],
      order: [['ventas', 'DESC']],
      limit: parseInt(limit)
    });

    res.json(products);
  } catch (error) {
    console.error('Error al obtener más vendidos:', error);
    res.status(500).json({
      error: 'Error al obtener más vendidos',
      message: error.message
    });
  }
};

// Obtener productos recientes
export const getRecentProducts = async (req, res) => {
  try {
    const { limit = 4 } = req.query;

    const products = await Product.findAll({
      where: {
        activo: true,
        stock: { [Op.gt]: 0 }
      },
      include: [{
        model: Category,
        as: 'categoria',
        attributes: ['categoria_id', 'nombre']
      }],
      order: [['creado_en', 'DESC']],
      limit: parseInt(limit)
    });

    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos recientes:', error);
    res.status(500).json({
      error: 'Error al obtener productos recientes',
      message: error.message
    });
  }
};

// Obtener productos por categoría
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { limit = 12, offset = 0 } = req.query;

    const { count, rows: products } = await Product.findAndCountAll({
      where: {
        categoria_id: categoryId,
        activo: true
      },
      include: [{
        model: Category,
        as: 'categoria',
        attributes: ['categoria_id', 'nombre']
      }],
      order: [['nombre', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      total: count,
      productos: products,
      page: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
      totalPages: Math.ceil(count / parseInt(limit))
    });
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    res.status(500).json({
      error: 'Error al obtener productos por categoría',
      message: error.message
    });
  }
};

// Obtener rango de precios de productos
export const getPriceRange = async (req, res) => {
  try {
    const { categoria_id } = req.query;
    const where = { activo: true };

    if (categoria_id) {
      where.categoria_id = categoria_id;
    }

    const products = await Product.findAll({
      where,
      attributes: ['precio'],
      raw: true
    });

    if (products.length === 0) {
      return res.json({ min: 0, max: 0 });
    }

    const prices = products.map(p => parseFloat(p.precio));
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    res.json({ min, max });
  } catch (error) {
    console.error('Error al obtener rango de precios:', error);
    res.status(500).json({
      error: 'Error al obtener rango de precios',
      message: error.message
    });
  }
};