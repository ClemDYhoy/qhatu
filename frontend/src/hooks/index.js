// C:\qhatu\frontend\src\hooks\index.js
/**
 * 📦 EXPORTACIONES DE HOOKS PERSONALIZADOS
 * 
 * Este archivo centraliza todos los hooks personalizados de la aplicación.
 * Permite importaciones limpias desde un solo punto:
 * 
 * Uso:
 * import { useAuth, useCart } from '@/hooks';
 * 
 * NO CONFUNDIR CON:
 * - Componentes (están en src/components/)
 * - Servicios (están en src/services/)
 */

// ============================================
// 🔐 HOOKS DE AUTENTICACIÓN
// ============================================
export { default as useAuth } from './useAuth';
export { default as useAdminAuth } from './useAdminAuth';
export { default as useWhatsApp } from './useWhatsApp';

// ============================================
// 🛒 HOOKS DE COMERCIO
// ============================================
export { default as useCart } from './useCart';
export { default as useProducts } from './useProducts';
export { default as useWhatsApp } from './useWhatsApp';

// ============================================
// 🔌 HOOKS DE COMUNICACIÓN EN TIEMPO REAL
// ============================================
export { default as useSocket } from './useSocket';

// ============================================
// 📤 EXPORTACIONES NOMBRADAS (Named Exports)
// Para compatibilidad con destructuring:
// import { useAuth, useCart } from '@/hooks';
// ============================================
export { useAuth } from './useAuth';
export { useCart } from './useCart';
export { useSocket } from './useSocket';
export { useAdminAuth } from './useAdminAuth';
export { useProducts } from './useProducts';

/**
 * 📝 NOTA IMPORTANTE:
 * 
 * Si algún hook no tiene "export default", solo usa la exportación nombrada.
 * Por ejemplo:
 * 
 * ❌ INCORRECTO (si useAuth.js no tiene export default):
 * export { default as useAuth } from './useAuth';
 * 
 * ✅ CORRECTO:
 * export { useAuth } from './useAuth';
 * 
 * Este archivo soporta AMBAS formas de importación:
 * 
 * 1. Import por defecto:
 *    import useAuth from '@/hooks/useAuth';
 * 
 * 2. Import destructurado:
 *    import { useAuth, useCart } from '@/hooks';
 */