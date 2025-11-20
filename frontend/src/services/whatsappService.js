// C:\qhatu\frontend\src\services\whatsappService.js
import api from './api';

const NUMERO_WHATSAPP = '51914679650';

const whatsappService = {
  
  /**
   * 🛒 Crear venta en BD y enviar por WhatsApp
   */
  async enviarPedidoWhatsApp(cartData, user) {
    try {
      // 1️⃣ Crear venta en la base de datos
      const response = await api.post('/ventas/crear-whatsapp');

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al crear venta');
      }

      const { numero_venta, venta_id, total, items, cliente } = response.data.data;

      // 2️⃣ Construir mensaje de WhatsApp
      const mensaje = this.construirMensajeWhatsApp(numero_venta, items, total, cliente);

      // 3️⃣ Marcar como enviado por WhatsApp
      try {
        await api.post(`/ventas/${venta_id}/marcar-enviado`, { mensaje });
      } catch (err) {
        console.warn('⚠️ No se pudo marcar como enviado:', err);
        // No bloqueamos el flujo si falla este paso
      }

      // 4️⃣ Abrir WhatsApp
      this.abrirWhatsApp(mensaje);

      return {
        success: true,
        numero_venta,
        venta_id,
        total
      };

    } catch (error) {
      console.error('❌ Error al enviar pedido:', error);
      
      // Mensajes de error específicos
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Stock insuficiente');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
      }

      throw new Error('Error al procesar el pedido. Intenta nuevamente.');
    }
  },

  /**
   * 📝 Construir mensaje formateado para WhatsApp
   */
  construirMensajeWhatsApp(numeroVenta, items, total, cliente) {
    let mensaje = `🛒 *NUEVO PEDIDO - ${numeroVenta}*\n\n`;
    
    // Información del cliente
    mensaje += `👤 *Cliente:* ${cliente?.nombre || 'Cliente'}\n`;
    if (cliente?.telefono && cliente.telefono !== 'No proporcionado') {
      mensaje += `📱 *Teléfono:* ${cliente.telefono}\n`;
    }
    if (cliente?.email) {
      mensaje += `📧 *Email:* ${cliente.email}\n`;
    }
    mensaje += `\n`;

    // Productos
    mensaje += `📦 *PRODUCTOS:*\n`;
    mensaje += `━━━━━━━━━━━━━━━━\n`;
    
    items.forEach((item, index) => {
      const precioFinal = item.precio_descuento || item.precio_unitario;
      mensaje += `${index + 1}. *${item.producto_nombre}*\n`;
      mensaje += `   Cantidad: ${item.cantidad}\n`;
      mensaje += `   Precio: S/ ${parseFloat(precioFinal).toFixed(2)}\n`;
      
      if (item.precio_descuento) {
        const ahorro = (item.precio_unitario - item.precio_descuento) * item.cantidad;
        mensaje += `   💰 Ahorro: S/ ${ahorro.toFixed(2)}\n`;
      }
      
      mensaje += `   Subtotal: S/ ${parseFloat(item.subtotal).toFixed(2)}\n`;
      mensaje += `\n`;
    });

    mensaje += `━━━━━━━━━━━━━━━━\n`;
    mensaje += `💰 *TOTAL: S/ ${parseFloat(total).toFixed(2)}*\n\n`;
    
    mensaje += `📍 *Dirección de entrega:*\n`;
    mensaje += cliente?.direccion || '_Por confirmar_\n';
    if (cliente?.distrito) {
      mensaje += `Distrito: ${cliente.distrito}\n`;
    }
    mensaje += `\n`;
    
    mensaje += `⏰ Pedido realizado: ${new Date().toLocaleString('es-PE', {
      dateStyle: 'short',
      timeStyle: 'short'
    })}\n`;
    mensaje += `\n_Por favor confirme la disponibilidad de los productos._`;

    return mensaje;
  },

  /**
   * 📲 Abrir WhatsApp con mensaje pre-llenado
   */
  abrirWhatsApp(mensaje) {
    const mensajeCodificado = encodeURIComponent(mensaje);
    const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensajeCodificado}`;
    
    // Detectar si es móvil
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // En móvil, abrir directamente
      window.location.href = url;
    } else {
      // En escritorio, abrir en nueva pestaña
      const ventana = window.open(url, '_blank');
      if (!ventana) {
        alert('Por favor permite ventanas emergentes para abrir WhatsApp');
      }
    }
  },

  /**
   * 👁️ Vista previa del PDF
   */
  previewPDF(cartData) {
    if (!cartData.items || cartData.items.length === 0) {
      alert('Carrito vacío');
      return;
    }

    const html = this.generarHTMLPDF(cartData);
    const ventana = window.open('', '_blank', 'width=800,height=600');
    
    if (!ventana) {
      alert('Por favor permite ventanas emergentes');
      return;
    }

    ventana.document.write(html);
    ventana.document.close();
  },

  /**
   * 📥 Descargar PDF del carrito
   */
  downloadPDF(cartData) {
    if (!cartData.items || cartData.items.length === 0) {
      alert('Carrito vacío');
      return;
    }

    const html = this.generarHTMLPDF(cartData);
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Por favor permite ventanas emergentes');
      return;
    }

    printWindow.document.write(html);
    printWindow.document.close();
    
    // Esperar a que se cargue y luego imprimir
    printWindow.onload = () => {
      printWindow.print();
    };
  },

  /**
   * 📄 Generar HTML para PDF
   */
  generarHTMLPDF(cartData) {
    const { items, subtotal, descuento, total } = cartData;
    
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Carrito - Qhatu</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            max-width: 800px;
            margin: 20px auto;
            padding: 30px;
            background: #fff;
          }
          
          .header {
            border-bottom: 4px solid #FF6B35;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          h1 {
            color: #FF6B35;
            font-size: 32px;
            margin-bottom: 10px;
          }
          
          .fecha {
            color: #666;
            font-size: 14px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
          }
          
          th {
            background-color: #f8f9fa;
            padding: 15px;
            text-align: left;
            font-weight: bold;
            border-bottom: 2px solid #dee2e6;
            color: #333;
          }
          
          td {
            padding: 15px;
            border-bottom: 1px solid #dee2e6;
          }
          
          tr:hover {
            background-color: #f8f9fa;
          }
          
          .precio-descuento {
            color: #28a745;
            font-weight: bold;
          }
          
          .precio-original {
            text-decoration: line-through;
            color: #999;
            font-size: 0.9em;
          }
          
          .totales {
            margin-top: 40px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
          }
          
          .totales p {
            display: flex;
            justify-content: space-between;
            margin: 12px 0;
            font-size: 16px;
          }
          
          .total-final {
            font-size: 24px;
            font-weight: bold;
            color: #FF6B35;
            border-top: 2px solid #dee2e6;
            padding-top: 15px;
            margin-top: 15px;
          }
          
          .descuento {
            color: #28a745;
          }
          
          .footer {
            margin-top: 50px;
            padding: 20px;
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            border-radius: 4px;
          }
          
          .footer p {
            color: #856404;
            line-height: 1.6;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 20px;
            }
            
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🛒 QHATU - Carrito de Compras</h1>
          <p class="fecha"><strong>Fecha:</strong> ${new Date().toLocaleString('es-PE', {
            dateStyle: 'full',
            timeStyle: 'short'
          })}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th style="text-align: center;">Cantidad</th>
              <th style="text-align: right;">Precio</th>
              <th style="text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => {
              const precioFinal = item.precioFinal || item.precio;
              const tieneDescuento = item.precio_descuento && item.precio_descuento < item.precio;
              
              return `
                <tr>
                  <td><strong>${item.nombre}</strong></td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">
                    ${tieneDescuento ? `
                      <span class="precio-original">S/ ${parseFloat(item.precio).toFixed(2)}</span><br>
                      <span class="precio-descuento">S/ ${parseFloat(precioFinal).toFixed(2)}</span>
                    ` : `
                      S/ ${parseFloat(precioFinal).toFixed(2)}
                    `}
                  </td>
                  <td style="text-align: right;">
                    <strong>S/ ${parseFloat(item.subtotalItem).toFixed(2)}</strong>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="totales">
          ${descuento > 0 ? `
            <p>
              <span>Subtotal:</span>
              <span>S/ ${parseFloat(subtotal).toFixed(2)}</span>
            </p>
            <p class="descuento">
              <span>Descuento:</span>
              <span>-S/ ${parseFloat(descuento).toFixed(2)}</span>
            </p>
          ` : ''}
          <p class="total-final">
            <span>TOTAL:</span>
            <span>S/ ${parseFloat(total).toFixed(2)}</span>
          </p>
        </div>

        <div class="footer">
          <p>
            <strong>📝 Nota:</strong> Este es un resumen de tu carrito de compras. 
            Para finalizar tu pedido, envíalo por WhatsApp y recibirás un número de pedido único.
          </p>
          <p style="margin-top: 10px;">
            <strong>📱 WhatsApp:</strong> +${NUMERO_WHATSAPP}
          </p>
        </div>
      </body> 
      </html>
    `;
  }
};

export default whatsappService;