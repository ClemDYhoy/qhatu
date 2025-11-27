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
  // C:\qhatu\backend\src\controllers\ventaController.js
// ✅ CONFIRMAR VENTA - VERSIÓN MEJORADA Y MÁS ROBUSTA

confirmarVenta: async (req, res) => {
  const transaction = await Venta.sequelize.transaction();
  
  try {
    const { ventaId } = req.params;
    const vendedor_id = req.user?.usuario_id;
    const { notas_vendedor } = req.body;

    console.log(`\n✅ [CONFIRMACIÓN] Iniciando venta ${ventaId} por vendedor ${vendedor_id}...`);

    // ====================================
    // 1️⃣ VALIDACIONES INICIALES
    // ====================================
    
    // Validar vendedor autenticado
    if (!vendedor_id) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: 'Vendedor no autenticado'
      });
    }

    // Validar ID de venta
    const ventaIdNum = parseInt(ventaId);
    if (isNaN(ventaIdNum) || ventaIdNum <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'ID de venta inválido',
        code: 'INVALID_ID'
      });
    }

    // ====================================
    // 2️⃣ OBTENER VENTA CON BLOQUEO
    // ====================================
    
    const venta = await Venta.findByPk(ventaIdNum, {
      include: [{
        model: VentaItem,
        as: 'items',
        required: true
      }],
      transaction,
      lock: transaction.LOCK.UPDATE // 🔒 Bloqueo pesimista para evitar race conditions
    });

    // Validar existencia
    if (!venta) {
      await transaction.rollback();
      console.error(`❌ Venta ${ventaIdNum} no encontrada`);
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada',
        code: 'NOT_FOUND'
      });
    }

    console.log(`📦 Venta ${venta.numero_venta} encontrada - Estado: ${venta.estado}`);

    // ====================================
    // 3️⃣ VALIDAR ESTADO
    // ====================================
    
    if (venta.estado !== 'pendiente') {
      await transaction.rollback();
      console.warn(`⚠️ Venta ${venta.numero_venta} no puede confirmarse (estado: ${venta.estado})`);
      
      // Mensajes específicos por estado
      const mensajesPorEstado = {
        confirmada: 'Esta venta ya fue confirmada anteriormente',
        procesando: 'Esta venta ya está siendo procesada',
        cancelada: 'Esta venta fue cancelada y no puede confirmarse',
        enviada: 'Esta venta ya fue enviada',
        entregada: 'Esta venta ya fue entregada'
      };
      
      return res.status(400).json({
        success: false,
        message: mensajesPorEstado[venta.estado] || `Estado actual: ${venta.estado}`,
        code: 'INVALID_STATE',
        estado_actual: venta.estado
      });
    }

    // ====================================
    // 4️⃣ VALIDAR ITEMS
    // ====================================
    
    if (!venta.items || venta.items.length === 0) {
      await transaction.rollback();
      console.error(`❌ Venta ${venta.numero_venta} sin items`);
      return res.status(400).json({
        success: false,
        message: 'La venta no tiene productos asociados',
        code: 'NO_ITEMS'
      });
    }

    console.log(`🔍 Validando ${venta.items.length} productos...`);

    // ====================================
    // 5️⃣ VALIDAR Y ACTUALIZAR STOCK
    // ====================================
    
    const productosActualizados = [];
    const erroresStock = [];

    for (const item of venta.items) {
      // Validar producto_id
      if (!item.producto_id) {
        console.warn(`⚠️ Item sin producto_id: ${item.producto_nombre}`);
        erroresStock.push({
          producto: item.producto_nombre,
          error: 'Producto no identificado'
        });
        continue;
      }

      // Obtener producto con bloqueo
      const producto = await Product.findByPk(item.producto_id, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      // Validar existencia
      if (!producto) {
        console.error(`❌ Producto ${item.producto_id} no encontrado`);
        erroresStock.push({
          producto: item.producto_nombre,
          error: 'Producto no encontrado en inventario'
        });
        continue;
      }

      // Validar stock disponible
      if (producto.stock < item.cantidad) {
        console.error(
          `❌ Stock insuficiente: ${producto.nombre}`,
          `(necesita ${item.cantidad}, disponible ${producto.stock})`
        );
        erroresStock.push({
          producto: producto.nombre,
          solicitado: item.cantidad,
          disponible: producto.stock
        });
        continue;
      }

      // ✅ Actualizar stock y estadísticas
      const stockAnterior = producto.stock;
      const nuevoStock = stockAnterior - item.cantidad;
      
      await producto.update({
        stock: nuevoStock,
        ventas: (producto.ventas || 0) + item.cantidad, // Incrementar contador de ventas
        ultima_venta: new Date() // Registrar última fecha de venta
      }, { transaction });

      productosActualizados.push({
        producto_id: producto.producto_id,
        nombre: producto.nombre,
        stock_anterior: stockAnterior,
        stock_nuevo: nuevoStock,
        cantidad_vendida: item.cantidad
      });

      console.log(
        `✅ ${producto.nombre}: ${stockAnterior} → ${nuevoStock}`,
        `(-${item.cantidad})`
      );
    }

    // Si hubo errores de stock, revertir transacción
    if (erroresStock.length > 0) {
      await transaction.rollback();
      console.error(`❌ Errores de stock detectados:`, erroresStock);
      
      return res.status(400).json({
        success: false,
        message: 'Stock insuficiente para algunos productos',
        code: 'INSUFFICIENT_STOCK',
        errores: erroresStock,
        productos_validos: productosActualizados.length,
        productos_error: erroresStock.length
      });
    }

    console.log(`✅ Stock de ${productosActualizados.length} productos actualizado`);

    // ====================================
    // 6️⃣ ACTUALIZAR ESTADO DE VENTA
    // ====================================
    
    const fechaConfirmacion = new Date();
    
    await venta.update({
      estado: 'confirmada',
      vendedor_id,
      fecha_confirmacion: fechaConfirmacion,
      notas_vendedor: notas_vendedor || null
    }, { transaction });

    console.log(`✅ Venta ${venta.numero_venta} → confirmada`);

    // ====================================
    // 7️⃣ COMMIT - ACTIVAR TRIGGER
    // ====================================
    
    await transaction.commit();
    console.log(`✅ Transacción commit exitoso - Trigger MySQL activado`);

    // ====================================
    // 8️⃣ RECARGAR DATOS COMPLETOS
    // ====================================
    
    const ventaActualizada = await Venta.findByPk(ventaIdNum, {
      include: [
        { model: VentaItem, as: 'items' },
        { 
          model: User, 
          as: 'usuario', 
          attributes: ['usuario_id', 'nombre_completo', 'email', 'telefono'] 
        },
        { 
          model: User, 
          as: 'vendedor', 
          attributes: ['usuario_id', 'nombre_completo', 'email'] 
        }
      ]
    });

    // ====================================
    // 9️⃣ NOTIFICAR VÍA SOCKET.IO
    // ====================================
    
    if (req.io) {
      console.log('🔔 Emitiendo notificación Socket.IO...');
      
      // Notificar confirmación de venta
      req.io.emit('venta-confirmada', {
        venta_id: venta.venta_id,
        numero_venta: venta.numero_venta,
        vendedor_id,
        vendedor_nombre: ventaActualizada.vendedor?.nombre_completo,
        total: parseFloat(venta.total),
        items_count: venta.items.length,
        timestamp: Date.now()
      });

      // Notificar actualización de stock
      req.io.emit('stock-actualizado', {
        productos: productosActualizados.map(p => ({
          producto_id: p.producto_id,
          nombre: p.nombre,
          stock_nuevo: p.stock_nuevo
        })),
        venta_id: venta.venta_id,
        timestamp: Date.now()
      });

      console.log('✅ Notificaciones Socket.IO enviadas');
    }

    // ====================================
    // 🔟 RESPUESTA EXITOSA
    // ====================================
    
    console.log(`\n✅ [ÉXITO] Venta ${venta.numero_venta} confirmada exitosamente\n`);
    
    return res.json({
      success: true,
      message: `Venta ${venta.numero_venta} confirmada exitosamente. Stock actualizado automáticamente.`,
      data: {
        venta_id: ventaActualizada.venta_id,
        numero_venta: ventaActualizada.numero_venta,
        estado: ventaActualizada.estado,
        fecha_confirmacion: ventaActualizada.fecha_confirmacion,
        total: parseFloat(ventaActualizada.total),
        vendedor: {
          id: ventaActualizada.vendedor?.usuario_id,
          nombre: ventaActualizada.vendedor?.nombre_completo
        },
        cliente: {
          nombre: ventaActualizada.cliente_nombre,
          telefono: ventaActualizada.cliente_telefono
        },
        items: ventaActualizada.items.map(item => ({
          producto_id: item.producto_id,
          producto_nombre: item.producto_nombre,
          cantidad: item.cantidad,
          precio_unitario: parseFloat(item.precio_unitario),
          subtotal: parseFloat(item.subtotal)
        })),
        productos_actualizados: productosActualizados
      }
    });

  } catch (error) {
    // ====================================
    // ❌ MANEJO DE ERRORES
    // ====================================
    
    await transaction.rollback();
    console.error('\n❌ [ERROR CRÍTICO] confirmarVenta:', error);
    console.error('Stack trace:', error.stack);
    
    // Análisis de tipo de error
    const errorInfo = {
      name: error.name,
      message: error.message,
      code: error.code,
      sql: error.sql
    };
    
    console.error('Detalles del error:', errorInfo);

    // Mensajes de error específicos
    let statusCode = 500;
    let errorMessage = 'Error interno al confirmar venta';
    let errorCode = 'CONFIRM_ERROR';

    // Error de constraint de base de datos
    if (error.name === 'SequelizeUniqueConstraintError') {
      statusCode = 409;
      errorMessage = 'Conflicto al confirmar venta (posible duplicado)';
      errorCode = 'CONSTRAINT_ERROR';
    }
    
    // Error de validación
    if (error.name === 'SequelizeValidationError') {
      statusCode = 400;
      errorMessage = 'Datos de venta inválidos';
      errorCode = 'VALIDATION_ERROR';
    }
    
    // Error de timeout
    if (error.name === 'SequelizeTimeoutError') {
      statusCode = 503;
      errorMessage = 'Tiempo de espera agotado. Intente nuevamente.';
      errorCode = 'TIMEOUT_ERROR';
    }

    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      code: errorCode,
      error: process.env.NODE_ENV === 'development' ? errorInfo : undefined,
      timestamp: new Date().toISOString()
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