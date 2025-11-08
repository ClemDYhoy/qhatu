import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

export const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

const CART_STORAGE_KEY = 'qhatu_cart';
const MAX_QUANTITY = 99;

const safeJSONParse = (value, fallback = []) => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const safeJSONStringify = (value) => {
  try {
    return JSON.stringify(value);
  } catch {
    return '[]';
  }
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? safeJSONParse(savedCart) : [];
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // ✅ SOLO guardar en localStorage (SIN dispatchEvent)
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, safeJSONStringify(cart));
    } catch (error) {
      console.error('Error al guardar carrito:', error);
    }
  }, [cart]);

  // ✅ SOLO sincronización entre pestañas (SIN listener local)
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Solo actualizar si viene de OTRA pestaña
      if (e.key === CART_STORAGE_KEY && e.newValue && e.storageArea !== localStorage) {
        setCart(safeJSONParse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // ==================== ACCIONES ====================
  
  const addToCart = useCallback((product, quantity = 1) => {
    if (!product?.producto_id) {
      console.error('❌ Producto inválido:', product);
      return false;
    }

    const validQuantity = Math.max(1, Math.min(quantity, MAX_QUANTITY));

    setCart(prevCart => {
      console.log('🔄 Agregando al carrito:', product.nombre, 'qty:', validQuantity);
      
      const existingIndex = prevCart.findIndex(
        item => item.producto_id === product.producto_id
      );

      if (existingIndex !== -1) {
        // Actualizar existente
        const newCart = [...prevCart];
        const newQuantity = Math.min(
          newCart[existingIndex].quantity + validQuantity,
          MAX_QUANTITY
        );
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newQuantity,
        };
        console.log('✅ Producto actualizado. Nueva cantidad:', newQuantity);
        return newCart;
      }

      // Agregar nuevo
      const newCart = [...prevCart, {
        ...product,
        quantity: validQuantity,
        addedAt: Date.now(),
      }];
      console.log('✅ Producto agregado. Total items:', newCart.length);
      return newCart;
    });

    return true;
  }, []);

  const removeFromCart = useCallback((productId) => {
    if (!productId) {
      console.error('❌ ID inválido');
      return false;
    }

    setCart(prevCart => prevCart.filter(item => item.producto_id !== productId));
    return true;
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (!productId) return false;

    const validQuantity = Math.max(0, Math.min(quantity, MAX_QUANTITY));

    if (validQuantity === 0) {
      setCart(prevCart => prevCart.filter(item => item.producto_id !== productId));
      return true;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.producto_id === productId
          ? { ...item, quantity: validQuantity }
          : item
      )
    );

    return true;
  }, []);

  const incrementQuantity = useCallback((productId) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.producto_id === productId
          ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) }
          : item
      )
    );
  }, []);

  const decrementQuantity = useCallback((productId) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.producto_id === productId
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error al limpiar:', error);
    }
  }, []);

  // ==================== GETTERS ====================

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.precio_descuento || item.precio || 0);
      return total + price * item.quantity;
    }, 0);
  }, [cart]);

  const getTotalItems = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  const getUniqueItemsCount = useCallback(() => {
    return cart.length;
  }, [cart]);

  const isEmpty = useCallback(() => {
    return cart.length === 0;
  }, [cart]);

  const isInCart = useCallback((productId) => {
    return cart.some(item => item.producto_id === productId);
  }, [cart]);

  const getProductQuantity = useCallback((productId) => {
    const item = cart.find(item => item.producto_id === productId);
    return item ? item.quantity : 0;
  }, [cart]);

  const getCartItem = useCallback((productId) => {
    return cart.find(item => item.producto_id === productId) || null;
  }, [cart]);

  // ==================== CONTEXTO ====================

  const value = {
    cart,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getCartTotal,
    getTotalItems,
    getUniqueItemsCount,
    isInCart,
    getProductQuantity,
    getCartItem,
    isEmpty,
    MAX_QUANTITY,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};