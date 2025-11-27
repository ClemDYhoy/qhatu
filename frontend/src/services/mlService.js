// frontend/src/services/mlService.js
import api from './api.js';

/**
 * 🔌 SERVICIO CLIENTE DE MACHINE LEARNING (FRONTEND)
 * 
 * Cliente para consumir los endpoints de IA desde el frontend.
 * Incluye manejo de errores, loading states y caché local.
 * 
 * @version 2.0.0 - PRODUCCIÓN
 */

class MLService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 2 * 60 * 1000; // 2 minutos
    this.requestsInProgress = new Map(); // Para evitar requests duplicados
  }

  // ====================================
  // 🔧 UTILIDADES DE CACHÉ
  // ====================================

  _getCacheKey(endpoint, params) {
    return `${endpoint}_${JSON.stringify(params)}`;
  }

  _setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  _getCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  _handleError(error, defaultMessage) {
    console.error('❌ ML Service Error:', error);
    
    if (error.response?.data) {
      return {
        success: false,
        error: error.response.data.error || defaultMessage,
        message: error.response.data.message,
        code: error.response.data.code,
        status: error.response.status
      };
    }
    
    return {
      success: false,
      error: defaultMessage,
      message: error.message || 'Error de conexión',
      code: 'NETWORK_ERROR'
    };
  }

  // ====================================
  // 🎯 ENDPOINTS PRINCIPALES DE IA
  // ====================================

  /**
   * Obtener segmento del cliente (K-Means)
   */
  async obtenerSegmentoCliente(usuarioId, useCache = true) {
    const cacheKey = this._getCacheKey('segmento', { usuarioId });
    
    // Verificar caché
    if (useCache) {
      const cached = this._getCache(cacheKey);
      if (cached) {
        console.log(`✅ Segmento de usuario ${usuarioId} obtenido del caché local`);
        return cached;
      }
    }

    // Verificar si ya hay una solicitud en progreso
    if (this.requestsInProgress.has(cacheKey)) {
      console.log(`⏳ Esperando solicitud existente para segmento ${usuarioId}...`);
      return this.requestsInProgress.get(cacheKey);
    }

    try {
      console.log(`🎯 Solicitando segmento para usuario ${usuarioId}...`);
      
      const requestPromise = api.get(`/ml/segmento-cliente/${usuarioId}`);
      this.requestsInProgress.set(cacheKey, requestPromise);
      
      const response = await requestPromise;
      
      const result = {
        success: true,
        ...response.data
      };

      this._setCache(cacheKey, result);
      return result;

    } catch (error) {
      return this._handleError(error, 'Error al obtener segmento del cliente');
    } finally {
      this.requestsInProgress.delete(cacheKey);
    }
  }

  /**
   * Obtener probabilidad de cierre (Regresión Lineal)
   */
  async obtenerProbabilidadCierre(usuarioId, useCache = true) {
    const cacheKey = this._getCacheKey('probabilidad', { usuarioId });
    
    if (useCache) {
      const cached = this._getCache(cacheKey);
      if (cached) {
        console.log(`✅ Probabilidad de usuario ${usuarioId} obtenida del caché local`);
        return cached;
      }
    }

    if (this.requestsInProgress.has(cacheKey)) {
      return this.requestsInProgress.get(cacheKey);
    }

    try {
      console.log(`🎯 Solicitando probabilidad para usuario ${usuarioId}...`);
      
      const requestPromise = api.get(`/ml/probabilidad-cierre/${usuarioId}`);
      this.requestsInProgress.set(cacheKey, requestPromise);
      
      const response = await requestPromise;
      
      const result = {
        success: true,
        ...response.data
      };

      this._setCache(cacheKey, result);
      return result;

    } catch (error) {
      return this._handleError(error, 'Error al calcular probabilidad de cierre');
    } finally {
      this.requestsInProgress.delete(cacheKey);
    }
  }

  /**
   * Obtener recomendaciones de productos (Cosine Similarity)
   */
  async obtenerRecomendacionesProductos(ventaId, useCache = true) {
    const cacheKey = this._getCacheKey('recomendaciones', { ventaId });
    
    if (useCache) {
      const cached = this._getCache(cacheKey);
      if (cached) {
        console.log(`✅ Recomendaciones para venta ${ventaId} obtenidas del caché local`);
        return cached;
      }
    }

    if (this.requestsInProgress.has(cacheKey)) {
      return this.requestsInProgress.get(cacheKey);
    }

    try {
      console.log(`🎯 Solicitando recomendaciones para venta ${ventaId}...`);
      
      const requestPromise = api.get(`/ml/recomendaciones/${ventaId}`);
      this.requestsInProgress.set(cacheKey, requestPromise);
      
      const response = await requestPromise;
      
      const result = {
        success: true,
        ...response.data
      };

      this._setCache(cacheKey, result);
      return result;

    } catch (error) {
      return this._handleError(error, 'Error al generar recomendaciones de productos');
    } finally {
      this.requestsInProgress.delete(cacheKey);
    }
  }

  /**
   * Obtener análisis completo (3 algoritmos)
   * ⚡ MÉTODO PRINCIPAL - USA ESTE
   */
  async obtenerAnalisisCompleto(ventaId, usuarioId, useCache = true) {
    const cacheKey = this._getCacheKey('analisis_completo', { ventaId, usuarioId });
    
    if (useCache) {
      const cached = this._getCache(cacheKey);
      if (cached) {
        console.log(`✅ Análisis completo obtenido del caché local`);
        return cached;
      }
    }

    if (this.requestsInProgress.has(cacheKey)) {
      return this.requestsInProgress.get(cacheKey);
    }

    try {
      console.log(`🎯 Solicitando análisis completo (venta ${ventaId}, usuario ${usuarioId})...`);
      
      const requestPromise = api.get(`/ml/analisis-completo/${ventaId}/${usuarioId}`);
      this.requestsInProgress.set(cacheKey, requestPromise);
      
      const response = await requestPromise;
      
      const result = {
        success: true,
        ...response.data
      };

      this._setCache(cacheKey, result);
      
      console.log(`✅ Análisis completo recibido:`, {
        segmento: result.data?.analisis?.segmentoCliente?.segmento,
        probabilidad: result.data?.analisis?.probabilidadCierre?.probabilidad,
        recomendaciones: result.data?.analisis?.recomendacionesProductos?.totalRecomendaciones
      });
      
      return result;

    } catch (error) {
      return this._handleError(error, 'Error al realizar análisis completo');
    } finally {
      this.requestsInProgress.delete(cacheKey);
    }
  }

  /**
   * Enviar recomendaciones por WhatsApp
   */
  async enviarRecomendacionesWhatsApp(data) {
    try {
      console.log('📱 Enviando recomendaciones por WhatsApp...', data);
      
      const response = await api.post('/ml/enviar-recomendaciones-whatsapp', data);
      
      return {
        success: true,
        ...response.data
      };

    } catch (error) {
      return this._handleError(error, 'Error al enviar recomendaciones por WhatsApp');
    }
  }

  // ====================================
  // 🛠️ UTILIDADES ADICIONALES
  // ====================================

  /**
   * Verificar salud del servicio ML
   */
  async healthCheck() {
    try {
      const response = await api.get('/ml/health');
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      return this._handleError(error, 'Error al verificar salud del servicio ML');
    }
  }

  /**
   * Limpiar caché local
   */
  limpiarCache() {
    this.cache.clear();
    console.log('🧹 Caché local de ML limpiado');
    return { success: true, message: 'Caché limpiado correctamente' };
  }

  /**
   * Obtener estadísticas del caché local
   */
  obtenerEstadisticasCache() {
    return {
      cacheSize: this.cache.size,
      cacheTimeout: this.cacheTimeout,
      requestsInProgress: this.requestsInProgress.size,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        age: Date.now() - value.timestamp,
        ageSeconds: Math.floor((Date.now() - value.timestamp) / 1000)
      }))
    };
  }

  // ====================================
  // 🎯 MÉTODOS DE CONVENIENCIA
  // ====================================

  /**
   * Generar resumen ejecutivo para UI
   */
  generarResumenEjecutivo(analisisCompleto) {
    if (!analisisCompleto?.success || !analisisCompleto.data?.analisis) {
      return null;
    }

    const { segmentoCliente, probabilidadCierre, recomendacionesProductos } = 
      analisisCompleto.data.analisis;

    return {
      prioridad: probabilidadCierre.probabilidad >= 80 ? 'ALTA' : 
                probabilidadCierre.probabilidad >= 60 ? 'MEDIA' : 'BAJA',
      icono: segmentoCliente.icono,
      segmento: segmentoCliente.segmento,
      color: segmentoCliente.color,
      probabilidad: probabilidadCierre.probabilidad,
      probabilidadPorcentaje: `${probabilidadCierre.probabilidad}%`,
      recomendacionesCount: recomendacionesProductos.totalRecomendaciones,
      mensajeResumen: `Cliente ${segmentoCliente.segmento} con ${probabilidadCierre.probabilidad}% de probabilidad de cierre. ${recomendacionesProductos.totalRecomendaciones} recomendaciones disponibles.`,
      accionRecomendada: this._generarAccionRecomendada(
        segmentoCliente.segmento, 
        probabilidadCierre.probabilidad
      )
    };
  }

  _generarAccionRecomendada(segmento, probabilidad) {
    if (probabilidad >= 85 && segmento === 'VIP') {
      return 'CONTACTAR INMEDIATAMENTE - Cliente VIP con probabilidad muy alta';
    }
    if (probabilidad >= 70) {
      return 'SEGUIMIENTO PRIORITARIO - Alta probabilidad de cierre';
    }
    if (probabilidad >= 50) {
      return 'SEGUIMIENTO ESTÁNDAR - Probabilidad media';
    }
    return 'SEGUIMIENTO BAJO - Enfocar en otros clientes';
  }

  /**
   * Formatear recomendaciones para mostrar en UI
   */
  formatearRecomendacionesParaUI(recomendaciones) {
    if (!recomendaciones?.success || !recomendaciones.data?.recomendaciones) {
      return [];
    }

    return recomendaciones.data.recomendaciones.map(rec => ({
      id: rec.producto_id,
      nombre: rec.producto_nombre,
      precio: rec.precio,
      precioNumerico: rec.precioNumerico,
      similitud: rec.similitud,
      razon: rec.razon,
      imagen: rec.url_imagen || '/awaiting-image.jpeg',
      categoria: rec.categoria_nombre,
      badge: rec.badge
    }));
  }

  /**
   * Calcular potencial de upsell
   */
  calcularPotencialUpsell(recomendaciones) {
    if (!recomendaciones?.success || !recomendaciones.data?.recomendaciones) {
      return {
        montoTotal: 0,
        cantidadProductos: 0,
        porcentajeIncremento: 0
      };
    }

    const totalRecomendaciones = recomendaciones.data.recomendaciones.reduce(
      (sum, rec) => sum + (rec.precioNumerico || 0),
      0
    );

    return {
      montoTotal: totalRecomendaciones,
      cantidadProductos: recomendaciones.data.recomendaciones.length,
      porcentajeIncremento: 0 // Calcular en el componente con el total actual
    };
  }

  /**
   * Verificar si la IA está disponible
   */
  async verificarDisponibilidad() {
    try {
      const health = await this.healthCheck();
      return health.success && health.status === 'healthy';
    } catch (error) {
      console.error('❌ IA no disponible:', error);
      return false;
    }
  }

  /**
   * Invalidar caché de un usuario específico
   */
  invalidarCacheUsuario(usuarioId) {
    let deletedCount = 0;
    
    for (const [key] of this.cache) {
      if (key.includes(`usuario_${usuarioId}`) || key.includes(`"usuarioId":${usuarioId}`)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    console.log(`🗑️ Invalidadas ${deletedCount} entradas de caché para usuario ${usuarioId}`);
    return deletedCount;
  }

  /**
   * Invalidar caché de una venta específica
   */
  invalidarCacheVenta(ventaId) {
    let deletedCount = 0;
    
    for (const [key] of this.cache) {
      if (key.includes(`venta_${ventaId}`) || key.includes(`"ventaId":${ventaId}`)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    console.log(`🗑️ Invalidadas ${deletedCount} entradas de caché para venta ${ventaId}`);
    return deletedCount;
  }
}
    
// ====================================
// 📤 EXPORTAR SINGLETON
// ====================================

const mlService = new MLService();
export default mlService;