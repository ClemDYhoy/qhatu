// backend/src/services/ml/mlConstants.js

/**
 * 🔢 CONSTANTES DE MACHINE LEARNING
 * 
 * Valores configurables para los algoritmos de IA.
 * Ajusta estos valores según el comportamiento de tu negocio.
 * 
 * @version 1.0.0
 */

// ====================================
// 🎯 K-MEANS - SEGMENTACIÓN DE CLIENTES
// ====================================

export const KMEANS_CONFIG = {
  // Número de clusters (segmentos)
  K: 3,
  
  // Umbrales para segmentación VIP
  VIP_THRESHOLD: {
    totalCompras: 5,      // Mínimo 5 compras para ser VIP
    gastoTotal: 300,      // Mínimo S/.300 gastado para ser VIP
    diasInactivo: 30      // Máximo 30 días sin comprar para ser VIP
  },
  
  // Umbrales para segmentación MEDIO
  MEDIO_THRESHOLD: {
    totalCompras: 2,      // Mínimo 2 compras para ser MEDIO
    gastoTotal: 100,      // Mínimo S/.100 gastado para ser MEDIO
    diasInactivo: 60      // Máximo 60 días sin comprar para ser MEDIO
  },
  
  // Pesos para cálculo de score de fidelidad
  WEIGHTS: {
    totalCompras: 0.4,    // 40% del score
    gastoTotal: 0.4,      // 40% del score
    frecuencia: 0.2       // 20% del score
  },
  
  // Colores y etiquetas por segmento
  SEGMENTOS: {
    VIP: {
      nombre: 'VIP',
      color: 'red',
      icono: '🔴',
      prioridad: 1,
      descripcion: 'Cliente de alto valor'
    },
    MEDIO: {
      nombre: 'MEDIO',
      color: 'yellow',
      icono: '🟡',
      prioridad: 2,
      descripcion: 'Cliente regular'
    },
    NUEVO: {
      nombre: 'NUEVO',
      color: 'green',
      icono: '🟢',
      prioridad: 3,
      descripcion: 'Cliente nuevo'
    }
  }
};

// ====================================
// 📊 COSINE SIMILARITY - RECOMENDACIONES
// ====================================

export const COSINE_CONFIG = {
  // Umbral mínimo de similitud (0-1)
  SIMILARITY_THRESHOLD: 0.6,    // Solo recomendar si similitud > 60%
  
  // Número máximo de recomendaciones a retornar
  MAX_RECOMMENDATIONS: 5,
  
  // Pesos para cálculo de similitud
  WEIGHTS: {
    categoria: 0.4,      // 40% - Misma categoría es muy importante
    precio: 0.3,         // 30% - Precio similar
    popularidad: 0.2,    // 20% - Productos populares
    destacado: 0.1       // 10% - Productos destacados
  },
  
  // Rango de precio para considerar "similares" (±30%)
  PRICE_RANGE_PERCENT: 0.3,
  
  // Boost para productos de la misma categoría
  SAME_CATEGORY_BOOST: 0.2,
  
  // Penalización para productos ya en el carrito
  ALREADY_IN_CART_PENALTY: -0.5
};

// ====================================
// 📈 REGRESIÓN LINEAL - PROBABILIDAD CIERRE
// ====================================

export const REGRESSION_CONFIG = {
  // Probabilidad base por segmento (%)
  BASE_PROBABILITY: {
    VIP: 92,
    MEDIO: 75,
    NUEVO: 45
  },
  
  // Factores de ajuste
  ADJUSTMENT_FACTORS: {
    // Ajuste por tasa de confirmación histórica
    historicRate: {
      weight: 0.3,
      max: 10       // Máximo +10% de ajuste
    },
    
    // Ajuste por volumen de compras
    purchaseVolume: {
      weight: 0.2,
      perPurchase: 2,  // +2% por cada compra
      max: 10          // Máximo +10%
    },
    
    // Ajuste por recencia
    recency: {
      weight: 0.2,
      thresholds: {
        veryRecent: { days: 7, adjustment: 5 },    // +5% si compró en 7 días
        recent: { days: 15, adjustment: 3 },       // +3% si compró en 15 días
        moderate: { days: 30, adjustment: 0 },     // Sin ajuste
        old: { days: 60, adjustment: -5 }          // -5% si no compra hace 60 días
      }
    },
    
    // Ajuste por tiempo promedio de confirmación
    confirmationSpeed: {
      weight: 0.1,
      fast: { minutes: 30, adjustment: 8 },   // +8% si confirma en <30 min
      normal: { minutes: 120, adjustment: 0 }, // Sin ajuste
      slow: { minutes: 240, adjustment: -5 }   // -5% si tarda >4 horas
    }
  },
  
  // Límites de probabilidad
  MIN_PROBABILITY: 5,   // Mínimo 5%
  MAX_PROBABILITY: 98,  // Máximo 98%
  
  // Umbrales de confianza del análisis
  CONFIDENCE_LEVELS: {
    VERY_HIGH: { minSamples: 20, label: 'MUY_ALTA' },
    HIGH: { minSamples: 10, label: 'ALTA' },
    MEDIUM: { minSamples: 5, label: 'MEDIA' },
    LOW: { minSamples: 2, label: 'BAJA' },
    VERY_LOW: { minSamples: 0, label: 'MUY_BAJA' }
  }
};

// ====================================
// 💾 CONFIGURACIÓN DE CACHÉ
// ====================================

export const CACHE_CONFIG = {
  // Tiempo de vida del caché por tipo de dato
  TTL: {
    segmentoCliente: 5 * 60 * 1000,      // 5 minutos
    probabilidadCierre: 5 * 60 * 1000,   // 5 minutos
    recomendaciones: 10 * 60 * 1000,     // 10 minutos
    analisisCompleto: 5 * 60 * 1000      // 5 minutos
  },
  
  // Tamaño máximo de caché (entradas)
  MAX_SIZE: 1000,
  
  // Limpiar caché automáticamente cada X tiempo
  AUTO_CLEAN_INTERVAL: 15 * 60 * 1000   // 15 minutos
};

// ====================================
// 📱 WHATSAPP - MENSAJES
// ====================================

export const WHATSAPP_CONFIG = {
  // Templates de mensajes
  TEMPLATES: {
    recomendacionVIP: {
      saludo: '¡Hola {nombre}! 👋',
      intro: 'Como cliente VIP, te recomendamos productos que van perfecto con tu pedido:',
      despedida: '¿Te interesa agregar alguno? Responde aquí o escríbeme ✨'
    },
    
    recomendacionMedio: {
      saludo: 'Hola {nombre}! 👋',
      intro: 'Te sugerimos estos productos que complementan tu compra:',
      despedida: '¿Quieres agregarlos a tu pedido? ¡Responde aquí! 😊'
    },
    
    recomendacionNuevo: {
      saludo: 'Hola {nombre}! 👋',
      intro: 'Estos productos van muy bien con lo que elegiste:',
      despedida: '¿Te interesan? ¡Escríbeme! 🎉'
    }
  },
  
  // Emojis por categoría
  EMOJI_CATEGORIAS: {
    'Dulces': '🍬',
    'Snacks': '🍿',
    'Bebidas': '🥤',
    'Ramen y Fideos': '🍜',
    'Licores': '🍷',
    'default': '🎁'
  },
  
  // Máximo de productos a mostrar en mensaje
  MAX_PRODUCTS_IN_MESSAGE: 3
};

// ====================================
// 🎯 PRIORIDADES DE VENTA
// ====================================

export const PRIORITY_CONFIG = {
  ALTA: {
    minProbability: 80,
    color: 'red',
    label: 'ALTA',
    action: 'Contactar INMEDIATAMENTE'
  },
  
  MEDIA: {
    minProbability: 60,
    color: 'yellow',
    label: 'MEDIA',
    action: 'Seguimiento PRIORITARIO'
  },
  
  BAJA: {
    minProbability: 0,
    color: 'green',
    label: 'BAJA',
    action: 'Seguimiento ESTÁNDAR'
  }
};

// ====================================
// 🔢 NORMALIZACIÓN DE DATOS
// ====================================

export const NORMALIZATION_CONFIG = {
  // Valores máximos esperados para normalización
  MAX_VALUES: {
    precio: 1000,           // S/.1000 como máximo esperado
    ventas: 1000,           // 1000 ventas como máximo esperado
    totalCompras: 100,      // 100 compras como máximo esperado
    gastoTotal: 10000       // S/.10,000 como máximo esperado
  },
  
  // Método de normalización
  METHOD: 'min-max'  // 'min-max' o 'z-score'
};

// ====================================
// 🧮 FÓRMULAS MATEMÁTICAS
// ====================================

export const FORMULAS = {
  // Cosine Similarity: (A · B) / (|A| × |B|)
  cosineSimilarity: {
    description: 'Similitud del coseno entre dos vectores',
    formula: '(dotProduct) / (magnitudeA × magnitudeB)',
    range: [0, 1]
  },
  
  // Euclidean Distance: √(Σ(ai - bi)²)
  euclideanDistance: {
    description: 'Distancia euclidiana entre dos puntos',
    formula: 'sqrt(sum((a[i] - b[i])²))',
    range: [0, Infinity]
  },
  
  // Score de Fidelidad
  fidelityScore: {
    description: 'Puntuación de fidelidad del cliente',
    formula: '(compras × 0.4) + (gastos × 0.4) + (frecuencia × 0.2)',
    range: [0, 100]
  }
};

// ====================================
// 📊 MÉTRICAS DE PERFORMANCE
// ====================================

export const METRICS_CONFIG = {
  // Tiempos máximos de respuesta (ms)
  MAX_RESPONSE_TIME: {
    segmentacion: 1000,       // 1 segundo
    recomendaciones: 2000,    // 2 segundos
    probabilidad: 1000,       // 1 segundo
    analisisCompleto: 3000    // 3 segundos
  },
  
  // Logging
  ENABLE_PERFORMANCE_LOG: true,
  LOG_SLOW_QUERIES: true,
  SLOW_QUERY_THRESHOLD: 1000  // Considerar lento si > 1 segundo
};

// ====================================
// 🚨 LÍMITES Y VALIDACIONES
// ====================================

export const VALIDATION_LIMITS = {
  // IDs
  MIN_ID: 1,
  MAX_ID: Number.MAX_SAFE_INTEGER,
  
  // Cantidades
  MIN_CANTIDAD: 1,
  MAX_CANTIDAD: 999,
  
  // Precios
  MIN_PRECIO: 0.01,
  MAX_PRECIO: 99999.99,
  
  // Strings
  MAX_STRING_LENGTH: 500,
  MAX_ARRAY_LENGTH: 100
};

// ====================================
// 🔧 CONFIGURACIÓN DE DESARROLLO
// ====================================

export const DEV_CONFIG = {
  // Habilitar logs detallados en desarrollo
  ENABLE_DEBUG_LOGS: process.env.NODE_ENV === 'development',
  
  // Mostrar tiempos de ejecución
  SHOW_EXECUTION_TIMES: process.env.NODE_ENV === 'development',
  
  // Datos mock para testing
  USE_MOCK_DATA: false
};

// ====================================
// 📤 EXPORTAR TODAS LAS CONSTANTES
// ====================================

export default {
  KMEANS_CONFIG,
  COSINE_CONFIG,
  REGRESSION_CONFIG,
  CACHE_CONFIG,
  WHATSAPP_CONFIG,
  PRIORITY_CONFIG,
  NORMALIZATION_CONFIG,
  FORMULAS,
  METRICS_CONFIG,
  VALIDATION_LIMITS,
  DEV_CONFIG
};