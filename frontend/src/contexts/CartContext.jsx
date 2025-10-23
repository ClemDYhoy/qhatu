import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

// Crear el contexto
export const CartContext = createContext();

// Hook personalizado con validación
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

// Constantes
const CART_STORAGE_KEY = 'qhatu_cart';
const MAX_QUANTITY = 99;

// Utilidades
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

// Provider del carrito
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? safeJSONParse(savedCart) : [];
    } catch (error) {
      console.error('Error al cargar carrito desde localStorage:', error);
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, safeJSONStringify(cart));
      // Disparar evento para sincronizar entre pestañas
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error al guardar carrito en localStorage:', error);
    }
  }, [cart]);

  // Sincronizar entre pestañas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === CART_STORAGE_KEY) {
        setCart(safeJSONParse(e.newValue));
      }
    };

    const handleCartUpdate = () => {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        setCart(safeJSONParse(savedCart));
      } catch (error) {
        console.error('Error al sincronizar carrito:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Agregar producto al carrito
  const addToCart = useCallback((product, quantity = 1) => {
    if (!product || !product.producto_id) {
      console.error('Producto inválido:', product);
      return false;
    }

    const validQuantity = Math.max(1, Math.min(quantity, MAX_QUANTITY));

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.producto_id === product.producto_id
      );

      if (existingItem) {
        // Actualizar cantidad sin exceder el máximo
        return prevCart.map((item) =>
          item.producto_id === product.producto_id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + validQuantity,
                  MAX_QUANTITY
                ),
              }
            : item
        );
      }

      // Agregar nuevo producto
      return [
        ...prevCart,
        {
          ...product,
          quantity: validQuantity,
          addedAt: Date.now(), // Timestamp para ordenar
        },
      ];
    });

    return true;
  }, []);

  // Remover producto del carrito
  const removeFromCart = useCallback((productId) => {
    if (!productId) {
      console.error('ID de producto inválido');
      return false;
    }

    setCart((prevCart) =>
      prevCart.filter((item) => item.producto_id !== productId)
    );

    return true;
  }, []);

  // Actualizar cantidad de un producto
  const updateQuantity = useCallback((productId, quantity) => {
    if (!productId) {
      console.error('ID de producto inválido');
      return false;
    }

    const validQuantity = Math.max(0, Math.min(quantity, MAX_QUANTITY));

    if (validQuantity === 0) {
      return removeFromCart(productId);
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.producto_id === productId
          ? { ...item, quantity: validQuantity }
          : item
      )
    );

    return true;
  }, [removeFromCart]);

  // Incrementar cantidad
  const incrementQuantity = useCallback((productId) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.producto_id === productId
          ? {
              ...item,
              quantity: Math.min(item.quantity + 1, MAX_QUANTITY),
            }
          : item
      )
    );
  }, []);

  // Decrementar cantidad
  const decrementQuantity = useCallback((productId) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.producto_id === productId
          ? {
              ...item,
              quantity: Math.max(1, item.quantity - 1),
            }
          : item
      )
    );
  }, []);

  // Limpiar carrito
  const clearCart = useCallback(() => {
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error al limpiar carrito:', error);
    }
  }, []);

  // Calcular total del carrito
  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.precio || item.price || 0);
      return total + price * item.quantity;
    }, 0);
  }, [cart]);

  // Calcular cantidad total de items (suma de cantidades)
  const getTotalItems = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // Calcular cantidad de productos únicos
  const getUniqueItemsCount = useCallback(() => {
    return cart.length;
  }, [cart]);

  // Verificar si un producto está en el carrito
  const isInCart = useCallback(
    (productId) => {
      return cart.some((item) => item.producto_id === productId);
    },
    [cart]
  );

  // Obtener cantidad de un producto específico
  const getProductQuantity = useCallback(
    (productId) => {
      const item = cart.find((item) => item.producto_id === productId);
      return item ? item.quantity : 0;
    },
    [cart]
  );

  // Obtener producto del carrito por ID
  const getCartItem = useCallback(
    (productId) => {
      return cart.find((item) => item.producto_id === productId) || null;
    },
    [cart]
  );

  // Verificar si el carrito está vacío
  const isEmpty = useCallback(() => {
    return cart.length === 0;
  }, [cart]);

  // Valor del contexto
  const value = {
    // Estado
    cart,
    isLoading,
    
    // Acciones
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    
    // Getters
    getCartTotal,
    getTotalItems,
    getUniqueItemsCount,
    isInCart,
    getProductQuantity,
    getCartItem,
    isEmpty,
    
    // Constantes útiles
    MAX_QUANTITY,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};