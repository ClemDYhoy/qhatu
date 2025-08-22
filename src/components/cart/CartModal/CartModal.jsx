import React from 'react';
import { useCart } from '../../../contexts/CartContext';
import { useWhatsApp } from '../../../hooks/useWhatsApp';
import Modal from '../../ui/Modal/Modal';
import Button from '../../ui/Button/Button';
import './CartModal.css';

const CartModal = ({ isOpen, onClose }) => {
const { cart, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
const { openWhatsApp } = useWhatsApp();

const handleCheckout = () => {
    openWhatsApp();
    clearCart();
    onClose();
};

if (!isOpen) return null;

return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tu Carrito de Compras">
        <div className="cart-modal">
            {cart.length === 0 ? (
            <p className="cart-empty">Tu carrito está vacío</p>
            ) : (
            <>
                <div className="cart-items">
                {cart.map(item => (
                    <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                        <h4 className="cart-item-name">{item.name}</h4>
                        <p className="cart-item-price">${item.price} x {item.quantity}</p>
                    </div>
                    
                    <div className="cart-item-actions">
                        <div className="quantity-controls">
                        <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="quantity-btn"
                        >
                            -
                        </button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="quantity-btn"
                        >
                            +
                        </button>
                        </div>
                        
                        <button
                        onClick={() => removeFromCart(item.id)}
                        className="remove-btn"
                        >
                        Eliminar
                        </button>
                    </div>
                    </div>
                ))}
                </div>
                
                <div className="cart-total">
                <h3>Total: ${getTotal()}</h3>
                </div>
                
                <div className="cart-actions">
                <Button variant="secondary" onClick={clearCart}>
                    Vaciar Carrito
                </Button>
                <Button variant="primary" onClick={handleCheckout} className="btn-full">
                    Comprar por WhatsApp
                </Button>
                </div>
            </>
            )}
        </div>
    </Modal>
);
};

export default CartModal;