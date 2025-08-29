import express from 'express';
import Carousel from '../models/Carousel.js';
import { isAdmin } from '../config/middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
try {
    let carousel = await Carousel.findOne();
    if (!carousel) carousel = new Carousel({ images: [] });
    res.json(carousel);
} catch (err) {
    res.status(500).json({ error: 'Error al obtener carrusel' });
}
});

router.put('/', isAdmin, async (req, res) => {
try {
    const { images } = req.body;
    let carousel = await Carousel.findOne();
    if (!carousel) carousel = new Carousel();
    carousel.images = images;
    carousel.updatedAt = Date.now();
    await carousel.save();
    res.json({ message: 'Carrusel actualizado', carousel });
} catch (err) {
    res.status(500).json({ error: 'Error al actualizar' });
}
});

export default router;