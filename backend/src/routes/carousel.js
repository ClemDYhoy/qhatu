import express from 'express';
import Carousel from '../models/Carousel.js';
import { authMiddleware, adminMiddleware } from '../config/middleware/auth.js';

const router = express.Router();

// 🎞️ Obtener slides activos del carrusel
router.get('/', async (req, res) => {
try {
    const slides = await Carousel.findAll({
    where: { activo: true },
    order: [['prioridad', 'DESC']]
    });
    res.json(slides);
} catch (error) {
    res.status(500).json({ error: 'Error al obtener carrusel' });
}
});

// ➕ Crear slide (solo admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
try {
    const slide = await Carousel.create(req.body);
    res.status(201).json(slide);
} catch (error) {
    if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Error al crear slide' });
}
});

// 🔄 Actualizar slide (solo admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
try {
    const slide = await Carousel.findByPk(req.params.id);
    if (!slide) {
    return res.status(404).json({ error: 'Slide no encontrado' });
    }
    await slide.update(req.body);
    res.json(slide);
} catch (error) {
    if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Error al actualizar slide' });
}
});

// 🗑️ Eliminar slide (solo admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
try {
    const slide = await Carousel.findByPk(req.params.id);
    if (!slide) {
    return res.status(404).json({ error: 'Slide no encontrado' });
    }
    await slide.destroy();
    res.json({ message: 'Slide eliminado' });
} catch (error) {
    res.status(500).json({ error: 'Error al eliminar slide' });
}
});

export default router;