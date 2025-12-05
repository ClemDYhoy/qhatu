// frontend/src/services/index.js

// Core / API base
export { default as api } from './api';

// Servicios principales de la app
export { default as authService } from './authService';
export { default as cartService } from './cartService';
export * as productService from './productService';
export { default as ventasService } from './ventasService';
export { default as mlService } from './mlService';
export { default as whatsappService } from './whatsappService';
export { default as analyticsService } from './analyticsService';

// ✅ AGREGAR ESTAS LÍNEAS para exportar las funciones individuales
export { confirmarVenta, obtenerDetalleVenta } from './ventasService';