import { useCart } from '../contexts/CartContext';

export const useWhatsApp = () => {
const { cart, getTotal } = useCart();

const generateOrderMessage = () => {
    const message = cart.map(item => 
    `• ${item.name} - ${item.quantity} x $${item.price}`
    ).join('%0A');
    
    const total = getTotal();
    
    return `¡Hola! Quiero realizar este pedido:%0A%0A${message}%0A%0ATotal: $${total}%0A%0AMis datos:%0ANombre: [NOMBRE]%0ADirección: [DIRECCIÓN]%0ATeléfono: [TELÉFONO]`;
};

const openWhatsApp = () => {
    const message = generateOrderMessage();
    const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+1234567890';
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
};

return { openWhatsApp };
};

export default useWhatsApp; 