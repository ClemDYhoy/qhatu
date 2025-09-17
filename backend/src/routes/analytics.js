import express from 'express';
import { sequelize } from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../config/middleware/auth.js';

const router = express.Router();

// 🔍 Obtener términos de búsqueda populares
router.get('/search-terms', authMiddleware, adminMiddleware, async (req, res) => {
try {
    const [results] = await sequelize.query(
    `SELECT termino_busqueda, COUNT(*) AS count
    FROM busquedas
    GROUP BY termino_busqueda
    ORDER BY count DESC
    LIMIT 10`
    );
    res.json(results);
} catch (error) {
    res.status(500).json({ error: 'Error al obtener términos de búsqueda' });
}
});

// 📊 Obtener productos más populares (vistas, carritos, compras)
router.get('/popular-products', authMiddleware, adminMiddleware, async (req, res) => {
try {
    const [results] = await sequelize.query(
    `SELECT p.nombre, p.id_producto, COUNT(*) AS count, ip.tipo_interaccion
    FROM interacciones_productos ip
    JOIN productos p ON ip.id_producto = p.id_producto
    GROUP BY p.id_producto, ip.tipo_interaccion
    ORDER BY count DESC
    LIMIT 10`
    );
    res.json(results);
} catch (error) {
    res.status(500).json({ error: 'Error al obtener productos populares' });
}
});

export default router;