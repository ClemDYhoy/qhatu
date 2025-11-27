import  api  from './api';

class AnalyticsService {
  
  // ✅ ENDPOINT CORRECTO que SÍ existe en tu backend
  async obtenerMiRendimiento(periodo = 'hoy') {
    try {
      const response = await api.get(`/analytics-ventas/vendedores/mi-rendimiento?periodo=${periodo}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo mi rendimiento:', error);
      throw error;
    }
  }

  // ✅ ENDPOINT CORRECTO para estadísticas generales
  async obtenerEstadisticasVendedor() {
    try {
      const response = await api.get('/analytics-ventas/dashboard-vendedor');
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas vendedor:', error);
      throw error;
    }
  }

  // ✅ ENDPOINT CORRECTO para KPIs
  async obtenerKPIsVendedor() {
    try {
      const response = await api.get('/analytics-ventas/kpis');
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo KPIs vendedor:', error);
      throw error;
    }
  }

  // ✅ ENDPOINT CORRECTO para clientes VIP
  async obtenerClientesVIP() {
    try {
      const response = await api.get('/analytics-ventas/clientes/vip');
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo clientes VIP:', error);
      throw error;
    }
  }

  // ✅ ENDPOINT CORRECTO para productos más vendidos
  async obtenerProductosMasVendidos() {
    try {
      const response = await api.get('/analytics-ventas/productos/mas-vendidos');
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo productos más vendidos:', error);
      throw error;
    }
  }
}

export default new AnalyticsService();