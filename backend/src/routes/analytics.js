// src/routes/analytics.js
import express from 'express';
import { sequelize } from '../config/database.js';
import { 
  requireAuth, 
  requireAdmin,
  requirePermission 
} from '../config/middleware/auth.js';

const router = express.Router();

// ============================================
// 🔍 BÚSQUEDAS Y TÉRMINOS POPULARES
// ============================================

/**
 * GET /api/analytics/search-terms
 * Obtener términos de búsqueda más populares
 * Requiere: Admin
 */
router.get('/search-terms', requireAuth, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 30;

    const [results] = await sequelize.query(`
      SELECT 
        termino_busqueda,
        COUNT(*) AS total_busquedas,
        COUNT(DISTINCT usuario_id) AS usuarios_unicos,
        DATE(fecha) as fecha
      FROM busquedas
      WHERE fecha >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY termino_busqueda
      ORDER BY total_busquedas DESC
      LIMIT ?
    `, {
      replacements: [days, limit]
    });

    res.json({
      success: true,
      data: results,
      meta: {
        period: `${days} días`,
        limit
      }
    });
  } catch (error) {
    console.error('Error en /search-terms:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener términos de búsqueda',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// 📊 PRODUCTOS POPULARES Y VENTAS
// ============================================

/**
 * GET /api/analytics/popular-products
 * Obtener productos más populares por tipo de interacción
 * Requiere: Admin
 */
router.get('/popular-products', requireAuth, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const tipoInteraccion = req.query.tipo || 'all'; // vista, carrito, compra, all

    let whereClause = '';
    if (tipoInteraccion !== 'all') {
      whereClause = `AND ip.tipo_interaccion = '${tipoInteraccion}'`;
    }

    const [results] = await sequelize.query(`
      SELECT 
        p.producto_id,
        p.nombre,
        p.precio,
        p.categoria_id,
        c.nombre as categoria_nombre,
        ip.tipo_interaccion,
        COUNT(*) AS total_interacciones,
        COUNT(DISTINCT ip.usuario_id) AS usuarios_unicos
      FROM interacciones_productos ip
      JOIN productos p ON ip.producto_id = p.producto_id
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      WHERE 1=1 ${whereClause}
      GROUP BY p.producto_id, ip.tipo_interaccion
      ORDER BY total_interacciones DESC
      LIMIT ?
    `, {
      replacements: [limit]
    });

    res.json({
      success: true,
      data: results,
      meta: {
        tipo: tipoInteraccion,
        limit
      }
    });
  } catch (error) {
    console.error('Error en /popular-products:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener productos populares',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/analytics/top-selling
 * Productos más vendidos (basado en ventas reales)
 * Requiere: Admin
 */
router.get('/top-selling', requireAuth, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 30;

    const [results] = await sequelize.query(`
      SELECT 
        p.producto_id,
        p.nombre,
        p.precio,
        p.url_imagen,
        c.nombre as categoria_nombre,
        SUM(vi.cantidad) as total_vendido,
        COUNT(DISTINCT v.venta_id) as numero_ventas,
        SUM(vi.subtotal) as ingresos_totales,
        AVG(vi.precio_unitario) as precio_promedio
      FROM venta_items vi
      JOIN productos p ON vi.producto_id = p.producto_id
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      JOIN ventas v ON vi.venta_id = v.venta_id
      WHERE v.fecha_venta >= DATE_SUB(NOW(), INTERVAL ? DAY)
        AND v.estado NOT IN ('cancelada')
      GROUP BY p.producto_id
      ORDER BY total_vendido DESC
      LIMIT ?
    `, {
      replacements: [days, limit]
    });

    res.json({
      success: true,
      data: results,
      meta: {
        period: `${days} días`,
        limit
      }
    });
  } catch (error) {
    console.error('Error en /top-selling:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener productos más vendidos',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// 💰 VENTAS Y REVENUE
// ============================================

/**
 * GET /api/analytics/sales-summary
 * Resumen de ventas totales
 * Requiere: Admin
 */
router.get('/sales-summary', requireAuth, requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const [summary] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_ventas,
        SUM(total) as ingresos_totales,
        AVG(total) as ticket_promedio,
        SUM(descuento_total) as descuentos_aplicados,
        COUNT(DISTINCT usuario_id) as clientes_unicos
      FROM ventas
      WHERE fecha_venta >= DATE_SUB(NOW(), INTERVAL ? DAY)
        AND estado NOT IN ('cancelada')
    `, {
      replacements: [days]
    });

    const [byDay] = await sequelize.query(`
      SELECT 
        DATE(fecha_venta) as fecha,
        COUNT(*) as ventas,
        SUM(total) as ingresos,
        AVG(total) as ticket_promedio
      FROM ventas
      WHERE fecha_venta >= DATE_SUB(NOW(), INTERVAL ? DAY)
        AND estado NOT IN ('cancelada')
      GROUP BY DATE(fecha_venta)
      ORDER BY fecha DESC
    `, {
      replacements: [days]
    });

    res.json({
      success: true,
      data: {
        summary: summary[0],
        by_day: byDay
      },
      meta: {
        period: `${days} días`
      }
    });
  } catch (error) {
    console.error('Error en /sales-summary:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener resumen de ventas',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// 📈 CATEGORÍAS Y RENDIMIENTO
// ============================================

/**
 * GET /api/analytics/categories-performance
 * Rendimiento por categoría
 * Requiere: Admin
 */
router.get('/categories-performance', requireAuth, requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const [results] = await sequelize.query(`
      SELECT 
        c.categoria_id,
        c.nombre as categoria,
        COUNT(DISTINCT p.producto_id) as productos_activos,
        SUM(vi.cantidad) as unidades_vendidas,
        SUM(vi.subtotal) as ingresos_totales,
        AVG(vi.precio_unitario) as precio_promedio,
        COUNT(DISTINCT v.venta_id) as numero_ventas
      FROM categorias c
      LEFT JOIN productos p ON c.categoria_id = p.categoria_id
      LEFT JOIN venta_items vi ON p.producto_id = vi.producto_id
      LEFT JOIN ventas v ON vi.venta_id = v.venta_id
      WHERE v.fecha_venta >= DATE_SUB(NOW(), INTERVAL ? DAY)
        AND v.estado NOT IN ('cancelada')
      GROUP BY c.categoria_id
      ORDER BY ingresos_totales DESC
    `, {
      replacements: [days]
    });

    res.json({
      success: true,
      data: results,
      meta: {
        period: `${days} días`
      }
    });
  } catch (error) {
    console.error('Error en /categories-performance:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener rendimiento de categorías',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// 👥 CLIENTES Y COMPORTAMIENTO
// ============================================

/**
 * GET /api/analytics/customers-stats
 * Estadísticas de clientes
 * Requiere: Admin
 */
router.get('/customers-stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [stats] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT usuario_id) as total_clientes,
        COUNT(*) as total_compras,
        AVG(total) as ticket_promedio,
        MAX(total) as compra_maxima
      FROM ventas
      WHERE estado NOT IN ('cancelada')
    `);

    const [topCustomers] = await sequelize.query(`
      SELECT 
        u.usuario_id,
        u.nombre_completo,
        u.email,
        COUNT(*) as total_compras,
        SUM(v.total) as gasto_total,
        AVG(v.total) as ticket_promedio,
        MAX(v.fecha_venta) as ultima_compra
      FROM ventas v
      JOIN usuarios u ON v.usuario_id = u.usuario_id
      WHERE v.estado NOT IN ('cancelada')
      GROUP BY u.usuario_id
      ORDER BY gasto_total DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        general: stats[0],
        top_customers: topCustomers
      }
    });
  } catch (error) {
    console.error('Error en /customers-stats:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener estadísticas de clientes',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// 🎯 DASHBOARD GENERAL
// ============================================

/**
 * GET /api/analytics/dashboard
 * Resumen general para dashboard principal
 * Requiere: Admin
 */
router.get('/dashboard', requireAuth, requireAdmin, async (req, res) => {
  try {
    // KPIs principales
    const [kpis] = await sequelize.query(`
      SELECT 
        (SELECT COUNT(*) FROM productos WHERE stock > 0) as productos_disponibles,
        (SELECT COUNT(*) FROM ventas WHERE DATE(fecha_venta) = CURDATE()) as ventas_hoy,
        (SELECT SUM(total) FROM ventas WHERE DATE(fecha_venta) = CURDATE() AND estado NOT IN ('cancelada')) as ingresos_hoy,
        (SELECT COUNT(*) FROM carritos WHERE estado = 'activo') as carritos_activos,
        (SELECT COUNT(*) FROM productos WHERE stock < umbral_bajo_stock) as productos_bajo_stock
    `);

    res.json({
      success: true,
      data: kpis[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en /dashboard:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener datos del dashboard',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;