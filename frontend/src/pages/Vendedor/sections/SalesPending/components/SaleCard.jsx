// C:\qhatu\frontend\src\pages\Vendedor\sections\SalesPending\components\SaleCard.jsx
import React, { useState } from 'react';
import { confirmarVenta, obtenerDetalleVenta } from '../../../../../services/ventasService';
import './SaleCard.css';

// SVG Icons
const Icons = {
  Package: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  CheckCircle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  AlertCircle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  User: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  MapPin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  FileText: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  ),
  DollarSign: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  MessageCircle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  ChevronDown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  ChevronUp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  ),
  Zap: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Copy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
};

const SaleCard = ({ venta, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);
  const [detallesCompletos, setDetallesCompletos] = useState(null);

  const {
    venta_id,
    numero_venta,
    cliente_nombre,
    cliente_telefono,
    cliente_direccion,
    cliente_distrito,
    cliente_email,
    cliente_notas,
    total,
    estado,
    fecha_venta,
    items,
    enviado_whatsapp
  } = venta;

  const cargarDetalles = async () => {
    if (detallesCompletos || items?.length > 0) {
      setExpanded(!expanded);
      return;
    }

    setLoadingDetails(true);
    setError(null);

    try {
      console.log(`Cargando detalles de ${numero_venta}...`);
      const response = await obtenerDetalleVenta(venta_id);

      if (response.success) {
        setDetallesCompletos(response.data);
        setExpanded(true);
        console.log(`Detalles cargados para ${numero_venta}`);
      } else {
        throw new Error(response.message || 'Error al cargar detalles');
      }
    } catch (err) {
      console.error('Error cargando detalles:', err);
      setError('No se pudieron cargar los detalles');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleConfirmar = async () => {
    const confirmar = window.confirm(
      `¿Confirmar venta ${numero_venta}?\n\n` +
      `Cliente: ${cliente_nombre}\n` +
      `Total: S/.${parseFloat(total).toFixed(2)}\n\n` +
      `Esto actualizará el inventario automáticamente.`
    );
    
    if (!confirmar) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`Confirmando venta ${numero_venta}...`);
      const response = await confirmarVenta(venta_id, '');

      if (response.success) {
        console.log(`Venta ${numero_venta} confirmada exitosamente`);
        alert(`Venta ${numero_venta} confirmada\n\nEl stock ha sido actualizado automáticamente.`);
        onConfirm?.();
      } else {
        throw new Error(response.message || 'Error al confirmar venta');
      }
    } catch (err) {
      console.error('Error al confirmar:', err);
      const mensaje = err.message || 'Error al confirmar venta';
      setError(mensaje);
      alert(`Error: ${mensaje}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    let numeroLimpio = cliente_telefono.replace(/\D/g, '');
    
    if (!numeroLimpio.startsWith('51')) {
      numeroLimpio = '51' + numeroLimpio;
    }

    const mensaje = `Hola ${cliente_nombre}

¡Gracias por tu compra en Qhatu!

Pedido: ${numero_venta}
Total: S/.${parseFloat(total).toFixed(2)}

${estado === 'pendiente' 
  ? 'Tu pedido está siendo procesado. Te confirmaremos los detalles pronto.' 
  : 'Tu pedido ha sido confirmado y está en proceso.'
}

¿Tienes alguna consulta?`;

    const url = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
    console.log(`Abriendo WhatsApp: ${numeroLimpio}`);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const copiarNumeroVenta = () => {
    navigator.clipboard.writeText(numero_venta).then(() => {
      alert(`Código ${numero_venta} copiado al portapapeles`);
    }).catch(() => {
      alert('No se pudo copiar el código');
    });
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diferencia = ahora - date;
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(diferencia / 3600000);
    const dias = Math.floor(diferencia / 86400000);

    if (minutos < 1) return 'Ahora mismo';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias === 1) return `Ayer ${date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
    
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = () => {
    const badges = {
      pendiente: { icon: Icons.Clock, label: 'Pendiente', className: 'badge-pending' },
      confirmada: { icon: Icons.CheckCircle, label: 'Confirmada', className: 'badge-confirmed' },
      procesando: { icon: Icons.Zap, label: 'Procesando', className: 'badge-processing' },
      en_preparacion: { icon: Icons.Package, label: 'En Preparación', className: 'badge-preparation' },
      lista_entrega: { icon: Icons.Package, label: 'Lista', className: 'badge-ready' },
      en_camino: { icon: Icons.MessageCircle, label: 'En Camino', className: 'badge-delivery' },
      enviada: { icon: Icons.MessageCircle, label: 'Enviada', className: 'badge-sent' },
      entregada: { icon: Icons.CheckCircle, label: 'Entregada', className: 'badge-delivered' },
      cancelada: { icon: Icons.AlertCircle, label: 'Cancelada', className: 'badge-canceled' }
    };

    const badge = badges[estado] || badges.pendiente;

    return (
      <span className={`sale-badge ${badge.className}`}>
        <span className="badge-icon">{badge.icon}</span>
        <span className="badge-label">{badge.label}</span>
      </span>
    );
  };

  const itemsAMostrar = detallesCompletos?.items || items || [];
  const totalItems = itemsAMostrar.length;

  return (
    <article className={`sale-card ${estado === 'pendiente' ? 'sale-card-new' : ''}`}>
      {estado === 'pendiente' && (
        <div className="sale-card-ribbon" aria-label="Nueva venta">
          NUEVA
        </div>
      )}

      {/* Header */}
      <header className="sale-card-header">
        <div className="header-left">
          <div className="sale-number-section">
            <button
              className="sale-number"
              onClick={copiarNumeroVenta}
              title="Copiar número de venta"
              aria-label={`Copiar número ${numero_venta}`}
            >
              <span className="copy-icon">{Icons.Copy}</span>
              <span className="number-text">{numero_venta}</span>
            </button>
            {getEstadoBadge()}
          </div>
        </div>

        <div className="header-right">
          {enviado_whatsapp && (
            <span className="badge-whatsapp" title="Pedido enviado por WhatsApp" aria-label="Enviado por WhatsApp">
              <span className="whatsapp-icon">{Icons.MessageCircle}</span>
            </span>
          )}
        </div>
      </header>

      {/* Cliente */}
      <section className="sale-card-client" aria-label="Información del cliente">
        <div className="client-header">
          <span className="client-icon">{Icons.User}</span>
          <h3 className="client-name">{cliente_nombre}</h3>
        </div>

        <div className="client-contacts">
          {cliente_telefono && (
            <div className="contact-item">
              <span className="contact-icon">{Icons.Phone}</span>
              <span className="contact-value">{cliente_telefono}</span>
            </div>
          )}
          
          {cliente_email && (
            <div className="contact-item">
              <span className="contact-icon">{Icons.Mail}</span>
              <span className="contact-value">{cliente_email}</span>
            </div>
          )}
        </div>

        {cliente_direccion && (
          <div className="client-address">
            <span className="address-icon">{Icons.MapPin}</span>
            <div className="address-content">
              <span className="address-street">{cliente_direccion}</span>
              {cliente_distrito && <span className="address-district">{cliente_distrito}</span>}
            </div>
          </div>
        )}
      </section>

      {/* Items */}
      <section className="sale-card-items" aria-label="Productos">
        <div className="items-header">
          <div className="items-count">
            <span className="package-icon">{Icons.Package}</span>
            <span className="count-text">{totalItems} producto{totalItems !== 1 ? 's' : ''}</span>
          </div>
          
          <button 
            className="btn-expand-items"
            onClick={cargarDetalles}
            disabled={loadingDetails}
            aria-expanded={expanded}
            aria-label={expanded ? 'Ocultar detalles' : 'Ver detalles'}
          >
            {loadingDetails ? (
              <span className="spinner-mini" />
            ) : (
              <>
                <span className="chevron-icon">
                  {expanded ? Icons.ChevronUp : Icons.ChevronDown}
                </span>
                <span className="expand-text">{expanded ? 'Ocultar' : 'Ver'}</span>
              </>
            )}
          </button>
        </div>
        
        {!expanded && totalItems > 0 && (
          <div className="items-preview">
            {itemsAMostrar.slice(0, 2).map((item, idx) => (
              <div key={idx} className="item-preview">
                <span className="item-bullet">•</span>
                <span className="item-name">{item.producto_nombre}</span>
                <span className="item-qty">x{item.cantidad}</span>
              </div>
            ))}
            {totalItems > 2 && (
              <span className="items-more">+{totalItems - 2} más</span>
            )}
          </div>
        )}

        {expanded && totalItems > 0 && (
          <div className="items-expanded">
            <div className="items-table">
              <div className="table-header">
                <span>Producto</span>
                <span>Cant.</span>
                <span>Precio</span>
                <span>Subtotal</span>
              </div>
              
              {itemsAMostrar.map((item, idx) => {
                const precioFinal = item.precio_descuento || item.precio_unitario;
                const tieneDescuento = item.precio_descuento && item.precio_descuento < item.precio_unitario;
                
                return (
                  <div key={idx} className="table-row">
                    <div className="item-detail">
                      <span className="item-text">{item.producto_nombre}</span>
                      {tieneDescuento && (
                        <span className="discount-badge">Desc.</span>
                      )}
                    </div>
                    
                    <span className="qty">x{item.cantidad}</span>
                    
                    <div className="prices">
                      {tieneDescuento && (
                        <span className="price-old">
                          S/.{parseFloat(item.precio_unitario).toFixed(2)}
                        </span>
                      )}
                      <span className="price-current">
                        S/.{parseFloat(precioFinal).toFixed(2)}
                      </span>
                    </div>
                    
                    <span className="subtotal">
                      S/.{parseFloat(item.subtotal).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Notas */}
      {cliente_notas && (
        <section className="sale-card-notes" aria-label="Notas del cliente">
          <div className="notes-header">
            <span className="notes-icon">{Icons.FileText}</span>
            <h4>Notas:</h4>
          </div>
          <p className="notes-text">{cliente_notas}</p>
        </section>
      )}

      {/* Total */}
      <div className="sale-card-total">
        <span className="total-label">Total:</span>
        <span className="total-amount">S/.{parseFloat(total).toFixed(2)}</span>
      </div>

      {/* Fecha */}
      <div className="sale-card-date">
        <span className="date-icon">{Icons.Clock}</span>
        <span className="date-text">{formatearFecha(fecha_venta)}</span>
      </div>

      {/* Error */}
      {error && (
        <div className="sale-card-error" role="alert">
          <span className="error-icon">{Icons.AlertCircle}</span>
          <p className="error-text">{error}</p>
        </div>
      )}

      {/* Acciones */}
      <footer className="sale-card-actions">
        <button
          className="btn-action btn-whatsapp"
          onClick={handleWhatsApp}
          title="Contactar al cliente por WhatsApp"
          aria-label="Enviar mensaje por WhatsApp"
        >
          <span className="btn-icon">{Icons.MessageCircle}</span>
          <span className="btn-text">Contactar</span>
        </button>

        {estado === 'pendiente' && (
          <button
            className="btn-action btn-confirm"
            onClick={handleConfirmar}
            disabled={loading}
            aria-label="Confirmar venta"
          >
            {loading ? (
              <>
                <span className="spinner-small" />
                <span className="btn-text">Confirmando...</span>
              </>
            ) : (
              <>
                <span className="btn-icon">{Icons.CheckCircle}</span>
                <span className="btn-text">Confirmar</span>
              </>
            )}
          </button>
        )}

        {estado === 'confirmada' && (
          <button
            className="btn-action btn-info"
            disabled
            aria-label="Venta confirmada"
          >
            <span className="btn-icon">{Icons.CheckCircle}</span>
            <span className="btn-text">Confirmada</span>
          </button>
        )}
      </footer>
    </article>
  );
};

export default SaleCard;