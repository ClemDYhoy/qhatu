import express from 'express';
import Product from '../models/Product.js';
import { sequelize } from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../config/middleware/auth.js';

const router = express.Router();

// 🛍️ Obtener productos con filtrado premium
router.get('/', async (req, res) => {
  try {
    const {
      categoria_id,
      tipo_comida_id,
      etiqueta_id,
      es_importado,
      marca,
      precio_min,
      precio_max,
      termino_busqueda,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;

    const [results] = await sequelize.query(
      'CALL FiltrarProductosAvanzado(:categoria_id, :tipo_comida_id, :etiqueta_id, :es_importado, :marca, :precio_min, :precio_max, :termino_busqueda, :offset, :limit, @total_resultados)',
      {
        replacements: {
          categoria_id: categoria_id ? parseInt(categoria_id) : null,
          tipo_comida_id: tipo_comida_id ? parseInt(tipo_comida_id) : null,
          etiqueta_id: etiqueta_id ? parseInt(etiqueta_id) : null,
          es_importado: es_importado ? es_importado === 'true' : null,
          marca: marca || null,
          precio_min: precio_min ? parseFloat(precio_min) : null,
          precio_max: precio_max ? parseFloat(precio_max) : null,
          termino_busqueda: termino_busqueda || null,
          offset: parseInt(offset),
          limit: parseInt(limit)
        }
      }
    );

    const [[{ total_resultados }]] = await sequelize.query(
      'SELECT @total_resultados AS total_resultados'
    );

    res.json({
      products: results,
      total: total_resultados,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos: ' + error.message });
  }
});

// ➕ Crear producto (solo admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// 🔄 Actualizar producto (solo admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    await product.update(req.body);
    res.json(product);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// 🗑️ Eliminar producto (solo admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    await product.destroy();
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

export default router;