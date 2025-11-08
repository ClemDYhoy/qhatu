import express from 'express';
import { Op, Sequelize } from 'sequelize';
import sequelize from '../config/database.js';

const router = express.Router();

// ============================================
// === UTILIDADES ===
// ============================================

const parseInt32 = (value, defaultValue = 0) => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) || parsed < 0 ? defaultValue : parsed;
};

// ============================================
// === RUTAS PÚBLICAS ===
// ============================================

/**
 * GET /api/banners-descuento/activos
 * Obtener banners activos y vigentes
 */
router.get('/activos', async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        b.banner_id,
        b.titulo,
        b.descripcion,
        b.categoria_id,
        c.nombre AS categoria_nombre,
        b.porcentaje_descuento,
        b.url_imagen_fondo,
        b.color_fondo,
        b.color_texto,
        b.fecha_inicio,
        b.fecha_fin,
        b.prioridad,
        b.tipo_descuento,
        b.monto_minimo,
        b.clicks,
        b.vistas,
        DATEDIFF(b.fecha_fin, NOW()) AS dias_restantes
      FROM 
        banners_descuento b
      INNER JOIN 
        categorias c ON b.categoria_id = c.categoria_id
      WHERE 
        b.activo = 1
        AND NOW() BETWEEN b.fecha_inicio AND b.fecha_fin
      ORDER BY 
        b.prioridad DESC,
        b.fecha_fin ASC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Error al obtener banners activos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener banners',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/banners-descuento/:id
 * Obtener un banner específico
 */
router.get('/:id', async (req, res) => {
  try {
    const bannerId = parseInt32(req.params.id);

    if (bannerId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'ID de banner inválido'
      });
    }

    const [results] = await sequelize.query(`
      SELECT 
        b.*,
        c.nombre AS categoria_nombre,
        DATEDIFF(b.fecha_fin, NOW()) AS dias_restantes
      FROM 
        banners_descuento b
      INNER JOIN 
        categorias c ON b.categoria_id = c.categoria_id
      WHERE 
        b.banner_id = ?
    `, {
      replacements: [bannerId]
    });

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Banner no encontrado'
      });
    }

    res.json({
      success: true,
      data: results[0]
    });

  } catch (error) {
    console.error('Error al obtener banner:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener banner',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/banners-descuento/interaccion
 * Registrar vista o click en un banner
 */
router.post('/interaccion', async (req, res) => {
  try {
    const { banner_id, tipo } = req.body;

    if (!banner_id || !tipo) {
      return res.status(400).json({
        success: false,
        error: 'banner_id y tipo son requeridos'
      });
    }

    if (!['vista', 'click'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        error: 'tipo debe ser "vista" o "click"'
      });
    }

    const bannerId = parseInt32(banner_id);
    const field = tipo === 'vista' ? 'vistas' : 'clicks';

    await sequelize.query(`
      UPDATE banners_descuento 
      SET ${field} = ${field} + 1 
      WHERE banner_id = ?
    `, {
      replacements: [bannerId]
    });

    res.json({
      success: true,
      message: `${tipo} registrada correctamente`
    });

  } catch (error) {
    console.error('Error al registrar interacción:', error);
    res.status(500).json({
      success: false,
      error: 'Error al registrar interacción',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// === RUTAS ADMIN (requieren autenticación) ===
// ============================================

/**
 * GET /api/banners-descuento/admin/all
 * Obtener todos los banners (admin)
 */
router.get('/admin/all', async (req, res) => {
  try {
    // TODO: Agregar middleware de autenticación admin
    
    const [results] = await sequelize.query(`
      SELECT 
        b.*,
        c.nombre AS categoria_nombre,
        DATEDIFF(b.fecha_fin, NOW()) AS dias_restantes,
        CASE
          WHEN b.activo = 0 THEN 'Inactivo'
          WHEN NOW() < b.fecha_inicio THEN 'Programado'
          WHEN NOW() > b.fecha_fin THEN 'Expirado'
          ELSE 'Activo'
        END AS estado
      FROM 
        banners_descuento b
      INNER JOIN 
        categorias c ON b.categoria_id = c.categoria_id
      ORDER BY 
        b.prioridad DESC,
        b.creado_en DESC
    `);

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Error al obtener todos los banners:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener banners',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/banners-descuento/admin/create
 * Crear nuevo banner (admin)
 */
router.post('/admin/create', async (req, res) => {
  try {
    // TODO: Agregar middleware de autenticación admin
    
    const {
      titulo,
      descripcion,
      categoria_id,
      porcentaje_descuento,
      url_imagen_fondo,
      color_fondo,
      color_texto,
      fecha_inicio,
      fecha_fin,
      activo,
      prioridad,
      tipo_descuento,
      monto_minimo
    } = req.body;

    // Validaciones
    if (!titulo || !categoria_id || !porcentaje_descuento || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos faltantes'
      });
    }

    const [result] = await sequelize.query(`
      INSERT INTO banners_descuento (
        titulo, descripcion, categoria_id, porcentaje_descuento,
        url_imagen_fondo, color_fondo, color_texto,
        fecha_inicio, fecha_fin, activo, prioridad,
        tipo_descuento, monto_minimo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, {
      replacements: [
        titulo,
        descripcion || null,
        categoria_id,
        porcentaje_descuento,
        url_imagen_fondo || null,
        color_fondo || '#667eea',
        color_texto || '#ffffff',
        fecha_inicio,
        fecha_fin,
        activo !== undefined ? activo : 1,
        prioridad || 0,
        tipo_descuento || 'porcentaje',
        monto_minimo || null
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Banner creado exitosamente',
      data: { banner_id: result.insertId }
    });

  } catch (error) {
    console.error('Error al crear banner:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear banner',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/banners-descuento/admin/:id
 * Actualizar banner (admin)
 */
router.put('/admin/:id', async (req, res) => {
  try {
    // TODO: Agregar middleware de autenticación admin
    
    const bannerId = parseInt32(req.params.id);
    const updates = req.body;

    if (bannerId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'ID de banner inválido'
      });
    }

    // Construir query dinámica
    const fields = [];
    const values = [];

    const allowedFields = [
      'titulo', 'descripcion', 'categoria_id', 'porcentaje_descuento',
      'url_imagen_fondo', 'color_fondo', 'color_texto',
      'fecha_inicio', 'fecha_fin', 'activo', 'prioridad',
      'tipo_descuento', 'monto_minimo'
    ];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updates[field]);
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No hay campos para actualizar'
      });
    }

    values.push(bannerId);

    await sequelize.query(`
      UPDATE banners_descuento 
      SET ${fields.join(', ')}
      WHERE banner_id = ?
    `, {
      replacements: values
    });

    res.json({
      success: true,
      message: 'Banner actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar banner:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar banner',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/banners-descuento/admin/:id
 * Eliminar banner (admin)
 */
router.delete('/admin/:id', async (req, res) => {
  try {
    // TODO: Agregar middleware de autenticación admin
    
    const bannerId = parseInt32(req.params.id);

    if (bannerId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'ID de banner inválido'
      });
    }

    await sequelize.query(`
      DELETE FROM banners_descuento 
      WHERE banner_id = ?
    `, {
      replacements: [bannerId]
    });

    res.json({
      success: true,
      message: 'Banner eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar banner:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar banner',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/banners-descuento/admin/stats
 * Estadísticas de banners (admin)
 */
router.get('/admin/stats', async (req, res) => {
  try {
    // TODO: Agregar middleware de autenticación admin
    
    const [results] = await sequelize.query(`
      SELECT 
        b.banner_id,
        b.titulo,
        c.nombre AS categoria_nombre,
        b.vistas,
        b.clicks,
        CASE 
          WHEN b.vistas > 0 THEN ROUND((b.clicks / b.vistas) * 100, 2)
          ELSE 0 
        END AS ctr_porcentaje
      FROM 
        banners_descuento b
      INNER JOIN 
        categorias c ON b.categoria_id = c.categoria_id
      WHERE 
        b.activo = 1
      ORDER BY 
        b.clicks DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;