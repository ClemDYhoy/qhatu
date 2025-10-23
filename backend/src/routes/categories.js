import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

// Obtener todas las categorías con sus subcategorías
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { padre_id: null }, // Solo categorías principales
      include: [{
        model: Category,
        as: 'subcategorias',
        required: false
      }],
      order: [['nombre', 'ASC']]
    });
    
    res.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ 
      error: 'Error al obtener categorías',
      message: error.message 
    });
  }
});

// Obtener una categoría por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'parent'
        },
        {
          model: Category,
          as: 'subcategorias'
        }
      ]
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ 
      error: 'Error al obtener categoría',
      message: error.message 
    });
  }
});

// Obtener todas las categorías (planas, sin jerarquía)
router.get('/all/flat', async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['nombre', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ 
      error: 'Error al obtener categorías',
      message: error.message 
    });
  }
});

export default router;