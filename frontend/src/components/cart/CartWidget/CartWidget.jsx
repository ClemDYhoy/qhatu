// C:\qhatu\frontend\src\components\cart\CartWidget\CartWidget.jsx
import React, { memo, useMemo, useState, useEffect, useRef } from 'react';
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

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

// ==================== COMPONENTE ====================

const CartWidget = memo(({ onClick }) => {
  const { getItemCount, getCartTotal, syncStatus, error } = useCart();

  const itemCount = useMemo(() => getItemCount(), [getItemCount]);
  const total = useMemo(() => getCartTotal(), [getCartTotal]);

  const isSyncing = syncStatus === 'syncing';
  const hasError = syncStatus === 'error';

  // Animación de "pop" cuando el contador aumenta (se agregó un producto)
  const [bump, setBump] = useState(false);
  const prevCount = useRef(itemCount);

  useEffect(() => {
    if (itemCount > prevCount.current) {
      setBump(true);
      const timer = setTimeout(() => setBump(false), 700);
      prevCount.current = itemCount;
      return () => clearTimeout(timer);
    }
    prevCount.current = itemCount;
    return undefined;
  }, [itemCount]);

  const inner = (
    <>
      <div className="cart-widget__icon-wrapper">
        <CartIcon
          className={`cart-widget__icon ${isSyncing ? 'cart-widget__icon--syncing' : ''}`}
        />

        {itemCount > 0 && (
          <span
            className={`cart-widget__badge ${hasError ? 'cart-widget__badge--error' : ''} ${bump ? 'cart-widget__badge--bump' : ''}`}
            aria-label={`${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}`}
          >
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </div>

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
    </>
  );

  const label = `Carrito de compras: ${itemCount} productos`;

  return (
    <div className={`cart-widget ${bump ? 'cart-widget--bump' : ''}`}>
      {onClick ? (
        <button
          type="button"
          className="cart-widget__link"
          onClick={onClick}
          aria-label={label}
        >
          {inner}
        </button>
      ) : (
        <Link to="/cart" className="cart-widget__link" aria-label={label}>
          {inner}
        </Link>
      )}

      {error && (
        <div className="cart-widget__error-tooltip" role="alert">
          <span className="cart-widget__error-icon"><AlertIcon /></span>
          <span>Error sincronizando carrito</span>
        </div>
      )}
    </div>
  );
});

CartWidget.displayName = 'CartWidget';

export default CartWidget;
