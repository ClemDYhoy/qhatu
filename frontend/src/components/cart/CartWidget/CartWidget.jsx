// C:\qhatu\frontend\src\components\cart\CartWidget\CartWidget.jsx
import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../hooks/useCart';
import './CartWidget.css';

// ==================== ICONOS ====================

const CartIcon = ({ className = "" }) => (
  <svg 
    className={className} 
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

// ==================== COMPONENTE ====================

const CartWidget = memo(() => {
  const { getItemCount, getCartTotal, syncStatus, error } = useCart();

  // Memoizar cálculos para evitar re-renders innecesarios
  const itemCount = useMemo(() => getItemCount(), [getItemCount]);
  const total = useMemo(() => getCartTotal(), [getCartTotal]);
  
  const isSyncing = syncStatus === 'syncing';
  const hasError = syncStatus === 'error';

  console.log('🛒 CartWidget render:', {
    itemCount,
    total,
    syncStatus,
    hasError
  });

  return (
    <div className="cart-widget">
      <Link 
        to="/cart" 
        className="cart-widget__link" 
        aria-label={`Carrito de compras: ${itemCount} productos`}
      >
        {/* Icono con badge */}
        <div className="cart-widget__icon-wrapper">
          <CartIcon 
            className={`cart-widget__icon ${isSyncing ? 'cart-widget__icon--syncing' : ''}`} 
          />
          
          {/* Badge con contador */}
          {itemCount > 0 && (
            <span 
              className={`cart-widget__badge ${hasError ? 'cart-widget__badge--error' : ''}`}
              aria-label={`${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}`}
            >
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </div>

        {/* Información del carrito */}
        {itemCount > 0 && (
          <div className="cart-widget__info">
            <span className="cart-widget__count">
              {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
            </span>
            <span className="cart-widget__total">
              S/. {total.toFixed(2)}
            </span>
          </div>
        )}
      </Link>

      {/* Tooltip de error */}
      {error && (
        <div className="cart-widget__error-tooltip" role="alert">
          <span className="cart-widget__error-icon">⚠️</span>
          <span>Error sincronizando carrito</span>
        </div>
      )}
    </div>
  );
});

CartWidget.displayName = 'CartWidget';

export default CartWidget;