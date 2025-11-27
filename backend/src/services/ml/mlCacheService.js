// backend/src/services/ml/mlCacheService.js

/**
 * 💾 SERVICIO DE CACHÉ PARA MACHINE LEARNING
 * 
 * Sistema de caché en memoria para optimizar consultas ML.
 * Reduce carga en BD y mejora tiempos de respuesta.
 * 
 * @version 1.0.0
 */

import { CACHE_CONFIG } from './mlConstants.js';
import mlConfig from './mlConfig.js';

class MLCacheService {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      clears: 0
    };
    
    // Auto-limpieza periódica
    this._startAutoCleanup();
  }

  // ====================================
  // 🔍 OPERACIONES BÁSICAS
  // ====================================

  /**
   * Obtener valor del caché
   */
  get(key) {
    if (!mlConfig.isCacheEnabled()) {
      this.stats.misses++;
      return null;
    }

    const entry = this.cache.get(key);

    // No existe
    if (!entry) {
      this.stats.misses++;
      mlConfig.recordRequest();
      return null;
    }

    // Verificar expiración
    if (this._isExpired(entry)) {
      this.delete(key);
      this.stats.misses++;
      mlConfig.recordRequest();
      return null;
    }

    // Cache hit
    this.stats.hits++;
    mlConfig.recordCacheHit();
    mlConfig.recordRequest();
    
    // Actualizar último acceso
    entry.lastAccess = Date.now();
    entry.hits++;

    return entry.data;
  }

  /**
   * Guardar valor en caché
   */
  set(key, data, ttl = null) {
    if (!mlConfig.isCacheEnabled()) {
      return false;
    }

    // Verificar tamaño máximo
    if (this.cache.size >= CACHE_CONFIG.MAX_SIZE) {
      this._evictOldest();
    }

    const entry = {
      key,
      data,
      ttl: ttl || CACHE_CONFIG.TTL.analisisCompleto,
      createdAt: Date.now(),
      lastAccess: Date.now(),
      hits: 0
    };

    this.cache.set(key, entry);
    this.stats.sets++;

    return true;
  }

  /**
   * Eliminar valor del caché
   */
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  /**
   * Verificar si existe una clave
   */
  has(key) {
    if (!mlConfig.isCacheEnabled()) {
      return false;
    }

    const entry = this.cache.get(key);
    if (!entry) return false;

    // Verificar si está expirado
    if (this._isExpired(entry)) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Limpiar todo el caché
   */
  clear() {
    this.cache.clear();
    this.stats.clears++;
    console.log('🧹 Caché ML limpiado completamente');
    return true;
  }

  // ====================================
  // 🎯 MÉTODOS ESPECÍFICOS DE ML
  // ====================================

  /**
   * Obtener o calcular (con callback)
   */
  async getOrCompute(key, computeFn, ttl = null) {
    // Intentar obtener del caché
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Calcular nuevo valor
    try {
      const data = await computeFn();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      console.error(`❌ Error computando valor para ${key}:`, error);
      throw error;
    }
  }

  /**
   * Guardar segmento de cliente
   */
  setSegmentoCliente(usuarioId, segmento) {
    const key = this._generateKey('segmento', usuarioId);
    return this.set(key, segmento, CACHE_CONFIG.TTL.segmentoCliente);
  }

  /**
   * Obtener segmento de cliente
   */
  getSegmentoCliente(usuarioId) {
    const key = this._generateKey('segmento', usuarioId);
    return this.get(key);
  }

  /**
   * Guardar probabilidad de cierre
   */
  setProbabilidadCierre(usuarioId, probabilidad) {
    const key = this._generateKey('probabilidad', usuarioId);
    return this.set(key, probabilidad, CACHE_CONFIG.TTL.probabilidadCierre);
  }

  /**
   * Obtener probabilidad de cierre
   */
  getProbabilidadCierre(usuarioId) {
    const key = this._generateKey('probabilidad', usuarioId);
    return this.get(key);
  }

  /**
   * Guardar recomendaciones
   */
  setRecomendaciones(ventaId, recomendaciones) {
    const key = this._generateKey('recomendaciones', ventaId);
    return this.set(key, recomendaciones, CACHE_CONFIG.TTL.recomendaciones);
  }

  /**
   * Obtener recomendaciones
   */
  getRecomendaciones(ventaId) {
    const key = this._generateKey('recomendaciones', ventaId);
    return this.get(key);
  }

  /**
   * Guardar análisis completo
   */
  setAnalisisCompleto(ventaId, usuarioId, analisis) {
    const key = this._generateKey('analisis', `${ventaId}_${usuarioId}`);
    return this.set(key, analisis, CACHE_CONFIG.TTL.analisisCompleto);
  }

  /**
   * Obtener análisis completo
   */
  getAnalisisCompleto(ventaId, usuarioId) {
    const key = this._generateKey('analisis', `${ventaId}_${usuarioId}`);
    return this.get(key);
  }

  // ====================================
  // 🧹 INVALIDACIÓN DE CACHÉ
  // ====================================

  /**
   * Invalidar caché de un usuario específico
   */
  invalidateUser(usuarioId) {
    const keysToDelete = [];

    for (const [key] of this.cache) {
      if (key.includes(`_${usuarioId}`) || key.includes(`usuario_${usuarioId}`)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
    
    console.log(`🗑️ Invalidadas ${keysToDelete.length} entradas de usuario ${usuarioId}`);
    return keysToDelete.length;
  }

  /**
   * Invalidar caché de una venta específica
   */
  invalidateVenta(ventaId) {
    const keysToDelete = [];

    for (const [key] of this.cache) {
      if (key.includes(`_${ventaId}`) || key.includes(`venta_${ventaId}`)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
    
    console.log(`🗑️ Invalidadas ${keysToDelete.length} entradas de venta ${ventaId}`);
    return keysToDelete.length;
  }

  /**
   * Invalidar caché por patrón
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    const keysToDelete = [];

    for (const [key] of this.cache) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
    
    console.log(`🗑️ Invalidadas ${keysToDelete.length} entradas con patrón ${pattern}`);
    return keysToDelete.length;
  }

  // ====================================
  // 🔧 MÉTODOS INTERNOS
  // ====================================

  /**
   * Generar clave de caché
   */
  _generateKey(type, identifier) {
    return `ml_${type}_${identifier}`;
  }

  /**
   * Verificar si una entrada está expirada
   */
  _isExpired(entry) {
    const now = Date.now();
    const age = now - entry.createdAt;
    return age > entry.ttl;
  }

  /**
   * Evictar la entrada más antigua (LRU)
   */
  _evictOldest() {
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
      console.log(`🗑️ Evicción LRU: ${oldestKey}`);
    }
  }

  /**
   * Limpiar entradas expiradas
   */
  _cleanupExpired() {
    const now = Date.now();
    const keysToDelete = [];

    for (const [key, entry] of this.cache) {
      if (this._isExpired(entry)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`🧹 Limpiadas ${keysToDelete.length} entradas expiradas`);
    }

    return keysToDelete.length;
  }

  /**
   * Iniciar limpieza automática periódica
   */
  _startAutoCleanup() {
    setInterval(() => {
      this._cleanupExpired();
    }, CACHE_CONFIG.AUTO_CLEAN_INTERVAL);

    console.log(`⏰ Auto-limpieza de caché iniciada (cada ${CACHE_CONFIG.AUTO_CLEAN_INTERVAL / 1000}s)`);
  }

  // ====================================
  // 📊 ESTADÍSTICAS Y MÉTRICAS
  // ====================================

  /**
   * Obtener estadísticas del caché
   */
  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 
      ? (this.stats.hits / totalRequests * 100).toFixed(2)
      : 0;

    return {
      size: this.cache.size,
      maxSize: CACHE_CONFIG.MAX_SIZE,
      usage: ((this.cache.size / CACHE_CONFIG.MAX_SIZE) * 100).toFixed(2) + '%',
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: hitRate + '%',
      sets: this.stats.sets,
      deletes: this.stats.deletes,
      clears: this.stats.clears,
      enabled: mlConfig.isCacheEnabled()
    };
  }

  /**
   * Obtener información detallada de todas las entradas
   */
  getEntries() {
    const entries = [];

    for (const [key, entry] of this.cache) {
      entries.push({
        key,
        size: this._estimateSize(entry.data),
        age: Math.floor((Date.now() - entry.createdAt) / 1000) + 's',
        ttl: Math.floor((entry.ttl - (Date.now() - entry.createdAt)) / 1000) + 's',
        hits: entry.hits,
        lastAccess: new Date(entry.lastAccess).toISOString(),
        expired: this._isExpired(entry)
      });
    }

    return entries.sort((a, b) => b.hits - a.hits); // Ordenar por hits
  }

  /**
   * Estimar tamaño de un objeto en memoria (aproximado)
   */
  _estimateSize(obj) {
    const str = JSON.stringify(obj);
    const bytes = new Blob([str]).size;
    
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  }

  /**
   * Obtener entradas más populares
   */
  getTopEntries(limit = 10) {
    const entries = this.getEntries();
    return entries.slice(0, limit);
  }

  /**
   * Obtener métricas de rendimiento
   */
  getPerformanceMetrics() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 
      ? (this.stats.hits / totalRequests * 100)
      : 0;

    return {
      cacheEfficiency: hitRate >= 70 ? 'EXCELENTE' : hitRate >= 50 ? 'BUENA' : hitRate >= 30 ? 'REGULAR' : 'MALA',
      recommendedAction: hitRate < 30 
        ? 'Considerar aumentar TTL o mejorar estrategia de caché'
        : hitRate < 50
        ? 'Considerar aumentar TTL'
        : 'Rendimiento óptimo',
      memorySavings: `~${this.stats.hits} consultas SQL evitadas`,
      timeSavings: `~${(this.stats.hits * 0.05).toFixed(2)}s ahorrados` // Asumiendo 50ms por query
    };
  }

  /**
   * Resetear estadísticas
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      clears: 0
    };
    console.log('📊 Estadísticas de caché reseteadas');
    return true;
  }

  /**
   * Obtener información de una clave específica
   */
  inspect(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    return {
      key,
      exists: true,
      expired: this._isExpired(entry),
      data: entry.data,
      metadata: {
        createdAt: new Date(entry.createdAt).toISOString(),
        lastAccess: new Date(entry.lastAccess).toISOString(),
        age: Math.floor((Date.now() - entry.createdAt) / 1000) + 's',
        ttl: entry.ttl + 'ms',
        remainingTTL: Math.max(0, entry.ttl - (Date.now() - entry.createdAt)) + 'ms',
        hits: entry.hits,
        size: this._estimateSize(entry.data)
      }
    };
  }

  /**
   * Warm up - precalentar caché con datos comunes
   */
  async warmUp(commonKeys) {
    console.log('🔥 Precalentando caché ML...');
    let warmed = 0;

    for (const { key, computeFn, ttl } of commonKeys) {
      try {
        await this.getOrCompute(key, computeFn, ttl);
        warmed++;
      } catch (error) {
        console.error(`❌ Error precalentando ${key}:`, error.message);
      }
    }

    console.log(`✅ Caché precalentado: ${warmed}/${commonKeys.length} entradas`);
    return warmed;
  }
}

// ====================================
// 📤 EXPORTAR SINGLETON
// ====================================

const mlCacheService = new MLCacheService();
export default mlCacheService;