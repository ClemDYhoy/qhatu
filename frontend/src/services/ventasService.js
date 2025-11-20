// C:\qhatu\frontend\src\services\ventasService.js
import api from './api';

/**
 * 📱 Crear venta desde carrito para WhatsApp
 */
export const crearVentaWhatsApp = async (datosAdicionales = {}) => {
  try {
    console.log('📱 Creando venta WhatsApp...');
    
    // ⚡ RUTA CORRECTA: /api/ventas/crear-whatsapp
    const response = await api.post('/ventas/crear-whatsapp', datosAdicionales);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al crear venta');
    }

    const ventaData = response.data.data;
    
    console.log('✅ Venta creada:', ventaData.numero_venta);
    console.log('📱 URL WhatsApp:', ventaData.whatsapp_url);
    
    return {
      success: true,
      data: ventaData,
      message: 'Venta creada correctamente'
    };
  } catch (error) {
    console.error('❌ Error creando venta WhatsApp:', error);
    
    const message = error.response?.data?.message;
    const code = error.response?.data?.code;
    
    // Mensajes específicos según el error
    let userMessage = 'Error al crear venta';
    
    if (message) {
      if (message.includes('carrito vacío') || message.includes('empty')) {
        userMessage = 'Tu carrito está vacío';
        return {
          success: false,
          message: userMessage,
          code: 'EMPTY_CART'
        };
      } else if (message.includes('stock')) {
        userMessage = 'Algunos productos no tienen stock suficiente';
        return {
          success: false,
          message: userMessage,
          code: 'INSUFFICIENT_STOCK',
          errores: error.response?.data?.errores
        };
      }
    }
    
    return {
      success: false,
      message: message || userMessage,
      error: error.message,
      code: code || 'CREATE_ERROR'
    };
  }
};

/**
 * 📋 Obtener ventas pendientes (para vendedores)
 */
export const obtenerVentasPendientes = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.limite) params.append('limite', filtros.limite);
    
    const url = params.toString() 
      ? `/ventas/pendientes?${params}` 
      : '/ventas/pendientes';
    
    const response = await api.get(url);
    
    const { data, totales } = response.data;
    
    console.log(`✅ ${data.length} ventas pendientes obtenidas`);
    
    return {
      success: true,
      data: data || [],
      totales: totales || {},
      count: data?.length || 0
    };
  } catch (error) {
    console.error('❌ Error obteniendo ventas pendientes:', error);
    
    const message = error.response?.data?.message;
    return {
      success: false,
      message: message || 'Error al obtener ventas pendientes',
      error: error.message,
      data: [],
      totales: {}
    };
  }
};

/**
 * ✅ Confirmar venta (vendedor)
 */
export const confirmarVenta = async (ventaId, notas = '') => {
  if (!ventaId) {
    return {
      success: false,
      message: 'ID de venta inválido'
    };
  }
  
  try {
    console.log('✅ Confirmando venta:', ventaId);
    
    const response = await api.post(`/ventas/${ventaId}/confirmar`, {
      notas_vendedor: notas || ''
    });
    
    const ventaConfirmada = response.data.data;
    
    console.log('✅ Venta confirmada:', ventaConfirmada.numero_venta);
    
    return {
      success: true,
      data: ventaConfirmada,
      message: 'Venta confirmada correctamente'
    };
  } catch (error) {
    console.error('❌ Error confirmando venta:', error);
    
    const message = error.response?.data?.message;
    const code = error.response?.data?.code;
    
    if (message && message.includes('stock')) {
      return {
        success: false,
        message: 'Stock insuficiente para confirmar la venta',
        code: 'INSUFFICIENT_STOCK'
      };
    }
    
    if (message && message.includes('estado')) {
      return {
        success: false,
        message: 'La venta ya fue procesada',
        code: 'INVALID_STATE'
      };
    }
    
    return {
      success: false,
      message: message || 'Error al confirmar venta',
      error: error.message,
      code: code || 'CONFIRM_ERROR'
    };
  }
};

/**
 * 📊 Obtener detalle de una venta
 */
export const obtenerDetalleVenta = async (ventaId) => {
  if (!ventaId) {
    return {
      success: false,
      message: 'ID de venta inválido'
    };
  }
  
  try {
    const response = await api.get(`/ventas/${ventaId}`);
    
    const venta = response.data.data;
    
    console.log('✅ Detalle obtenido:', venta.numero_venta);
    
    return {
      success: true,
      data: venta
    };
  } catch (error) {
    console.error('❌ Error obteniendo detalle venta:', error);
    
    const message = error.response?.data?.message;
    const status = error.response?.status;
    
    if (status === 404) {
      return {
        success: false,
        message: 'Venta no encontrada',
        code: 'NOT_FOUND'
      };
    }
    
    return {
      success: false,
      message: message || 'Error al obtener detalle de venta',
      error: error.message
    };
  }
};

/**
 * 📊 Obtener estadísticas de ventas (vendedor)
 */
export const obtenerEstadisticas = async (periodo = 'mes') => {
  try {
    const response = await api.get(`/ventas/estadisticas/vendedor?periodo=${periodo}`);
    
    const stats = response.data.data;
    
    console.log('✅ Estadísticas obtenidas:', stats);
    
    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    
    const message = error.response?.data?.message;
    return {
      success: false,
      message: message || 'Error al obtener estadísticas',
      error: error.message,
      data: {
        ventasHoy: 0,
        totalVentas: 0,
        pendientes: 0,
        comision: 0
      }
    };
  }
};

// ==================== EXPORTS ====================

const ventasService = {
  crearVentaWhatsApp,
  obtenerVentasPendientes,
  confirmarVenta,
  obtenerDetalleVenta,
  obtenerEstadisticas
};

export default ventasService;