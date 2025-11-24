// C:\qhatu\backend\src\controllers\ventaController.js
import { Venta, VentaItem, Cart, CartItem, Product, User } from '../models/index.js';
import { Op } from 'sequelize';
import whatsappService from '../services/whatsappService.js';

const VentaController = {
  // ====================================
  // 🛒 CREAR VENTA DESDE CARRITO (WhatsApp)
  // ====================================
  crearVentaWhatsApp: async (req, res) => {
    const transaction = await Venta.sequelize.transaction();

    try {
      const usuario_id = req.user?.usuario_id;
      
      // 1️⃣ Validar autenticación
      if (!usuario_id) {
        await transaction.rollback();
        return res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
      }

      console.log(`\n🛒 Iniciando creación de venta para usuario ${usuario_id}...`);

      // 2️⃣ Obtener carrito activo con bloqueo
      const carrito = await Cart.findOne({
        where: { usuario_id, estado: 'activo' },
        include: [{
          model: CartItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'producto',
            attributes: ['producto_id', 'nombre', 'precio', 'precio_descuento', 'stock', 'url_imagen', 'descripcion']
          }]
        }],
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      // Validar carrito
      if (!carrito || !carrito.items || carrito.items.length === 0) {
        await transaction.rollback();
        console.warn('⚠️ Carrito vacío o no encontrado');
        return res.status(400).json({ 
          success: false, 
          message: 'Tu carrito está vacío. Agrega productos para continuar.' 
        });
      }

      console.log(`✅ Carrito encontrado: ${carrito.items.length} items`);

      // 3️⃣ VALIDACIÓN CRÍTICA DE STOCK
      const stockErrors = [];
      for (const item of carrito.items) {
        if (!item.producto) {
          stockErrors.push({
            producto: 'Producto no encontrado',
            item_id: item.item_id
          });
          continue;
        }

        if (item.producto.stock < item.cantidad) {
          stockErrors.push({
            producto: item.producto.nombre,
            solicitado: item.cantidad,
            disponible: item.producto.stock
          });
        }
      }

      if (stockErrors.length > 0) {
        await transaction.rollback();
        console.warn('⚠️ Stock insuficiente:', stockErrors);
        return res.status(400).json({
          success: false,
          message: 'Stock insuficiente para algunos productos',
          errores: stockErrors
        });
      }

      console.log('✅ Stock validado correctamente');

      // 4️⃣ Obtener datos del cliente
      const usuario = await User.findByPk(usuario_id, {
        attributes: ['nombre_completo', 'email', 'telefono', 'direccion', 'distrito'],
        transaction
      });

      if (!usuario) {
        await transaction.rollback();
        return res.status(404).json({ 
          success: false, 
          message: 'Usuario no encontrado' 
        });
      }

      // 5️⃣ Crear venta (SIN numero_venta - lo genera el trigger)
      console.log('📝 Creando registro de venta...');
      
      const venta = await Venta.create({
        // ⚡ NO incluir numero_venta - el trigger MySQL lo genera
        carrito_id: carrito.carrito_id,
        usuario_id,
        cliente_nombre: usuario.nombre_completo || 'Cliente',
        cliente_email: usuario.email || null,
        cliente_telefono: usuario.telefono || 'No proporcionado',
        cliente_direccion: usuario.direccion || 'Por confirmar',
        cliente_distrito: usuario.distrito || null,
        cliente_notas: carrito.notas_cliente || null,
        subtotal: parseFloat(carrito.subtotal || 0),
        descuento_total: parseFloat(carrito.descuento_total || 0),
        total: parseFloat(carrito.total || 0),
        estado: 'pendiente',
        metodo_pago: 'whatsapp_pago',
        enviado_whatsapp: false,
        fecha_envio_whatsapp: null
      }, { transaction });

      // ⚡ CRÍTICO: Recargar para obtener numero_venta generado por trigger
      await venta.reload({ transaction });
      
      if (!venta.numero_venta) {
        throw new Error('El trigger no generó numero_venta correctamente');
      }

      console.log(`✅ Venta creada exitosamente: ${venta.numero_venta}`);

      // 6️⃣ Crear items de venta (snapshot de productos)
      console.log('📦 Creando items de venta...');
      
      const itemsCreados = await Promise.all(
        carrito.items.map(item => {
          const p = item.producto;
          const precioFinal = p.precio_descuento 
            ? parseFloat(p.precio_descuento) 
            : parseFloat(p.precio);

          return VentaItem.create({
            venta_id: venta.venta_id,
            producto_id: p.producto_id,
            producto_nombre: p.nombre,
            producto_descripcion: p.descripcion || '',
            producto_url_imagen: p.url_imagen || null,
            cantidad: item.cantidad,
            precio_unitario: parseFloat(p.precio),
            precio_descuento: p.precio_descuento ? parseFloat(p.precio_descuento) : null,
            subtotal: precioFinal * item.cantidad
          }, { transaction });
        })
      );

      console.log(`✅ ${itemsCreados.length} items creados`);

      // 7️⃣ Actualizar carrito y crear uno nuevo
      await carrito.update({ 
        estado: 'enviado',
        convertido_venta_id: venta.venta_id 
      }, { transaction });
      
      await Cart.create({
        usuario_id,
        estado: 'activo',
        subtotal: 0,
        descuento_total: 0,
        total: 0
      }, { transaction });

      console.log('✅ Carrito actualizado y nuevo carrito creado');

      // ✅ COMMIT - Transacción completada exitosamente
      await transaction.commit();
      console.log('✅ Transacción comprometida exitosamente');

      // 8️⃣ GENERAR URL DE WHATSAPP (después del commit)
      let whatsappResult = { success: false, url: null, mensaje: null };

      try {
        console.log('📱 Generando URL de WhatsApp...');
        
        whatsappResult = await whatsappService.enviarPedidoCliente({
          numero_venta: venta.numero_venta,
          cliente_nombre: venta.cliente_nombre,
          cliente_telefono: venta.cliente_telefono,
          total: parseFloat(venta.total)
        });

        if (whatsappResult.success) {
          console.log('✅ URL WhatsApp generada:', whatsappResult.url);
          
          // Actualizar estado de envío (sin transacción, ya hicimos commit)
          await venta.update({
            enviado_whatsapp: true,
            fecha_envio_whatsapp: new Date(),
            mensaje_whatsapp: whatsappResult.mensaje
          });
        } else {
          console.warn('⚠️ No se pudo generar URL WhatsApp:', whatsappResult.error);
        }
      } catch (whatsappError) {
        console.error('⚠️ Error al generar URL WhatsApp:', whatsappError.message);
        // No fallar la venta por error de WhatsApp
      }

      // 9️⃣ 🔔 EMITIR NOTIFICACIÓN SOCKET.IO
      if (req.io) {
        console.log('🔔 Emitiendo notificación Socket.IO...');
        
        req.io.emit('nueva-venta-pendiente', {
          venta_id: venta.venta_id,
          numero_venta: venta.numero_venta,
          total: parseFloat(venta.total),
          cliente_nombre: venta.cliente_nombre,
          cliente_telefono: venta.cliente_telefono,
          fecha: new Date().toISOString(),
          items_count: itemsCreados.length,
          enviado_whatsapp: venta.enviado_whatsapp,
          timestamp: Date.now()
        });
        
        console.log('✅ Notificación Socket.IO enviada');
      }

      // 🔟 Respuesta exitosa al frontend
      console.log(`\n✅ VENTA ${venta.numero_venta} COMPLETADA EXITOSAMENTE\n`);
      
      return res.status(201).json({
        success: true,
        message: 'Pedido creado exitosamente',
        whatsapp_enviado: venta.enviado_whatsapp,
        data: {
          venta_id: venta.venta_id,
          numero_venta: venta.numero_venta,
          total: parseFloat(venta.total),
          whatsapp_url: whatsappResult.url || null, // ⚡ URL para abrir WhatsApp
          items: itemsCreados.map(item => ({
            producto_nombre: item.producto_nombre,
            cantidad: item.cantidad,
            precio_unitario: parseFloat(item.precio_unitario),
            precio_descuento: item.precio_descuento ? parseFloat(item.precio_descuento) : null,
            subtotal: parseFloat(item.subtotal)
          })),
          cliente: {
            nombre: venta.cliente_nombre,
            telefono: venta.cliente_telefono,
            email: venta.cliente_email,
            direccion: venta.cliente_direccion
          }
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ ERROR EN crearVentaWhatsApp:', error);
      console.error('Stack:', error.stack);
      
      return res.status(500).json({
        success: false,
        message: 'Error interno al procesar el pedido',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ====================================
  // 📋 OBTENER VENTAS PENDIENTES
  // ====================================
  obtenerVentasPendientes: async (req, res) => {
    try {
      const { estado, limite = 100 } = req.query;

      const whereCondition = estado 
        ? { estado }
        : { estado: { [Op.in]: ['pendiente', 'confirmada', 'procesando'] } };

      const ventas = await Venta.findAll({
        where: whereCondition,
        attributes: [
          'venta_id', 'numero_venta', 'total', 'estado', 'fecha_venta',
          'cliente_nombre', 'cliente_telefono', 'cliente_direccion', 
          'cliente_distrito', 'cliente_notas', 'enviado_whatsapp'
        ],
        include: [{
          model: VentaItem,
          as: 'items',
          attributes: ['cantidad', 'producto_nombre', 'producto_url_imagen', 'subtotal', 'precio_descuento'],
          required: false
        }],
        order: [['fecha_venta', 'DESC']],
        limit: parseInt(limite)
      });

      const totales = {
        total_pendientes: ventas.filter(v => v.estado === 'pendiente').length,
        total_confirmadas: ventas.filter(v => v.estado === 'confirmada').length,
        total_procesando: ventas.filter(v => v.estado === 'procesando').length,
        monto_total: ventas.reduce((sum, v) => sum + parseFloat(v.total || 0), 0).toFixed(2),
        enviados_whatsapp: ventas.filter(v => v.enviado_whatsapp).length
      };

      return res.json({ 
        success: true, 
        data: ventas, 
        totales 
      });

    } catch (error) {
      console.error('❌ Error en obtenerVentasPendientes:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al cargar pedidos pendientes',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ====================================
  // ✅ CONFIRMAR VENTA
  // ====================================
  confirmarVenta: async (req, res) => {
    const transaction = await Venta.sequelize.transaction();

    try {
      const { ventaId } = req.params;
      const vendedor_id = req.user.usuario_id;
      const { notas_vendedor } = req.body;

      const venta = await Venta.findByPk(ventaId, {
        include: [{ model: VentaItem, as: 'items' }],
        transaction
      });

      if (!venta) {
        await transaction.rollback();
        return res.status(404).json({ 
          success: false, 
          message: 'Venta no encontrada' 
        });
      }

      if (!venta.puedeConfirmarse()) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false, 
          message: `Esta venta ya fue ${venta.estado}` 
        });
      }

      // Restar stock atómicamente con validación
      for (const item of venta.items) {
        const [affected] = await Product.decrement('stock', {
          by: item.cantidad,
          where: {
            producto_id: item.producto_id,
            stock: { [Op.gte]: item.cantidad }
          },
          transaction
        });

        if (affected[0][0] === 0) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Stock insuficiente para: ${item.producto_nombre}`
          });
        }

        // Incrementar contador de ventas
        await Product.increment('ventas', {
          by: item.cantidad,
          where: { producto_id: item.producto_id },
          transaction
        });
      }

      // Actualizar venta
      await venta.update({
        estado: 'confirmada',
        vendedor_id,
        fecha_confirmacion: new Date(),
        notas_vendedor: notas_vendedor || null
      }, { transaction });

      await transaction.commit();

      // 🔔 Notificar en tiempo real
      if (req.io) {
        req.io.emit('venta-confirmada', { 
          venta_id: venta.venta_id,
          numero_venta: venta.numero_venta,
          vendedor_id,
          timestamp: Date.now()
        });
      }

      return res.json({ 
        success: true, 
        message: 'Venta confirmada exitosamente', 
        data: venta 
      });

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en confirmarVenta:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al confirmar venta',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ====================================
  // 📊 OBTENER DETALLE DE VENTA
  // ====================================
  obtenerDetalleVenta: async (req, res) => {
    try {
      const { ventaId } = req.params;

      const venta = await Venta.findByPk(ventaId, {
        include: [
          { model: User, as: 'usuario', attributes: ['nombre_completo', 'telefono', 'email'] },
          { model: User, as: 'vendedor', attributes: ['nombre_completo', 'email'] },
          { model: VentaItem, as: 'items', include: [{ model: Product, as: 'producto' }] }
        ]
      });

      if (!venta) {
        return res.status(404).json({ success: false, message: 'Venta no encontrada' });
      }

      return res.json({ success: true, data: venta });

    } catch (error) {
      console.error('❌ Error en obtenerDetalleVenta:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al obtener detalle de venta'
      });
    }
  },

  // ====================================
  // 📊 ESTADÍSTICAS DEL VENDEDOR
  // ====================================
  obtenerEstadisticas: async (req, res) => {
    try {
      const vendedor_id = req.user.usuario_id;

      const [stats] = await Venta.sequelize.query(`
        SELECT 
          COUNT(CASE WHEN DATE(fecha_venta) = CURDATE() THEN 1 END) as ventasHoy,
          SUM(total) as totalVentas,
          COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes
        FROM ventas
        WHERE vendedor_id = ?
      `, {
        replacements: [vendedor_id],
        type: Venta.sequelize.QueryTypes.SELECT
      });

      const totalVentas = parseFloat(stats.totalVentas || 0);
      const comision = (totalVentas * 0.05).toFixed(2);

      return res.json({
        success: true,
        data: {
          ventasHoy: parseInt(stats.ventasHoy || 0),
          totalVentas: totalVentas.toFixed(2),
          pendientes: parseInt(stats.pendientes || 0),
          comision,
          porcentaje_comision: 5
        }
      });

    } catch (error) {
      console.error('❌ Error en obtenerEstadisticas:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al obtener estadísticas'
      });
    }
  },

  // ====================================
  // 📱 MARCAR COMO ENVIADO POR WHATSAPP
  // ====================================
  marcarEnviadoWhatsApp: async (req, res) => {
    try {
      const { ventaId } = req.params;
      const { mensaje } = req.body;

      const venta = await Venta.findByPk(ventaId);

      if (!venta) {
        return res.status(404).json({ success: false, message: 'Venta no encontrada' });
      }

      await venta.update({
        enviado_whatsapp: true,
        fecha_envio_whatsapp: new Date(),
        mensaje_whatsapp: mensaje || 'Pedido enviado por WhatsApp'
      });

      return res.json({ success: true, message: 'Venta marcada como enviada', data: venta });

    } catch (error) {
      console.error('❌ Error en marcarEnviadoWhatsApp:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al marcar venta como enviada'
      });
    }
  }
};

export default VentaController;