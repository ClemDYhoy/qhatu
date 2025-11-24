// C:\qhatu\backend\src\services\whatsappService.js
import dotenv from 'dotenv';
dotenv.config();

const WHATSAPP_CONFIG = {
    // ⚡ CAMBIAR ESTE NÚMERO AL TUYO
    NUMERO_TIENDA: process.env.WHATSAPP_NUMERO_TIENDA || '51914679650',
    WEB_URL: 'https://wa.me',
    NOMBRE_TIENDA: process.env.NOMBRE_TIENDA || 'Qhatu E-commerce',
    MONEDA: 'S/.'
};

const whatsappService = {
    /**
     * 🛒 ENVIAR PEDIDO CLIENTE → TIENDA
     */
    enviarPedidoCliente: async (data) => {
        try {
            const {
                numero_venta,
                cliente_nombre,
                total
            } = data;

            // Validar datos requeridos
            if (!numero_venta || !cliente_nombre || total === undefined) {
                console.error('❌ Datos incompletos:', { numero_venta, cliente_nombre, total });
                throw new Error('Datos incompletos para generar mensaje WhatsApp');
            }

            console.log('📱 Generando mensaje WhatsApp para:', numero_venta);

            // ✅ MENSAJE PROFESIONAL Y CONCISO
            const mensaje = `Hola ${WHATSAPP_CONFIG.NOMBRE_TIENDA} 👋

Soy *${cliente_nombre}*

Quiero realizar la compra del pedido:

🛍️ Código: *${numero_venta}*
💰 Total: *${WHATSAPP_CONFIG.MONEDA}${parseFloat(total).toFixed(2)}*

¿Cómo procedo con el pago?`;

            // Generar URL
            const url = whatsappService.generarURLWhatsApp(
                WHATSAPP_CONFIG.NUMERO_TIENDA,
                mensaje
            );

            console.log('✅ URL WhatsApp generada exitosamente');
            console.log(`📱 Destino: ${WHATSAPP_CONFIG.NUMERO_TIENDA}`);
            console.log(`🔗 URL: ${url.substring(0, 100)}...`);

            return {
                success: true,
                mensaje,
                url,
                numero_destino: WHATSAPP_CONFIG.NUMERO_TIENDA,
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
     * 🔗 Generar URL de WhatsApp Web
     */
    generarURLWhatsApp: (numero, mensaje) => {
        try {
            // Limpiar número (remover espacios, guiones, paréntesis)
            const numeroLimpio = numero.replace(/[\s\-\(\)]/g, '');
            
            // Validar que sea un número válido
            if (!/^\d+$/.test(numeroLimpio)) {
                throw new Error(`Número de WhatsApp inválido: ${numero}`);
            }
            
            // Codificar mensaje para URL
            const mensajeCodificado = encodeURIComponent(mensaje);
            
            // Generar URL completa
            const url = `${WHATSAPP_CONFIG.WEB_URL}/${numeroLimpio}?text=${mensajeCodificado}`;
            
            return url;
        } catch (error) {
            console.error('❌ Error generando URL WhatsApp:', error);
            throw error;
        }
    },

    /**
     * 🔔 Verificar configuración
     */
    verificarConfiguracion: () => {
        const numeroDefault = '51914679650';
        const configurado = WHATSAPP_CONFIG.NUMERO_TIENDA && 
                            WHATSAPP_CONFIG.NUMERO_TIENDA !== numeroDefault;

        if (!configurado) {
            console.warn('⚠️ WhatsApp usando número por defecto. Configura WHATSAPP_NUMERO_TIENDA en .env');
        }

        return {
            configurado,
            numero: WHATSAPP_CONFIG.NUMERO_TIENDA,
            tienda: WHATSAPP_CONFIG.NOMBRE_TIENDA,
            moneda: WHATSAPP_CONFIG.MONEDA
        };
    }
};

export default whatsappService;