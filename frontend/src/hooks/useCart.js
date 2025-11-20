// C:\qhatu\frontend\src\hooks\useCart.js
import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';

/**
 * 🛒 Hook para acceder al contexto del carrito
 * ✅ CORREGIDO: Ahora retorna correctamente todas las funciones del contexto
 * 
 * @returns {Object} Funciones y estado del carrito
 * @throws {Error} Si se usa fuera del CartProvider
 * 
 * @example
 * const { cart, addToCart, updateQuantity, getItemCount } = useCart();
 * 
 * // ✅ Agregar producto
 * await addToCart(productoId, cantidad);
 * 
 * // ✅ Obtener total de items
 * const totalItems = getItemCount();
 * 
 * // ✅ Verificar si un producto está en el carrito
 * const inCart = isInCart(productoId);
 */
export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  
  // ✅ Log para debugging en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 useCart hook:', {
      hasContext: !!context,
      hasAddToCart: typeof context.addToCart === 'function',
      hasGetItemCount: typeof context.getItemCount === 'function',
      cartItems: context.cart?.items?.length || 0
    });
  }
  
  // ✅ Retornar el contexto completo (incluye todas las funciones y estado)
  return context;
};

// También exportar como default para compatibilidad
export default useCart;