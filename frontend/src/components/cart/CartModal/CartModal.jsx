// UBICACIÓN: src/components/cart/CartModal/CartModal.jsx
import React, { useEffect } from 'react';
// Corregido: Añadimos .jsx para resolver el error de compilación
// Subir 3 niveles para ir de src/components/cart/CartModal/ a src/contexts/
import { useCart } from '../../../contexts/CartContext.jsx';
// Corregido: Añadimos .jsx para resolver el error de compilación
import CartContent from '../CartContent.jsx'; 
// ELIMINADO: Se ha removido el import de './CartModal.css' ya que no se permiten archivos CSS separados.

/**
 * 🛒 Modal del Carrito
 * Este componente es responsable únicamente de la presentación del modal: 
 * el overlay, la lógica de apertura/cierre, y la prevención de scroll del body.
 * El contenido y la lógica de negocio están en CartContent.
 */
const CartModal = ({ isOpen, onClose }) => {
    // Usamos useCart para obtener el estado de loading
    const { loading: cartLoading } = useCart();
    
    // 🖱️ Lógica para cerrar el modal al presionar la tecla ESC
    useEffect(() => {
        const handleEsc = (e) => {
            // Cierra si es 'Escape' y no hay operaciones de carrito en curso
            if (e.key === 'Escape' && !cartLoading) onClose();
        };
        
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            // Previene el scroll del body al abrir el modal
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            window.removeEventListener('keydown', handleEsc);
            // Restablece el scroll del body al cerrar el modal
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose, cartLoading]);

    if (!isOpen) return null; // No renderizar si no está abierto

    return (
        <>
            {/* Overlay: Fondo oscuro que ocupa toda la pantalla y cierra al hacer clic (Reemplaza cart-modal-overlay) */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
                onClick={() => onClose()}
                aria-hidden="true"
            />

            {/* Modal Container: Se desliza desde la derecha (Reemplaza cart-modal-container) */}
            <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-50 transition-transform duration-300 transform translate-x-0 overflow-y-auto">
                <CartContent 
                    onClose={onClose} 
                    isPage={false} // Se usa como modal
                />
            </div>
            
            {/* Estilos inline para asegurar la animación de deslizamiento */}
            <style jsx="true">{`
                .fixed.top-0.right-0.h-full.max-w-sm {
                    /* Asegurar que el modal se deslice correctamente desde la derecha */
                    transition: transform 0.3s ease-out;
                    transform: translateX(0);
                }
            `}</style>
        </>
    );
};

export default CartModal;