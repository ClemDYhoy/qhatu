import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../config/middleware/auth.js';

const router = express.Router();

router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ email: user.email, isAdmin: user.isAdmin });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener perfil: ' + error.message });
    }
});

export default router;