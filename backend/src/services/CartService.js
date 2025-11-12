// src/services/CartService.js
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Producto from '../models/Producto.js';
import { Op } from 'sequelize';

class CartService {
  static async obtenerOCrearCarrito(usuarioId = null, sesionTemporal = null) {
    let carrito = null;

    if (usuarioId) {
      carrito = await Cart.findOne({ where: { usuario_id: usuarioId, estado: 'activo' } });
    } else if (sesionTemporal) {
      carrito = await Cart.findOne({ where: { sesion_temporal: sesionTemporal, estado: 'activo' } });
    }

    if (!carrito) {
      carrito = await Cart.create({
        usuario_id: usuarioId || null,
        sesion_temporal: sesionTemporal || null
      });
    }

    return carrito;
  }

  static async obtenerCarritoCompleto(carritoId) {
    const carrito = await Cart.findByPk(carritoId, {
      include: [{
        model: CartItem,
        include: [Producto]
      }]
    });

    if (!carrito) return null;

    return {
      ...carrito.toJSON(),
      items: carrito.CarritoItems || []
    };
  }

  static async agregarProducto(carritoId, productoId, cantidad = 1) {
    const producto = await Producto.findByPk(productoId);
    if (!producto) throw new Error('Producto no encontrado');
    if (cantidad > producto.stock) throw new Error('Stock insuficiente');

    let item = await CartItem.findOne({ where: { carrito_id: carritoId, producto_id: productoId } });

    if (item) {
      const nuevaCantidad = item.cantidad + cantidad;
      if (nuevaCantidad > producto.stock) throw new Error('Stock insuficiente');
      await item.update({ cantidad: nuevaCantidad });
    } else {
      await CartItem.create({
        carrito_id: carritoId,
        producto_id: productoId,
        cantidad,
        precio_unitario: producto.precio,
        precio_descuento: producto.precio_descuento,
        subtotal: (producto.precio_descuento || producto.precio) * cantidad
      });
    }

    await this.actualizarTotales(carritoId);
    return { success: true };
  }

  static async actualizarCantidad(itemId, cantidad) {
    const item = await CartItem.findByPk(itemId, { include: [Producto] });
    if (!item) throw new Error('Item no encontrado');
    if (cantidad > item.Producto.stock) throw new Error('Stock insuficiente');

    await item.update({ cantidad, subtotal: (item.precio_descuento || item.precio_unitario) * cantidad });
    await this.actualizarTotales(item.carrito_id);
    return { success: true };
  }

  static async eliminarItem(itemId) {
    const item = await CartItem.findByPk(itemId);
    if (!item) throw new Error('Item no encontrado');
    await item.destroy();
    await this.actualizarTotales(item.carrito_id);
    return { success: true };
  }

  static async migrarCarrito(sesionTemporal, usuarioId) {
    const carritoInvitado = await Cart.findOne({ where: { sesion_temporal: sesionTemporal, estado: 'activo' } });
    if (!carritoInvitado) return null;

    const carritoUsuario = await this.obtenerOCrearCarrito(usuarioId);

    const items = await CartItem.findAll({ where: { carrito_id: carritoInvitado.carrito_id } });
    for (const item of items) {
      await this.agregarProducto(carritoUsuario.carrito_id, item.producto_id, item.cantidad);
    }

    await carritoInvitado.destroy();
    return carritoUsuario.carrito_id;
  }

  static async actualizarTotales(carritoId) {
    const items = await CartItem.findAll({ where: { carrito_id: carritoId } });
    const subtotal = items.reduce((sum, i) => sum + i.precio_unitario * i.cantidad, 0);
    const descuento = items.reduce((sum, i) => sum + (i.precio_descuento ? (i.precio_unitario - i.precio_descuento) * i.cantidad : 0), 0);
    const total = subtotal - descuento;

    await Cart.update({ subtotal, descuento_total: descuento, total }, { where: { carrito_id: carritoId } });
  }
}

export default CartService;