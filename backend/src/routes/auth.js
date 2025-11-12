// C:\qhatu\backend\src\routes\auth.js
import { Router } from 'express';
import AuthController from '../controllers/authController.js';
import { requireAuth } from '../config/middleware/auth.js';

const router = Router();

// ====================================
// 🌐 RUTAS PÚBLICAS
// ====================================

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario (manual)
 * @access  Público
 */
router.post('/register', AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión (manual)
 * @access  Público
 */
router.post('/login', AuthController.login);

/**
 * @route   POST /api/auth/google
 * @desc    Login/Registro con Google OAuth
 * @access  Público
 */
router.post('/google', AuthController.googleAuth);

/**
 * @route   GET /api/auth/check-email
 * @desc    Verificar si un email ya está registrado
 * @access  Público
 */
router.get('/check-email', AuthController.checkEmail);

// ====================================
// 🔒 RUTAS PROTEGIDAS (requieren autenticación)
// ====================================

/**
 * @route   GET /api/auth/me
 * @desc    Obtener datos del usuario autenticado
 * @access  Privado
 */
router.get('/me', requireAuth, AuthController.me);

/**
 * @route   PUT /api/auth/complete-profile
 * @desc    Completar perfil del usuario (al momento de comprar)
 * @access  Privado
 */
router.put('/complete-profile', requireAuth, AuthController.completeProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Cambiar contraseña del usuario autenticado
 * @access  Privado
 */
router.put('/change-password', requireAuth, AuthController.changePassword);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión (principalmente del lado del cliente)
 * @access  Público
 */
router.post('/logout', (req, res) => {
  res.clearCookie('session_id', { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production' 
  });
  
  res.json({ 
    success: true, 
    message: 'Sesión cerrada exitosamente' 
  });
});

export default router;