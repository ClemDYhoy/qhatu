// C:\qhatu\backend\src\repositories\CartRepository.js
import sequelize from '../config/database.js';
import { Cart, CartItem, Product } from '../models/index.js';
import { Op } from 'sequelize';

// ====================================
// 📦 ESTRUCTURA DE CARRITO VACÍO
// ====================================
const EMPTY_CART_STRUCTURE = {
    items: [],
    subtotal: 0.00,
    descuento_total: 0.00,
    total: 0.00,
    estado: 'activo',
    notas_cliente: null
};

// ====================================
// 🔧 FUNCIONES DE CÁLCULO
// ====================================

/**
 * Recalcula totales del carrito
 */
const recalcularTotales = async (carritoId, transaction = null) => {
    try {
        const items = await CartItem.findAll({
            where: { carrito_id: carritoId },
            transaction
        });

        let subtotal = 0;
        let descuentoTotal = 0;

        for (const item of items) {
            const precioFinal = item.precio_descuento || item.precio_unitario;
            const itemSubtotal = parseFloat(precioFinal) * item.cantidad;
            
            if (parseFloat(item.subtotal) !== itemSubtotal) {
                await item.update({ subtotal: itemSubtotal.toFixed(2) }, { transaction });
            }

            subtotal += itemSubtotal;
            
            if (item.precio_descuento) {
                const ahorroUnitario = parseFloat(item.precio_unitario) - parseFloat(item.precio_descuento);
                descuentoTotal += ahorroUnitario * item.cantidad;
            }
        }

        await Cart.update({
            subtotal: subtotal.toFixed(2),
            descuento_total: descuentoTotal.toFixed(2),
            total: subtotal.toFixed(2)
        }, {
            where: { carrito_id: carritoId },
            transaction
        });

    } catch (error) {
        console.error('❌ Error al recalcular totales:', error);
        throw new Error('Error en cálculo del carrito');
    }
};

// ====================================
// 🛒 LÓGICA DE NEGOCIO PRINCIPAL
// ====================================

/**
 * Obtener o crear carrito activo
 */
const obtenerOCrearCarrito = async (usuarioId, sesionTemporal = null) => {
    let whereClause = { estado: 'activo' };
    
    if (usuarioId) {
        whereClause.usuario_id = usuarioId;
    } else if (sesionTemporal) {
        whereClause.sesion_temporal = sesionTemporal;
    } else {
        throw new Error("Se requiere usuarioId o sesionTemporal");
    }

    try {
        const [carrito, creado] = await Cart.findOrCreate({
            where: whereClause,
            defaults: {
                usuario_id: usuarioId,
                sesion_temporal: sesionTemporal,
                estado: 'activo',
                subtotal: 0.00,
                descuento_total: 0.00,
                total: 0.00
            }
        });

        return carrito;
    } catch (error) {
        console.error('❌ Error en obtenerOCrearCarrito:', error);
        throw error;
    }
};

/**
 * Agregar producto al carrito
 */
const agregarProducto = async (carritoId, producto_id, cantidad) => {
    const transaction = await sequelize.transaction();
    
    try {
        const product = await Product.findByPk(producto_id, { transaction });
        
        if (!product) {
            throw new Error(`Producto ${producto_id} no encontrado`);
        }
        
        const precioUnitario = parseFloat(product.precio);
        const precioDescuento = product.precio_descuento ? parseFloat(product.precio_descuento) : null;
        const precioFinal = precioDescuento || precioUnitario;

        let item = await CartItem.findOne({
            where: { carrito_id: carritoId, producto_id },
            transaction
        });
        
        if (item) {
            const nuevaCantidad = item.cantidad + cantidad;
            
            if (product.stock < nuevaCantidad) {
                throw new Error(`Stock insuficiente. Disponible: ${product.stock}`);
            }

            await item.update({ 
                cantidad: nuevaCantidad,
                subtotal: (nuevaCantidad * precioFinal).toFixed(2)
            }, { transaction });
        } else {
            if (product.stock < cantidad) {
                throw new Error(`Stock insuficiente. Disponible: ${product.stock}`);
            }

            item = await CartItem.create({
                carrito_id: carritoId,
                producto_id,
                cantidad,
                precio_unitario: precioUnitario,
                precio_descuento: precioDescuento,
                subtotal: (cantidad * precioFinal).toFixed(2)
            }, { transaction });
        }

        await recalcularTotales(carritoId, transaction);
        await transaction.commit();

        return item;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Actualizar cantidad de un item
 */
const actualizarCantidad = async (item_id, cantidad) => {
    const transaction = await sequelize.transaction();

    try {
        const item = await CartItem.findByPk(item_id, {
            include: [{ model: Product, as: 'producto' }],
            transaction
        });

        if (!item) {
            throw new Error('Item no encontrado');
        }

        if (cantidad < 1) {
            throw new Error('Cantidad debe ser al menos 1');
        }

        if (item.producto.stock < cantidad) {
            throw new Error(`Stock insuficiente. Disponible: ${item.producto.stock}`);
        }

        const precioFinal = item.precio_descuento || item.precio_unitario;
        
        await item.update({
            cantidad,
            subtotal: (cantidad * parseFloat(precioFinal)).toFixed(2)
        }, { transaction });

        await recalcularTotales(item.carrito_id, transaction);
        await transaction.commit();

        return await obtenerCarritoCompleto(item.carrito_id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Eliminar item del carrito
 */
const eliminarItem = async (item_id) => {
    const transaction = await sequelize.transaction();

    try {
        const item = await CartItem.findByPk(item_id, { transaction });

        if (!item) {
            throw new Error('Item no encontrado');
        }

        const carrito_id = item.carrito_id;
        await item.destroy({ transaction });
        await recalcularTotales(carrito_id, transaction);
        await transaction.commit();

        return await obtenerCarritoCompleto(carrito_id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Vaciar carrito completo
 */
const vaciarCarrito = async (carrito_id) => {
    const transaction = await sequelize.transaction();

    try {
        await CartItem.destroy({
            where: { carrito_id },
            transaction
        });

        await Cart.update({
            subtotal: 0.00,
            descuento_total: 0.00,
            total: 0.00
        }, {
            where: { carrito_id },
            transaction
        });

        await transaction.commit();
        return await obtenerCarritoCompleto(carrito_id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Obtener carrito completo con items y productos
 */
const obtenerCarritoCompleto = async (carritoId) => {
    if (!carritoId) return null;

    return await Cart.findByPk(carritoId, {
        include: [{
            model: CartItem,
            as: 'items',
            include: [{
                model: Product,
                as: 'producto',
                attributes: ['producto_id', 'nombre', 'url_imagen', 'stock', 'precio', 'precio_descuento']
            }]
        }]
    });
};

/**
 * Actualizar notas del cliente
 */
const actualizarNotas = async (carrito_id, notas) => {
    await Cart.update(
        { notas_cliente: notas },
        { where: { carrito_id } }
    );
};

/**
 * Obtener resumen del carrito
 */
const obtenerResumen = async (usuarioId, sesionTemporal) => {
    const carrito = await obtenerOCrearCarrito(usuarioId, sesionTemporal);
    const carritoCompleto = await obtenerCarritoCompleto(carrito.carrito_id);

    return {
        total_items: carritoCompleto?.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0,
        total: parseFloat(carritoCompleto?.total || 0)
    };
};

/**
 * Migrar carrito de sesión temporal a usuario autenticado
 */
const migrarCarrito = async (sesionTemporal, usuarioId) => {
    const transaction = await sequelize.transaction();

    try {
        // Buscar carrito temporal
        const carritoTemporal = await Cart.findOne({
            where: { sesion_temporal: sesionTemporal, estado: 'activo' },
            include: [{ model: CartItem, as: 'items' }],
            transaction
        });

        if (!carritoTemporal || carritoTemporal.items.length === 0) {
            await transaction.commit();
            return null;
        }

        // Buscar carrito del usuario
        let carritoUsuario = await Cart.findOne({
            where: { usuario_id: usuarioId, estado: 'activo' },
            transaction
        });

        if (!carritoUsuario) {
            // Convertir carrito temporal en carrito de usuario
            await carritoTemporal.update({
                usuario_id: usuarioId,
                sesion_temporal: null
            }, { transaction });

            await transaction.commit();
            return await obtenerCarritoCompleto(carritoTemporal.carrito_id);
        } else {
            // Fusionar items del carrito temporal al carrito del usuario
            for (const item of carritoTemporal.items) {
                const itemExistente = await CartItem.findOne({
                    where: {
                        carrito_id: carritoUsuario.carrito_id,
                        producto_id: item.producto_id
                    },
                    transaction
                });

                if (itemExistente) {
                    await itemExistente.update({
                        cantidad: itemExistente.cantidad + item.cantidad
                    }, { transaction });
                } else {
                    await CartItem.create({
                        carrito_id: carritoUsuario.carrito_id,
                        producto_id: item.producto_id,
                        cantidad: item.cantidad,
                        precio_unitario: item.precio_unitario,
                        precio_descuento: item.precio_descuento,
                        subtotal: item.subtotal
                    }, { transaction });
                }
            }

            // Eliminar carrito temporal
            await carritoTemporal.destroy({ transaction });

            // Recalcular totales del carrito del usuario
            await recalcularTotales(carritoUsuario.carrito_id, transaction);
            await transaction.commit();

            return await obtenerCarritoCompleto(carritoUsuario.carrito_id);
        }
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

// ====================================
// 📤 EXPORTACIÓN
// ====================================

const CartRepository = {
    EMPTY_CART_STRUCTURE,
    obtenerOCrearCarrito,
    agregarProducto,
    actualizarCantidad,
    eliminarItem,
    vaciarCarrito,
    obtenerCarritoCompleto,
    recalcularTotales,
    actualizarNotas,
    obtenerResumen,
    migrarCarrito
};

export default CartRepository;