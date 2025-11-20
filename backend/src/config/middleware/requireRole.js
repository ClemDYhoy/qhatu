// C:\qhatu\backend\src\config\middleware\requireRole.js

/**
 * 🛡️ Middleware de Autorización por Roles
 * 
 * Verifica que el usuario autenticado tenga uno de los roles permitidos.
 * Debe usarse DESPUÉS del middleware requireAuth.
 */

/**
 * @param {string[]} allowedRoles - Array de roles permitidos
 * @returns {Function} Middleware de Express
 * 
 * @example
 * router.get('/admin-only', requireAuth, requireRole(['super_admin']), controller)
 * router.post('/ventas', requireAuth, requireRole(['vendedor', 'super_admin']), controller)
 */
export const requireRole = (allowedRoles = []) => {
  // Validar entrada
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    throw new Error('requireRole: allowedRoles debe ser un array no vacío');
  }

  return (req, res, next) => {
    try {
      // 1. Verificar que existe usuario autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Autenticación requerida',
          code: 'AUTH_REQUIRED'
        });
      }

      // 2. Extraer rol del usuario (compatible con múltiples estructuras)
      const userRole = req.user.rol?.nombre || req.user.rol || req.user.role || 'cliente';

      // 3. Verificar si el rol está permitido
      if (!allowedRoles.includes(userRole)) {
        console.warn(`🚫 Acceso denegado: Usuario ${req.user.usuario_id} (${userRole}) intentó acceder a ruta protegida`);
        
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. No tienes permisos para esta acción.',
          code: 'INSUFFICIENT_PERMISSIONS',
          required_roles: allowedRoles,
          user_role: userRole
        });
      }

      // 4. Log de acceso exitoso (solo en desarrollo)
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Acceso autorizado: ${userRole} → ${req.method} ${req.path}`);
      }

      // 5. Continuar con la petición
      next();

    } catch (error) {
      console.error('❌ Error en middleware requireRole:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos',
        code: 'AUTHORIZATION_ERROR'
      });
    }
  };
};

/**
 * 🔐 Verificar si el usuario tiene un rol específico
 * Función auxiliar para usar en controladores
 * 
 * @param {Object} user - Usuario de req.user
 * @param {string[]} roles - Roles a verificar
 * @returns {boolean}
 */
export const hasRole = (user, roles) => {
  if (!user || !roles) return false;
  
  const userRole = user.rol?.nombre || user.rol || user.role;
  return roles.includes(userRole);
};

/**
 * 🛡️ Middleware para super_admin exclusivo
 */
export const requireSuperAdmin = requireRole(['super_admin']);

/**
 * 🛡️ Middleware para vendedores y admin
 */
export const requireVendedor = requireRole(['vendedor', 'super_admin']);

/**
 * 🛡️ Middleware para almaceneros y admin
 */
export const requireAlmacenero = requireRole(['almacenero', 'super_admin']);

/**
 * 🛡️ Middleware para cualquier staff (vendedor, almacenero, admin)
 */
export const requireStaff = requireRole(['vendedor', 'almacenero', 'super_admin']);

export default requireRole;