// C:\qhatu\backend\src\routes\analytics-ventas.js
import express from 'express';
import AnalyticsController from '../controllers/analyticsController.js';
import { requireAuth, requireRole } from '../config/middleware/auth.js';

const router = express.Router();

/**
 * 🔐 POLÍTICAS DE ACCESO:
 * 
 * - Rutas /vendedores/mi-rendimiento y /dashboard-vendedor:
 *   Accesibles por vendedores y admins
 * 
 * - Todas las demás rutas:
 *   Solo para super_admin
 */

// ==========================================
// 📈 KPIs Y MÉTRICAS GENERALES
// ==========================================

/**
 * @route   GET /api/analytics-ventas/kpis
 * @desc    Obtener KPIs principales del sistema
 * @access  Admin
 * @query   fecha_desde, fecha_hasta, vendedor_id (opcionales)
 */
router.get(
  '/kpis',
  requireAuth,
  requireRole(['super_admin']),
  AnalyticsController.obtenerKPIs
);

// ==========================================
// 👤 ANÁLISIS DE VENDEDORES
// ==========================================

/**
 * @route   GET /api/analytics-ventas/vendedores/rendimiento
 * @desc    Obtener rendimiento de todos los vendedores
 * @access  Admin
 * @query   periodo (hoy, semana, mes, anio), limite
 */
router.get(
  '/vendedores/rendimiento',
  requireAuth,
  requireRole(['super_admin']),
  AnalyticsController.obtenerRendimientoVendedores
);

/**
 * @route   GET /api/analytics-ventas/vendedores/mi-rendimiento
 * @desc    Obtener estadísticas del vendedor autenticado
 * @access  Vendedor, Admin
 * @query   periodo (hoy, semana, mes, anio)
 */
router.get(
  '/vendedores/mi-rendimiento',
  requireAuth,
  requireRole(['vendedor', 'super_admin']),
  AnalyticsController.obtenerMiRendimiento
);

/**
 * @route   GET /api/analytics-ventas/vendedores/:vendedorId/estadisticas
 * @desc    Obtener estadísticas de un vendedor específico
 * @access  Admin
 * @params  vendedorId
 * @query   periodo (hoy, semana, mes, anio)
 */
router.get(
  '/vendedores/:vendedorId/estadisticas',
  requireAuth,
  requireRole(['super_admin']),
  AnalyticsController.obtenerEstadisticasVendedor
);

// ==========================================
// 👥 ANÁLISIS DE CLIENTES
// ==========================================

/**
 * @route   GET /api/analytics-ventas/clientes/vip
 * @desc    Obtener clientes más valiosos
 * @access  Admin
 * @query   limite, min_compras
 */
router.get(
  '/clientes/vip',
  requireAuth,
  requireRole(['super_admin']),
  AnalyticsController.obtenerClientesVIP
);

/**
 * @route   GET /api/analytics-ventas/clientes/inactivos
 * @desc    Obtener clientes inactivos para reactivación
 * @access  Admin, Vendedor (para su uso en IA Asistente)
 * @query   dias_inactividad
 */
router.get(
  '/clientes/inactivos',
  requireAuth,
  requireRole(['super_admin', 'vendedor']),
  AnalyticsController.obtenerClientesInactivos
);

// ==========================================
// 📦 ANÁLISIS DE PRODUCTOS
// ==========================================

/**
 * @route   GET /api/analytics-ventas/productos/mas-vendidos
 * @desc    Obtener productos más vendidos
 * @access  Admin, Vendedor
 * @query   limite, categoria_id, periodo
 */
router.get(
  '/productos/mas-vendidos',
  requireAuth,
  requireRole(['super_admin', 'vendedor', 'almacenero']),
  AnalyticsController.obtenerProductosMasVendidos
);

/**
 * @route   GET /api/analytics-ventas/categorias/rendimiento
 * @desc    Obtener rendimiento por categoría
 * @access  Admin, Almacenero
 * @query   periodo
 */
router.get(
  '/categorias/rendimiento',
  requireAuth,
  requireRole(['super_admin', 'almacenero']),
  AnalyticsController.obtenerRendimientoCategorias
);

// ==========================================
// 📅 ANÁLISIS TEMPORAL
// ==========================================

/**
 * @route   GET /api/analytics-ventas/ventas/por-dia-semana
 * @desc    Obtener ventas agrupadas por día de la semana
 * @access  Admin
 * @query   periodo
 */
router.get(
  '/ventas/por-dia-semana',
  requireAuth,
  requireRole(['super_admin']),
  AnalyticsController.obtenerVentasPorDiaSemana
);

/**
 * @route   GET /api/analytics-ventas/ventas/por-hora
 * @desc    Obtener ventas agrupadas por hora del día
 * @access  Admin
 * @query   periodo
 */
router.get(
  '/ventas/por-hora',
  requireAuth,
  requireRole(['super_admin']),
  AnalyticsController.obtenerVentasPorHora
);

// ==========================================
// 📊 REPORTES Y DASHBOARDS
// ==========================================

/**
 * @route   GET /api/analytics-ventas/reportes/comparativa-periodos
 * @desc    Obtener comparativa entre diferentes periodos
 * @access  Admin
 */
router.get(
  '/reportes/comparativa-periodos',
  requireAuth,
  requireRole(['super_admin']),
  AnalyticsController.obtenerComparativaPeriodos
);

/**
 * @route   GET /api/analytics-ventas/dashboard-admin
 * @desc    Obtener resumen completo para dashboard de admin
 * @access  Admin
 */
router.get(
  '/dashboard-admin',
  requireAuth,
  requireRole(['super_admin']),
  AnalyticsController.obtenerDashboardAdmin
);

/**
 * @route   GET /api/analytics-ventas/dashboard-vendedor
 * @desc    Obtener resumen para dashboard de vendedor
 * @access  Vendedor, Admin
 */
router.get(
  '/dashboard-vendedor',
  requireAuth,
  requireRole(['vendedor', 'super_admin']),
  AnalyticsController.obtenerDashboardVendedor
);

// ==========================================
// 📤 EXPORTAR ROUTER
// ==========================================

export default router;