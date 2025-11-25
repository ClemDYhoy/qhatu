// C:\qhatu\frontend\src\services\analyticsService.js
import api from './api';

/**
 * 📊 SERVICIO DE ANALYTICS (FRONTEND)
 * 
 * Maneja todas las llamadas a los endpoints de análisis de ventas.
 * Consume la API /api/analytics-ventas
 */

const analyticsService = {

  // ==========================================
  // 📈 KPIs Y MÉTRICAS GENERALES
  // ==========================================

  /**
   * Obtener KPIs principales
   */
  obtenerKPIs: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros.vendedor_id) params.append('vendedor_id', filtros.vendedor_id);
      
      const url = params.toString() 
        ? `/analytics-ventas/kpis?${params}`
        : '/analytics-ventas/kpis';
      
      const response = await api.get(url);
      
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta
      };
    } catch (error) {
      console.error('❌ Error obteniendo KPIs:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener KPIs',
        error: error.message
      };
    }
  },

  // ==========================================
  // 👤 VENDEDORES
  // ==========================================

  /**
   * Obtener mi rendimiento como vendedor
   */
  obtenerMiRendimiento: async (periodo = 'mes') => {
    try {
      const response = await api.get(`/analytics-ventas/vendedores/mi-rendimiento?periodo=${periodo}`);
      
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta
      };
    } catch (error) {
      console.error('❌ Error obteniendo mi rendimiento:', error);
      
      // Si es 404, devolver datos vacíos en lugar de error
      if (error.response?.status === 404) {
        return {
          success: true,
          data: {
            total_ventas: 0,
            monto_total: '0.00',
            ticket_promedio: '0.00',
            items_vendidos: 0,
            clientes_unicos: 0,
            comision: '0.00',
            periodo
          },
          meta: { periodo }
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener rendimiento',
        error: error.message
      };
    }
  },

  /**
   * Obtener rendimiento de todos los vendedores (solo admin)
   */
  obtenerRendimientoVendedores: async (periodo = 'mes', limite = 10) => {
    try {
      const response = await api.get(`/analytics-ventas/vendedores/rendimiento?periodo=${periodo}&limite=${limite}`);
      
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta
      };
    } catch (error) {
      console.error('❌ Error obteniendo rendimiento vendedores:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener vendedores',
        error: error.message
      };
    }
  },

  /**
   * Obtener estadísticas de un vendedor específico (solo admin)
   */
  obtenerEstadisticasVendedor: async (vendedorId, periodo = 'mes') => {
    try {
      const response = await api.get(`/analytics-ventas/vendedores/${vendedorId}/estadisticas?periodo=${periodo}`);
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas vendedor:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener estadísticas',
        error: error.message
      };
    }
  },

  // ==========================================
  // 👥 CLIENTES
  // ==========================================

  /**
   * Obtener clientes VIP
   */
  obtenerClientesVIP: async (limite = 20, min_compras = 3) => {
    try {
      const response = await api.get(`/analytics-ventas/clientes/vip?limite=${limite}&min_compras=${min_compras}`);
      
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta
      };
    } catch (error) {
      console.error('❌ Error obteniendo clientes VIP:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener clientes VIP',
        error: error.message
      };
    }
  },

  /**
   * Obtener clientes inactivos para reactivación
   */
  obtenerClientesInactivos: async (dias_inactividad = 60) => {
    try {
      const response = await api.get(`/analytics-ventas/clientes/inactivos?dias_inactividad=${dias_inactividad}`);
      
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta
      };
    } catch (error) {
      console.error('❌ Error obteniendo clientes inactivos:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener clientes inactivos',
        error: error.message
      };
    }
  },

  // ==========================================
  // 📦 PRODUCTOS
  // ==========================================

  /**
   * Obtener productos más vendidos
   */
  obtenerProductosMasVendidos: async (filtros = {}) => {
    try {
      const { limite = 20, categoria_id, periodo = 'mes' } = filtros;
      
      const params = new URLSearchParams();
      params.append('limite', limite);
      params.append('periodo', periodo);
      if (categoria_id) params.append('categoria_id', categoria_id);
      
      const response = await api.get(`/analytics-ventas/productos/mas-vendidos?${params}`);
      
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta
      };
    } catch (error) {
      console.error('❌ Error obteniendo productos más vendidos:', error);
      
      // Si es 404 o no hay datos, devolver array vacío
      if (error.response?.status === 404 || error.response?.status === 500) {
        return {
          success: true,
          data: [],
          meta: { periodo: filtros.periodo || 'mes', total: 0 }
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener productos',
        error: error.message
      };
    }
  },

  /**
   * Obtener rendimiento por categoría
   */
  obtenerRendimientoCategorias: async (periodo = 'mes') => {
    try {
      const response = await api.get(`/analytics-ventas/categorias/rendimiento?periodo=${periodo}`);
      
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta
      };
    } catch (error) {
      console.error('❌ Error obteniendo rendimiento categorías:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener categorías',
        error: error.message
      };
    }
  },

  // ==========================================
  // 📅 ANÁLISIS TEMPORAL
  // ==========================================

  /**
   * Obtener ventas por día de la semana
   */
  obtenerVentasPorDiaSemana: async (periodo = 'mes') => {
    try {
      const response = await api.get(`/analytics-ventas/ventas/por-dia-semana?periodo=${periodo}`);
      
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta
      };
    } catch (error) {
      console.error('❌ Error obteniendo ventas por día:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener ventas por día',
        error: error.message
      };
    }
  },

  /**
   * Obtener ventas por hora del día
   */
  obtenerVentasPorHora: async (periodo = 'semana') => {
    try {
      const response = await api.get(`/analytics-ventas/ventas/por-hora?periodo=${periodo}`);
      
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta
      };
    } catch (error) {
      console.error('❌ Error obteniendo ventas por hora:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener ventas por hora',
        error: error.message
      };
    }
  },

  // ==========================================
  // 📊 DASHBOARDS Y REPORTES
  // ==========================================

  /**
   * Obtener dashboard completo para vendedor
   */
  obtenerDashboardVendedor: async () => {
    try {
      const response = await api.get('/analytics-ventas/dashboard-vendedor');
      
      return {
        success: true,
        data: response.data.data,
        vendedor: response.data.vendedor,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      console.error('❌ Error obteniendo dashboard vendedor:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener dashboard',
        error: error.message
      };
    }
  },

  /**
   * Obtener dashboard completo para admin
   */
  obtenerDashboardAdmin: async () => {
    try {
      const response = await api.get('/analytics-ventas/dashboard-admin');
      
      return {
        success: true,
        data: response.data.data,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      console.error('❌ Error obteniendo dashboard admin:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener dashboard',
        error: error.message
      };
    }
  },

  /**
   * Obtener comparativa de periodos
   */
  obtenerComparativaPeriodos: async () => {
    try {
      const response = await api.get('/analytics-ventas/reportes/comparativa-periodos');
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Error obteniendo comparativa:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener comparativa',
        error: error.message
      };
    }
  }
};

export default analyticsService;