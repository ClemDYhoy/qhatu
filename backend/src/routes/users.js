// C:\qhatu\backend\src\routes\users.js
import express from 'express';
import { requireAuth, requireRole } from '../config/middleware/auth.js';
import userController from '../controllers/userController.js';

const router = express.Router();

// ==================================================
// 📋 DOCUMENTACIÓN DE ENDPOINTS
// ==================================================
/**
 * BASE URL: /api/users
 * 
 * RUTAS AUTENTICADAS (Cualquier usuario logueado):
 * - GET    /profile              - Ver mi perfil
 * - PUT    /profile              - Actualizar mi perfil
 * - DELETE /account              - Eliminar mi cuenta (solo clientes)
 * 
 * RUTAS ADMINISTRATIVAS (Solo super_admin):
 * - GET    /                     - Listar todos los usuarios
 * - GET    /:id                  - Ver usuario específico
 * - PUT    /:id                  - Actualizar usuario (estado/rol)
 * - PUT    /:id/assign-role      - Asignar rol a usuario
 * - DELETE /:id                  - Eliminar usuario
 */

// ==================================================
// 🔓 RUTAS DEL PERFIL DE USUARIO (Autenticado)
// ==================================================

/**
 * @route   GET /api/users/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private (cualquier rol autenticado)
 */
router.get('/profile', requireAuth, userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Actualizar perfil del usuario autenticado
 * @access  Private (cualquier rol autenticado)
 */
router.put('/profile', requireAuth, userController.updateProfile);

/**
 * @route   DELETE /api/users/account
 * @desc    Eliminar/desactivar cuenta del usuario
 * @access  Private (solo clientes - no staff)
 */
router.delete('/account', requireAuth, userController.deleteAccount);

// ==================================================
// 🔐 RUTAS ADMINISTRATIVAS (Solo super_admin)
// ==================================================

/**
 * @route   GET /api/users
 * @desc    Listar todos los usuarios con paginación y filtros
 * @access  Private (super_admin)
 * @query   {page, limit, search, rol, estado, sortBy, sortOrder}
 */
router.get('/', requireAuth, requireRole('super_admin'), userController.getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener un usuario específico por ID
 * @access  Private (super_admin)
 */
router.get('/:id', requireAuth, requireRole('super_admin'), userController.getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar estado o rol de un usuario
 * @access  Private (super_admin)
 */
router.put('/:id', requireAuth, requireRole('super_admin'), userController.updateUser);

/**
 * @route   PUT /api/users/:id/assign-role
 * @desc    Asignar un rol específico a un usuario
 * @access  Private (super_admin)
 */
router.put('/:id/assign-role', requireAuth, requireRole('super_admin'), userController.assignRole);

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar/desactivar un usuario
 * @access  Private (super_admin)
 */
router.delete('/:id', requireAuth, requireRole('super_admin'), userController.deleteUser);

// ==================================================
// 🚫 MANEJO DE RUTAS NO ENCONTRADAS
// ==================================================
router.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.originalUrl} no encontrada`,
    availableRoutes: {
      authenticated: [
        'GET /api/users/profile',
        'PUT /api/users/profile',
        'DELETE /api/users/account'
      ],
      admin: [
        'GET /api/users',
        'GET /api/users/:id',
        'PUT /api/users/:id',
        'PUT /api/users/:id/assign-role',
        'DELETE /api/users/:id'
      ]
    }
  });
});

export default router;