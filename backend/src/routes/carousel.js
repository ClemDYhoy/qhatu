import express from 'express';
import Carousel from '../models/Carousel.js';

const router = express.Router();

// GET /api/carousels - Obtener carruseles activos
router.get('/', async (req, res) => {
  try {
    const carousels = await Carousel.findAll({
      where: { activo: true },
      order: [['creado_en', 'DESC']]
    });

    res.json({
      success: true,
      data: carousels
    });
  } catch (error) {
    console.error('Error al obtener carruseles:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener carruseles',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/carousels/:id - Obtener un carrusel específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const carousel = await Carousel.findByPk(id);

    if (!carousel) {
      return res.status(404).json({
        success: false,
        error: 'Carrusel no encontrado'
      });
    }

    res.json({
      success: true,
      data: carousel
    });
  } catch (error) {
    console.error('Error al obtener carrusel:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener carrusel',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;