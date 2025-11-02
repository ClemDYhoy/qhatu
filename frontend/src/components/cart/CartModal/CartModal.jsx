// C:\qhatu\frontend\src\components\cart\CartModal\CartModal.jsx

import React, { useState, useMemo } from 'react';
import { useCart } from '../../../contexts/CartContext';
import whatsappService from '../../../services/whatsappService';
import './CartModal.css';

// Iconos SVG
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const MinusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const FileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const CartModal = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, clearCart, getTotalItems } = useCart();
  const [showPurchaseDetails, setShowPurchaseDetails] = useState(false);

  // Calcular totales
  const cartData = useMemo(() => {
    const items = cart.map(item => {
      const precio = parseFloat(item.precio) || 0;
      const precioDescuento = item.precio_descuento ? parseFloat(item.precio_descuento) : null;
      const precioFinal = precioDescuento || precio;
      
      return {
        ...item,
        precio,
        precio_descuento: precioDescuento,
        precioFinal,
        subtotalItem: precioFinal * item.quantity
      };
    });

    const subtotalSinDescuento = items.reduce((sum, item) => 
      sum + (item.precio * item.quantity), 0
    );

    const total = items.reduce((sum, item) => 
      sum + item.subtotalItem, 0
    );

    const descuentoTotal = subtotalSinDescuento - total;

    return {
      items,
      subtotal: subtotalSinDescuento,
      descuento: descuentoTotal,
      total
    };
  }, [cart]);

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return 'S/. 0.00';
    return `S/. ${numPrice.toFixed(2)}`;
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handlePreviewPDF = () => {
    if (cartData.items.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    whatsappService.previewPDF(cartData);
  };

  const handleDownloadPDF = () => {
    if (cartData.items.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    whatsappService.downloadPDF(cartData);
  };

  const handleSendToWhatsApp = () => {
    if (cartData.items.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    
    // Mostrar confirmación
    const confirm = window.confirm(
      `¿Deseas enviar esta orden por WhatsApp?\n\nTotal: ${formatPrice(cartData.total)}\nProductos: ${getTotalItems()}`
    );
    
    if (confirm) {
      whatsappService.sendToWhatsApp(cartData);
      // Opcional: limpiar el carrito después de enviar
      // clearCart();
      // onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-modal__header">
          <h2>🛒 Mi Carrito ({getTotalItems()})</h2>
          <button 
            className="cart-modal__close" 
            onClick={onClose}
            aria-label="Cerrar carrito"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="cart-modal__body">
          {cartData.items.length === 0 ? (
            <div className="cart-modal__empty">
              <p>Tu carrito está vacío</p>
              <p className="cart-modal__empty-subtitle">¡Agrega productos para comenzar!</p>
            </div>
          ) : (
            <>
              {/* Lista de productos */}
              <div className="cart-modal__items">
                {cartData.items.map((item) => (
                  <div key={item.producto_id} className="cart-item">
                    {/* Imagen */}
                    <div className="cart-item__image">
                      <img 
                        src={item.url_imagen || '/awaiting-image.jpeg'} 
                        alt={item.nombre}
                        onError={(e) => {
                          e.target.src = '/awaiting-image.jpeg';
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="cart-item__info">
                      <h4 className="cart-item__name">{item.nombre}</h4>
                      
                      {/* Precios */}
                      <div className="cart-item__prices">
                        {item.precio_descuento ? (
                          <>
                            <span className="cart-item__price-old">
                              {formatPrice(item.precio)}
                            </span>
                            <span className="cart-item__price-current">
                              {formatPrice(item.precio_descuento)}
                            </span>
                          </>
                        ) : (
                          <span className="cart-item__price-current">
                            {formatPrice(item.precio)}
                          </span>
                        )}
                      </div>

                      {/* Controles de cantidad */}
                      <div className="cart-item__controls">
                        <button
                          className="cart-item__btn cart-item__btn--minus"
                          onClick={() => handleQuantityChange(item.producto_id, item.quantity - 1)}
                          aria-label="Disminuir cantidad"
                        >
                          <MinusIcon />
                        </button>
                        
                        <span className="cart-item__quantity">{item.quantity}</span>
                        
                        <button
                          className="cart-item__btn cart-item__btn--plus"
                          onClick={() => handleQuantityChange(item.producto_id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          aria-label="Aumentar cantidad"
                        >
                          <PlusIcon />
                        </button>
                      </div>

                      {/* Stock disponible */}
                      {item.quantity >= item.stock && (
                        <p className="cart-item__stock-warning">
                          Stock máximo alcanzado
                        </p>
                      )}
                    </div>

                    {/* Subtotal y eliminar */}
                    <div className="cart-item__actions">
                      <p className="cart-item__subtotal">
                        {formatPrice(item.subtotalItem)}
                      </p>
                      <button
                        className="cart-item__remove"
                        onClick={() => removeFromCart(item.producto_id)}
                        aria-label="Eliminar producto"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen de compra */}
              <div className="cart-modal__summary">
                <div className="cart-summary">
                  {cartData.descuento > 0 && (
                    <>
                      <div className="cart-summary__row">
                        <span>Subtotal:</span>
                        <span>{formatPrice(cartData.subtotal)}</span>
                      </div>
                      <div className="cart-summary__row cart-summary__row--discount">
                        <span>🎉 Descuento:</span>
                        <span>-{formatPrice(cartData.descuento)}</span>
                      </div>
                      <div className="cart-summary__divider"></div>
                    </>
                  )}
                  
                  <div className="cart-summary__row cart-summary__row--total">
                    <span>Total:</span>
                    <span>{formatPrice(cartData.total)}</span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="cart-modal__actions">
                  {/* Botones de PDF */}
                  <div className="cart-modal__pdf-actions">
                    <button
                      className="btn btn--outline btn--small"
                      onClick={handlePreviewPDF}
                      title="Ver PDF"
                    >
                      <EyeIcon />
                      <span>Vista previa</span>
                    </button>
                    <button
                      className="btn btn--outline btn--small"
                      onClick={handleDownloadPDF}
                      title="Descargar PDF"
                    >
                      <DownloadIcon />
                      <span>Descargar PDF</span>
                    </button>
                  </div>

                  {/* Botón principal de compra */}
                  <button
                    className="btn btn--whatsapp btn--large"
                    onClick={handleSendToWhatsApp}
                  >
                    <WhatsAppIcon />
                    <span>Comprar por WhatsApp</span>
                  </button>

                  {/* Botón limpiar carrito */}
                  <button
                    className="btn btn--danger-outline btn--small"
                    onClick={() => {
                      if (window.confirm('¿Deseas vaciar el carrito?')) {
                        clearCart();
                      }
                    }}
                  >
                    <TrashIcon />
                    <span>Vaciar carrito</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer info */}
        {cartData.items.length > 0 && (
          <div className="cart-modal__footer">
            <p>💡 <strong>Nota:</strong> Al hacer clic en "Comprar por WhatsApp", se abrirá una conversación con tu orden.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;