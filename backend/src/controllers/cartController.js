// C:\qhatu\backend\src\controllers\cartController.js

import Cart from '../models/Cart.js';
import { v4 as uuidv4 } from 'uuid';

class CartController {
  /**
   * Obtener carrito del usuario actual
   * GET /api/cart
   */
  static async obtenerCarrito(req, res) {
    try {
      const usuarioId = req.user?.usuario_id || null;
      const sesionTemporal = req.cookies?.session_id || req.headers['x-session-id'];

      if (!usuarioId && !sesionTemporal) {
        const nuevaSesion = uuidv4();
        res.cookie('session_id', nuevaSesion, {
          maxAge: 30 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });

        return res.json({
          success: true,
          carrito: {
            carrito_id: null,
            items: [],
            subtotal: 0,
            descuento_total: 0,
            total: 0
          },
          sesion_temporal: nuevaSesion
        });
      }

      const carrito = await Cart.obtenerOCrearCarrito(usuarioId, sesionTemporal);
      const carritoCompleto = await Cart.obtenerCarritoCompleto(carrito.carrito_id);

      res.json({
        success: true,
        carrito: carritoCompleto || {
          ...carrito,
          items: []
        }
      });
    } catch (error) {
      console.error('Error al obtener carrito:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el carrito',
        error: error.message
      });
    }
  }

  /**
   * Agregar producto al carrito
   * POST /api/cart/items
   */
  static async agregarProducto(req, res) {
    try {
      const { producto_id, cantidad = 1 } = req.body;

      if (!producto_id) {
        return res.status(400).json({
          success: false,
          message: 'El producto_id es requerido'
        });
      }

      const usuarioId = req.user?.usuario_id || null;
      let sesionTemporal = req.cookies?.session_id || req.headers['x-session-id'];

      if (!usuarioId && !sesionTemporal) {
        sesionTemporal = uuidv4();
        res.cookie('session_id', sesionTemporal, {
          maxAge: 30 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
      }

      const carrito = await Cart.obtenerOCrearCarrito(usuarioId, sesionTemporal);
      await Cart.agregarProducto(carrito.carrito_id, producto_id, cantidad);

      const carritoActualizado = await Cart.obtenerCarritoCompleto(carrito.carrito_id);

      res.json({
        success: true,
        message: 'Producto agregado al carrito',
        carrito: carritoActualizado
      });
    } catch (error) {
      console.error('Error al agregar producto:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al agregar producto al carrito'
      });
    }
  }

  /**
   * Actualizar cantidad de un item
   * PUT /api/cart/items/:itemId
   */
  static async actualizarCantidad(req, res) {
    try {
      const { itemId } = req.params;
      const { cantidad } = req.body;

      if (!cantidad || cantidad < 1) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad debe ser mayor a 0'
        });
      }

      await Cart.actualizarCantidad(itemId, cantidad);

      const usuarioId = req.user?.usuario_id || null;
      const sesionTemporal = req.cookies?.session_id || req.headers['x-session-id'];
      const carrito = await Cart.obtenerOCrearCarrito(usuarioId, sesionTemporal);
      const carritoActualizado = await Cart.obtenerCarritoCompleto(carrito.carrito_id);

      res.json({
        success: true,
        message: 'Cantidad actualizada',
        carrito: carritoActualizado
      });
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar cantidad'
      });
    }
  }

  /**
   * Eliminar item del carrito
   * DELETE /api/cart/items/:itemId
   */
  static async eliminarItem(req, res) {
    try {
      const { itemId } = req.params;

      await Cart.eliminarItem(itemId);

      const usuarioId = req.user?.usuario_id || null;
      const sesionTemporal = req.cookies?.session_id || req.headers['x-session-id'];
      const carrito = await Cart.obtenerOCrearCarrito(usuarioId, sesionTemporal);
      const carritoActualizado = await Cart.obtenerCarritoCompleto(carrito.carrito_id);

      res.json({
        success: true,
        message: 'Producto eliminado del carrito',
        carrito: carritoActualizado
      });
    } catch (error) {
      console.error('Error al eliminar item:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar producto del carrito'
      });
    }
  }

  /**
   * Vaciar carrito
   * DELETE /api/cart
   */
  static async vaciarCarrito(req, res) {
    try {
      const usuarioId = req.user?.usuario_id || null;
      const sesionTemporal = req.cookies?.session_id || req.headers['x-session-id'];

      const carrito = await Cart.obtenerOCrearCarrito(usuarioId, sesionTemporal);
      await Cart.vaciarCarrito(carrito.carrito_id);

      res.json({
        success: true,
        message: 'Carrito vaciado correctamente',
        carrito: {
          carrito_id: carrito.carrito_id,
          items: [],
          subtotal: 0,
          descuento_total: 0,
          total: 0
        }
      });
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
      res.status(500).json({
        success: false,
        message: 'Error al vaciar el carrito'
      });
    }
  }

  /**
   * Actualizar notas del cliente
   * PUT /api/cart/notas
   */
  static async actualizarNotas(req, res) {
    try {
      const { notas } = req.body;
      const usuarioId = req.user?.usuario_id || null;
      const sesionTemporal = req.cookies?.session_id || req.headers['x-session-id'];

      const carrito = await Cart.obtenerOCrearCarrito(usuarioId, sesionTemporal);
      await Cart.actualizarNotas(carrito.carrito_id, notas);

      const carritoActualizado = await Cart.obtenerCarritoCompleto(carrito.carrito_id);

      res.json({
        success: true,
        message: 'Notas actualizadas',
        carrito: carritoActualizado
      });
    } catch (error) {
      console.error('Error al actualizar notas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar notas'
      });
    }
  }

  /**
   * Migrar carrito al iniciar sesión
   * POST /api/cart/migrate
   */
  static async migrarCarrito(req, res) {
    try {
      const usuarioId = req.user?.usuario_id;
      const sesionTemporal = req.cookies?.session_id || req.headers['x-session-id'];

      if (!usuarioId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      if (!sesionTemporal) {
        return res.json({
          success: true,
          message: 'No hay carrito temporal para migrar'
        });
      }

      const carritoId = await Cart.migrarCarrito(sesionTemporal, usuarioId);
      
      if (carritoId) {
        const carritoCompleto = await Cart.obtenerCarritoCompleto(carritoId);
        res.clearCookie('session_id');

        return res.json({
          success: true,
          message: 'Carrito migrado correctamente',
          carrito: carritoCompleto
        });
      }

      res.json({
        success: true,
        message: 'No había productos en el carrito temporal'
      });
    } catch (error) {
      console.error('Error al migrar carrito:', error);
      res.status(500).json({
        success: false,
        message: 'Error al migrar el carrito'
      });
    }
  }

  /**
   * Obtener resumen del carrito
   * GET /api/cart/summary
   */
  static async obtenerResumen(req, res) {
    try {
      const usuarioId = req.user?.usuario_id || null;
      const sesionTemporal = req.cookies?.session_id || req.headers['x-session-id'];

      if (!usuarioId && !sesionTemporal) {
        return res.json({
          success: true,
          resumen: {
            total_items: 0,
            total: 0
          }
        });
      }

      const carrito = await Cart.obtenerOCrearCarrito(usuarioId, sesionTemporal);
      const carritoCompleto = await Cart.obtenerCarritoCompleto(carrito.carrito_id);

      const totalItems = carritoCompleto?.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0;

      res.json({
        success: true,
        resumen: {
          total_items: totalItems,
          total: carritoCompleto?.total || 0
        }
      });
    } catch (error) {
      console.error('Error al obtener resumen:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener resumen del carrito'
      });
    }
  }
}

export default CartController;