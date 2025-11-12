// C:\qhatu\backend\src\routes\cart.js

import express from 'express';
import CartController from '../controllers/cartController.js';
import { optionalAuth, requireAuth } from '../config/middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/cart
 * @desc    Obtener carrito del usuario/sesión actual
 * @access  Público (con sesión temporal para invitados)
 */
router.get('/', optionalAuth, CartController.obtenerCarrito);

/**
 * @route   GET /api/cart/summary
 * @desc    Obtener resumen del carrito (para widget en header)
 * @access  Público
 */
router.get('/summary', optionalAuth, CartController.obtenerResumen);

/**
 * @route   POST /api/cart/items
 * @desc    Agregar producto al carrito
 * @access  Público
 */
router.post('/items', optionalAuth, CartController.agregarProducto);

/**
 * @route   PUT /api/cart/items/:itemId
 * @desc    Actualizar cantidad de un item
 * @access  Público
 */
router.put('/items/:itemId', optionalAuth, CartController.actualizarCantidad);

/**
 * @route   DELETE /api/cart/items/:itemId
 * @desc    Eliminar item del carrito
 * @access  Público
 */
router.delete('/items/:itemId', optionalAuth, CartController.eliminarItem);

/**
 * @route   DELETE /api/cart
 * @desc    Vaciar carrito completamente
 * @access  Público
 */
router.delete('/', optionalAuth, CartController.vaciarCarrito);

/**
 * @route   PUT /api/cart/notas
 * @desc    Actualizar notas del cliente en el carrito
 * @access  Público
 */
router.put('/notas', optionalAuth, CartController.actualizarNotas);

/**
 * @route   POST /api/cart/migrate
 * @desc    Migrar carrito de invitado a usuario logueado
 * @access  Privado (requiere autenticación)
 */
router.post('/migrate', requireAuth, CartController.migrarCarrito);

export default router;