// C:\qhatu\backend\src\routes\ventas.js
import express from 'express';
import VentaController from '../controllers/ventaController.js';
import { requireAuth } from '../config/middleware/auth.js';

const router = express.Router();

// ====================================
// 🛒 VENTAS - OPERACIONES PRINCIPALES
// ====================================

/**
 * @route   POST /api/ventas/crear-whatsapp
 * @desc    Crear venta desde carrito para enviar por WhatsApp
 * @access  Privado (requiere autenticación)
 * @body    { } - El carrito se obtiene del usuario autenticado
 * @returns { success: boolean, data: { venta_id, numero_venta, total, items, cliente } }
 */
router.post('/crear-whatsapp', requireAuth, VentaController.crearVentaWhatsApp);

/**
 * @route   GET /api/ventas/pendientes
 * @desc    Obtener todas las ventas pendientes (para vendedores)
 * @access  Privado
 * @returns { success: boolean, data: Venta[], totales: object }
 */
router.get('/pendientes', requireAuth, VentaController.obtenerVentasPendientes);

/**
 * @route   GET /api/ventas/estadisticas/vendedor
 * @desc    Obtener estadísticas del vendedor actual
 * @access  Privado (solo vendedores)
 * @returns { success: boolean, data: { ventasHoy, totalVentas, comision, etc } }
 * 
 * IMPORTANTE: Esta ruta debe ir ANTES de /:ventaId para evitar conflictos
 */
router.get('/estadisticas/vendedor', requireAuth, VentaController.obtenerEstadisticas);

/**
 * @route   GET /api/ventas/:ventaId
 * @desc    Obtener detalle completo de una venta
 * @access  Privado
 * @params  ventaId - ID de la venta
 * @returns { success: boolean, data: Venta }
 */
router.get('/:ventaId', requireAuth, VentaController.obtenerDetalleVenta);

/**
 * @route   POST /api/ventas/:ventaId/confirmar
 * @desc    Confirmar venta y actualizar inventario automáticamente
 * @access  Privado (solo vendedores)
 * @params  ventaId - ID de la venta
 * @body    { notas_vendedor?: string }
 * @returns { success: boolean, message: string, data: Venta }
 */
router.post('/:ventaId/confirmar', requireAuth, VentaController.confirmarVenta);

/**
 * @route   POST /api/ventas/:ventaId/marcar-enviado
 * @desc    Marcar venta como enviada por WhatsApp
 * @access  Privado
 * @params  ventaId - ID de la venta
 * @body    { mensaje: string }
 * @returns { success: boolean, message: string, data: object }
 */
router.post('/:ventaId/marcar-enviado', requireAuth, VentaController.marcarEnviadoWhatsApp);

// ====================================
// 📤 EXPORTAR ROUTER
// ====================================

export default router;