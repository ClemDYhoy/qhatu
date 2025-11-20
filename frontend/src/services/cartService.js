// C:\qhatu\frontend\src\services\cartService.js
import api from './api';

// ==================== CONSTANTES ====================
const CART_STORAGE_KEY = 'qhatu_cart_backup';
const CART_METADATA_KEY = 'qhatu_cart_metadata';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

// ==================== UTILIDADES ====================

/**
 * Parse JSON de forma segura
 */
const safeJSONParse = (value, fallback = null) => {
  try {
    if (!value) return fallback;
    const parsed = JSON.parse(value);
    return parsed;
  } catch (error) {
    console.warn('⚠️ Error parseando JSON:', error);
    return fallback;
  }
};

/**
 * Stringify JSON de forma segura
 */
const safeJSONStringify = (value) => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error('❌ Error stringificando JSON:', error);
    return null;
  }
};

/**
 * Delay para reintentos
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Validar estructura del carrito
 */
const isValidCartData = (data) => {
  if (!data || typeof data !== 'object') return false;
  
  // Validar estructura básica del carrito del servidor
  if ('items' in data && Array.isArray(data.items)) {
    return true;
  }
  
  // Validar estructura de array simple (backup local)
  if (Array.isArray(data)) {
    return true;
  }
  
  return false;
};

/**
 * Normalizar datos del carrito a formato consistente
 */
const normalizeCartData = (data) => {
  // Si ya tiene el formato del servidor, retornar tal cual
  if (data && typeof data === 'object' && 'items' in data) {
    return {
      items: data.items || [],
      total: parseFloat(data.total) || 0,
      subtotal: parseFloat(data.subtotal) || 0,
      descuento_total: parseFloat(data.descuento_total) || 0,
      carrito_id: data.carrito_id || null
    };
  }
  
  // Si es un array (formato local antiguo), convertir
  if (Array.isArray(data)) {
    return {
      items: data.map(item => ({
        ...item,
        item_id: item.item_id || item.id || `temp_${Date.now()}_${Math.random()}`,
        cantidad: item.cantidad || item.quantity || 1,
        producto_id: item.producto_id || item.id,
      })),
      total: data.reduce((sum, item) => {
        const price = parseFloat(item.precio_descuento || item.precio || 0);
        const qty = item.cantidad || item.quantity || 1;
        return sum + (price * qty);
      }, 0),
      subtotal: data.reduce((sum, item) => {
        const price = parseFloat(item.precio || 0);
        const qty = item.cantidad || item.quantity || 1;
        return sum + (price * qty);
      }, 0),
      descuento_total: 0,
      carrito_id: null
    };
  }
  
  // Formato vacío por defecto
  return {
    items: [],
    total: 0,
    subtotal: 0,
    descuento_total: 0,
    carrito_id: null
  };
};

// ==================== ALMACENAMIENTO LOCAL ====================

/**
 * Guardar backup local del carrito
 */
export const saveLocalBackup = (cartData) => {
  try {
    if (!isValidCartData(cartData)) {
      console.warn('⚠️ Datos de carrito inválidos, no se guardará backup');
      return false;
    }
    
    const normalizedData = normalizeCartData(cartData);
    const stringified = safeJSONStringify(normalizedData);
    
    if (!stringified) return false;
    
    localStorage.setItem(CART_STORAGE_KEY, stringified);
    
    // Guardar metadata
    const metadata = {
      lastUpdated: Date.now(),
      itemCount: normalizedData.items?.length || 0,
      total: normalizedData.total || 0
    };
    localStorage.setItem(CART_METADATA_KEY, safeJSONStringify(metadata));
    
    return true;
  } catch (error) {
    console.error('❌ Error guardando backup local:', error);
    return false;
  }
};

/**
 * Obtener backup local del carrito
 */
export const getLocalBackup = () => {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    if (!data) return null;
    
    const parsed = safeJSONParse(data);
    
    if (!isValidCartData(parsed)) {
      console.warn('⚠️ Backup local inválido, limpiando...');
      clearLocalBackup();
      return null;
    }
    
    return normalizeCartData(parsed);
  } catch (error) {
    console.error('❌ Error obteniendo backup local:', error);
    return null;
  }
};

/**
 * Limpiar backup local
 */
export const clearLocalBackup = () => {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(CART_METADATA_KEY);
    return true;
  } catch (error) {
    console.error('❌ Error limpiando backup local:', error);
    return false;
  }
};

/**
 * Obtener metadata del backup
 */
export const getBackupMetadata = () => {
  try {
    const metadata = localStorage.getItem(CART_METADATA_KEY);
    return safeJSONParse(metadata, { lastUpdated: 0, itemCount: 0, total: 0 });
  } catch {
    return { lastUpdated: 0, itemCount: 0, total: 0 };
  }
};

// ==================== API CON RETRY ====================

/**
 * Ejecutar request con reintentos automáticos
 */
const executeWithRetry = async (requestFn, attempts = MAX_RETRY_ATTEMPTS) => {
  let lastError = null;
  
  for (let i = 0; i < attempts; i++) {
    try {
      const result = await requestFn();
      return result;
    } catch (error) {
      lastError = error;
      
      // No reintentar en errores 4xx (errores del cliente)
      const status = error.response?.status;
      if (status && status >= 400 && status < 500) {
        throw error;
      }
      
      // Si no es el último intento, esperar antes de reintentar
      if (i < attempts - 1) {
        const delayTime = RETRY_DELAY_MS * (i + 1); // Backoff exponencial
        console.log(`⏳ Reintentando en ${delayTime}ms... (${i + 1}/${attempts})`);
        await delay(delayTime);
      }
    }
  }
  
  throw lastError;
};

// ==================== API DEL CARRITO ====================

/**
 * 🛒 Obtener carrito actual del usuario
 * 🔥 FIX: Ruta corregida a /api/cart
 */
export const obtenerCarrito = async (useBackupOnError = true) => {
  try {
    console.log('🛒 Obteniendo carrito del servidor...');
    
    const response = await executeWithRetry(async () => {
      return await api.get('/cart'); // ✅ RUTA CORREGIDA
    });
    
    console.log('📦 Respuesta del servidor:', response.data);
    
    // 🔥 FIX: El backend responde con { success, carrito }
    const cartData = response.data.carrito || response.data;
    const normalizedData = normalizeCartData(cartData);
    
    // Guardar backup exitoso
    saveLocalBackup(normalizedData);
    
    return {
      success: true,
      data: normalizedData,
      source: 'server'
    };
  } catch (error) {
    console.error('❌ Error obteniendo carrito del servidor:', error);
    
    // Intentar usar backup local
    if (useBackupOnError) {
      const backup = getLocalBackup();
      if (backup) {
        console.log('📦 Usando backup local del carrito');
        return {
          success: true,
          data: backup,
          source: 'local_backup',
          warning: 'Usando datos locales, sincronización pendiente'
        };
      }
    }
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error al obtener carrito',
      error: error.message,
      data: normalizeCartData(null) // Retornar carrito vacío
    };
  }
};

/**
 * ➕ Agregar producto al carrito
 * 🔥 FIX: Ruta corregida a /api/cart/items
 */
export const agregarAlCarrito = async (productoId, cantidad = 1) => {
  if (!productoId) {
    return {
      success: false,
      message: 'ID de producto inválido'
    };
  }
  
  if (cantidad < 1 || cantidad > 99) {
    return {
      success: false,
      message: 'Cantidad debe estar entre 1 y 99'
    };
  }
  
  try {
    console.log('➕ Agregando al carrito:', { productoId, cantidad });
    
    const response = await executeWithRetry(async () => {
      return await api.post('/cart/items', { // ✅ RUTA CORREGIDA
        producto_id: productoId,
        cantidad
      });
    });
    
    console.log('✅ Producto agregado:', response.data);
    
    // 🔥 FIX: El backend responde con { success, carrito }
    const cartData = response.data.carrito || response.data;
    const normalizedData = normalizeCartData(cartData);
    saveLocalBackup(normalizedData);
    
    return {
      success: true,
      data: normalizedData,
      message: 'Producto agregado al carrito'
    };
  } catch (error) {
    console.error('❌ Error agregando al carrito:', error);
    
    // Si hay error de stock, mostrar mensaje específico
    const message = error.response?.data?.message;
    if (message && message.includes('stock')) {
      return {
        success: false,
        message: message,
        code: 'INSUFFICIENT_STOCK'
      };
    }
    
    return {
      success: false,
      message: message || 'Error al agregar producto',
      error: error.message
    };
  }
};

/**
 * 🔄 Actualizar cantidad de un item
 * 🔥 FIX: Ruta corregida a /api/cart/items/:id
 */
export const actualizarCantidad = async (itemId, cantidad) => {
  if (!itemId) {
    return {
      success: false,
      message: 'ID de item inválido'
    };
  }
  
  if (cantidad < 0 || cantidad > 99) {
    return {
      success: false,
      message: 'Cantidad debe estar entre 0 y 99'
    };
  }
  
  try {
    console.log('🔄 Actualizando cantidad:', { itemId, cantidad });
    
    const response = await executeWithRetry(async () => {
      return await api.put(`/cart/items/${itemId}`, { // ✅ RUTA CORREGIDA
        cantidad
      });
    });
    
    console.log('✅ Cantidad actualizada:', response.data);
    
    // 🔥 FIX: El backend responde con { success, carrito }
    const cartData = response.data.carrito || response.data;
    const normalizedData = normalizeCartData(cartData);
    saveLocalBackup(normalizedData);
    
    return {
      success: true,
      data: normalizedData,
      message: cantidad === 0 ? 'Item eliminado' : 'Cantidad actualizada'
    };
  } catch (error) {
    console.error('❌ Error actualizando cantidad:', error);
    
    const message = error.response?.data?.message;
    return {
      success: false,
      message: message || 'Error al actualizar cantidad',
      error: error.message
    };
  }
};

/**
 * 🗑️ Eliminar item del carrito
 * 🔥 FIX: Ruta corregida a /api/cart/items/:id
 */
export const eliminarDelCarrito = async (itemId) => {
  if (!itemId) {
    return {
      success: false,
      message: 'ID de item inválido'
    };
  }
  
  try {
    console.log('🗑️ Eliminando item:', itemId);
    
    const response = await executeWithRetry(async () => {
      return await api.delete(`/cart/items/${itemId}`); // ✅ RUTA CORREGIDA
    });
    
    console.log('✅ Item eliminado:', response.data);
    
    // 🔥 FIX: El backend responde con { success, carrito }
    const cartData = response.data.carrito || response.data;
    const normalizedData = normalizeCartData(cartData);
    saveLocalBackup(normalizedData);
    
    return {
      success: true,
      data: normalizedData,
      message: 'Producto eliminado del carrito'
    };
  } catch (error) {
    console.error('❌ Error eliminando item:', error);
    
    const message = error.response?.data?.message;
    return {
      success: false,
      message: message || 'Error al eliminar producto',
      error: error.message
    };
  }
};

/**
 * 🧹 Limpiar carrito completo
 * 🔥 FIX: Ruta corregida a /api/cart
 */
export const limpiarCarrito = async () => {
  try {
    console.log('🧹 Limpiando carrito...');
    
    const response = await executeWithRetry(async () => {
      return await api.delete('/cart'); // ✅ RUTA CORREGIDA
    });
    
    console.log('✅ Carrito limpiado:', response.data);
    
    const emptyCart = normalizeCartData(null);
    clearLocalBackup();
    
    return {
      success: true,
      data: emptyCart,
      message: 'Carrito limpiado correctamente'
    };
  } catch (error) {
    console.error('❌ Error limpiando carrito:', error);
    
    const message = error.response?.data?.message;
    return {
      success: false,
      message: message || 'Error al limpiar carrito',
      error: error.message
    };
  }
};

/**
 * 🔄 Sincronizar carrito local con servidor
 */
export const sincronizarCarrito = async () => {
  try {
    console.log('🔄 Sincronizando carrito con servidor...');
    
    const result = await obtenerCarrito(false);
    
    if (result.success) {
      console.log('✅ Carrito sincronizado correctamente');
      return result;
    }
    
    throw new Error(result.message || 'Error en sincronización');
  } catch (error) {
    console.error('❌ Error sincronizando carrito:', error);
    return {
      success: false,
      message: 'Error al sincronizar carrito',
      error: error.message
    };
  }
};

/**
 * 📊 Obtener estadísticas del carrito
 */
export const obtenerEstadisticas = () => {
  const backup = getLocalBackup();
  const metadata = getBackupMetadata();
  
  return {
    hasLocalData: backup !== null,
    itemCount: metadata.itemCount,
    total: metadata.total,
    lastUpdated: metadata.lastUpdated,
    lastUpdatedFormatted: metadata.lastUpdated 
      ? new Date(metadata.lastUpdated).toLocaleString('es-PE')
      : 'Nunca'
  };
};

/**
 * 🩺 Verificar salud del carrito
 */
export const verificarSaludCarrito = async () => {
  try {
    const serverData = await obtenerCarrito(false);
    const localData = getLocalBackup();
    const metadata = getBackupMetadata();
    
    return {
      server: {
        available: serverData.success,
        itemCount: serverData.data?.items?.length || 0,
        total: serverData.data?.total || 0
      },
      local: {
        hasBackup: localData !== null,
        itemCount: metadata.itemCount,
        total: metadata.total,
        lastUpdated: metadata.lastUpdatedFormatted
      },
      synchronized: serverData.success && (
        serverData.data?.items?.length === metadata.itemCount
      )
    };
  } catch (error) {
    return {
      server: { available: false, error: error.message },
      local: { hasBackup: false },
      synchronized: false
    };
  }
};

// ==================== LEGACY SUPPORT ====================

/**
 * Soporte para código legacy (si existe)
 */
export const cartService = {
  get: getLocalBackup,
  save: saveLocalBackup,
  clear: clearLocalBackup,
  
  // Métodos adicionales
  getMetadata: getBackupMetadata,
  isValid: isValidCartData,
  normalize: normalizeCartData
};

// ==================== EXPORTS ====================

export default {
  // API Principal
  obtenerCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  eliminarDelCarrito,
  limpiarCarrito,
  sincronizarCarrito,
  
  // Almacenamiento Local
  saveLocalBackup,
  getLocalBackup,
  clearLocalBackup,
  getBackupMetadata,
  
  // Utilidades
  obtenerEstadisticas,
  verificarSaludCarrito,
  normalizeCartData,
  isValidCartData,
  
  // Legacy
  cartService
};