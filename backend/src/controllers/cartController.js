// C:\qhatu\backend\src\controllers\cartController.js
import CartRepository from '../repositories/CartRepository.js';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';

class CartController {
    /**
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
                        ...CartRepository.EMPTY_CART_STRUCTURE,
                        sesion_temporal: nuevaSesion
                    }
                });
            }

            const carrito = await CartRepository.obtenerOCrearCarrito(usuarioId, sesionTemporal);
            const carritoCompleto = await CartRepository.obtenerCarritoCompleto(carrito.carrito_id);

            res.json({
                success: true,
                carrito: carritoCompleto || {
                    ...carrito.toJSON(),
                    items: []
                }
            });
        } catch (error) {
            console.error(chalk.red('❌ Error al obtener carrito:'), error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el carrito',
                error: error.message
            });
        }
    }

    /**
     * POST /api/cart/items
     */
    static async agregarProducto(req, res) {
        try {
            const { producto_id, cantidad = 1 } = req.body;
            
            if (!producto_id) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Producto ID requerido' 
                });
            }

            const usuarioId = req.user?.usuario_id || null;
            const sesionTemporal = req.cookies?.session_id || req.headers['x-session-id'];
            
            if (!usuarioId && !sesionTemporal) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Sesión requerida' 
                });
            }

            const carrito = await CartRepository.obtenerOCrearCarrito(usuarioId, sesionTemporal);
            await CartRepository.agregarProducto(carrito.carrito_id, producto_id, cantidad);
            
            const carritoActualizado = await CartRepository.obtenerCarritoCompleto(carrito.carrito_id);

            res.json({
                success: true,
                message: 'Producto agregado',
                carrito: carritoActualizado
            });
        } catch (error) {
            console.error(chalk.red('❌ Error al agregar:'), error.message);
            
            const status = error.message.includes('Stock insuficiente') ? 409 : 500;
            
            res.status(status).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * PUT /api/cart/items/:itemId
     */
    static async actualizarCantidad(req, res) {
        try {
            const { itemId } = req.params;
            const { cantidad } = req.body;

            if (!cantidad || cantidad < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Cantidad debe ser al menos 1'
                });
            }

            const carritoActualizado = await CartRepository.actualizarCantidad(itemId, cantidad);

            res.json({
                success: true,
                message: 'Cantidad actualizada',
                carrito: carritoActualizado
            });
        } catch (error) {
            console.error(chalk.red('❌ Error al actualizar:'), error.message);
            
            const status = error.message.includes('Stock insuficiente') ? 409 : 500;
            
            res.status(status).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * DELETE /api/cart/items/:itemId
     */
    static async eliminarItem(req, res) {
        try {
            const { itemId } = req.params;
            const carritoActualizado = await CartRepository.eliminarItem(itemId);

            res.json({
                success: true,
                message: 'Producto eliminado',
                carrito: carritoActualizado
            });
        } catch (error) {
            console.error(chalk.red('❌ Error al eliminar:'), error.message);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar producto'
            });
        }
    }

    /**
     * DELETE /api/cart
     */
    static async vaciarCarrito(req, res) {
        try {
            const usuarioId = req.user?.usuario_id || null;
            const sesionTemporal = req.cookies?.session_id || req.headers['x-session-id'];

            const carrito = await CartRepository.obtenerOCrearCarrito(usuarioId, sesionTemporal);
            await CartRepository.vaciarCarrito(carrito.carrito_id);

            res.json({
                success: true,
                message: 'Carrito vaciado',
                carrito: CartRepository.EMPTY_CART_STRUCTURE
            });
        } catch (error) {
            console.error(chalk.red('❌ Error al vaciar:'), error.message);
            res.status(500).json({
                success: false,
                message: 'Error al vaciar carrito'
            });
        }
    }

    /**
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

            const resumen = await CartRepository.obtenerResumen(usuarioId, sesionTemporal);

            res.json({
                success: true,
                resumen
            });
        } catch (error) {
            console.error(chalk.red('❌ Error al obtener resumen:'), error.message);
            res.status(500).json({
                success: false,
                message: 'Error al obtener resumen'
            });
        }
    }

    /**
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

            const carritoMigrado = await CartRepository.migrarCarrito(sesionTemporal, usuarioId);

            if (carritoMigrado) {
                res.clearCookie('session_id');
                
                return res.json({
                    success: true,
                    message: 'Carrito migrado correctamente',
                    carrito: carritoMigrado
                });
            }

            res.json({
                success: true,
                message: 'No había carrito temporal para migrar'
            });
        } catch (error) {
            console.error(chalk.red('❌ Error al migrar:'), error.message);
            res.status(500).json({
                success: false,
                message: 'Error al migrar carrito'
            });
        }
    }
}

export default CartController;