// UBICACIÓN: src/pages/Cart/CartPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CartContent from '../../components/cart/CartContent.jsx';
import './CartPage.css'; // Estilos específicos para la página del carrito

/**
 * 🛒 Componente de la página completa del Carrito (Ruta: /cart)
 * Este componente actúa como un wrapper para mostrar el CartContent 
 * en un diseño de página completa.
 */
const CartPage = () => {
    const navigate = useNavigate();

    // Función de cierre que redirige a la página de productos (Tienda)
    const handleBackToProducts = () => {
        navigate('/products');
    };

    return (
        <div className="cart-page section">
            <div className="container">
                <div className="cart-page__wrapper">
                    {/* 🎯 Reutilizamos el CartContent */}
                    <CartContent 
                        onClose={handleBackToProducts}
                        isPage={true} // Indicamos que debe renderizarse como página
                    />
                </div>
            </div>
        </div>
    );
};

export default CartPage;