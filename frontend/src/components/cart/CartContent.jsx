// C:\qhatu\frontend\src\components\cart\CartContent.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useWhatsApp } from '../../hooks/useWhatsApp.js';
import './CartContent.css';

const CartContent = ({ onClose, isPage = false }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const { 
        cart, 
        loading: cartLoading, 
        updateQuantity, 
        removeItem,
        clearCart,
    } = useCart();

    const { 
        comprarPorWhatsApp, 
        loading: whatsappLoading, 
        error: whatsappError 
    } = useWhatsApp();

    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const { isEmpty, total, itemCount } = useMemo(() => {
        const items = cart?.items || [];
        const empty = items.length === 0;
        const total = parseFloat(cart?.total) || 0;
        const count = items.reduce((sum, item) => sum + (item.cantidad || 0), 0);
        
        return { isEmpty: empty, total, itemCount: count };
    }, [cart]);

    const handleComprarWhatsApp = async () => {
        console.log('🛒 Iniciando compra por WhatsApp...');
        
        // Validaciones previas
        if (!user) {
            alert('Debes iniciar sesión para realizar una compra');
            navigate('/login');
            return;
        }

        if (isEmpty) {
            alert('Tu carrito está vacío');
            return;
        }

        const confirmPurchase = window.confirm(
            `¿Confirmar la compra de ${itemCount} producto(s) por un total de S/.${total.toFixed(2)}?\n\n` +
            `Se abrirá WhatsApp para completar tu pedido.`
        );
        
        if (!confirmPurchase) return;

        try {
            console.log('📱 Llamando a comprarPorWhatsApp...');
            const result = await comprarPorWhatsApp();

            console.log('📦 Resultado de compra:', result);

            if (result.success && result.data) {
                const { numero_venta, whatsapp_url } = result.data;
                
                console.log(`✅ Pedido creado: ${numero_venta}`);
                
                // Mostrar mensaje de éxito
                setSuccessMessage(`¡Pedido ${numero_venta} creado! Se abrirá WhatsApp...`);
                setShowSuccess(true);
                
                // Limpiar carrito
                await clearCart();
                
                // ⚡ WhatsApp ya se abrió automáticamente en useWhatsApp
                // Solo informamos al usuario
                
                // Redirigir después de 3 segundos
                setTimeout(() => {
                    setShowSuccess(false);
                    if (isPage) {
                        navigate('/'); 
                    } else {
                        onClose(); 
                    }
                }, 3000);
            } else {
                throw new Error(result.message || 'Error al crear el pedido');
            }
        } catch (error) {
            console.error('❌ Error en compra:', error);
            
            let mensajeError = 'Error al procesar el pedido. Por favor intenta nuevamente.';
            
            // Mensajes específicos según el error
            if (error.message.includes('carrito vacío')) {
                mensajeError = 'Tu carrito está vacío. Agrega productos para continuar.';
            } else if (error.message.includes('stock')) {
                mensajeError = 'Algunos productos no tienen stock suficiente.';
            } else if (error.message.includes('sesión')) {
                mensajeError = 'Tu sesión expiró. Por favor inicia sesión nuevamente.';
                setTimeout(() => navigate('/login'), 2000);
            }
            
            alert(mensajeError);
        }
    };

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) {
            handleRemoveItem(itemId);
            return;
        }
        await updateQuantity(itemId, newQuantity);
    };

    // Continuación de CartContent.jsx

    const handleRemoveItem = async (itemId) => {
        if (window.confirm('¿Eliminar este producto del carrito?')) {
            await removeItem(itemId);
        }
    };

    return (
        <div className={`cart-content ${isPage ? 'cart-content--page' : 'cart-content--modal'}`}>
            {/* Header */}
            <div className="cart-content__header">
                <div className="cart-content__title-wrapper">
                    <h2 className="cart-content__title">
                        <svg className="cart-content__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1"/>
                            <circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                        {isPage ? 'Tu Carrito de Compras' : 'Tu Carrito'}
                    </h2>
                    <span className="cart-content__item-count">{itemCount} productos</span>
                </div>
                
                {!isPage && (
                    <button 
                        className="cart-content__close-btn"
                        onClick={onClose}
                        disabled={whatsappLoading}
                        aria-label="Cerrar carrito"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                )}
            </div>

            {/* Body */}
            <div className="cart-content__body">
                {cartLoading && (
                    <div className="cart-content__loading">
                        <div className="cart-content__spinner"></div>
                        <p className="cart-content__loading-text">Cargando carrito...</p>
                    </div>
                )}
                
                {!cartLoading && isEmpty && (
                    <div className="cart-content__empty">
                        <svg className="cart-content__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1"/>
                            <circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                        <h3 className="cart-content__empty-title">Tu carrito está vacío</h3>
                        <p className="cart-content__empty-text">Agrega productos para continuar</p>
                        <button 
                            className="cart-content__empty-btn"
                            onClick={() => {
                                if (onClose) onClose();
                                navigate('/products');
                            }}
                        >
                            Ver Productos
                        </button>
                    </div>
                )}

                {!cartLoading && !isEmpty && (
                    <>
                        {/* Lista de items */}
                        <div className="cart-content__items">
                            {cart.items.map((item) => (
                                <div key={item.item_id} className="cart-item">
                                    <div className="cart-item__image">
                                        <img 
                                            src={item.producto?.url_imagen || '/awaiting-image.jpeg'} 
                                            alt={item.producto?.nombre}
                                            onError={(e) => { e.target.src = '/awaiting-image.jpeg'; }}
                                        />
                                    </div>

                                    <div className="cart-item__info">
                                        <h4 className="cart-item__name">{item.producto?.nombre}</h4>
                                        
                                        <div className="cart-item__price">
                                            {item.precio_descuento ? (
                                                <>
                                                    <span className="cart-item__price-current">
                                                        S/.{parseFloat(item.precio_descuento).toFixed(2)}
                                                    </span>
                                                    <span className="cart-item__price-old">
                                                        S/.{parseFloat(item.precio_unitario).toFixed(2)}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="cart-item__price-current">
                                                    S/.{parseFloat(item.precio_unitario).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="cart-item__quantity">
                                        <button
                                            className="cart-item__qty-btn cart-item__qty-btn--minus"
                                            onClick={() => handleUpdateQuantity(item.item_id, item.cantidad - 1)}
                                            disabled={item.cantidad <= 1 || whatsappLoading}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="5" y1="12" x2="19" y2="12"/>
                                            </svg>
                                        </button>
                                        
                                        <span className="cart-item__qty-value">
                                            {item.cantidad}
                                        </span>
                                        
                                        <button
                                            className="cart-item__qty-btn cart-item__qty-btn--plus"
                                            onClick={() => handleUpdateQuantity(item.item_id, item.cantidad + 1)}
                                            disabled={whatsappLoading}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="12" y1="5" x2="12" y2="19"/>
                                                <line x1="5" y1="12" x2="19" y2="12"/>
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="cart-item__subtotal">
                                        S/.{parseFloat(item.subtotal).toFixed(2)}
                                    </div>

                                    <button
                                        className="cart-item__remove"
                                        onClick={() => handleRemoveItem(item.item_id)}
                                        disabled={whatsappLoading}
                                        aria-label="Eliminar producto"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6"/>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                            <line x1="10" y1="11" x2="10" y2="17"/>
                                            <line x1="14" y1="11" x2="14" y2="17"/>
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {whatsappError && (
                            <div className="cart-content__alert cart-content__alert--error">
                                <svg className="cart-content__alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="8" x2="12" y2="12"/>
                                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                <div className="cart-content__alert-content">
                                    <p className="cart-content__alert-title">Error de pedido</p>
                                    <p className="cart-content__alert-text">{whatsappError}</p>
                                </div>
                            </div>
                        )}

                        {showSuccess && (
                            <div className="cart-content__alert cart-content__alert--success">
                                <svg className="cart-content__alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                                <div className="cart-content__alert-content">
                                    <p className="cart-content__alert-title">¡Éxito!</p>
                                    <p className="cart-content__alert-text">{successMessage}</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer */}
            {!isEmpty && !cartLoading && (
                <div className="cart-content__footer">
                    <div className="cart-content__totals">
                        <div className="cart-content__total-row">
                            <span className="cart-content__total-label">Subtotal:</span>
                            <span className="cart-content__total-value">S/.{parseFloat(cart.subtotal || 0).toFixed(2)}</span>
                        </div>
                        
                        {cart.descuento_total > 0 && (
                            <div className="cart-content__total-row cart-content__total-row--discount">
                                <span className="cart-content__total-label">Descuento:</span>
                                <span className="cart-content__total-value">-S/.{parseFloat(cart.descuento_total).toFixed(2)}</span>
                            </div>
                        )}
                        
                        <div className="cart-content__total-row cart-content__total-row--final">
                            <span className="cart-content__total-label">Total a Pagar:</span>
                            <span className="cart-content__total-value">S/.{parseFloat(total).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="cart-content__actions">
                        <button
                            className="cart-content__btn cart-content__btn--primary"
                            onClick={handleComprarWhatsApp}
                            disabled={whatsappLoading || showSuccess}
                        >
                            {whatsappLoading ? (
                                <>
                                    <div className="cart-content__btn-spinner"></div>
                                    <span>Procesando...</span>
                                </>
                            ) : showSuccess ? (
                                <>
                                    <svg className="cart-content__btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                        <polyline points="22 4 12 14.01 9 11.01"/>
                                    </svg>
                                    <span>¡Pedido Creado!</span>
                                </>
                            ) : (
                                <>
                                    <svg className="cart-content__btn-icon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                    <span>Comprar por WhatsApp</span>
                                </>
                            )}
                        </button>
                        
                        <button
                            className="cart-content__btn cart-content__btn--secondary"
                            onClick={() => {
                                if (onClose) onClose();
                                if (isPage) navigate('/products');
                            }}
                            disabled={whatsappLoading}
                        >
                            {isPage ? 'Seguir Comprando' : 'Cerrar'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartContent;