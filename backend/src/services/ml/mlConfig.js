// backend/src/services/ml/mlConfig.js

/**
 * ⚙️ CONFIGURACIÓN GENERAL DE MACHINE LEARNING
 * 
 * Centraliza toda la configuración del sistema ML.
 * Permite cambiar comportamiento sin tocar código.
 * 
 * @version 1.0.0
 */

import {
  KMEANS_CONFIG,
  COSINE_CONFIG,
  REGRESSION_CONFIG,
  CACHE_CONFIG,
  WHATSAPP_CONFIG,
  PRIORITY_CONFIG,
  NORMALIZATION_CONFIG,
  METRICS_CONFIG,
  VALIDATION_LIMITS,
  DEV_CONFIG
} from './mlConstants.js';

/**
 * Configuración principal del servicio ML
 */
class MLConfig {
  constructor() {
    // Cargar configuraciones
    this.kmeans = KMEANS_CONFIG;
    this.cosine = COSINE_CONFIG;
    this.regression = REGRESSION_CONFIG;
    this.cache = CACHE_CONFIG;
    this.whatsapp = WHATSAPP_CONFIG;
    this.priority = PRIORITY_CONFIG;
    this.normalization = NORMALIZATION_CONFIG;
    this.metrics = METRICS_CONFIG;
    this.validation = VALIDATION_LIMITS;
    this.dev = DEV_CONFIG;
    
    // Variables de entorno
    this.env = {
      NODE_ENV: process.env.NODE_ENV || 'development',
      ENABLE_ML: process.env.ENABLE_ML !== 'false', // true por defecto
      ML_CACHE_ENABLED: process.env.ML_CACHE_ENABLED !== 'false',
      ML_LOG_LEVEL: process.env.ML_LOG_LEVEL || 'info'
    };
    
    // Estado del servicio
    this.state = {
      initialized: false,
      lastCleanup: null,
      totalRequests: 0,
      totalCacheHits: 0,
      totalErrors: 0
    };
  }

  /**
   * Inicializar el servicio ML
   */
  initialize() {
    if (this.state.initialized) {
      console.log('⚠️  ML Config ya inicializado');
      return;
    }

    console.log('🎯 Inicializando ML Config...');
    
    // Validar configuración
    this._validateConfig();
    
    // Inicializar métricas
    this._initializeMetrics();
    
    this.state.initialized = true;
    this.state.lastCleanup = new Date();
    
    console.log('✅ ML Config inicializado correctamente');
    
    if (this.dev.ENABLE_DEBUG_LOGS) {
      this._logConfiguration();
    }
  }

  /**
   * Validar configuración
   */
  _validateConfig() {
    // Validar K-Means
    if (this.kmeans.K < 2 || this.kmeans.K > 10) {
      throw new Error('K-Means: K debe estar entre 2 y 10');
    }

    // Validar Cosine
    if (this.cosine.SIMILARITY_THRESHOLD < 0 || this.cosine.SIMILARITY_THRESHOLD > 1) {
      throw new Error('Cosine: SIMILARITY_THRESHOLD debe estar entre 0 y 1');
    }

    // Validar Regresión
    Object.values(this.regression.BASE_PROBABILITY).forEach(prob => {
      if (prob < 0 || prob > 100) {
        throw new Error('Regresión: Probabilidades deben estar entre 0 y 100');
      }
    });

    console.log('✅ Configuración validada');
  }

  /**
   * Inicializar métricas
   */
  _initializeMetrics() {
    this.state.totalRequests = 0;
    this.state.totalCacheHits = 0;
    this.state.totalErrors = 0;
  }

  /**
   * Registrar una solicitud
   */
  recordRequest() {
    this.state.totalRequests++;
  }

  /**
   * Registrar un cache hit
   */
  recordCacheHit() {
    this.state.totalCacheHits++;
  }

  /**
   * Registrar un error
   */
  recordError() {
    this.state.totalErrors++;
  }

  /**
   * Obtener estadísticas del servicio
   */
  getStats() {
    const cacheHitRate = this.state.totalRequests > 0
      ? (this.state.totalCacheHits / this.state.totalRequests * 100).toFixed(2)
      : 0;

    return {
      initialized: this.state.initialized,
      environment: this.env.NODE_ENV,
      mlEnabled: this.env.ENABLE_ML,
      cacheEnabled: this.env.ML_CACHE_ENABLED,
      totalRequests: this.state.totalRequests,
      totalCacheHits: this.state.totalCacheHits,
      cacheHitRate: `${cacheHitRate}%`,
      totalErrors: this.state.totalErrors,
      errorRate: this.state.totalRequests > 0
        ? `${(this.state.totalErrors / this.state.totalRequests * 100).toFixed(2)}%`
        : '0%',
      lastCleanup: this.state.lastCleanup,
      uptime: this.state.initialized 
        ? Math.floor((Date.now() - this.state.lastCleanup.getTime()) / 1000)
        : 0
    };
  }

  /**
   * Obtener configuración de un algoritmo específico
   */
  getAlgorithmConfig(algorithm) {
    const configs = {
      'kmeans': this.kmeans,
      'cosine': this.cosine,
      'regression': this.regression
    };

    return configs[algorithm] || null;
  }

  /**
   * Actualizar configuración en runtime (solo en desarrollo)
   */
  updateConfig(algorithm, key, value) {
    if (this.env.NODE_ENV === 'production') {
      throw new Error('No se puede modificar configuración en producción');
    }

    const configs = {
      'kmeans': this.kmeans,
      'cosine': this.cosine,
      'regression': this.regression
    };

    if (!configs[algorithm]) {
      throw new Error(`Algoritmo ${algorithm} no existe`);
    }

    if (configs[algorithm][key] === undefined) {
      throw new Error(`Clave ${key} no existe en ${algorithm}`);
    }

    configs[algorithm][key] = value;
    console.log(`✅ Configuración actualizada: ${algorithm}.${key} = ${value}`);

    return configs[algorithm];
  }

  /**
   * Resetear estadísticas
   */
  resetStats() {
    this._initializeMetrics();
    console.log('🔄 Estadísticas reseteadas');
  }

  /**
   * Verificar si el servicio ML está habilitado
   */
  isEnabled() {
    return this.env.ENABLE_ML && this.state.initialized;
  }

  /**
   * Verificar si el caché está habilitado
   */
  isCacheEnabled() {
    return this.env.ML_CACHE_ENABLED;
  }

  /**
   * Obtener TTL de caché para un tipo de dato
   */
  getCacheTTL(dataType) {
    return this.cache.TTL[dataType] || this.cache.TTL.analisisCompleto;
  }

  /**
   * Obtener segmento por score
   */
  getSegmentByScore(totalCompras, gastoTotal, diasInactivo) {
    const { VIP_THRESHOLD, MEDIO_THRESHOLD } = this.kmeans;

    if (
      totalCompras >= VIP_THRESHOLD.totalCompras &&
      gastoTotal >= VIP_THRESHOLD.gastoTotal &&
      diasInactivo <= VIP_THRESHOLD.diasInactivo
    ) {
      return 'VIP';
    }

    if (
      totalCompras >= MEDIO_THRESHOLD.totalCompras &&
      gastoTotal >= MEDIO_THRESHOLD.gastoTotal &&
      diasInactivo <= MEDIO_THRESHOLD.diasInactivo
    ) {
      return 'MEDIO';
    }

    return 'NUEVO';
  }

  /**
   * Obtener probabilidad base por segmento
   */
  getBaseProbability(segment) {
    return this.regression.BASE_PROBABILITY[segment] || 50;
  }

  /**
   * Obtener prioridad por probabilidad
   */
  getPriorityByProbability(probability) {
    if (probability >= this.priority.ALTA.minProbability) {
      return this.priority.ALTA;
    }
    
    if (probability >= this.priority.MEDIA.minProbability) {
      return this.priority.MEDIA;
    }
    
    return this.priority.BAJA;
  }

  /**
   * Log de configuración (debug)
   */
  _logConfiguration() {
    console.log('\n📊 CONFIGURACIÓN ML');
    console.log('═'.repeat(50));
    console.log('🎯 K-Means:');
    console.log(`   - K clusters: ${this.kmeans.K}`);
    console.log(`   - VIP threshold: ${this.kmeans.VIP_THRESHOLD.totalCompras} compras`);
    console.log('\n📊 Cosine Similarity:');
    console.log(`   - Threshold: ${this.cosine.SIMILARITY_THRESHOLD}`);
    console.log(`   - Max recomendaciones: ${this.cosine.MAX_RECOMMENDATIONS}`);
    console.log('\n📈 Regresión Lineal:');
    console.log(`   - Prob. VIP: ${this.regression.BASE_PROBABILITY.VIP}%`);
    console.log(`   - Prob. MEDIO: ${this.regression.BASE_PROBABILITY.MEDIO}%`);
    console.log(`   - Prob. NUEVO: ${this.regression.BASE_PROBABILITY.NUEVO}%`);
    console.log('\n💾 Caché:');
    console.log(`   - TTL Segmento: ${this.cache.TTL.segmentoCliente / 1000}s`);
    console.log(`   - TTL Recomendaciones: ${this.cache.TTL.recomendaciones / 1000}s`);
    console.log(`   - Max size: ${this.cache.MAX_SIZE} entradas`);
    console.log('═'.repeat(50) + '\n');
  }

  /**
   * Exportar configuración completa
   */
  exportConfig() {
    return {
      kmeans: this.kmeans,
      cosine: this.cosine,
      regression: this.regression,
      cache: this.cache,
      whatsapp: this.whatsapp,
      priority: this.priority,
      normalization: this.normalization,
      metrics: this.metrics,
      validation: this.validation,
      dev: this.dev,
      env: this.env,
      state: this.state
    };
  }

  /**
   * Importar configuración (solo en desarrollo)
   */
  importConfig(config) {
    if (this.env.NODE_ENV === 'production') {
      throw new Error('No se puede importar configuración en producción');
    }

    Object.assign(this.kmeans, config.kmeans);
    Object.assign(this.cosine, config.cosine);
    Object.assign(this.regression, config.regression);
    Object.assign(this.cache, config.cache);

    console.log('✅ Configuración importada correctamente');
  }
}

// ====================================
// 📤 EXPORTAR SINGLETON
// ====================================

const mlConfig = new MLConfig();

// Auto-inicializar
mlConfig.initialize();

export default mlConfig;