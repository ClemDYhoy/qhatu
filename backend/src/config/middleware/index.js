// src/config/middleware/index.js
/**
 * Índice centralizado de middlewares
 * Permite importar todos los middlewares desde un solo lugar
 */

// Importar todos los middlewares de autenticación
export {
  // Autenticación base
  requireAuth,
  optionalAuth,
  
  // Verificación de roles
  requireRole,
  requireAdmin,
  requireSuperAdmin,
  requireVendedor,
  requireAlmacenero,
  
  // Verificación de permisos
  requirePermission,
  requireAnyPermission,
  
  // Helpers
  hasPermission,
  hasRole,
  requireOwnerOrAdmin,
  
  // Aliases para compatibilidad
  authMiddleware,
  authenticate,
  isAuthenticated,
  adminMiddleware,
  isAdmin,
  superAdminMiddleware,
  isSuperAdmin,
  vendedorMiddleware,
  isVendedor,
  almaceneroMiddleware,
  isAlmacenero,
  
  // Export por defecto
  default as auth
} from './auth.js';

/**
 * Middleware de validación de datos
 * Para validar request body, params y query
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

/**
 * Middleware de logging de requests
 */
export const logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
};

/**
 * Middleware para cachear respuestas
 */
export const cacheResponse = (duration = 60) => {
  const cache = new Map();
  
  return (req, res, next) => {
    const key = req.originalUrl;
    const cached = cache.get(key);
    
    if (cached && Date.now() < cached.expiry) {
      return res.json(cached.data);
    }
    
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      cache.set(key, {
        data,
        expiry: Date.now() + duration * 1000
      });
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * Middleware para sanitizar inputs
 */
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Remover caracteres peligrosos
        sanitized[key] = value
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/<[^>]+>/g, '')
          .trim();
      } else if (typeof value === 'object') {
        sanitized[key] = sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };
  
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  
  next();
};

/**
 * Middleware para manejar async/await en rutas
 * Evita tener que usar try/catch en cada ruta
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};