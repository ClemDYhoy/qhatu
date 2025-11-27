// backend/src/services/ml/mlValidators.js

/**
 * ✅ VALIDADORES DE MACHINE LEARNING
 * 
 * Valida todos los datos de entrada para los algoritmos ML.
 * Evita errores y asegura la integridad de los datos.
 * 
 * @version 1.0.0
 */

import { VALIDATION_LIMITS } from './mlConstants.js';

/**
 * Clase de validación de errores personalizada
 */
export class MLValidationError extends Error {
  constructor(message, code = 'VALIDATION_ERROR', field = null) {
    super(message);
    this.name = 'MLValidationError';
    this.code = code;
    this.field = field;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Validadores base
 */
class MLValidators {
  
  // ====================================
  // 🔢 VALIDADORES BÁSICOS
  // ====================================

  /**
   * Validar que un valor es un número entero válido
   */
  validateInteger(value, fieldName = 'value', min = null, max = null) {
    // Verificar que existe
    if (value === null || value === undefined) {
      throw new MLValidationError(
        `${fieldName} es requerido`,
        'REQUIRED_FIELD',
        fieldName
      );
    }

    // Convertir a número si es string
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;

    // Verificar que es número
    if (isNaN(numValue) || !Number.isInteger(numValue)) {
      throw new MLValidationError(
        `${fieldName} debe ser un número entero`,
        'INVALID_INTEGER',
        fieldName
      );
    }

    // Verificar límites
    const minLimit = min !== null ? min : VALIDATION_LIMITS.MIN_ID;
    const maxLimit = max !== null ? max : VALIDATION_LIMITS.MAX_ID;

    if (numValue < minLimit || numValue > maxLimit) {
      throw new MLValidationError(
        `${fieldName} debe estar entre ${minLimit} y ${maxLimit}`,
        'OUT_OF_RANGE',
        fieldName
      );
    }

    return numValue;
  }

  /**
   * Validar que un valor es un número decimal válido
   */
  validateDecimal(value, fieldName = 'value', min = null, max = null) {
    if (value === null || value === undefined) {
      throw new MLValidationError(
        `${fieldName} es requerido`,
        'REQUIRED_FIELD',
        fieldName
      );
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue) || !isFinite(numValue)) {
      throw new MLValidationError(
        `${fieldName} debe ser un número válido`,
        'INVALID_NUMBER',
        fieldName
      );
    }

    if (min !== null && numValue < min) {
      throw new MLValidationError(
        `${fieldName} debe ser mayor o igual a ${min}`,
        'VALUE_TOO_LOW',
        fieldName
      );
    }

    if (max !== null && numValue > max) {
      throw new MLValidationError(
        `${fieldName} debe ser menor o igual a ${max}`,
        'VALUE_TOO_HIGH',
        fieldName
      );
    }

    return numValue;
  }

  /**
   * Validar que un valor es un string válido
   */
  validateString(value, fieldName = 'value', minLength = 0, maxLength = null) {
    if (value === null || value === undefined) {
      throw new MLValidationError(
        `${fieldName} es requerido`,
        'REQUIRED_FIELD',
        fieldName
      );
    }

    const strValue = String(value).trim();

    if (strValue.length < minLength) {
      throw new MLValidationError(
        `${fieldName} debe tener al menos ${minLength} caracteres`,
        'STRING_TOO_SHORT',
        fieldName
      );
    }

    const maxLen = maxLength || VALIDATION_LIMITS.MAX_STRING_LENGTH;
    if (strValue.length > maxLen) {
      throw new MLValidationError(
        `${fieldName} no debe exceder ${maxLen} caracteres`,
        'STRING_TOO_LONG',
        fieldName
      );
    }

    return strValue;
  }

  /**
   * Validar que un valor es un array válido
   */
  validateArray(value, fieldName = 'value', minLength = 0, maxLength = null) {
    if (!Array.isArray(value)) {
      throw new MLValidationError(
        `${fieldName} debe ser un array`,
        'INVALID_ARRAY',
        fieldName
      );
    }

    if (value.length < minLength) {
      throw new MLValidationError(
        `${fieldName} debe tener al menos ${minLength} elementos`,
        'ARRAY_TOO_SHORT',
        fieldName
      );
    }

    const maxLen = maxLength || VALIDATION_LIMITS.MAX_ARRAY_LENGTH;
    if (value.length > maxLen) {
      throw new MLValidationError(
        `${fieldName} no debe exceder ${maxLen} elementos`,
        'ARRAY_TOO_LONG',
        fieldName
      );
    }

    return value;
  }

  /**
   * Validar que un valor está en una lista de opciones
   */
  validateEnum(value, options, fieldName = 'value') {
    if (!options.includes(value)) {
      throw new MLValidationError(
        `${fieldName} debe ser uno de: ${options.join(', ')}`,
        'INVALID_ENUM',
        fieldName
      );
    }

    return value;
  }

  // ====================================
  // 🎯 VALIDADORES ESPECÍFICOS DE ML
  // ====================================

  /**
   * Validar ID de usuario
   */
  validateUsuarioId(usuarioId) {
    return this.validateInteger(
      usuarioId,
      'usuarioId',
      VALIDATION_LIMITS.MIN_ID,
      VALIDATION_LIMITS.MAX_ID
    );
  }

  /**
   * Validar ID de venta
   */
  validateVentaId(ventaId) {
    return this.validateInteger(
      ventaId,
      'ventaId',
      VALIDATION_LIMITS.MIN_ID,
      VALIDATION_LIMITS.MAX_ID
    );
  }

  /**
   * Validar ID de producto
   */
  validateProductoId(productoId) {
    return this.validateInteger(
      productoId,
      'productoId',
      VALIDATION_LIMITS.MIN_ID,
      VALIDATION_LIMITS.MAX_ID
    );
  }

  /**
   * Validar cantidad
   */
  validateCantidad(cantidad) {
    return this.validateInteger(
      cantidad,
      'cantidad',
      VALIDATION_LIMITS.MIN_CANTIDAD,
      VALIDATION_LIMITS.MAX_CANTIDAD
    );
  }

  /**
   * Validar precio
   */
  validatePrecio(precio) {
    return this.validateDecimal(
      precio,
      'precio',
      VALIDATION_LIMITS.MIN_PRECIO,
      VALIDATION_LIMITS.MAX_PRECIO
    );
  }

  /**
   * Validar probabilidad (0-1)
   */
  validateProbability(probability) {
    return this.validateDecimal(
      probability,
      'probability',
      0,
      1
    );
  }

  /**
   * Validar porcentaje (0-100)
   */
  validatePercentage(percentage) {
    return this.validateDecimal(
      percentage,
      'percentage',
      0,
      100
    );
  }

  /**
   * Validar similitud (0-1)
   */
  validateSimilarity(similarity) {
    return this.validateDecimal(
      similarity,
      'similarity',
      0,
      1
    );
  }

  /**
   * Validar datos de cliente para K-Means
   */
  validateClienteData(clienteData) {
    if (!clienteData || typeof clienteData !== 'object') {
      throw new MLValidationError(
        'Datos de cliente inválidos',
        'INVALID_CLIENT_DATA'
      );
    }

    // Validar campos requeridos
    const required = ['totalCompras', 'gastoTotal', 'diasInactivo'];
    const missing = required.filter(field => clienteData[field] === undefined);

    if (missing.length > 0) {
      throw new MLValidationError(
        `Faltan campos requeridos: ${missing.join(', ')}`,
        'MISSING_REQUIRED_FIELDS'
      );
    }

    // Validar tipos
    return {
      totalCompras: this.validateInteger(clienteData.totalCompras, 'totalCompras', 0),
      gastoTotal: this.validateDecimal(clienteData.gastoTotal, 'gastoTotal', 0),
      diasInactivo: this.validateInteger(clienteData.diasInactivo, 'diasInactivo', 0),
      ticketPromedio: clienteData.ticketPromedio 
        ? this.validateDecimal(clienteData.ticketPromedio, 'ticketPromedio', 0)
        : 0,
      frecuenciaCompra: clienteData.frecuenciaCompra 
        ? this.validateDecimal(clienteData.frecuenciaCompra, 'frecuenciaCompra', 0)
        : 0
    };
  }

  /**
   * Validar datos de producto para Cosine Similarity
   */
  validateProductoData(productoData) {
    if (!productoData || typeof productoData !== 'object') {
      throw new MLValidationError(
        'Datos de producto inválidos',
        'INVALID_PRODUCT_DATA'
      );
    }

    const required = ['producto_id', 'nombre', 'precio', 'categoria_id'];
    const missing = required.filter(field => productoData[field] === undefined);

    if (missing.length > 0) {
      throw new MLValidationError(
        `Faltan campos requeridos en producto: ${missing.join(', ')}`,
        'MISSING_REQUIRED_FIELDS'
      );
    }

    return {
      producto_id: this.validateProductoId(productoData.producto_id),
      nombre: this.validateString(productoData.nombre, 'nombre', 1),
      precio: this.validatePrecio(productoData.precio),
      categoria_id: this.validateInteger(productoData.categoria_id, 'categoria_id', 1),
      ventas: productoData.ventas 
        ? this.validateInteger(productoData.ventas, 'ventas', 0)
        : 0,
      destacado: Boolean(productoData.destacado)
    };
  }

  /**
   * Validar vector de características
   */
  validateFeatureVector(vector, expectedLength = null) {
    if (!Array.isArray(vector)) {
      throw new MLValidationError(
        'El vector debe ser un array',
        'INVALID_VECTOR'
      );
    }

    if (expectedLength !== null && vector.length !== expectedLength) {
      throw new MLValidationError(
        `El vector debe tener ${expectedLength} elementos`,
        'INVALID_VECTOR_LENGTH'
      );
    }

    // Validar que todos son números
    const hasInvalidValues = vector.some(v => typeof v !== 'number' || isNaN(v) || !isFinite(v));
    if (hasInvalidValues) {
      throw new MLValidationError(
        'El vector contiene valores inválidos',
        'INVALID_VECTOR_VALUES'
      );
    }

    return vector;
  }

  /**
   * Validar datos de historial para Regresión
   */
  validateHistorialData(historialData) {
    if (!historialData || typeof historialData !== 'object') {
      throw new MLValidationError(
        'Datos de historial inválidos',
        'INVALID_HISTORY_DATA'
      );
    }

    return {
      totalVentas: this.validateInteger(
        historialData.totalVentas || 0, 
        'totalVentas', 
        0
      ),
      ventasConfirmadas: this.validateInteger(
        historialData.ventasConfirmadas || 0, 
        'ventasConfirmadas', 
        0
      ),
      tasaConfirmacion: this.validateDecimal(
        historialData.tasaConfirmacion || 0, 
        'tasaConfirmacion', 
        0, 
        1
      ),
      tiempoPromedioConfirmacion: historialData.tiempoPromedioConfirmacion 
        ? this.validateDecimal(historialData.tiempoPromedioConfirmacion, 'tiempoPromedioConfirmacion', 0)
        : 0
    };
  }

  /**
   * Validar datos para enviar recomendaciones por WhatsApp
   */
  validateWhatsAppData(data) {
    if (!data || typeof data !== 'object') {
      throw new MLValidationError(
        'Datos de WhatsApp inválidos',
        'INVALID_WHATSAPP_DATA'
      );
    }

    const validated = {
      ventaId: this.validateVentaId(data.ventaId),
      usuarioId: this.validateUsuarioId(data.usuarioId)
    };

    // Validar productos recomendados (opcional)
    if (data.productosRecomendados) {
      validated.productosRecomendados = this.validateArray(
        data.productosRecomendados,
        'productosRecomendados',
        0,
        10
      );

      // Validar estructura de cada producto
      validated.productosRecomendados = validated.productosRecomendados.map(prod => {
        if (typeof prod === 'number') {
          return { producto_id: prod };
        }
        if (prod && typeof prod === 'object' && prod.producto_id) {
          return {
            producto_id: this.validateProductoId(prod.producto_id),
            producto_nombre: prod.producto_nombre || '',
            precio: prod.precio ? this.validatePrecio(prod.precio) : 0,
            similitud: prod.similitud ? this.validateSimilarity(prod.similitud) : 0
          };
        }
        throw new MLValidationError(
          'Estructura de producto recomendado inválida',
          'INVALID_PRODUCT_STRUCTURE'
        );
      });
    }

    // Validar mensaje personalizado (opcional)
    if (data.mensajePersonalizado) {
      validated.mensajePersonalizado = this.validateString(
        data.mensajePersonalizado,
        'mensajePersonalizado',
        0,
        1000
      );
    }

    return validated;
  }

  /**
   * Validar parámetros de caché
   */
  validateCacheKey(key) {
    return this.validateString(key, 'cacheKey', 1, 200);
  }

  /**
   * Validar TTL de caché
   */
  validateCacheTTL(ttl) {
    return this.validateInteger(ttl, 'cacheTTL', 1000, 3600000); // 1seg - 1hora
  }

  // ====================================
  // 🔄 SANITIZADORES
  // ====================================

  /**
   * Sanitizar entrada eliminando caracteres peligrosos
   */
  sanitizeInput(input) {
    if (typeof input === 'string') {
      return input
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/[<>\"\']/g, '')
        .trim();
    }
    return input;
  }

  /**
   * Sanitizar objeto completo
   */
  sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  // ====================================
  // 🧪 VALIDADORES DE RANGO
  // ====================================

  /**
   * Validar que un valor está en un rango
   */
  validateRange(value, min, max, fieldName = 'value') {
    const numValue = this.validateDecimal(value, fieldName);
    
    if (numValue < min || numValue > max) {
      throw new MLValidationError(
        `${fieldName} debe estar entre ${min} y ${max}`,
        'OUT_OF_RANGE',
        fieldName
      );
    }

    return numValue;
  }

  /**
   * Validar múltiples campos a la vez
   */
  validateMultiple(validations) {
    const errors = [];
    const results = {};

    for (const [field, validator] of Object.entries(validations)) {
      try {
        results[field] = validator();
      } catch (error) {
        if (error instanceof MLValidationError) {
          errors.push({
            field: error.field || field,
            message: error.message,
            code: error.code
          });
        } else {
          errors.push({
            field,
            message: error.message,
            code: 'UNKNOWN_ERROR'
          });
        }
      }
    }

    if (errors.length > 0) {
      const error = new MLValidationError(
        'Errores de validación múltiples',
        'MULTIPLE_VALIDATION_ERRORS'
      );
      error.errors = errors;
      throw error;
    }

    return results;
  }
}

// ====================================
// 📤 EXPORTAR SINGLETON
// ====================================

const mlValidators = new MLValidators();
export default mlValidators;