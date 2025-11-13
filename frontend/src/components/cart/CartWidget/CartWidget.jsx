// C:\qhatu\frontend\src\components\cart\CartWidget\CartWidget.jsx
import React from 'react';
import { useCart } from '../../../contexts/CartContext';
import './CartWidget.css';

// ====================================
// 🎨 ICONO SVG DEL CARRITO
// ====================================
const CartIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="21" r="1"/>
    <circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

// ====================================
// 🧩 COMPONENTE CART WIDGET
// ====================================
// IMPORTANTE: Este componente solo dispara un evento, NO abre el modal directamente
const CartWidget = () => {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  // Handler que dispara un evento personalizado
  // El Header escuchará este evento y abrirá el modal
  const handleClick = () => {
    // Disparar evento personalizado para que el Header maneje la apertura del modal
    const event = new CustomEvent('openCartModal');
    window.dispatchEvent(event);
  };

  return (
    <button 
      className="cart-widget"
      onClick={handleClick}
      aria-label={`Carrito de compras: ${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`}
      type="button"
    >
      <span className="cart-widget__icon">
        <CartIcon />
      </span>
      
      {totalItems > 0 && (
        <span className="cart-widget__badge" aria-label={`${totalItems} productos`}>
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}

      <span className="cart-widget__pulse" />
    </button>
  );
};

export default CartWidget;