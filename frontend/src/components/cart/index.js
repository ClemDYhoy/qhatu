// C:\qhatu\frontend\src\components\cart\index.js
/**
 * 📦 EXPORTACIONES DE COMPONENTES DEL CARRITO
 * 
 * Este archivo centraliza todos los componentes relacionados con el carrito.
 * 
 * Uso:
 * import { CartWidget, CartModal } from '@/components/cart';
 */

// ============================================
// 🛒 COMPONENTES DEL CARRITO
// ============================================
export { default as CartWidget } from './CartWidget/CartWidget';
export { default as CartModal } from './CartModal/CartModal';

// Exportaciones nombradas para compatibilidad
import CartWidget from './CartWidget/CartWidget';
import CartModal from './CartModal/CartModal';

export { CartWidget, CartModal };