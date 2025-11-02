// C:\qhatu\frontend\src\services\whatsappService.js

import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Servicio para manejar la generación de PDFs y envío a WhatsApp
 */
class WhatsAppService {
  constructor() {
    // Número de WhatsApp del vendedor (configurar según necesidad)
    this.vendorPhone = '51123456789'; // Cambiar por el número real
  }

  /**
   * Genera un PDF con los detalles de la compra
   * @param {Object} cartData - Datos del carrito
   * @param {Array} cartData.items - Items del carrito
   * @param {Number} cartData.total - Total de la compra
   * @param {Number} cartData.subtotal - Subtotal
   * @param {Number} cartData.descuento - Descuento aplicado
   * @returns {Blob} PDF generado como Blob
   */
  generatePurchasePDF(cartData) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Configuración de colores
    const primaryColor = [231, 76, 60]; // Rojo
    const textColor = [44, 62, 80];
    const lightGray = [236, 240, 241];

    // ENCABEZADO
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('QHATU STORE', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Orden de Compra', pageWidth / 2, 30, { align: 'center' });

    // INFORMACIÓN DE LA ORDEN
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    const currentDate = new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    doc.text(`Fecha: ${currentDate}`, 14, 50);
    doc.text(`Orden #: ORD-${Date.now().toString().slice(-8)}`, 14, 56);

    // TABLA DE PRODUCTOS
    const tableData = cartData.items.map((item, index) => [
      index + 1,
      item.nombre,
      item.quantity,
      `S/. ${item.precio.toFixed(2)}`,
      item.precio_descuento ? `S/. ${item.precio_descuento.toFixed(2)}` : '-',
      `S/. ${((item.precio_descuento || item.precio) * item.quantity).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 65,
      head: [['#', 'Producto', 'Cant.', 'Precio', 'Descuento', 'Subtotal']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        textColor: textColor,
        fontSize: 9
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { cellWidth: 70 },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'right', cellWidth: 25 },
        4: { halign: 'right', cellWidth: 25 },
        5: { halign: 'right', cellWidth: 30 }
      },
      alternateRowStyles: {
        fillColor: lightGray
      }
    });

    // TOTALES
    const finalY = doc.lastAutoTable.finalY + 10;
    const rightX = pageWidth - 14;

    doc.setFontSize(10);
    
    if (cartData.descuento > 0) {
      doc.text('Subtotal:', rightX - 50, finalY, { align: 'right' });
      doc.text(`S/. ${cartData.subtotal.toFixed(2)}`, rightX, finalY, { align: 'right' });
      
      doc.setTextColor(231, 76, 60);
      doc.text('Descuento:', rightX - 50, finalY + 6, { align: 'right' });
      doc.text(`-S/. ${cartData.descuento.toFixed(2)}`, rightX, finalY + 6, { align: 'right' });
    }

    // Total final
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(rightX - 60, finalY + 10, rightX, finalY + 10);
    
    doc.setTextColor(...textColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', rightX - 50, finalY + 18, { align: 'right' });
    doc.text(`S/. ${cartData.total.toFixed(2)}`, rightX, finalY + 18, { align: 'right' });

    // PIE DE PÁGINA
    const footerY = doc.internal.pageSize.getHeight() - 30;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(127, 140, 141);
    
    doc.text('Gracias por tu compra en QHATU STORE', pageWidth / 2, footerY, { align: 'center' });
    doc.text('Productos importados de calidad', pageWidth / 2, footerY + 5, { align: 'center' });
    doc.text('WhatsApp: +51 123 456 789 | Email: info@qhatu.com', pageWidth / 2, footerY + 10, { align: 'center' });

    return doc;
  }

  /**
   * Genera el mensaje de WhatsApp con los detalles de la compra
   * @param {Object} cartData - Datos del carrito
   * @returns {String} Mensaje formateado
   */
  generateWhatsAppMessage(cartData) {
    let message = '🛒 *NUEVA ORDEN DE COMPRA* 🛒\n\n';
    message += `📅 Fecha: ${new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}\n\n`;
    
    message += '*PRODUCTOS:*\n';
    message += '━━━━━━━━━━━━━━━━━━━━\n';
    
    cartData.items.forEach((item, index) => {
      const precioUnitario = item.precio_descuento || item.precio;
      const subtotal = precioUnitario * item.quantity;
      
      message += `\n${index + 1}. *${item.nombre}*\n`;
      message += `   Cantidad: ${item.quantity}\n`;
      message += `   Precio: S/. ${precioUnitario.toFixed(2)}\n`;
      message += `   Subtotal: S/. ${subtotal.toFixed(2)}\n`;
    });
    
    message += '\n━━━━━━━━━━━━━━━━━━━━\n';
    
    if (cartData.descuento > 0) {
      message += `\nSubtotal: S/. ${cartData.subtotal.toFixed(2)}`;
      message += `\n🎉 Descuento: -S/. ${cartData.descuento.toFixed(2)}`;
    }
    
    message += `\n\n💰 *TOTAL: S/. ${cartData.total.toFixed(2)}*\n\n`;
    message += '¿Deseas confirmar esta compra? 😊';
    
    return message;
  }

  /**
   * Abre WhatsApp con el mensaje de compra (sin PDF por limitaciones de web)
   * @param {Object} cartData - Datos del carrito
   */
  sendToWhatsApp(cartData) {
    const message = this.generateWhatsAppMessage(cartData);
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${this.vendorPhone}?text=${encodedMessage}`;
    
    window.open(whatsappURL, '_blank', 'noopener,noreferrer');
  }

  /**
   * Descarga el PDF de la compra
   * @param {Object} cartData - Datos del carrito
   */
  downloadPDF(cartData) {
    const doc = this.generatePurchasePDF(cartData);
    const fileName = `Orden_QHATU_${Date.now()}.pdf`;
    doc.save(fileName);
  }

  /**
   * Muestra una vista previa del PDF en una nueva ventana
   * @param {Object} cartData - Datos del carrito
   */
  previewPDF(cartData) {
    const doc = this.generatePurchasePDF(cartData);
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    
    // Limpiar el objeto URL después de un tiempo
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
  }

  /**
   * Envía consulta sobre un producto específico
   * @param {Object} product - Producto a consultar
   */
  consultProduct(product) {
    const price = product.precio_descuento || product.precio;
    const message = encodeURIComponent(
      `Hola! 👋\n\nEstoy interesado en:\n*${product.nombre}*\n\nPrecio: S/. ${price.toFixed(2)}\n\n¿Está disponible?`
    );
    
    window.open(
      `https://wa.me/${this.vendorPhone}?text=${message}`,
      '_blank',
      'noopener,noreferrer'
    );
  }
}

// Exportar instancia única (Singleton)
const whatsappService = new WhatsAppService();
export default whatsappService;