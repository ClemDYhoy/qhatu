import express from 'express';
import { isAdmin } from '../config/middleware/auth.js'; // Importa el named export

const router = express.Router();

router.get('/', isAdmin, (req, res) => {
  res.json({ message: 'Lista de productos', products: [] }); // Placeholder
});

router.post('/', isAdmin, (req, res) => {
  const { name, price } = req.body;
  res.json({ message: 'Producto creado', product: { name, price } }); // Placeholder
});

export default router;