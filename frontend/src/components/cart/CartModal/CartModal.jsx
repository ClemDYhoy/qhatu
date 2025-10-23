import React, { useMemo } from 'react';
import { useCart } from '../../../contexts/CartContext';
import './CartModal.css';

const CartModal = ({ isOpen, onClose }) => {
  const {
    cart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    updateQuantity,
    getCartTotal,
    clearCart,
    isEmpty
  } = useCart();

  const total = useMemo(() => getCartTotal(), [cart, getCartTotal]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  };

  const handleCheckout = () => {
    if (isEmpty()) return;

    const message = cart.map(item => {
      const price = item.precio_descuento || item.precio;
      return `• ${item.nombre} x${item.quantity} - ${formatPrice(price * item.quantity)}`;
    }).join('\n');

    const whatsappMessage = encodeURIComponent(
      `¡Hola! Quiero realizar el siguiente pedido:\n\n${message}\n\nTotal: ${formatPrice(total)}`
    );

    window.open(`https://wa.me/51123456789?text=${whatsappMessage}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-modal-header">
          <h2>Carrito de Compras</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="cart-modal-body">
          {isEmpty() ? (
            <div className="cart-empty">
              <p>Tu carrito está vacío</p>
              <button onClick={onClose}>Ir a comprar</button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => {
                  const price = item.precio_descuento || item.precio;
                  const subtotal = price * item.quantity;

                  return (
                    <div key={item.producto_id} className="cart-item">
                      <img
                        src={item.url_imagen || '/placeholder.png'}
                        alt={item.nombre}
                        onError={(e) => e.target.src = '/placeholder.png'}
                      />
                      
                      <div className="cart-item-info">
                        <h4>{item.nombre}</h4>
                        {item.categoria && (
                          <span className="item-category">{item.categoria.nombre}</span>
                        )}
                        <div className="item-price">
                          {item.precio_descuento ? (
                            <>
                              <span className="price-original">{formatPrice(item.precio)}</span>
                              <span className="price-discount">{formatPrice(item.precio_descuento)}</span>
                            </>
                          ) : (
                            <span>{formatPrice(item.precio)}</span>
                          )}
                        </div>
                      </div>

                      <div className="cart-item-actions">
                        <div className="quantity-controls">
                          <button
                            onClick={() => decrementQuantity(item.producto_id)}
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (value > 0) updateQuantity(item.producto_id, value);
                            }}
                            min="1"
                            max={item.stock}
                          />
                          <button
                            onClick={() => incrementQuantity(item.producto_id)}
                            disabled={item.quantity >= item.stock}
                          >
                            +
                          </button>
                        </div>

                        <div className="item-subtotal">
                          {formatPrice(subtotal)}
                        </div>

                        <button
                          className="remove-btn"
                          onClick={() => removeFromCart(item.producto_id)}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="cart-actions">
                <button className="clear-cart-btn" onClick={clearCart}>
                  Vaciar carrito
                </button>
              </div>
            </>
          )}
        </div>

        {!isEmpty() && (
          <div className="cart-modal-footer">
            <div className="cart-total">
              <span>Total:</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              💬 Enviar pedido por WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;