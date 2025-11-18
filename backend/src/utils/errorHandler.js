// C:\qhatu\backend\src\utils\errorHandler.js

/**
 * ===================================================
 * 🚨 MANEJO CENTRALIZADO DE ERRORES
 * ===================================================
 * Clases y funciones para manejo consistente de errores
 */

/**
 * Clase base para errores personalizados
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error de validación (400)
 */
class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

/**
 * Error de autenticación (401)
 */
class AuthenticationError extends AppError {
  constructor(message = 'No autenticado') {
    super(message, 401);
  }
}

/**
 * Error de autorización (403)
 */
class AuthorizationError extends AppError {
  constructor(message = 'No tienes permisos para esta acción') {
    super(message, 403);
  }
}

/**
 * Error de recurso no encontrado (404)
 */
class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} no encontrado`, 404);
  }
}

/**
 * Error de conflicto (409)
 */
class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
  }
}

/**
 * Middleware para capturar errores no manejados
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Modo desarrollo: mostrar stack trace
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  // Modo producción: solo errores operacionales
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      ...(err.errors && { errors: err.errors })
    });
  }

  // Errores de programación: log y mensaje genérico
  console.error('❌ ERROR NO OPERACIONAL:', err);
  
  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'Algo salió mal en el servidor'
  });
};

/**
 * Wrapper para funciones async/await
 * Evita try/catch repetitivos
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Middleware para manejar rutas no encontradas
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Ruta ${req.originalUrl}`);
  next(error);
};

/**
 * Validar campos requeridos
 */
const validateRequiredFields = (data, requiredFields) => {
  const missing = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    throw new ValidationError(
      'Campos requeridos faltantes',
      missing.map(field => ({
        field,
        message: `El campo '${field}' es requerido`
      }))
    );
  }
};

/**
 * Respuesta exitosa estandarizada
 */
const successResponse = (res, data, message = 'Operación exitosa', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Respuesta con paginación
 */
const paginatedResponse = (res, data, pagination, message = 'Datos obtenidos') => {
  return res.json({
    success: true,
    message,
    data,
    pagination: {
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      pages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Logger de errores
 */
const logError = (error, req = null) => {
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack
  };

  if (req) {
    errorLog.method = req.method;
    errorLog.url = req.originalUrl;
    errorLog.ip = req.ip;
    errorLog.user = req.user?.usuario_id || 'anónimo';
  }

  console.error('🔥 ERROR LOG:', JSON.stringify(errorLog, null, 2));
  
  // Aquí podrías enviar a un servicio de logs (Sentry, LogRocket, etc.)
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  errorHandler,
  catchAsync,
  notFoundHandler,
  validateRequiredFields,
  successResponse,
  paginatedResponse,
  logError
};