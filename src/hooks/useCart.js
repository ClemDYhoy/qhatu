import { useCart } from '../contexts/CartContext';

export const useCartActions = () => {
const cart = useCart();
return cart;
};

export default useCartActions;