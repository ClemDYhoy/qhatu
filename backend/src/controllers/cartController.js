// C:\qhatu\backend\src\controllers\cartController.js

import CartRepository from '../repositories/CartRepository.js'; // ✅ Nuevo Repositorio de Lógica
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk'; // Utilidad de logging que usas en server.js

class CartController {
  /**
   * Obtener carrito del usuario actual
   * GET /api/cart
   */
  static async obtenerCarrito(req, res) {
    try {
      const usuarioId = req.user?.usuario_id || null;
      const sesionTemporal = req.cookies?.session_id || req.headers['x-session-id'];

      // 1. Manejo de Sesión Inicial (Usuario nuevo no autenticado)
      if (!usuarioId && !sesionTemporal) {
        const nuevaSesion = uuidv4();
        
        // Establecer la cookie de sesión
        res.cookie('session_id', nuevaSesion, {
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });

        // Respuesta de carrito vacío con la nueva sesión temporal
        return res.json({
          success: true,
          carrito: CartRepository.EMPTY_CART_STRUCTURE, // Uso de una constante de estructura limpia
          sesion_temporal: nuevaSesion
        });
      }

      // 2. Obtener o crear carrito usando el Repositorio
      const carrito = await CartRepository.obtenerOCrearCarrito(usuarioId, sesionTemporal);
      
      // 3. Obtener la vista completa del carrito
      const carritoCompleto = await CartRepository.obtenerCarritoCompleto(carrito.carrito_id);

      res.json({
        success: true,
        carrito: carritoCompleto || {
          ...carrito.toJSON(), // Si solo se obtiene el modelo base, usar .toJSON() para limpieza
          items: []
        }
      });
    } catch (error) {
      console.error(chalk.red('❌ Error al obtener carrito:'), error.message);
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
        return res.status(400).json({ success: false, message: 'Producto ID es requerido.' });
      }

      const usuarioId = req.user?.usuario_id || null;
      const sesionTemporal = req.cookies?.session_id || req.headers['x-session-id'];
      
      if (!usuarioId && !sesionTemporal) {
        return res.status(401).json({ success: false, message: 'Se requiere iniciar sesión o sesión temporal.' });
      }

      const carrito = await CartRepository.obtenerOCrearCarrito(usuarioId, sesionTemporal);

      console.log(chalk.cyan(`DEBUG 1: Carrito ${carrito.carrito_id} obtenido/creado.`)); 
      
      // 🚨 La lógica de negocio robusta se maneja en el Repositorio
      await CartRepository.agregarProducto(carrito.carrito_id, producto_id, cantidad);

      console.log(chalk.cyan('DEBUG 2: Producto agregado correctamente.')); 

      const carritoActualizado = await CartRepository.obtenerCarritoCompleto(carrito.carrito_id);
      
      console.log(chalk.cyan('DEBUG 3: Carrito completo obtenido.')); 

      res.json({
        success: true,
        message: 'Producto agregado al carrito',
        carrito: carritoActualizado
      });
    } catch (error) {
      console.error(chalk.red('❌ Error al agregar producto:'), error.message);
      console.error(chalk.red('Stack Trace del Error:'));
      console.error(error.stack);
      
      // Manejo de errores específicos del repositorio (como "Stock insuficiente")
      const status = error.message.includes('Stock insuficiente') ? 409 : 500;
      
      res.status(status).json({
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

      if (!cantidad || cantidad < 0) { // Permitir 0 para eliminar
        return res.status(400).json({
          success: false,
          message: 'La cantidad debe ser 0 o mayor'
        });
      }
      
      const usuarioId = req.user?.usuario_id || null;
      const sesionTemporal = req.cookies?.session_id || req.headers['x-session-id'];
      
      // La lógica del repositorio maneja si es 0 (eliminar) o > 0 (actualizar)
      await CartRepository.actualizarCantidad(itemId, cantidad, usuarioId, sesionTemporal);

      // Obtener carrito actualizado
      const carrito = await CartRepository.obtenerOCrearCarrito(usuarioId, sesionTemporal);
      const carritoActualizado = await CartRepository.obtenerCarritoCompleto(carrito.carrito_id);

      res.json({
        success: true,
        message: 'Cantidad actualizada',
        carrito: carritoActualizado
      });
    } catch (error) {
      console.error(chalk.red('❌ Error al actualizar cantidad:'), error.message);
      const status = error.message.includes('Stock insuficiente') ? 409 : 500;
      res.status(status).json({
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

      await CartRepository.eliminarItem(itemId);

      const usuarioId = req.user?.usuario_id || null;
      const sesionTemporal = req.cookies?.session_id || req.headers['x-session-id'];
      const carrito = await CartRepository.obtenerOCrearCarrito(usuarioId, sesionTemporal);
      const carritoActualizado = await CartRepository.obtenerCarritoCompleto(carrito.carrito_id);

      res.json({
        success: true,
        message: 'Producto eliminado del carrito',
        carrito: carritoActualizado
      });
    } catch (error) {
      console.error(chalk.red('❌ Error al eliminar item:'), error.message);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar producto del carrito'
      });
    }
  }

  /**
   * Vaciar carrito
   * DELETE /api/cart/clear
   */
  static async vaciarCarrito(req, res) {
    try {
      const usuarioId = req.user?.usuario_id || null;
      const sesionTemporal = req.cookies?.session_id || req.headers['x-session-id'];

      const carrito = await CartRepository.obtenerOCrearCarrito(usuarioId, sesionTemporal);
      await CartRepository.vaciarCarrito(carrito.carrito_id);

      res.json({
        success: true,
        message: 'Carrito vaciado correctamente',
        carrito: {
          carrito_id: carrito.carrito_id,
          ...CartRepository.EMPTY_CART_STRUCTURE // Reutilizar estructura limpia
        }
      });
    } catch (error) {
      console.error(chalk.red('❌ Error al vaciar carrito:'), error.message);
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

      const carrito = await CartRepository.obtenerOCrearCarrito(usuarioId, sesionTemporal);
      await CartRepository.actualizarNotas(carrito.carrito_id, notas);

      const carritoActualizado = await CartRepository.obtenerCarritoCompleto(carrito.carrito_id);

      res.json({
        success: true,
        message: 'Notas actualizadas',
        carrito: carritoActualizado
      });
    } catch (error) {
      console.error(chalk.red('❌ Error al actualizar notas:'), error.message);
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
          message: 'Usuario no autenticado. No se puede migrar.'
        });
      }

      if (!sesionTemporal) {
        return res.json({
          success: true,
          message: 'No hay carrito temporal para migrar'
        });
      }

      // La lógica de migración compleja ocurre en el repositorio
      const carritoMigrado = await CartRepository.migrarCarrito(sesionTemporal, usuarioId);
      
      if (carritoMigrado) {
        const carritoCompleto = await CartRepository.obtenerCarritoCompleto(carritoMigrado.carrito_id);
        res.clearCookie('session_id'); // Limpiar la cookie temporal

        return res.json({
          success: true,
          message: 'Carrito migrado correctamente',
          carrito: carritoCompleto
        });
      }

      res.json({
        success: true,
        message: 'No había carrito temporal activo para migrar'
      });
    } catch (error) {
      console.error(chalk.red('❌ Error al migrar carrito:'), error.message);
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
          resumen: { total_items: 0, total: 0 }
        });
      }

      // 🚨 Usamos una función dedicada para optimizar la consulta
      const resumen = await CartRepository.obtenerResumen(usuarioId, sesionTemporal);

      res.json({
        success: true,
        resumen: resumen
      });
    } catch (error) {
      console.error(chalk.red('❌ Error al obtener resumen:'), error.message);
      res.status(500).json({
        success: false,
        message: 'Error al obtener resumen del carrito'
      });
    }
  }
}

export default CartController;