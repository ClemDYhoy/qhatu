// C:\qhatu\frontend\src\contexts\CartContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useApp } from './AppContext';
import { 
  obtenerCarrito, 
  agregarAlCarrito, 
  actualizarCantidad, 
  eliminarDelCarrito,
  limpiarCarrito 
} from '../services/cartService';

// ==================== CONSTANTES ====================
const CART_STORAGE_KEY = 'qhatu_cart_backup';
const MAX_QUANTITY = 99;
const SYNC_DEBOUNCE_MS = 500;

// ==================== UTILIDADES ====================
const safeJSONParse = (value, fallback = null) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const safeJSONStringify = (value) => {
  try {
    return JSON.stringify(value);
  } catch {
    return '{}';
  }
};

// ==================== CONTEXT ====================
export const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

// ==================== PROVIDER ====================
export const CartProvider = ({ children }) => {
  const { user, isAuthenticated, authChecked } = useApp();
  
  // Estados principales
  const [cart, setCart] = useState({
    items: [],
    total: 0,
    subtotal: 0,
    descuento_total: 0,
    carrito_id: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState('synced');
  
  // Referencias
  const syncTimeoutRef = useRef(null);
  const isSyncingRef = useRef(false);
  const lastSyncRef = useRef(Date.now());

  // ==================== BACKUP LOCAL ====================
  
  const saveLocalBackup = useCallback((cartData) => {
    try {
      if (cartData) {
        localStorage.setItem(CART_STORAGE_KEY, safeJSONStringify(cartData));
      }
    } catch (error) {
      console.warn('⚠️ No se pudo guardar backup local:', error);
    }
  }, []);

  const loadLocalBackup = useCallback(() => {
    try {
      const backup = localStorage.getItem(CART_STORAGE_KEY);
      return safeJSONParse(backup);
    } catch {
      return null;
    }
  }, []);

  const clearLocalBackup = useCallback(() => {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.warn('⚠️ No se pudo limpiar backup local:', error);
    }
  }, []);

  // ==================== SINCRONIZACIÓN ====================

  const loadCart = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      setSyncStatus('syncing');
      
      console.log('🛒 Cargando carrito del servidor...');
      
      const response = await obtenerCarrito();
      
      if (response.success && response.data) {
        const normalizedCart = {
          items: response.data.items || [],
          total: parseFloat(response.data.total) || 0,
          subtotal: parseFloat(response.data.subtotal) || 0,
          descuento_total: parseFloat(response.data.descuento_total) || 0,
          carrito_id: response.data.carrito_id || null
        };
        
        setCart(normalizedCart);
        saveLocalBackup(normalizedCart);
        setSyncStatus('synced');
        lastSyncRef.current = Date.now();
        
        console.log('✅ Carrito cargado correctamente:', {
          items: normalizedCart.items.length,
          total: normalizedCart.total
        });
        
        return { success: true, data: normalizedCart };
      }
      
      throw new Error(response.message || 'Error al cargar carrito');
    } catch (err) {
      console.error('❌ Error cargando carrito:', err);
      setError(err.message);
      setSyncStatus('error');
      
      const backup = loadLocalBackup();
      if (backup) {
        console.log('📦 Usando backup local del carrito');
        setCart(backup);
        return { success: false, error: err.message, usingBackup: true };
      }
      
      return { success: false, error: err.message };
    } finally {
      if (!silent) setLoading(false);
    }
  }, [saveLocalBackup, loadLocalBackup]);

  // Sincronización automática cada 30 segundos
  useEffect(() => {
    const syncInterval = setInterval(() => {
      const timeSinceLastSync = Date.now() - lastSyncRef.current;
      
      if (timeSinceLastSync > 30000 && !isSyncingRef.current) {
        console.log('🔄 Sincronización automática del carrito');
        loadCart(true);
      }
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [loadCart]);

  // ✅ CARGAR CARRITO CUANDO AUTENTICACIÓN ESTÉ LISTA
  useEffect(() => {
    if (!authChecked) {
      console.log('⏳ Esperando verificación de autenticación...');
      return;
    }

    console.log('📦 CartContext inicializando:', {
      isAuthenticated,
      hasUser: !!user,
      authChecked
    });

    loadCart();
  }, [authChecked, isAuthenticated, user?.usuario_id, loadCart]);

  // ==================== OPERACIONES DEL CARRITO ====================

  const addToCart = useCallback(async (productoId, cantidad = 1) => {
    console.log('🛒 CartContext.addToCart - Iniciando:', {
      productoId,
      cantidad,
      tipoProductoId: typeof productoId,
      isAuthenticated,
      hasUser: !!user
    });

    // ✅ Validación de tipo
    if (!productoId || typeof productoId !== 'number') {
      console.error('❌ producto_id debe ser número:', productoId, typeof productoId);
      return { 
        success: false, 
        message: 'ID de producto inválido (debe ser número)' 
      };
    }

    if (cantidad < 1 || cantidad > MAX_QUANTITY) {
      return { 
        success: false, 
        message: `Cantidad debe estar entre 1 y ${MAX_QUANTITY}` 
      };
    }

    if (isSyncingRef.current) {
      return { success: false, message: 'Operación en progreso, intenta de nuevo' };
    }

    try {
      isSyncingRef.current = true;
      setLoading(true);
      setError(null);
      setSyncStatus('syncing');
      
      console.log('📤 Enviando a agregarAlCarrito:', { productoId, cantidad });
      
      // ✅ Llamar API sin validar autenticación en frontend
      const response = await agregarAlCarrito(productoId, cantidad);
      
      console.log('📥 Respuesta del servidor:', response);
      
      if (response.success && response.data) {
        const normalizedCart = {
          items: response.data.items || [],
          total: parseFloat(response.data.total) || 0,
          subtotal: parseFloat(response.data.subtotal) || 0,
          descuento_total: parseFloat(response.data.descuento_total) || 0,
          carrito_id: response.data.carrito_id || null
        };
        
        setCart(normalizedCart);
        saveLocalBackup(normalizedCart);
        setSyncStatus('synced');
        lastSyncRef.current = Date.now();
        
        console.log('✅ Producto agregado exitosamente');
        
        return { success: true, data: normalizedCart };
      }
      
      throw new Error(response.message || 'Error al agregar producto');
    } catch (err) {
      console.error('❌ Error agregando al carrito:', err);
      setError(err.message);
      setSyncStatus('error');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
      isSyncingRef.current = false;
    }
  }, [saveLocalBackup, isAuthenticated, user]);

  // ✅ DEFINIR removeItem ANTES DE USARLO
  const removeItem = useCallback(async (itemId) => {
    try {
      setLoading(true);
      setError(null);
      setSyncStatus('syncing');
      
      console.log('🗑️ Eliminando item:', itemId);
      
      const response = await eliminarDelCarrito(itemId);
      
      if (response.success && response.data) {
        const normalizedCart = {
          items: response.data.items || [],
          total: parseFloat(response.data.total) || 0,
          subtotal: parseFloat(response.data.subtotal) || 0,
          descuento_total: parseFloat(response.data.descuento_total) || 0,
          carrito_id: response.data.carrito_id || null
        };
        
        setCart(normalizedCart);
        saveLocalBackup(normalizedCart);
        setSyncStatus('synced');
        lastSyncRef.current = Date.now();
        
        console.log('✅ Item eliminado correctamente');
        return { success: true, data: normalizedCart };
      }
      
      throw new Error(response.message || 'Error al eliminar item');
    } catch (err) {
      console.error('❌ Error eliminando item:', err);
      setError(err.message);
      setSyncStatus('error');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, [saveLocalBackup]);

  const updateQuantity = useCallback(async (itemId, cantidad) => {
    if (!cart) return { success: false, message: 'Carrito no disponible' };

    const validQuantity = Math.max(0, Math.min(cantidad, MAX_QUANTITY));

    if (validQuantity === 0) {
      return removeItem(itemId);
    }

    // Actualización optimista
    setCart(prevCart => {
      if (!prevCart?.items) return prevCart;
      return {
        ...prevCart,
        items: prevCart.items.map(item =>
          item.item_id === itemId
            ? { ...item, cantidad: validQuantity }
            : item
        )
      };
    });

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    return new Promise((resolve) => {
      syncTimeoutRef.current = setTimeout(async () => {
        try {
          setSyncStatus('syncing');
          console.log('🔄 Actualizando cantidad:', { itemId, validQuantity });
          
          const response = await actualizarCantidad(itemId, validQuantity);
          
          if (response.success && response.data) {
            const normalizedCart = {
              items: response.data.items || [],
              total: parseFloat(response.data.total) || 0,
              subtotal: parseFloat(response.data.subtotal) || 0,
              descuento_total: parseFloat(response.data.descuento_total) || 0,
              carrito_id: response.data.carrito_id || null
            };
            
            setCart(normalizedCart);
            saveLocalBackup(normalizedCart);
            setSyncStatus('synced');
            lastSyncRef.current = Date.now();
            
            console.log('✅ Cantidad actualizada correctamente');
            resolve({ success: true, data: normalizedCart });
          } else {
            throw new Error(response.message || 'Error al actualizar cantidad');
          }
        } catch (err) {
          console.error('❌ Error actualizando cantidad:', err);
          setSyncStatus('error');
          await loadCart(true);
          resolve({ success: false, message: err.message });
        }
      }, SYNC_DEBOUNCE_MS);
    });
  }, [cart, saveLocalBackup, loadCart, removeItem]);

  const incrementQuantity = useCallback(async (itemId) => {
    const item = cart?.items?.find(i => i.item_id === itemId);
    if (!item) return { success: false, message: 'Item no encontrado' };
    
    return updateQuantity(itemId, item.cantidad + 1);
  }, [cart, updateQuantity]);

  const decrementQuantity = useCallback(async (itemId) => {
    const item = cart?.items?.find(i => i.item_id === itemId);
    if (!item) return { success: false, message: 'Item no encontrado' };
    
    return updateQuantity(itemId, item.cantidad - 1);
  }, [cart, updateQuantity]);

  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSyncStatus('syncing');
      
      console.log('🧹 Limpiando carrito...');
      
      const response = await limpiarCarrito();
      
      if (response.success) {
        const emptyCart = { 
          items: [], 
          total: 0, 
          subtotal: 0, 
          descuento_total: 0,
          carrito_id: null
        };
        setCart(emptyCart);
        clearLocalBackup();
        setSyncStatus('synced');
        lastSyncRef.current = Date.now();
        
        console.log('✅ Carrito limpiado correctamente');
        return { success: true };
      }
      
      throw new Error(response.message || 'Error al limpiar carrito');
    } catch (err) {
      console.error('❌ Error limpiando carrito:', err);
      setError(err.message);
      setSyncStatus('error');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, [clearLocalBackup]);

  // ==================== GETTERS ====================

  const isEmpty = useCallback(() => {
    return !cart?.items || cart.items.length === 0;
  }, [cart]);

  const getItemCount = useCallback(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.cantidad, 0);
  }, [cart]);

  const getUniqueItemsCount = useCallback(() => {
    return cart?.items?.length || 0;
  }, [cart]);

  const isInCart = useCallback((productoId) => {
    return cart?.items?.some(item => item.producto_id === productoId) || false;
  }, [cart]);

  const getProductQuantity = useCallback((productoId) => {
    const item = cart?.items?.find(item => item.producto_id === productoId);
    return item ? item.cantidad : 0;
  }, [cart]);

  const getCartItem = useCallback((productoId) => {
    return cart?.items?.find(item => item.producto_id === productoId) || null;
  }, [cart]);

  const getCartTotal = useCallback(() => {
    return cart?.total || 0;
  }, [cart]);

  const getCartSubtotal = useCallback(() => {
    return cart?.subtotal || 0;
  }, [cart]);

  const getTotalDiscount = useCallback(() => {
    return cart?.descuento_total || 0;
  }, [cart]);

  // ==================== CLEANUP ====================

  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  // ==================== CONTEXT VALUE ====================

  const value = {
    // Estado
    cart,
    loading,
    error,
    syncStatus,
    
    // Operaciones principales
    addToCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    removeItem,
    clearCart,
    loadCart,
    
    // Getters
    isEmpty,
    getItemCount,
    getUniqueItemsCount,
    isInCart,
    getProductQuantity,
    getCartItem,
    getCartTotal,
    getCartSubtotal,
    getTotalDiscount,
    
    // Constantes
    MAX_QUANTITY,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;