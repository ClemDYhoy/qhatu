import React, { useState } from 'react';
import { useCart } from '../../../contexts/CartContext';
import CartModal from '../CartModal/CartModal';
import './CartWidget.css';

const CartWidget = () => {
const [isModalOpen, setIsModalOpen] = useState(false);
const { getTotalItems } = useCart();

const totalItems = getTotalItems();

return (
    <>
    <button 
        className="cart-widget"
        onClick={() => setIsModalOpen(true)}
    >
        <span className="cart-icon">🛒</span>
        {totalItems > 0 && (
        <span className="cart-badge">{totalItems}</span>
        )}
    </button>
    
    <CartModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
    />
    </>
);
};

export default CartWidget;