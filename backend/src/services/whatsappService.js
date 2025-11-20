// C:\qhatu\backend\src\services\whatsappService.js
import dotenv from 'dotenv';
dotenv.config();

/**
 * 📱 Servicio de WhatsApp para Qhatu
 * 
 * Formatea y envía mensajes de pedidos a WhatsApp.
 * Compatible con WhatsApp Web API y WhatsApp Business API.
 */

const WHATSAPP_CONFIG = {
  // Número de WhatsApp de la tienda (formato internacional sin +)
  NUMERO_TIENDA: process.env.WHATSAPP_NUMERO_TIENDA || '51962000001',
  
  // URL base para WhatsApp Web
  WEB_URL: 'https://wa.me',
  
  // Nombre de la tienda
  NOMBRE_TIENDA: process.env.NOMBRE_TIENDA || 'Qhatu E-commerce',
  
  // Moneda
  MONEDA: 'S/.' // Soles peruanos
};

const whatsappService = {
  /**
   * 🛒 Enviar pedido del cliente a la tienda
   * @param {Object} data - Datos del pedido
   * @returns {Promise<Object>} { success: boolean, mensaje: string, url: string }
   */
  enviarPedidoCliente: async (data) => {
    try {
      const {
        numero_venta,
        cliente_nombre,
        cliente_telefono,
        cliente_direccion,
        cliente_notas,
        total,
        items
      } = data;

      // Formatear mensaje
      const mensaje = whatsappService.formatearMensajePedido({
        numero_venta,
        cliente_nombre,
        cliente_telefono,
        cliente_direccion,
        cliente_notas,
        total,
        items
      });

      // Generar URL de WhatsApp
      const url = whatsappService.generarURLWhatsApp(WHATSAPP_CONFIG.NUMERO_TIENDA, mensaje);

      console.log(`📱 WhatsApp URL generada para ${numero_venta}`);

      return {
        success: true,
        mensaje,
        url,
        tipo: 'whatsapp_web'
      };

    } catch (error) {
      console.error('❌ Error en enviarPedidoCliente:', error);
      return {
        success: false,
        mensaje: null,
        url: null,
        error: error.message
      };
    }
  },

  /**
   * 📝 Formatear mensaje de pedido
   * @param {Object} data - Datos del pedido
   * @returns {string} Mensaje formateado
   */
  formatearMensajePedido: (data) => {
    const {
      numero_venta,
      cliente_nombre,
      cliente_telefono,
      cliente_direccion,
      cliente_notas,
      total,
      items
    } = data;

    let mensaje = `🛍️ *NUEVO PEDIDO - ${numero_venta}*\n\n`;
    mensaje += `👤 *Cliente:* ${cliente_nombre}\n`;
    mensaje += `📞 *Teléfono:* ${cliente_telefono}\n`;
    mensaje += `📍 *Dirección:* ${cliente_direccion || 'Por confirmar'}\n\n`;

    mensaje += `📦 *PRODUCTOS:*\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━\n`;

    items.forEach((item, index) => {
      const precioFinal = item.precio_descuento || item.precio_unitario;
      const subtotal = item.subtotal;
      
      mensaje += `\n${index + 1}. ${item.nombre}\n`;
      mensaje += `   • Cantidad: ${item.cantidad}\n`;
      mensaje += `   • Precio: ${WHATSAPP_CONFIG.MONEDA}${precioFinal.toFixed(2)}`;
      
      if (item.precio_descuento) {
        mensaje += ` ~~${WHATSAPP_CONFIG.MONEDA}${item.precio_unitario.toFixed(2)}~~ 🏷️\n`;
      } else {
        mensaje += `\n`;
      }
      
      mensaje += `   • Subtotal: ${WHATSAPP_CONFIG.MONEDA}${subtotal.toFixed(2)}\n`;
    });

    mensaje += `\n━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `💰 *TOTAL: ${WHATSAPP_CONFIG.MONEDA}${total.toFixed(2)}*\n\n`;

    if (cliente_notas) {
      mensaje += `📝 *Notas del cliente:*\n${cliente_notas}\n\n`;
    }

    mensaje += `⏰ *Fecha:* ${new Date().toLocaleString('es-PE')}\n`;
    mensaje += `🏪 *${WHATSAPP_CONFIG.NOMBRE_TIENDA}*`;

    return mensaje;
  },

  /**
   * 🔗 Generar URL de WhatsApp Web
   * @param {string} numero - Número de destino (formato internacional sin +)
   * @param {string} mensaje - Mensaje a enviar
   * @returns {string} URL de WhatsApp
   */
  generarURLWhatsApp: (numero, mensaje) => {
    const mensajeCodificado = encodeURIComponent(mensaje);
    return `${WHATSAPP_CONFIG.WEB_URL}/${numero}?text=${mensajeCodificado}`;
  },

  /**
   * ✅ Formatear mensaje de confirmación para el cliente
   * @param {Object} data - Datos de la confirmación
   * @returns {string} Mensaje formateado
   */
  formatearMensajeConfirmacion: (data) => {
    const { numero_venta, cliente_nombre, total, tiempo_estimado } = data;

    let mensaje = `✅ *PEDIDO CONFIRMADO*\n\n`;
    mensaje += `Hola ${cliente_nombre} 👋\n\n`;
    mensaje += `Tu pedido *${numero_venta}* ha sido confirmado exitosamente.\n\n`;
    mensaje += `💰 Total: ${WHATSAPP_CONFIG.MONEDA}${total.toFixed(2)}\n`;
    mensaje += `⏱️ Tiempo estimado: ${tiempo_estimado || '30-45 minutos'}\n\n`;
    mensaje += `📦 Te notificaremos cuando esté listo para entrega.\n\n`;
    mensaje += `Gracias por tu compra en *${WHATSAPP_CONFIG.NOMBRE_TIENDA}*! 🛍️`;

    return mensaje;
  },

  /**
   * 📊 Generar reporte de venta para vendedor
   * @param {Object} venta - Datos de la venta
   * @returns {string} Reporte formateado
   */
  generarReporteVendedor: (venta) => {
    let reporte = `📊 *REPORTE DE VENTA*\n\n`;
    reporte += `🔢 Pedido: *${venta.numero_venta}*\n`;
    reporte += `📅 Fecha: ${new Date(venta.fecha_venta).toLocaleString('es-PE')}\n`;
    reporte += `👤 Cliente: ${venta.cliente_nombre}\n`;
    reporte += `💰 Total: ${WHATSAPP_CONFIG.MONEDA}${parseFloat(venta.total).toFixed(2)}\n`;
    reporte += `📦 Items: ${venta.items?.length || 0}\n`;
    reporte += `🎯 Estado: ${venta.estado.toUpperCase()}\n\n`;
    reporte += `Venta registrada por ${WHATSAPP_CONFIG.NOMBRE_TIENDA}`;

    return reporte;
  },

  /**
   * 🔔 Verificar configuración de WhatsApp
   * @returns {Object} Estado de la configuración
   */
  verificarConfiguracion: () => {
    const configurado = WHATSAPP_CONFIG.NUMERO_TIENDA && 
                        WHATSAPP_CONFIG.NUMERO_TIENDA !== '51962000001';

    return {
      configurado,
      numero: WHATSAPP_CONFIG.NUMERO_TIENDA,
      tienda: WHATSAPP_CONFIG.NOMBRE_TIENDA,
      moneda: WHATSAPP_CONFIG.MONEDA
    };
  }
};

export default whatsappService;