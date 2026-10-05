// UBICACIÓN: src/components/cart/CartModal/CartModal.jsx
import React, { useEffect } from 'react';
import { useCart } from '../../../contexts/CartContext.jsx';
import CartContent from '../CartContent.jsx';
import './CartModal.css';

/**
 * 🛒 Modal del Carrito (panel lateral / drawer)
 * Solo maneja el overlay, la apertura/cierre y el bloqueo de scroll del body.
 * El contenido y la lógica de negocio viven en CartContent.
 */
const CartModal = ({ isOpen, onClose }) => {
  const { loading: cartLoading } = useCart();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !cartLoading) onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, cartLoading]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="qm-cart-overlay"
        onClick={() => { if (!cartLoading) onClose(); }}
        aria-hidden="true"
      />

      <aside
        className="qm-cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        <CartContent onClose={onClose} isPage={false} />
      </aside>
    </>
  );
};

export default CartModal;
