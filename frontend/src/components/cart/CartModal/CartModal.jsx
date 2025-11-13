// src/components/cart/CartModal/CartModal.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import authService from '../../../services/authService';
import whatsappService from '../../../services/whatsappService';
import Login from '../../layout/Auth/Login'; // Usamos el Login mejorado
import './CartModal.css';

// === ICONOS SVG ===
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const MinusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// === COMPONENTE PRINCIPAL ===
const CartModal = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, clearCart, getTotalItems } = useCart();
  const [showLogin, setShowLogin] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

  // === CÁLCULO DE TOTALES ===
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

    const subtotal = items.reduce((sum, i) => sum + i.precio * i.quantity, 0);
    const total = items.reduce((sum, i) => sum + i.subtotalItem, 0);
    const descuento = subtotal - total;

    return { items, subtotal, descuento, total };
  }, [cart]);

  const formatPrice = (price) => `S/. ${(parseFloat(price) || 0).toFixed(2)}`;

  // === MANEJADORES ===
  const handleQuantityChange = (id, qty) => {
    if (qty < 1) removeFromCart(id);
    else updateQuantity(id, qty);
  };

  const handlePreviewPDF = () => {
    if (!cartData.items.length) return alert('Carrito vacío');
    whatsappService.previewPDF(cartData);
  };

  const handleDownloadPDF = () => {
    if (!cartData.items.length) return alert('Carrito vacío');
    whatsappService.downloadPDF(cartData);
  };

  // === CHECKOUT CON VALIDACIÓN DE LOGIN ===
  const handleCheckout = () => {
    if (!cartData.items.length) {
      alert('Tu carrito está vacío');
      return;
    }

    if (!isAuthenticated) {
      setPendingCheckout(true);
      setShowLogin(true);
      return;
    }

    proceedWithWhatsApp();
  };

  const proceedWithWhatsApp = () => {
    const confirm = window.confirm(
      `¿Enviar pedido por WhatsApp?\nTotal: ${formatPrice(cartData.total)}\nProductos: ${getTotalItems()}`
    );

    if (confirm) {
      whatsappService.sendToWhatsApp(cartData, user);
      onClose();
    }
  };

  // === ESCUCHAR LOGIN EXITOSO ===
  useEffect(() => {
    const handleUserLogin = () => {
      if (pendingCheckout && authService.isAuthenticated()) {
        setShowLogin(false);
        setPendingCheckout(false);
        setTimeout(proceedWithWhatsApp, 300);
      }
    };

    window.addEventListener('userDataChanged', handleUserLogin);
    return () => window.removeEventListener('userDataChanged', handleUserLogin);
  }, [pendingCheckout, cartData, user]);

  // === CIERRE DE MODALES ===
  const handleLoginClose = () => {
    setShowLogin(false);
    setPendingCheckout(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* MODAL PRINCIPAL */}
      <div className="cart-modal-overlay" onClick={onClose}>
        <div className="cart-modal" onClick={e => e.stopPropagation()}>

          {/* HEADER */}
          <div className="cart-modal__header">
            <h2>Mi Carrito ({getTotalItems()})</h2>
            <button className="cart-modal__close" onClick={onClose}>
              <CloseIcon />
            </button>
          </div>

          {/* BODY */}
          <div className="cart-modal__body">
            {cartData.items.length === 0 ? (
              <div className="cart-empty">
                <p>Tu carrito está vacío</p>
                <p className="subtitle">¡Explora nuestros productos importados!</p>
              </div>
            ) : (
              <>
                {/* ITEMS */}
                <div className="cart-items">
                  {cartData.items.map(item => (
                    <div key={item.producto_id} className="cart-item">
                      <img
                        src={item.url_imagen || '/awaiting-image.jpeg'}
                        alt={item.nombre}
                        onError={e => e.target.src = '/awaiting-image.jpeg'}
                      />
                      <div className="cart-item__info">
                        <h4>{item.nombre}</h4>
                        <div className="prices">
                          {item.precio_descuento ? (
                            <>
                              <span className="old">{formatPrice(item.precio)}</span>
                              <span className="current">{formatPrice(item.precio_descuento)}</span>
                            </>
                          ) : (
                            <span className="current">{formatPrice(item.precio)}</span>
                          )}
                        </div>
                        <div className="controls">
                          <button onClick={() => handleQuantityChange(item.producto_id, item.quantity - 1)}>
                            <MinusIcon />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.producto_id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <PlusIcon />
                          </button>
                        </div>
                        {item.quantity >= item.stock && (
                          <p className="stock-warning">Stock máximo</p>
                        )}
                      </div>
                      <div className="actions">
                        <p className="subtotal">{formatPrice(item.subtotalItem)}</p>
                        <button onClick={() => removeFromCart(item.producto_id)}>
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* RESUMEN */}
                <div className="cart-summary">
                  {cartData.descuento > 0 && (
                    <>
                      <div className="row">
                        <span>Subtotal:</span>
                        <span>{formatPrice(cartData.subtotal)}</span>
                      </div>
                      <div className="row discount">
                        <span>Descuento:</span>
                        <span>-{formatPrice(cartData.descuento)}</span>
                      </div>
                      <div className="divider"></div>
                    </>
                  )}
                  <div className="row total">
                    <span>Total:</span>
                    <span>{formatPrice(cartData.total)}</span>
                  </div>
                </div>

                {/* ACCIONES */}
                <div className="cart-actions">
                  <div className="pdf-actions">
                    <button className="btn-outline" onClick={handlePreviewPDF}>
                      <EyeIcon /> Vista
                    </button>
                    <button className="btn-outline" onClick={handleDownloadPDF}>
                      <DownloadIcon /> PDF
                    </button>
                  </div>

                  <button
                    className={`btn-whatsapp ${!isAuthenticated ? 'locked' : ''}`}
                    onClick={handleCheckout}
                  >
                    {isAuthenticated ? (
                      <>
                        <WhatsAppIcon /> Comprar por WhatsApp
                      </>
                    ) : (
                      <>
                        <LockIcon /> Inicia sesión para comprar
                      </>
                    )}
                  </button>

                  <button
                    className="btn-danger-outline"
                    onClick={() => window.confirm('¿Vaciar carrito?') && clearCart()}
                  >
                    <TrashIcon /> Vaciar
                  </button>
                </div>
              </>
            )}
          </div>

          {/* FOOTER */}
          {cartData.items.length > 0 && (
            <div className="cart-footer">
              <p>
                <strong>Nota:</strong>{' '}
                {isAuthenticated
                  ? 'Se abrirá WhatsApp con tu orden lista.'
                  : 'Debes iniciar sesión para continuar con tu pedido.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE LOGIN (solo si se necesita checkout) */}
      {showLogin && (
        <Login
          isModal
          onClose={handleLoginClose}
          onSwitchToRegister={() => {
            setShowLogin(false);
            navigate('/register', {
              state: { returnTo: '/cart', message: 'Regístrate para completar tu compra' }
            });
          }}
        />
      )}
    </>
  );
};

export default CartModal;