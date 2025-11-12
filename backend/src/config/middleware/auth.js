// src/config/middleware/auth.js
import jwt from 'jsonwebtoken';
import db from '../database.js';

// ============================================
// 🔐 AUTENTICACIÓN BASE
// ============================================

/**
 * Middleware de autenticación obligatoria
 * Requiere token válido, sino devuelve 401
 */
export const requireAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Token no proporcionado.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario en la base de datos con rol
    const [usuarios] = await db.query(
      `SELECT 
        u.usuario_id, 
        u.email, 
        u.nombre_completo,
        u.telefono,
        u.rol_id,
        u.estado,
        r.nombre as rol_nombre,
        r.permisos
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.rol_id
      WHERE u.usuario_id = ? AND u.estado = 'activo'`,
      [decoded.usuario_id]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o inactivo'
      });
    }

    // Parsear permisos si están en JSON
    const usuario = usuarios[0];
    if (usuario.permisos && typeof usuario.permisos === 'string') {
      try {
        usuario.permisos = JSON.parse(usuario.permisos);
      } catch (e) {
        // Si no es JSON, dejar como está
      }
    }

    req.user = usuario;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error en la autenticación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware de autenticación opcional
 * Si hay token válido, agrega req.user
 * Si no hay token, continúa sin req.user (para carritos de invitados)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [usuarios] = await db.query(
      `SELECT 
        u.usuario_id, 
        u.email, 
        u.nombre_completo,
        u.telefono,
        u.rol_id,
        u.estado,
        r.nombre as rol_nombre,
        r.permisos
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.rol_id
      WHERE u.usuario_id = ? AND u.estado = 'activo'`,
      [decoded.usuario_id]
    );

    if (usuarios.length > 0) {
      const usuario = usuarios[0];
      if (usuario.permisos && typeof usuario.permisos === 'string') {
        try {
          usuario.permisos = JSON.parse(usuario.permisos);
        } catch (e) {
          // Ignorar error de parsing
        }
      }
      req.user = usuario;
    }

    next();
  } catch (error) {
    // Si hay error en el token, continuar sin usuario
    next();
  }
};

// ============================================
// 👥 VERIFICACIÓN DE ROLES
// ============================================

/**
 * Middleware para verificar roles específicos
 * Uso: requireRole(['super_admin', 'vendedor'])
 */
export const requireRole = (rolesPermitidos) => {
  // Normalizar entrada: aceptar string o array
  const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];
  
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Acceso denegado. Autenticación requerida.'
        });
      }

      const rolNombre = req.user.rol_nombre;

      if (!roles.includes(rolNombre)) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. No tienes permisos suficientes.',
          requiredRoles: roles,
          userRole: rolNombre
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos'
      });
    }
  };
};

/**
 * Middleware para verificar si es admin (cualquier tipo)
 * Roles permitidos: super_admin, vendedor, almacenero
 */
export const requireAdmin = requireRole(['super_admin', 'vendedor', 'almacenero']);

/**
 * Middleware para verificar si es super admin
 */
export const requireSuperAdmin = requireRole(['super_admin']);

/**
 * Middleware para verificar si es vendedor o super admin
 */
export const requireVendedor = requireRole(['super_admin', 'vendedor']);

/**
 * Middleware para verificar si es almacenero o super admin
 */
export const requireAlmacenero = requireRole(['super_admin', 'almacenero']);

// ============================================
// 🔑 VERIFICACIÓN DE PERMISOS GRANULARES
// ============================================

/**
 * Middleware para verificar permisos específicos
 * Uso: requirePermission('productos', 'crear')
 */
export const requirePermission = (recurso, accion) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Acceso denegado. Autenticación requerida.'
        });
      }

      // Super admin tiene todos los permisos
      if (req.user.rol_nombre === 'super_admin') {
        return next();
      }

      const permisos = req.user.permisos;
      
      // Si permisos es un objeto JSON (formato moderno)
      if (permisos && typeof permisos === 'object') {
        if (permisos[recurso] && permisos[recurso].includes(accion)) {
          return next();
        }
      }
      // Si permisos es string con formato antiguo "productos:crear,editar|ventas:ver"
      else if (permisos && typeof permisos === 'string') {
        const recursos = permisos.split('|');
        
        for (const recursoPermiso of recursos) {
          const [nombre, acciones] = recursoPermiso.split(':');
          
          if (nombre === recurso) {
            const accionesArray = acciones.split(',').map(a => a.trim());
            if (accionesArray.includes(accion)) {
              return next();
            }
          }
        }
      }

      return res.status(403).json({
        success: false,
        message: `No tienes permiso para ${accion} en ${recurso}`,
        requiredPermission: { recurso, accion },
        userRole: req.user.rol_nombre
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

/**
 * Middleware para verificar múltiples permisos (OR logic)
 * Si el usuario tiene AL MENOS UNO de los permisos, permite el acceso
 */
export const requireAnyPermission = (permisosArray) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Acceso denegado. Autenticación requerida.'
        });
      }

      // Super admin tiene todos los permisos
      if (req.user.rol_nombre === 'super_admin') {
        return next();
      }

      const permisos = req.user.permisos;

      for (const { recurso, accion } of permisosArray) {
        if (permisos && typeof permisos === 'object') {
          if (permisos[recurso] && permisos[recurso].includes(accion)) {
            return next();
          }
        }
      }

      return res.status(403).json({
        success: false,
        message: 'No tienes ninguno de los permisos requeridos',
        requiredPermissions: permisosArray,
        userRole: req.user.rol_nombre
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos'
      });
    }
  };
};

// ============================================
// 📋 HELPERS Y UTILIDADES
// ============================================

/**
 * Helper para verificar si un usuario tiene un permiso específico
 * Uso en controladores: if (hasPermission(req.user, 'productos', 'crear')) { ... }
 */
export const hasPermission = (user, recurso, accion) => {
  if (!user) return false;
  if (user.rol_nombre === 'super_admin') return true;

  const permisos = user.permisos;

  if (permisos && typeof permisos === 'object') {
    return permisos[recurso] && permisos[recurso].includes(accion);
  }

  return false;
};

/**
 * Helper para verificar si un usuario tiene un rol específico
 */
export const hasRole = (user, rol) => {
  if (!user) return false;
  const roles = Array.isArray(rol) ? rol : [rol];
  return roles.includes(user.rol_nombre);
};

/**
 * Middleware para verificar que el usuario es dueño del recurso
 * o es admin
 */
export const requireOwnerOrAdmin = (userIdField = 'usuario_id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Autenticación requerida'
        });
      }

      // Admin puede acceder a todo
      if (hasRole(req.user, ['super_admin', 'vendedor', 'almacenero'])) {
        return next();
      }

      // Verificar que sea el dueño
      const resourceUserId = req.params[userIdField] || req.body[userIdField];
      
      if (parseInt(resourceUserId) !== req.user.usuario_id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para acceder a este recurso'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos'
      });
    }
  };
};

// ============================================
// 📤 ALIASES PARA COMPATIBILIDAD
// ============================================

// Aliases para nombres comunes
export const authMiddleware = requireAuth;
export const authenticate = requireAuth;
export const isAuthenticated = requireAuth;

export const adminMiddleware = requireAdmin;
export const isAdmin = requireAdmin;

export const superAdminMiddleware = requireSuperAdmin;
export const isSuperAdmin = requireSuperAdmin;

export const vendedorMiddleware = requireVendedor;
export const isVendedor = requireVendedor;

export const almaceneroMiddleware = requireAlmacenero;
export const isAlmacenero = requireAlmacenero;

// Export por defecto para compatibilidad
export default requireAuth;