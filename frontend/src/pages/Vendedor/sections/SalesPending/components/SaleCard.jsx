// C:\qhatu\frontend\src\pages\Vendedor\sections\SalesPending\components\SaleCard.jsx
import { useState } from 'react';
import { confirmarVenta } from '../../../../../services/ventasService';

/**
 * 🎴 Card de Venta Individual
 */
const SaleCard = ({ venta, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(null);

  const {
    venta_id,
    numero_venta,
    cliente_nombre,
    cliente_telefono,
    cliente_direccion,
    cliente_distrito,
    cliente_notas,
    total,
    estado,
    fecha_venta,
    items,
    enviado_whatsapp
  } = venta;

  /**
   * Confirmar venta
   */
  const handleConfirmar = async () => {
    if (!confirm(`¿Confirmar venta ${numero_venta}?`)) return;

    setLoading(true);
    setError(null);

    try {
      const response = await confirmarVenta(venta_id);

      if (response.success) {
        alert(`✅ Venta ${numero_venta} confirmada`);
        onConfirm?.();
      }
    } catch (err) {
      console.error('Error al confirmar:', err);
      setError(err.message || 'Error al confirmar venta');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abrir WhatsApp con el cliente
   */
  const handleWhatsApp = () => {
    const mensaje = `Hola ${cliente_nombre}, te confirmamos tu pedido ${numero_venta} por S/.${total}. ¿Alguna consulta?`;
    const url = `https://wa.me/51${cliente_telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  /**
   * Formatear fecha
   */
  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Badge de estado
   */
  const getEstadoBadge = () => {
    const badges = {
      pendiente: { icon: '⏳', label: 'Pendiente', className: 'badge-pending' },
      confirmada: { icon: '✅', label: 'Confirmada', className: 'badge-confirmed' },
      procesando: { icon: '📦', label: 'Procesando', className: 'badge-processing' },
      en_camino: { icon: '🚚', label: 'En Camino', className: 'badge-delivery' },
      entregada: { icon: '✅', label: 'Entregada', className: 'badge-delivered' },
      cancelada: { icon: '❌', label: 'Cancelada', className: 'badge-canceled' }
    };

    const badge = badges[estado] || badges.pendiente;

    return (
      <span className={`sale-badge ${badge.className}`}>
        {badge.icon} {badge.label}
      </span>
    );
  };

  return (
    <div className="sale-card">
      {/* Header */}
      <div className="sale-card-header">
        <div className="sale-card-number">
          <span className="sale-number">{numero_venta}</span>
          {getEstadoBadge()}
        </div>

        <div className="sale-card-badges">
          {enviado_whatsapp && (
            <span className="badge-whatsapp" title="Enviado por WhatsApp">
              📱
            </span>
          )}
        </div>
      </div>

      {/* Cliente */}
      <div className="sale-card-client">
        <div className="client-info">
          <h3>{cliente_nombre}</h3>
          <p className="client-phone">📞 {cliente_telefono}</p>
          {cliente_direccion && (
            <p className="client-address">
              📍 {cliente_direccion}{cliente_distrito ? `, ${cliente_distrito}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Items preview */}
      <div className="sale-card-items">
        <p className="items-count">
          📦 {items?.length || 0} producto{items?.length !== 1 ? 's' : ''}
        </p>
        
        {!expanded && items?.length > 0 && (
          <div className="items-preview">
            {items.slice(0, 2).map((item, idx) => (
              <span key={idx} className="item-preview">
                • {item.producto_nombre} (x{item.cantidad})
              </span>
            ))}
            {items.length > 2 && (
              <span className="items-more">+{items.length - 2} más</span>
            )}
          </div>
        )}

        {/* Items expandidos */}
        {expanded && items?.length > 0 && (
          <div className="items-expanded">
            {items.map((item, idx) => (
              <div key={idx} className="item-detail">
                <div className="item-detail-info">
                  <span className="item-name">{item.producto_nombre}</span>
                  <span className="item-quantity">x{item.cantidad}</span>
                </div>
                <span className="item-price">S/.{item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        <button 
          className="btn-expand"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '▲ Ver menos' : '▼ Ver detalles'}
        </button>
      </div>

      {/* Notas del cliente */}
      {cliente_notas && (
        <div className="sale-card-notes">
          <span className="notes-icon">📝</span>
          <p>{cliente_notas}</p>
        </div>
      )}

      {/* Total */}
      <div className="sale-card-total">
        <span className="total-label">Total:</span>
        <span className="total-amount">S/.{total.toFixed(2)}</span>
      </div>

      {/* Fecha */}
      <div className="sale-card-date">
        <span>🕒 {formatearFecha(fecha_venta)}</span>
      </div>

      {/* Error */}
      {error && (
        <div className="sale-card-error">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {/* Acciones */}
      <div className="sale-card-actions">
        <button
          className="btn-whatsapp"
          onClick={handleWhatsApp}
          title="Contactar por WhatsApp"
        >
          📱 WhatsApp
        </button>

        {estado === 'pendiente' && (
          <button
            className="btn-confirm"
            onClick={handleConfirmar}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-small" />
                <span>Confirmando...</span>
              </>
            ) : (
              <>
                <span>✅</span>
                <span>Confirmar</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default SaleCard;

/**
 * 🎨 GUÍA DE CSS
 * 
 * Card principal:
 * - .sale-card: bg-white, rounded-lg, shadow, p-4, border, hover:shadow-lg
 * - .sale-card: display flex, flex-direction column, gap 12px
 * 
 * Header:
 * - .sale-card-header: flex between, items-center
 * - .sale-card-number: flex gap-2, items-center
 * - .sale-number: font-bold, text-lg, text-blue-600
 * 
 * Badges:
 * - .sale-badge: px-2, py-1, rounded, text-xs, font-medium
 * - .badge-pending: bg-yellow-100, text-yellow-800
 * - .badge-confirmed: bg-green-100, text-green-800
 * - .badge-processing: bg-blue-100, text-blue-800
 * - .badge-whatsapp: bg-green-50, text-green-600, rounded-full, w-8 h-8
 * 
 * Cliente:
 * - .sale-card-client: border-bottom, pb-3
 * - .client-info h3: font-semibold, text-base
 * - .client-phone, .client-address: text-sm, text-gray-600, mt-1
 * 
 * Items:
 * - .sale-card-items: py-2
 * - .items-count: font-medium, text-sm, mb-2
 * - .items-preview: flex-col, gap-1
 * - .item-preview: text-sm, text-gray-600
 * - .items-more: text-xs, text-blue-500, font-medium
 * - .items-expanded: bg-gray-50, rounded, p-2, mt-2
 * - .item-detail: flex between, text-sm, py-1
 * - .item-name: text-gray-700
 * - .item-quantity: text-gray-500, ml-2
 * - .item-price: font-medium
 * - .btn-expand: text-xs, text-blue-500, hover:underline, mt-2
 * 
 * Notas:
 * - .sale-card-notes: bg-yellow-50, border-yellow-200, rounded, p-2, flex gap-2
 * - .notes-icon: text-lg
 * - .sale-card-notes p: text-sm, italic
 * 
 * Total:
 * - .sale-card-total: flex between, items-center, py-2, border-top
 * - .total-label: text-gray-600
 * - .total-amount: text-xl, font-bold, text-green-600
 * 
 * Fecha:
 * - .sale-card-date: text-xs, text-gray-500, flex items-center, gap-1
 * 
 * Error:
 * - .sale-card-error: bg-red-50, border-red-200, rounded, p-2, flex gap-2, text-sm
 * 
 * Acciones:
 * - .sale-card-actions: flex gap-2, pt-2, border-top
 * - .btn-whatsapp: flex-1, bg-green-500, hover:bg-green-600, text-white
 * - .btn-confirm: flex-1, bg-blue-500, hover:bg-blue-600, text-white
 * - Ambos botones: rounded, px-4, py-2, flex items-center, gap-2, justify-center
 * 
 * Estados:
 * - .btn-confirm:disabled: opacity-50, cursor-not-allowed
 * - .spinner-small: width 16px, height 16px, border-2, animate-spin
 * 
 * Responsive:
 * - Mobile: .sale-card-actions flex-col (botones 100% width)
 * - Desktop: .sale-card-actions flex-row
 */
