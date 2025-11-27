// frontend/src/pages/Vendedor/sections/SalesPending/components/SaleCard.jsx
import React, { useState, useEffect } from 'react';
import { confirmarVenta, obtenerDetalleVenta } from '../../../../../services';
import mlService from '../../../../../services/mlService';
import './SaleCard.css';

// ====================================
// SVG Icons (todos los que usas)
// ====================================
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

  // Estados para IA
  const [mlData, setMlData] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [mlError, setMlError] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

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
    items = [],
    enviado_whatsapp,
    usuario_id,
  } = venta;

  // Carga automática de análisis IA solo para ventas pendientes
  useEffect(() => {
    if (venta_id && usuario_id && estado === 'pendiente' && !mlData && !mlLoading) {
      cargarDatosML();
    }
  }, [venta_id, usuario_id, estado, mlData, mlLoading]);

  // Carga de datos de Machine Learning
  const cargarDatosML = async () => {
    setMlLoading(true);
    setMlError(null);

    try {
      console.log(`Cargando análisis IA para venta ${venta_id}...`);
      const resultado = await mlService.obtenerAnalisisCompleto(venta_id, usuario_id);

      if (resultado.success) {
        setMlData(resultado.data);
        console.log(`Datos IA cargados para ${numero_venta}`, resultado.data);
      } else {
        throw new Error(resultado.error || 'Error del servicio IA');
      }
    } catch (err) {
      console.error('Error cargando IA:', err);
      setMlError(err.message || 'IA temporalmente no disponible');
    } finally {
      setMlLoading(false);
    }
  };

  // Enviar recomendaciones por WhatsApp usando IA
  const enviarRecomendacionesWhatsApp = async () => {
    if (!mlData?.analisis?.recomendacionesProductos?.recomendaciones?.length) return;

    setLoading(true);
    try {
      const productos = mlData.analisis.recomendacionesProductos.recomendaciones.slice(0, 3);
      const resultado = await mlService.enviarRecomendacionesWhatsApp({
        ventaId: venta_id,
        usuarioId: usuario_id,
        productosRecomendados: productos,
      });

      if (resultado.success) {
        window.open(resultado.data.urlWhatsApp, '_blank', 'noopener,noreferrer');
        alert(`Recomendaciones enviadas a ${cliente_nombre} por WhatsApp`);
      } else {
        throw new Error(resultado.error);
      }
    } catch (err) {
      alert(`Error enviando recomendaciones: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Componentes de IA
  const SegmentoBadge = () => {
    if (!mlData || mlLoading) return null;
    const seg = mlData.analisis.segmentoCliente;
    return (
      <div className={`segmento-badge segmento-${seg.color}`}>
        <span className="segmento-icon">{seg.icono}</span>
        <span className="segmento-text">{seg.nombre}</span>
        <span className="segmento-score">{seg.score}pts</span>
      </div>
    );
  };

  const ProbabilityMeter = () => {
    if (!mlData || mlLoading) return null;
    const prob = mlData.analisis.probabilidadCierre;
    return (
      <div className="probability-meter">
        <div className="probability-header">
          <span className="probability-label">Prob. Cierre IA:</span>
          <span className="probability-value">{prob.probabilidad}%</span>
        </div>
        <div className="probability-bar">
          <div
            className="probability-fill"
            style={{ width: `${prob.probabilidad}%` }}
          />
        </div>
        <div className="probability-confidence">
          Confianza: {prob.confianza.toLowerCase()}
        </div>
      </div>
    );
  };

  const RecommendationsPanel = () => {
    if (!mlData || !showRecommendations) return null;
    const recs = mlData.analisis.recomendacionesProductos.recomendaciones;

    if (!recs?.length) {
      return (
        <div className="recommendations-panel empty">
          <p>No hay recomendaciones disponibles en este momento</p>
        </div>
      );
    }

    return (
      <div className="recommendations-panel">
        <div className="recommendations-header">
          <h4>Recomendaciones IA</h4>
          <span className="recommendations-count">{recs.length} sugerencias</span>
        </div>
        <div className="recommendations-list">
          {recs.slice(0, 3).map((p, i) => (
            <div key={i} className="recommendation-item">
              <div className="recommendation-info">
                <span className="product-name">{p.producto_nombre}</span>
                <span className="product-similarity">{p.similitud}% similar</span>
                <span className="product-reason">{p.razon}</span>
              </div>
              <div className="recommendation-price">
                S/.{parseFloat(p.precio).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        <div className="recommendations-actions">
          <button
            className="btn-recommendation-send"
            onClick={enviarRecomendacionesWhatsApp}
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar por WhatsApp'}
          </button>
        </div>
      </div>
    );
  };

  const MLLoadingIndicator = () => mlLoading && (
    <div className="ml-loading">
      <div className="ml-spinner" />
      <span>Analizando con IA...</span>
    </div>
  );

  const MLErrorIndicator = () => mlError && (
    <div className="ml-error">
      <span className="error-icon">Warning</span>
      <span className="error-text">IA no disponible</span>
    </div>
  );

  // Funciones existentes
  const cargarDetalles = async () => {
    if (detallesCompletos || items.length > 0) {
      setExpanded(!expanded);
      return;
    }
    setLoadingDetails(true);
    try {
      const res = await obtenerDetalleVenta(venta_id);
      if (res.success) {
        setDetallesCompletos(res.data);
        setExpanded(true);
      }
    } catch (err) {
      setError('Error al cargar detalles');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleConfirmar = async () => {
    const prob = mlData?.analisis.probabilidadCierre.probabilidad || 'N/A';
    const seg = mlData?.analisis.segmentoCliente.nombre || 'N/A';

    const confirmar = window.confirm(
      `¿Confirmar venta ${numero_venta}?\n\n` +
      `Cliente: ${cliente_nombre}\n` +
      `Segmento IA: ${seg}\n` +
      `Probabilidad IA: ${prob}%\n` +
      `Total: S/.${parseFloat(total).toFixed(2)}\n\n` +
      `Se actualizará el inventario automáticamente.`
    );

    if (!confirmar) return;

    setLoading(true);
    try {
      const res = await confirmarVenta(venta_id, '');
      if (res.success) {
        alert(`Venta ${numero_venta} confirmada\n\nStock actualizado automáticamente.`);
        onConfirm?.();
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      alert(`Error: ${err.message || 'No se pudo confirmar'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    let numero = cliente_telefono.replace(/\D/g, '');
    if (!numero.startsWith('51')) numero = '51' + numero;

    const mensaje = `Hola ${cliente_nombre}\n\n¡Gracias por tu compra en Qhatu!\n\n` +
      `Pedido: ${numero_venta}\nTotal: S/.${parseFloat(total).toFixed(2)}\n\n` +
      `${estado === 'pendiente' ? 'Tu pedido está siendo procesado.' : 'Tu pedido ha sido confirmado.'}\n\n¿Alguna consulta?`;

    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const copiarNumeroVenta = () => {
    navigator.clipboard.writeText(numero_venta).then(() => {
      alert(`Código ${numero_venta} copiado`);
    });
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diff = ahora - date;
    const mins = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (mins < 1) return 'Ahora';
    if (mins < 60) return `Hace ${mins} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias === 1) return `Ayer`;
    return date.toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const getEstadoBadge = () => {
    const badges = {
      pendiente: { icon: Icons.Clock, label: 'Pendiente', class: 'badge-pending' },
      confirmada: { icon: Icons.CheckCircle, label: 'Confirmada', class: 'badge-confirmed' },
      procesando: { icon: Icons.Zap, label: 'Procesando', class: 'badge-processing' },
      en_preparacion: { icon: Icons.Package, label: 'Preparando', class: 'badge-preparation' },
      lista_entrega: { icon: Icons.Package, label: 'Lista', class: 'badge-ready' },
      en_camino: { icon: Icons.MessageCircle, label: 'En Camino', class: 'badge-delivery' },
      enviada: { icon: Icons.MessageCircle, label: 'Enviada', class: 'badge-sent' },
      entregada: { icon: Icons.CheckCircle, label: 'Entregada', class: 'badge-delivered' },
      cancelada: { icon: Icons.AlertCircle, label: 'Cancelada', class: 'badge-canceled' },
    };
    const b = badges[estado] || badges.pendiente;
    return (
      <span className={`sale-badge ${b.class}`}>
        <span className="badge-icon">{b.icon}</span>
        <span className="badge-label">{b.label}</span>
      </span>
    );
  };

  const itemsAMostrar = detallesCompletos?.items || items;
  const totalItems = itemsAMostrar.length;

  return (
    <article className={`sale-card ${estado === 'pendiente' ? 'sale-card-new' : ''}`}>
      {estado === 'pendiente' && <div className="sale-card-ribbon">NUEVA</div>}

      {/* Header con IA */}
      <header className="sale-card-header">
        <div className="header-left">
          <div className="sale-number-section">
            <button className="sale-number" onClick={copiarNumeroVenta}>
              <span className="copy-icon">{Icons.Copy}</span>
              <span className="number-text">{numero_venta}</span>
            </button>
            {getEstadoBadge()}
            <SegmentoBadge />
          </div>
        </div>
        <div className="header-right">
          {enviado_whatsapp && <span className="badge-whatsapp"><span className="whatsapp-icon">{Icons.MessageCircle}</span></span>}
          <MLLoadingIndicator />
          <MLErrorIndicator />
        </div>
      </header>

      {/* Probabilidad de cierre IA */}
      <div className="sale-card-ia-section">
        <ProbabilityMeter />
      </div>

      {/* Cliente */}
      <section className="sale-card-client">
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
      <section className="sale-card-items">
        <div className="items-header">
          <div className="items-count">
            <span className="package-icon">{Icons.Package}</span>
            <span className="count-text">{totalItems} producto{totalItems !== 1 ? 's' : ''}</span>
          </div>
          <button className="btn-expand-items" onClick={cargarDetalles} disabled={loadingDetails}>
            {loadingDetails ? <span className="spinner-mini" /> : (
              <>
                <span className="chevron-icon">{expanded ? Icons.ChevronUp : Icons.ChevronDown}</span>
                <span className="expand-text">{expanded ? 'Ocultar' : 'Ver'}</span>
              </>
            )}
          </button>
        </div>

        {!expanded && totalItems > 0 && (
          <div className="items-preview">
            {itemsAMostrar.slice(0, 2).map((it, i) => (
              <div key={i} className="item-preview">
                <span className="item-bullet">•</span>
                <span className="item-name">{it.producto_nombre}</span>
                <span className="item-qty">x{it.cantidad}</span>
              </div>
            ))}
            {totalItems > 2 && <span className="items-more">+{totalItems - 2} más</span>}
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
              {itemsAMostrar.map((it, i) => {
                const precio = it.precio_descuento || it.precio_unitario;
                const descuento = it.precio_descuento && it.precio_descuento < it.precio_unitario;
                return (
                  <div key={i} className="table-row">
                    <div className="item-detail">
                      <span className="item-text">{it.producto_nombre}</span>
                      {descuento && <span className="discount-badge">Desc.</span>}
                    </div>
                    <span className="qty">x{it.cantidad}</span>
                    <div className="prices">
                      {descuento && <span className="price-old">S/.{parseFloat(it.precio_unitario).toFixed(2)}</span>}
                      <span className="price-current">S/.{parseFloat(precio).toFixed(2)}</span>
                    </div>
                    <span className="subtotal">S/.{parseFloat(it.subtotal).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Botón para mostrar recomendaciones IA */}
      {mlData && !showRecommendations && (
        <div className="ia-recommendations-toggle">
          <button className="btn-show-recommendations" onClick={() => setShowRecommendations(true)}>
            <span className="btn-icon">Target</span>
            <span className="btn-text">Ver Recomendaciones IA</span>
          </button>
        </div>
      )}

      {/* Panel de recomendaciones */}
      <RecommendationsPanel />

      {/* Notas */}
      {cliente_notas && (
        <section className="sale-card-notes">
          <div className="notes-header">
            <span className="notes-icon">{Icons.FileText}</span>
            <h4>Notas:</h4>
          </div>
          <p className="notes-text">{cliente_notas}</p>
        </section>
      )}

      {/* Total y fecha */}
      <div className="sale-card-total">
        <span className="total-label">Total:</span>
        <span className="total-amount">S/.{parseFloat(total).toFixed(2)}</span>
      </div>

      <div className="sale-card-date">
        <span className="date-icon">{Icons.Clock}</span>
        <span className="date-text">{formatearFecha(fecha_venta)}</span>
      </div>

      {/* Errores */}
      {error && (
        <div className="sale-card-error" role="alert">
          <span className="error-icon">{Icons.AlertCircle}</span>
          <p className="error-text">{error}</p>
        </div>
      )}

      {/* Acciones */}
      <footer className="sale-card-actions">
        <button className="btn-action btn-whatsapp" onClick={handleWhatsApp}>
          <span className="btn-icon">{Icons.MessageCircle}</span>
          <span className="btn-text">Contactar</span>
        </button>

        {estado === 'pendiente' && (
          <button className="btn-action btn-confirm" onClick={handleConfirmar} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-small" />
                <span className="btn-text">Confirmando...</span>
              </>
            ) : (
              <>
                <span className="btn-icon">{Icons.CheckCircle}</span>
                <span className="btn-text">
                  Confirmar {mlData && `(${mlData.analisis.probabilidadCierre.probabilidad}%)`}
                </span>
              </>
            )}
          </button>
        )}

        {estado === 'confirmada' && (
          <button className="btn-action btn-info" disabled>
            <span className="btn-icon">{Icons.CheckCircle}</span>
            <span className="btn-text">Confirmada</span>
          </button>
        )}
      </footer>
    </article>
  );
};

export default SaleCard;