// C:\qhatu\backend\src\routes\categories.js
import express from 'express';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { Op } from 'sequelize';

const router = express.Router();

// ============================================
// UTILIDADES
// ============================================

const parseInt32 = (value, defaultValue = 0) => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) || parsed < 0 ? defaultValue : parsed;
};

// ============================================
// RUTAS PÚBLICAS
// ============================================

/**
 * GET /api/categories
 * Obtener todas las categorías con jerarquía (padre -> hijos)
 */
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { padre_id: null }, // Solo categorías padre
      include: [{
        model: Category,
        as: 'subcategorias',
        required: false,
        order: [['nombre', 'ASC']]
      }],
      order: [['nombre', 'ASC']]
    });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener categorías',
      message: error.message 
    });
  }
});

/**
 * GET /api/categories/all/flat
 * Obtener todas las categorías sin jerarquía (lista plana)
 */
router.get('/all/flat', async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['nombre', 'ASC']]
    });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error al obtener categorías planas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener categorías',
      message: error.message 
    });
  }
});

/**
 * GET /api/categories/especiales
 * Obtener categorías especiales (Descuentos y Combos)
 */
router.get('/especiales', async (req, res) => {
  try {
    const categorias = await Category.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.like]: '%Descuento%' } },
          { nombre: { [Op.like]: '%Combo%' } }
        ],
        padre_id: null
      },
      include: [{
        model: Category,
        as: 'subcategorias',
        required: false
      }],
      order: [['nombre', 'ASC']]
    });

    // Categorizar
    const descuentos = categorias.find(cat => 
      cat.nombre.toLowerCase().includes('descuento')
    );
    
    const combos = categorias.find(cat => 
      cat.nombre.toLowerCase().includes('combo')
    );

    res.json({
      success: true,
      data: {
        descuentos: descuentos || null,
        combos: combos || null
      }
    });
  } catch (error) {
    console.error('Error al obtener categorías especiales:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener categorías especiales',
      message: error.message 
    });
  }
});

/**
 * GET /api/categories/descuentos
 * Obtener categoría de descuentos con conteo de productos
 */
router.get('/descuentos', async (req, res) => {
  try {
    const categoria = await Category.findOne({
      where: {
        nombre: { [Op.like]: '%Descuento%' },
        padre_id: null
      }
    });

    if (!categoria) {
      return res.status(404).json({
        success: false,
        error: 'Categoría de descuentos no encontrada',
        message: 'Ejecuta el script SQL para crear las categorías especiales'
      });
    }

    // Contar productos con descuento activo
    const totalProductos = await Product.count({
      where: {
        precio_descuento: { [Op.ne]: null },
        [Op.and]: [
          { precio_descuento: { [Op.lt]: Product.sequelize.col('precio') } },
          { stock: { [Op.gt]: 0 } }
        ]
      }
    });

    res.json({
      success: true,
      data: {
        ...categoria.toJSON(),
        total_productos: totalProductos
      }
    });
  } catch (error) {
    console.error('Error al obtener categoría descuentos:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener categoría descuentos',
      message: error.message 
    });
  }
});

/**
 * GET /api/categories/combos
 * Obtener categoría de combos con subcategorías y conteo
 */
router.get('/combos', async (req, res) => {
  try {
    const categoria = await Category.findOne({
      where: {
        nombre: { [Op.like]: '%Combo%' },
        padre_id: null
      },
      include: [{
        model: Category,
        as: 'subcategorias',
        required: false
      }]
    });

    if (!categoria) {
      return res.status(404).json({
        success: false,
        error: 'Categoría de combos no encontrada',
        message: 'Ejecuta el script SQL para crear las categorías especiales'
      });
    }

    // Obtener IDs de subcategorías
    const subcategoriaIds = categoria.subcategorias?.map(sub => sub.categoria_id) || [];
    const allIds = [categoria.categoria_id, ...subcategoriaIds];

    // Contar productos en combos
    const totalProductos = await Product.count({
      where: {
        categoria_id: { [Op.in]: allIds },
        stock: { [Op.gt]: 0 }
      }
    });

    // Contar por subcategoría
    const subcategoriasConConteo = await Promise.all(
      (categoria.subcategorias || []).map(async (sub) => {
        const count = await Product.count({
          where: {
            categoria_id: sub.categoria_id,
            stock: { [Op.gt]: 0 }
          }
        });
        return {
          ...sub.toJSON(),
          total_productos: count
        };
      })
    );

    res.json({
      success: true,
      data: {
        ...categoria.toJSON(),
        subcategorias: subcategoriasConConteo,
        total_productos: totalProductos
      }
    });
  } catch (error) {
    console.error('Error al obtener categoría combos:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener categoría combos',
      message: error.message 
    });
  }
});

/**
 * GET /api/categories/stats
 * Estadísticas de todas las categorías con conteo de productos
 */
router.get('/stats', async (req, res) => {
  try {
    const categoriasPadre = await Category.findAll({
      where: { padre_id: null },
      include: [{
        model: Category,
        as: 'subcategorias',
        required: false
      }],
      order: [['nombre', 'ASC']]
    });

    const statsPromises = categoriasPadre.map(async (categoria) => {
      const subcategoriaIds = categoria.subcategorias?.map(sub => sub.categoria_id) || [];
      const allIds = [categoria.categoria_id, ...subcategoriaIds];

      const totalProductos = await Product.count({
        where: { categoria_id: { [Op.in]: allIds } }
      });

      const disponibles = await Product.count({
        where: {
          categoria_id: { [Op.in]: allIds },
          stock: { [Op.gt]: 0 }
        }
      });

      const subcategoriasStats = await Promise.all(
        (categoria.subcategorias || []).map(async (sub) => {
          const total = await Product.count({
            where: { categoria_id: sub.categoria_id }
          });
          const disp = await Product.count({
            where: {
              categoria_id: sub.categoria_id,
              stock: { [Op.gt]: 0 }
            }
          });
          return {
            categoria_id: sub.categoria_id,
            nombre: sub.nombre,
            total_productos: total,
            disponibles: disp
          };
        })
      );

      return {
        categoria_id: categoria.categoria_id,
        nombre: categoria.nombre,
        total_productos: totalProductos,
        disponibles,
        agotados: totalProductos - disponibles,
        subcategorias: subcategoriasStats
      };
    });

    const stats = await Promise.all(statsPromises);

    res.json({
      success: true,
      data: stats,
      total_general: stats.reduce((sum, cat) => sum + cat.total_productos, 0)
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener estadísticas',
      message: error.message 
    });
  }
});

/**
 * GET /api/categories/:id
 * Obtener una categoría específica por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const categoryId = parseInt32(id);

    if (categoryId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'ID de categoría inválido'
      });
    }

    const category = await Category.findByPk(categoryId, {
      include: [
        {
          model: Category,
          as: 'parent',
          required: false
        },
        {
          model: Category,
          as: 'subcategorias',
          required: false
        }
      ]
    });
    
    if (!category) {
      return res.status(404).json({ 
        success: false,
        error: 'Categoría no encontrada' 
      });
    }

    // Contar productos en esta categoría
    const totalProductos = await Product.count({
      where: { categoria_id: categoryId }
    });

    const disponibles = await Product.count({
      where: {
        categoria_id: categoryId,
        stock: { [Op.gt]: 0 }
      }
    });
    
    res.json({
      success: true,
      data: {
        ...category.toJSON(),
        total_productos: totalProductos,
        disponibles,
        agotados: totalProductos - disponibles
      }
    });
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener categoría',
      message: error.message 
    });
  }
});

export default router;