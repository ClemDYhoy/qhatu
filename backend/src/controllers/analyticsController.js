// C:\qhatu\backend\src\controllers\analyticsController.js
import AnalyticsService from '../services/analyticsService.js';
import { validationResult } from 'express-validator';

/**
 * 📊 CONTROLADOR DE ANALYTICS
 * 
 * Maneja todas las peticiones HTTP relacionadas con análisis de ventas.
 * Valida inputs, delega lógica al servicio y formatea respuestas.
 */
const AnalyticsController = {

  // ==========================================
  // 📈 KPIs Y MÉTRICAS GENERALES
  // ==========================================

  /**
   * GET /api/analytics/kpis
   * Obtener KPIs principales del sistema
   */
  obtenerKPIs: async (req, res) => {
    try {
      const { fecha_desde, fecha_hasta, vendedor_id } = req.query;

      const filtros = {};
      if (fecha_desde) filtros.fecha_desde = fecha_desde;
      if (fecha_hasta) filtros.fecha_hasta = fecha_hasta;
      if (vendedor_id) filtros.vendedor_id = parseInt(vendedor_id);

      const resultado = await AnalyticsService.obtenerKPIsPrincipales(filtros);

      if (!resultado.success) {
        return res.status(500).json({
          success: false,
          message: 'Error al obtener KPIs',
          error: resultado.error
        });
      }

      return res.json({
        success: true,
        data: resultado.data,
        meta: {
          filtros_aplicados: filtros,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Error en obtenerKPIs:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno al obtener KPIs',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==========================================
  // 👤 ANÁLISIS DE VENDEDORES
  // ==========================================

  /**
   * GET /api/analytics/vendedores/rendimiento
   * Obtener rendimiento de todos los vendedores
   */
  obtenerRendimientoVendedores: async (req, res) => {
    try {
      const { periodo = 'mes', limite = 10 } = req.query;

      // Validar periodo
      const periodosValidos = ['hoy', 'semana', 'mes', 'anio'];
      if (!periodosValidos.includes(periodo)) {
        return res.status(400).json({
          success: false,
          message: `Periodo inválido. Use: ${periodosValidos.join(', ')}`
        });
      }

      const resultado = await AnalyticsService.obtenerRendimientoVendedores({
        periodo,
        limite: parseInt(limite)
      });

      if (!resultado.success) {
        return res.status(500).json({
          success: false,
          message: 'Error al obtener rendimiento de vendedores',
          error: resultado.error
        });
      }

      return res.json({
        success: true,
        data: resultado.data,
        meta: resultado.meta
      });

    } catch (error) {
      console.error('❌ Error en obtenerRendimientoVendedores:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno al obtener rendimiento',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * GET /api/analytics/vendedores/:vendedorId/estadisticas
   * Obtener estadísticas de un vendedor específico
   */
  obtenerEstadisticasVendedor: async (req, res) => {
    try {
      const { vendedorId } = req.params;
      const { periodo = 'mes' } = req.query;

      // Validar que vendedorId sea un número
      const vendedor_id = parseInt(vendedorId);
      if (isNaN(vendedor_id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de vendedor inválido'
        });
      }

      const resultado = await AnalyticsService.obtenerEstadisticasVendedor(
        vendedor_id,
        periodo
      );

      if (!resultado.success) {
        return res.status(500).json({
          success: false,
          message: 'Error al obtener estadísticas del vendedor',
          error: resultado.error
        });
      }

      return res.json({
        success: true,
        data: resultado.data
      });

    } catch (error) {
      console.error('❌ Error en obtenerEstadisticasVendedor:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno al obtener estadísticas',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * GET /api/analytics/vendedores/mi-rendimiento
   * Obtener estadísticas del vendedor autenticado
   */
  obtenerMiRendimiento: async (req, res) => {
    try {
      const vendedor_id = req.user.usuario_id;
      const { periodo = 'mes' } = req.query;

      const resultado = await AnalyticsService.obtenerEstadisticasVendedor(
        vendedor_id,
        periodo
      );

      if (!resultado.success) {
        return res.status(500).json({
          success: false,
          message: 'Error al obtener tu rendimiento',
          error: resultado.error
        });
      }

      return res.json({
        success: true,
        data: resultado.data,
        meta: {
          vendedor_id,
          nombre: req.user.nombre_completo
        }
      });

    } catch (error) {
      console.error('❌ Error en obtenerMiRendimiento:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno al obtener rendimiento',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==========================================
  // 👥 ANÁLISIS DE CLIENTES
  // ==========================================

  /**
   * GET /api/analytics/clientes/vip
   * Obtener clientes más valiosos
   */
  obtenerClientesVIP: async (req, res) => {
    try {
      const { limite = 20, min_compras = 3 } = req.query;

      const resultado = await AnalyticsService.obtenerClientesVIP({
        limite: parseInt(limite),
        min_compras: parseInt(min_compras)
      });

      if (!resultado.success) {
        return res.status(500).json({
          success: false,
          message: 'Error al obtener clientes VIP',
          error: resultado.error
        });
      }

      return res.json({
        success: true,
        data: resultado.data,
        meta: resultado.meta
      });

    } catch (error) {
      console.error('❌ Error en obtenerClientesVIP:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno al obtener clientes VIP',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * GET /api/analytics/clientes/inactivos
   * Obtener clientes inactivos para reactivación
   */
  obtenerClientesInactivos: async (req, res) => {
    try {
      const { dias_inactividad = 60 } = req.query;

      const resultado = await AnalyticsService.obtenerClientesInactivos(
        parseInt(dias_inactividad)
      );

      if (!resultado.success) {
        return res.status(500).json({
          success: false,
          message: 'Error al obtener clientes inactivos',
          error: resultado.error
        });
      }

      return res.json({
        success: true,
        data: resultado.data,
        meta: resultado.meta
      });

    } catch (error) {
      console.error('❌ Error en obtenerClientesInactivos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno al obtener clientes inactivos',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==========================================
  // 📦 ANÁLISIS DE PRODUCTOS
  // ==========================================

  /**
   * GET /api/analytics/productos/mas-vendidos
   * Obtener productos más vendidos
   */
  obtenerProductosMasVendidos: async (req, res) => {
    try {
      const { 
        limite = 20, 
        categoria_id, 
        periodo = 'mes' 
      } = req.query;

      const filtros = {
        limite: parseInt(limite),
        periodo
      };

      if (categoria_id) {
        filtros.categoria_id = parseInt(categoria_id);
      }

      const resultado = await AnalyticsService.obtenerProductosMasVendidos(filtros);

      if (!resultado.success) {
        return res.status(500).json({
          success: false,
          message: 'Error al obtener productos más vendidos',
          error: resultado.error
        });
      }

      return res.json({
        success: true,
        data: resultado.data,
        meta: resultado.meta
      });

    } catch (error) {
      console.error('❌ Error en obtenerProductosMasVendidos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno al obtener productos',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * GET /api/analytics/categorias/rendimiento
   * Obtener rendimiento por categoría
   */
  obtenerRendimientoCategorias: async (req, res) => {
    try {
      const { periodo = 'mes' } = req.query;

      const resultado = await AnalyticsService.obtenerRendimientoCategorias(periodo);

      if (!resultado.success) {
        return res.status(500).json({
          success: false,
          message: 'Error al obtener rendimiento de categorías',
          error: resultado.error
        });
      }

      return res.json({
        success: true,
        data: resultado.data,
        meta: resultado.meta
      });

    } catch (error) {
      console.error('❌ Error en obtenerRendimientoCategorias:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno al obtener categorías',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==========================================
  // 📅 ANÁLISIS TEMPORAL
  // ==========================================

  /**
   * GET /api/analytics/ventas/por-dia-semana
   * Obtener ventas agrupadas por día de la semana
   */
  obtenerVentasPorDiaSemana: async (req, res) => {
    try {
      const { periodo = 'mes' } = req.query;

      const resultado = await AnalyticsService.obtenerVentasPorDiaSemana(periodo);

      if (!resultado.success) {
        return res.status(500).json({
          success: false,
          message: 'Error al obtener ventas por día',
          error: resultado.error
        });
      }

      return res.json({
        success: true,
        data: resultado.data,
        meta: resultado.meta
      });

    } catch (error) {
      console.error('❌ Error en obtenerVentasPorDiaSemana:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno al obtener ventas por día',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * GET /api/analytics/ventas/por-hora
   * Obtener ventas agrupadas por hora del día
   */
  obtenerVentasPorHora: async (req, res) => {
    try {
      const { periodo = 'semana' } = req.query;

      const resultado = await AnalyticsService.obtenerVentasPorHora(periodo);

      if (!resultado.success) {
        return res.status(500).json({
          success: false,
          message: 'Error al obtener ventas por hora',
          error: resultado.error
        });
      }

      return res.json({
        success: true,
        data: resultado.data,
        meta: resultado.meta
      });

    } catch (error) {
      console.error('❌ Error en obtenerVentasPorHora:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno al obtener ventas por hora',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ==========================================
  // 📊 REPORTES Y COMPARATIVAS
  // ==========================================

  /**
   * GET /api/analytics/reportes/comparativa-periodos
   * Obtener comparativa entre diferentes periodos
   */
  obtenerComparativaPeriodos: async (req, res) => {
    try {
      const resultado = await AnalyticsService.obtenerComparativaPeriodos();

      if (!resultado.success) {
        return res.status(500).json({
          success: false,
          message: 'Error al obtener comparativa de periodos',
          error: resultado.error
        });
      }

      return res.json({
        success: true,
        data: resultado.data
      });

    } catch (error) {
      console.error('❌ Error en obtenerComparativaPeriodos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno al obtener comparativa',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * GET /api/analytics/dashboard-admin
   * Obtener resumen completo para dashboard de admin
   */
  obtenerDashboardAdmin: async (req, res) => {
    try {
      // Ejecutar múltiples consultas en paralelo para optimizar
      const [
        kpis,
        topVendedores,
        topProductos,
        clientesVIP,
        comparativa
      ] = await Promise.all([
        AnalyticsService.obtenerKPIsPrincipales({ 
          fecha_desde: null, 
          fecha_hasta: null 
        }),
        AnalyticsService.obtenerRendimientoVendedores({ 
          periodo: 'mes', 
          limite: 5 
        }),
        AnalyticsService.obtenerProductosMasVendidos({ 
          limite: 10, 
          periodo: 'mes' 
        }),
        AnalyticsService.obtenerClientesVIP({ 
          limite: 10, 
          min_compras: 3 
        }),
        AnalyticsService.obtenerComparativaPeriodos()
      ]);

      return res.json({
        success: true,
        data: {
          kpis: kpis.data,
          top_vendedores: topVendedores.data,
          top_productos: topProductos.data,
          clientes_vip: clientesVIP.data,
          comparativa_periodos: comparativa.data
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error en obtenerDashboardAdmin:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno al obtener dashboard',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * GET /api/analytics/dashboard-vendedor
   * Obtener resumen para dashboard de vendedor
   */
  obtenerDashboardVendedor: async (req, res) => {
    try {
      const vendedor_id = req.user.usuario_id;

      const [
        estadisticas,
        topProductos,
        ventasPorDia
      ] = await Promise.all([
        AnalyticsService.obtenerEstadisticasVendedor(vendedor_id, 'mes'),
        AnalyticsService.obtenerProductosMasVendidos({ 
          limite: 5, 
          periodo: 'mes' 
        }),
        AnalyticsService.obtenerVentasPorDiaSemana('semana')
      ]);

      return res.json({
        success: true,
        data: {
          mis_estadisticas: estadisticas.data,
          productos_populares: topProductos.data,
          patron_ventas: ventasPorDia.data
        },
        vendedor: {
          id: vendedor_id,
          nombre: req.user.nombre_completo
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error en obtenerDashboardVendedor:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno al obtener dashboard',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

export default AnalyticsController;