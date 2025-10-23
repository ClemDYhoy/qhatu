import { Category } from '../models/index.js';

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { padre_id: null }, // Solo categorías principales
      include: [{
        model: Category,
        as: 'subcategorias'
      }]
    });
    
    res.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ 
      error: 'Error al obtener categorías',
      message: error.message 
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id, {
      include: [{
        model: Category,
        as: 'subcategorias'
      }]
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
};