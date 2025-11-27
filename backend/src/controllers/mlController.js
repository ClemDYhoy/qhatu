// backend/src/controllers/mlController.js
import { param, validationResult } from 'express-validator';
import mlRecommendationService from '../services/ml/mlRecommendationService.js';
import { MLValidationError } from '../services/ml/mlValidators.js';

// Helper para manejar async/await sin try/catch repetitivos
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware para validar parámetros
const validateParams = validations => async (req, res, next) => {
  await Promise.all(validations.map(v => v.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Parámetros inválidos',
      details: errors.array()
    });
  }
  next();
};

const mlController = {

  // ====================================
  // 🔹 Health Check
  // ====================================
  healthCheck: asyncHandler(async (req, res) => {
    const health = await mlRecommendationService.healthCheck();
    res.json(health);
  }),

  // ====================================
  // 🔹 Obtener segmento de cliente
  // ====================================
  obtenerSegmentoCliente: [
    validateParams([
      param('usuarioId').isInt({ gt: 0 }).withMessage('usuarioId debe ser un número positivo')
    ]),
    asyncHandler(async (req, res) => {
      const { usuarioId } = req.params;
      const segmento = await mlRecommendationService.segmentarClienteKMeans(Number(usuarioId));
      res.json({ success: true, data: segmento });
    })
  ],

  // ====================================
  // 🔹 Obtener probabilidad de cierre
  // ====================================
  obtenerProbabilidadCierre: [
    validateParams([
      param('usuarioId').isInt({ gt: 0 }).withMessage('usuarioId debe ser un número positivo')
    ]),
    asyncHandler(async (req, res) => {
      const { usuarioId } = req.params;
      const probabilidad = await mlRecommendationService.predecirProbabilidadCierre(Number(usuarioId));
      res.json({ success: true, data: probabilidad });
    })
  ],

  // ====================================
  // 🔹 Obtener recomendaciones de productos
  // ====================================
  obtenerRecomendacionesProductos: [
    validateParams([
      param('ventaId').isInt({ gt: 0 }).withMessage('ventaId debe ser un número positivo')
    ]),
    asyncHandler(async (req, res) => {
      const { ventaId } = req.params;
      const recomendaciones = await mlRecommendationService.calcularRecomendacionesCosine(Number(ventaId));
      res.json({ success: true, data: recomendaciones });
    })
  ],

  // ====================================
  // 🔹 Obtener análisis completo
  // ====================================
  obtenerAnalisisCompleto: [
    validateParams([
      param('ventaId').isInt({ gt: 0 }).withMessage('ventaId debe ser un número positivo'),
      param('usuarioId').isInt({ gt: 0 }).withMessage('usuarioId debe ser un número positivo')
    ]),
    asyncHandler(async (req, res) => {
      const { ventaId, usuarioId } = req.params;
      const resultado = await mlRecommendationService.obtenerAnalisisCompletoVenta(
        Number(ventaId),
        Number(usuarioId)
      );
      res.json(resultado);
    })
  ],

  // ====================================
  // 🔹 Limpiar caché
  // ====================================
  limpiarCache: asyncHandler(async (req, res) => {
    const resultado = mlRecommendationService.limpiarCache();
    res.json(resultado);
  }),

  // ====================================
  // 🔹 Enviar recomendaciones por WhatsApp (Placeholder)
  // ====================================
  enviarRecomendacionesWhatsApp: asyncHandler(async (req, res) => {
    const { ventaId, usuarioId, productosRecomendados, mensajePersonalizado } = req.body;

    if (!ventaId || !usuarioId) {
      return res.status(400).json({ success: false, error: 'ventaId y usuarioId son requeridos' });
    }

    // Placeholder: implementación real en mlRecommendationService
    if (typeof mlRecommendationService.enviarRecomendacionesWhatsApp !== 'function') {
      return res.status(501).json({
        success: false,
        error: 'Funcionalidad no implementada',
        message: 'El envío de recomendaciones por WhatsApp aún no está disponible'
      });
    }

    const resultado = await mlRecommendationService.enviarRecomendacionesWhatsApp({
      ventaId: Number(ventaId),
      usuarioId: Number(usuarioId),
      productosRecomendados,
      mensajePersonalizado
    });

    res.json({ success: true, data: resultado });
  }),

  // ====================================
  // 🔹 Manejo de errores centralizado
  // ====================================
  errorHandler: (err, req, res, next) => {
    console.error('❌ Error en ML Controller:', err);

    if (err instanceof MLValidationError) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno',
      timestamp: new Date().toISOString()
    });
  }

};

export default mlController;
