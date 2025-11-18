// C:\qhatu\backend\src\config\middleware\auth.js
import jwt from 'jsonwebtoken';
import { User, Role } from '../../models/index.js';

// ============================================
// 🔐 AUTENTICACIÓN BASE
// ============================================

/**
 * Middleware de autenticación obligatoria
 * Requiere token válido, sino devuelve 401
 */
export const requireAuth = async (req, res, next) => {
  try {
    // 1. Extraer y validar token
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Token no proporcionado.'
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o malformado.'
      });
    }

    // 2. Verificar token JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado'
        });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }
      throw jwtError;
    }

    // 3. Buscar usuario en la base de datos con Sequelize
    const user = await User.findByPk(decoded.usuario_id, {
      attributes: [
        'usuario_id',
        'email',
        'nombre_completo',
        'telefono',
        'rol_id',
        'estado',
        'foto_perfil_url'
      ],
      include: [{
        model: Role,
        as: 'rol',
        attributes: ['rol_id', 'nombre', 'permisos'],
        required: false
      }]
    });

    // 4. Validar usuario existe y está activo
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (user.estado !== 'activo') {
      return res.status(403).json({
        success: false,
        message: 'Tu cuenta está inactiva. Contacta al administrador.'
      });
    }

    // 5. Preparar datos del usuario
    const userData = user.toJSON();
    
    // Parsear permisos si están en JSON string
    if (userData.rol?.permisos && typeof userData.rol.permisos === 'string') {
      try {
        userData.rol.permisos = JSON.parse(userData.rol.permisos);
      } catch (e) {
        console.error('⚠️ Error parseando permisos:', e);
        userData.rol.permisos = {};
      }
    }

    // 6. Agregar usuario a la request
    req.user = {
      usuario_id: userData.usuario_id,
      email: userData.email,
      nombre_completo: userData.nombre_completo,
      telefono: userData.telefono,
      rol_id: userData.rol_id,
      estado: userData.estado,
      foto_perfil_url: userData.foto_perfil_url,
      rol_nombre: userData.rol?.nombre || null,
      permisos: userData.rol?.permisos || {}
    };

    next();

  } catch (error) {
    console.error('❌ Error en requireAuth:', error);
    
    // Errores específicos de JWT ya manejados arriba
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

    // Error genérico
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
    const authHeader = req.header('Authorization');

    // Si no hay header, continuar sin usuario
    if (!authHeader) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '').trim();

    // Si no hay token, continuar sin usuario
    if (!token) {
      return next();
    }

    // Intentar verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      // Token inválido o expirado, continuar sin usuario
      console.warn('⚠️ Token inválido en optionalAuth:', jwtError.message);
      return next();
    }

    // Buscar usuario
    const user = await User.findByPk(decoded.usuario_id, {
      attributes: [
        'usuario_id',
        'email',
        'nombre_completo',
        'telefono',
        'rol_id',
        'estado',
        'foto_perfil_url'
      ],
      include: [{
        model: Role,
        as: 'rol',
        attributes: ['rol_id', 'nombre', 'permisos'],
        required: false
      }]
    });

    // Si existe y está activo, agregar a request
    if (user && user.estado === 'activo') {
      const userData = user.toJSON();
      
      // Parsear permisos
      if (userData.rol?.permisos && typeof userData.rol.permisos === 'string') {
        try {
          userData.rol.permisos = JSON.parse(userData.rol.permisos);
        } catch (e) {
          userData.rol.permisos = {};
        }
      }

      req.user = {
        usuario_id: userData.usuario_id,
        email: userData.email,
        nombre_completo: userData.nombre_completo,
        telefono: userData.telefono,
        rol_id: userData.rol_id,
        estado: userData.estado,
        foto_perfil_url: userData.foto_perfil_url,
        rol_nombre: userData.rol?.nombre || null,
        permisos: userData.rol?.permisos || {}
      };
    }

    next();

  } catch (error) {
    // En caso de cualquier error, continuar sin usuario
    console.error('❌ Error en optionalAuth:', error);
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
      console.error('❌ Error en requireRole:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos'
      });
    }
  };
};

/**
 * Middleware para verificar si es admin (cualquier tipo)
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
      
      // Verificar permisos en formato objeto
      if (permisos && typeof permisos === 'object') {
        if (permisos[recurso] && permisos[recurso].includes(accion)) {
          return next();
        }
      }

      return res.status(403).json({
        success: false,
        message: `No tienes permiso para ${accion} en ${recurso}`,
        requiredPermission: { recurso, accion },
        userRole: req.user.rol_nombre
      });
    } catch (error) {
      console.error('❌ Error en requirePermission:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos'
      });
    }
  };
};

/**
 * Middleware para verificar múltiples permisos (OR logic)
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
      console.error('❌ Error en requireAnyPermission:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos'
      });
    }
  };
};

// ============================================
// 📋 HELPERS
// ============================================

/**
 * Helper para verificar permisos
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
 * Helper para verificar roles
 */
export const hasRole = (user, rol) => {
  if (!user) return false;
  const roles = Array.isArray(rol) ? rol : [rol];
  return roles.includes(user.rol_nombre);
};

/**
 * Middleware para verificar ownership o admin
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

      if (hasRole(req.user, ['super_admin', 'vendedor', 'almacenero'])) {
        return next();
      }

      const resourceUserId = req.params[userIdField] || req.body[userIdField];
      
      if (parseInt(resourceUserId) !== req.user.usuario_id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para acceder a este recurso'
        });
      }

      next();
    } catch (error) {
      console.error('❌ Error en requireOwnerOrAdmin:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos'
      });
    }
  };
};

// ============================================
// 📤 ALIASES
// ============================================

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

export default requireAuth;