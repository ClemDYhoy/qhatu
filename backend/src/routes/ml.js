// backend/src/routes/ml.js
import express from 'express';
import mlController from '../controllers/mlController.js';
import { requireAuth, requireRole } from '../config/middleware/auth.js';

const router = express.Router();

/**
 * 🌐 RUTAS DE MACHINE LEARNING
 * 
 * Endpoints para los algoritmos de IA del sistema.
 * Todos requieren autenticación y algunos roles específicos.
 * 
 * @version 1.0.0
 */

// ====================================
// 🔐 MIDDLEWARE DE AUTENTICACIÓN
// ====================================

// Todas las rutas requieren autenticación
router.use(requireAuth);

// ====================================
// 🎯 ENDPOINTS PÚBLICOS (Autenticados)
// ====================================

/**
 * @route   GET /api/ml/health
 * @desc    Verificar estado del servicio ML
 * @access  Privado (Cualquier usuario autenticado)
 * @returns {Object} Estado del servicio ML
 */
router.get('/health', mlController.healthCheck);

/**
 * @route   GET /api/ml/segmento-cliente/:usuarioId
 * @desc    Obtener segmento del cliente (K-Means)
 * @access  Privado (Vendedores/Admin)
 * @params  usuarioId - ID del usuario a segmentar
 * @returns {Object} Segmento y características del cliente
 */
router.get('/segmento-cliente/:usuarioId', 
  requireRole(['vendedor', 'admin']), 
  mlController.obtenerSegmentoCliente
);

/**
 * @route   GET /api/ml/probabilidad-cierre/:usuarioId
 * @desc    Obtener probabilidad de cierre (Regresión Lineal)
 * @access  Privado (Vendedores/Admin)
 * @params  usuarioId - ID del usuario a analizar
 * @returns {Object} Probabilidad y factores de influencia
 */
router.get('/probabilidad-cierre/:usuarioId', 
  requireRole(['vendedor', 'admin']), 
  mlController.obtenerProbabilidadCierre
);

/**
 * @route   GET /api/ml/recomendaciones/:ventaId
 * @desc    Obtener recomendaciones de productos (Cosine Similarity)
 * @access  Privado (Vendedores/Admin)
 * @params  ventaId - ID de la venta a analizar
 * @returns {Object} Productos recomendados con similitud
 */
router.get('/recomendaciones/:ventaId', 
  requireRole(['vendedor', 'admin']), 
  mlController.obtenerRecomendacionesProductos
);

/**
 * @route   GET /api/ml/analisis-completo/:ventaId/:usuarioId
 * @desc    Obtener análisis completo con los 3 algoritmos
 * @access  Privado (Vendedores/Admin)
 * @params  ventaId - ID de la venta, usuarioId - ID del usuario
 * @returns {Object} Análisis completo con segmento, probabilidad y recomendaciones
 */
router.get('/analisis-completo/:ventaId/:usuarioId', 
  requireRole(['vendedor', 'admin']), 
  mlController.obtenerAnalisisCompleto
);

// ====================================
// 📱 ENDPOINTS DE ACCIÓN
// ====================================

/**
 * @route   POST /api/ml/enviar-recomendaciones-whatsapp
 * @desc    Enviar recomendaciones por WhatsApp al cliente
 * @access  Privado (Vendedores)
 * @body    { ventaId, usuarioId, productosRecomendados?, mensajePersonalizado? }
 * @returns {Object} URL de WhatsApp y mensaje generado
 */
router.post('/enviar-recomendaciones-whatsapp', 
  requireRole(['vendedor']), 
  mlController.enviarRecomendacionesWhatsApp
);

// ====================================
// 🛠️ ENDPOINTS DE ADMINISTRACIÓN
// ====================================

/**
 * @route   POST /api/ml/limpiar-cache
 * @desc    Limpiar caché del servicio ML (útil para testing)
 * @access  Privado (Admin)
 * @returns {Object} Confirmación de limpieza
 */
router.post('/limpiar-cache', 
  requireRole(['admin']), 
  mlController.limpiarCache
);

// ====================================
// 📚 DOCUMENTACIÓN DE LA API
// ====================================

/**
 * @route   GET /api/ml
 * @desc    Documentación de los endpoints ML
 * @access  Privado
 * @returns {Object} Documentación de la API ML
 */
router.get('/', requireAuth, (req, res) => {
  res.json({
    service: 'Qhatu ML Recommendation API',
    version: '1.0.0',
    description: 'Endpoints de Machine Learning para optimización de ventas',
    endpoints: {
      health: {
        method: 'GET',
        path: '/api/ml/health',
        description: 'Verificar estado del servicio ML',
        access: 'Cualquier usuario autenticado'
      },
      segmentoCliente: {
        method: 'GET',
        path: '/api/ml/segmento-cliente/:usuarioId',
        description: 'Obtener segmento del cliente (K-Means)',
        access: 'Vendedores/Admin',
        parameters: {
          usuarioId: 'ID del usuario a segmentar'
        }
      },
      probabilidadCierre: {
        method: 'GET',
        path: '/api/ml/probabilidad-cierre/:usuarioId',
        description: 'Obtener probabilidad de cierre (Regresión Lineal)',
        access: 'Vendedores/Admin',
        parameters: {
          usuarioId: 'ID del usuario a analizar'
        }
      },
      recomendaciones: {
        method: 'GET',
        path: '/api/ml/recomendaciones/:ventaId',
        description: 'Obtener recomendaciones de productos (Cosine Similarity)',
        access: 'Vendedores/Admin',
        parameters: {
          ventaId: 'ID de la venta a analizar'
        }
      },
      analisisCompleto: {
        method: 'GET',
        path: '/api/ml/analisis-completo/:ventaId/:usuarioId',
        description: 'Análisis completo con los 3 algoritmos',
        access: 'Vendedores/Admin',
        parameters: {
          ventaId: 'ID de la venta',
          usuarioId: 'ID del usuario'
        }
      },
      enviarWhatsApp: {
        method: 'POST',
        path: '/api/ml/enviar-recomendaciones-whatsapp',
        description: 'Enviar recomendaciones por WhatsApp',
        access: 'Vendedores',
        body: {
          ventaId: 'ID de la venta (requerido)',
          usuarioId: 'ID del usuario (requerido)',
          productosRecomendados: 'Array de productos a recomendar (opcional)',
          mensajePersonalizado: 'Mensaje personalizado (opcional)'
        }
      },
      limpiarCache: {
        method: 'POST',
        path: '/api/ml/limpiar-cache',
        description: 'Limpiar caché del servicio ML',
        access: 'Admin'
      }
    },
    algorithms: {
      kmeans: {
        name: 'K-Means Clustering',
        purpose: 'Segmentación de clientes en VIP/Medio/Nuevo',
        inputs: ['total_compras', 'gasto_total', 'dias_inactivo'],
        outputs: ['segmento', 'score', 'recomendaciones']
      },
      cosine: {
        name: 'Cosine Similarity',
        purpose: 'Recomendaciones de productos similares',
        inputs: ['categoria', 'precio', 'popularidad', 'destacado'],
        outputs: ['productos_similares', 'porcentaje_similitud', 'razon']
      },
      regression: {
        name: 'Linear Regression',
        purpose: 'Predicción de probabilidad de cierre',
        inputs: ['historial_confirmaciones', 'segmento_cliente', 'comportamiento'],
        outputs: ['probabilidad', 'factores_influencia', 'recomendacion']
      }
    },
    timestamp: new Date().toISOString()
  });
});

// ====================================
// 🚨 MANEJO DE ERRORES
// ====================================

// Ruta no encontrada
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint ML no encontrado',
    path: req.originalUrl,
    method: req.method,
    suggestion: 'Consulta GET /api/ml para ver los endpoints disponibles',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores global
router.use((error, req, res, next) => {
  console.error('❌ Error en ruta ML:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: 'Error interno en servicio ML',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor',
    code: 'ML_SERVICE_ERROR',
    timestamp: new Date().toISOString()
  });
});

// ====================================
// 📤 EXPORTAR ROUTER
// ====================================

export default router;