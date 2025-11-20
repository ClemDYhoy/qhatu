// C:\qhatu\backend\src\repositories\CartRepository.js
import sequelize from '../config/database.js';
import { Cart, CartItem, Product } from '../models/index.js'; // Importamos todos los modelos desde index
import { Op } from 'sequelize';

// ====================================
// 🔧 FUNCIONES DE CÁLCULO
// ====================================

/**
 * Recalcula el subtotal, descuento y total del carrito basado en sus items.
 * @param {number} carritoId
 * @param {Object} transaction - Transacción de Sequelize opcional
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
            
            // Actualizar subtotal del item si es necesario (para asegurar consistencia)
            if (parseFloat(item.subtotal) !== itemSubtotal) {
                await item.update({ subtotal: itemSubtotal }, { transaction });
            }

            subtotal += itemSubtotal;
            
            // Calcular el ahorro por descuento
            if (item.precio_descuento) {
                const ahorroUnitario = parseFloat(item.precio_unitario) - parseFloat(item.precio_descuento);
                descuentoTotal += ahorroUnitario * item.cantidad;
            }
        }

        const totalFinal = subtotal; // Aquí podrías añadir impuestos o envío

        await Cart.update({
            subtotal: subtotal,
            descuento_total: descuentoTotal,
            total: totalFinal
        }, {
            where: { carrito_id: carritoId },
            transaction
        });

    } catch (error) {
        console.error('Error al recalcular totales:', error);
        throw new Error('Fallo en la lógica de cálculo del carrito.');
    }
};

// ====================================
// 🛒 LÓGICA DE NEGOCIO PRINCIPAL
// ====================================

/**
 * Busca un carrito activo por usuario o sesión, o crea uno.
 */
const obtenerOCrearCarrito = async (usuarioId, sesionTemporal) => {
    let whereClause = { estado: 'activo' };
    
    if (usuarioId) {
        whereClause.usuario_id = usuarioId;
    } else if (sesionTemporal) {
        whereClause.sesion_temporal = sesionTemporal;
    } else {
        throw new Error("Se requiere usuarioId o sesionTemporal para obtener o crear el carrito.");
    }

    try {
        const [carrito, creado] = await Cart.findOrCreate({
            where: whereClause,
            defaults: {
                usuario_id: usuarioId,
                sesion_temporal: sesionTemporal
            }
        });
        return carrito;
    } catch (error) {
        console.error('Error en obtenerOCrearCarrito:', error.message);
        throw error;
    }
};

/**
 * Agrega o actualiza un producto en el carrito.
 */
const agregarProducto = async (carritoId, producto_id, cantidad) => {
    const transaction = await sequelize.transaction();
    try {
        // 1. Obtener datos del producto y stock
        const product = await Product.findByPk(producto_id, { transaction });
        if (!product) {
            throw new Error(`Producto con ID ${producto_id} no encontrado.`);
        }
        
        // El precio real a usar (con o sin descuento)
        const precioUnitario = parseFloat(product.precio);
        const precioDescuento = product.precio_descuento ? parseFloat(product.precio_descuento) : null;
        const precioFinal = precioDescuento || precioUnitario;

        // 2. Verificar stock (Lógica de negocio robusta)
        if (product.stock < cantidad) {
            await transaction.rollback();
            throw new Error(`Stock insuficiente. Solo quedan ${product.stock} unidades de ${product.nombre}.`);
        }

        // 3. Buscar item existente
        let item = await CartItem.findOne({
            where: { carrito_id: carritoId, producto_id: producto_id },
            transaction
        });
        
        // 4. Insertar o Actualizar
        if (item) {
            // Actualizar cantidad (sumar la nueva cantidad)
            const nuevaCantidad = item.cantidad + cantidad;
            
            // Re-verificar stock con la nueva cantidad total
            if (product.stock < nuevaCantidad) {
                await transaction.rollback();
                throw new Error(`Stock insuficiente. La cantidad total excede el stock disponible (${product.stock}).`);
            }

            await item.update({ 
                cantidad: nuevaCantidad,
                subtotal: nuevaCantidad * precioFinal
            }, { transaction });
            
        } else {
            // Crear nuevo item
            item = await CartItem.create({
                carrito_id: carritoId,
                producto_id: producto_id,
                cantidad: cantidad,
                precio_unitario: precioUnitario,
                precio_descuento: precioDescuento,
                subtotal: cantidad * precioFinal
            }, { transaction });
        }

        // 5. Recalcular Totales del Carrito
        await recalcularTotales(carritoId, transaction);

        await transaction.commit();
        return item;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Obtiene el carrito completo con sus items y los detalles del producto.
 */
const obtenerCarritoCompleto = async (carritoId) => {
    if (!carritoId) {
        return null;
    }
    return await Cart.findByPk(carritoId, {
        include: [{ 
            model: CartItem, 
            as: 'items', 
            include: [{
                model: Product,
                as: 'producto',
                attributes: ['producto_id', 'nombre', 'url_imagen', 'stock'] 
            }]
        }]
    });
};


// Exportamos el objeto que contiene las funciones que el controlador necesita
const CartRepository = {
    obtenerOCrearCarrito,
    agregarProducto,
    obtenerCarritoCompleto,
    recalcularTotales // Puede ser útil para otros servicios
};

export default CartRepository;