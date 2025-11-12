// src/services/whatsappService.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logoBase64 from '../../public/logo-oe.png'; // ← AÑADE TU LOGO EN BASE64

const WHATSAPP_NUMBER = '51987654321'; // ← TU NÚMERO DE EMPRESA

/**
 * Genera el PDF del carrito
 */
const generatePDF = (cartData, user) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 20;

  // === LOGO ===
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', margin, y, 40, 40);
    } catch (e) {
      console.warn('Logo no cargado');
    }
  }

  // === TÍTULO ===
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ORDEN DE COMPRA', pageWidth / 2, y + 50, { align: 'center' });

  y += 60;

  // === DATOS DEL CLIENTE ===
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);

  const clientInfo = [
    ['Cliente:', user?.nombre_completo || 'Anónimo'],
    ['Email:', user?.email || '-'],
    ['Teléfono:', user?.telefono || '-'],
    ['Fecha:', new Date().toLocaleDateString('es-PE')],
    ['Hora:', new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })]
  ];

  doc.autoTable({
    startY: y,
    head: [['Campo', 'Detalle']],
    body: clientInfo,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [102, 126, 234], textColor: 255 },
    columnStyles: { 0: { fontStyle: 'bold' } },
    margin: { left: margin, right: margin }
  });

  y = doc.lastAutoTable.finalY + 15;

  // === PRODUCTOS ===
  const tableData = cartData.items.map(item => [
    item.nombre,
    item.quantity,
    `S/. ${parseFloat(item.precio).toFixed(2)}`,
    item.precio_descuento ? `S/. ${parseFloat(item.precio_descuento).toFixed(2)}` : '-',
    `S/. ${item.subtotalItem.toFixed(2)}`
  ]);

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Detalles del Carrito', margin, y);
  y += 10;

  doc.autoTable({
    startY: y,
    head: [['Producto', 'Cant.', 'Precio Unit.', 'Descuento', 'Subtotal']],
    body: tableData,
    theme: 'striped',
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [102, 126, 234], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  });

  y = doc.lastAutoTable.finalY + 15;

  // === RESUMEN DE PAGO ===
  const summary = [
    ['Subtotal:', `S/. ${cartData.subtotal.toFixed(2)}`],
    cartData.descuento > 0 ? ['Descuento:', `-S/. ${cartData.descuento.toFixed(2)}`] : null,
    ['TOTAL A PAGAR:', `S/. ${cartData.total.toFixed(2)}`]
  ].filter(Boolean);

  doc.autoTable({
    startY: y,
    body: summary,
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'right' },
      1: { fontStyle: 'bold', halign: 'right', fontSize: 13 }
    },
    margin: { left: pageWidth / 2, right: margin }
  });

  // === FOOTER ===
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('Gracias por tu compra en Qhatu Imports', pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });
  doc.text('www.qhatu.com | +51 987 654 321', pageWidth / 2, doc.internal.pageSize.getHeight() - 12, { align: 'center' });

  return doc;
};

/**
 * Descargar PDF
 */
export const downloadPDF = (cartData, user) => {
  const doc = generatePDF(cartData, user);
  const fileName = `orden_qhatu_${user?.email?.split('@')[0] || 'cliente'}_${Date.now()}.pdf`;
  doc.save(fileName);
};

/**
 * Vista previa en nueva pestaña
 */
export const previewPDF = (cartData, user) => {
  const doc = generatePDF(cartData, user);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};

/**
 * Enviar a WhatsApp con PDF adjunto
 */
export const sendToWhatsApp = (cartData, user) => {
  const doc = generatePDF(cartData, user);
  const blob = doc.output('blob');
  const file = new File([blob], `orden_qhatu.pdf`, { type: 'application/pdf' });

  // Mensaje
  const itemsText = cartData.items
    .map(i => `• ${i.nombre} x${i.quantity} = S/. ${i.subtotalItem.toFixed(2)}`)
    .join('\n');

  const message = encodeURIComponent(
    `*¡NUEVA ORDEN!* %0A%0A` +
    `*Cliente:* ${user?.nombre_completo || 'Anónimo'}%0A` +
    `*Teléfono:* ${user?.telefono || '-'}%0A` +
    `*Email:* ${user?.email || '-'}%0A%0A` +
    `*Productos:*%0A${itemsText}%0A%0A` +
    `*Total:* S/. ${cartData.total.toFixed(2)}%0A%0A` +
    `Gracias por confiar en *Qhatu Imports*`
  );

  // Convertir blob a base64
  const reader = new FileReader();
  reader.onloadend = () => {
    const base64 = reader.result.split(',')[1];
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}&type=phone_number&app_absent=0`;

    // Abrir WhatsApp Web con archivo
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}`;
    form.target = '_blank';
    form.enctype = 'multipart/form-data';

    const input = document.createElement('input');
    input.type = 'file';
    input.name = 'file';
    input.files = new FileList([file]);

    // Simular envío (limitado por CORS, pero abre chat)
    window.open(whatsappURL, '_blank');
  };

  reader.readAsDataURL(blob);
};

// Exportar todo
export default {
  downloadPDF,
  previewPDF,
  sendToWhatsApp
};