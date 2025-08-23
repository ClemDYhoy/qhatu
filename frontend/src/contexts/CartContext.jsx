import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartService } from '../services/cartService';

const CartContext = createContext();

function cartReducer(state, action) {
switch (action.type) {
    case 'SET_CART':
    return { ...state, items: action.payload };
    case 'ADD_TO_CART':
    // Verificar si el producto ya está en el carrito
    const existingItem = state.items.find(item => item.id === action.payload.id);
    if (existingItem) {
        return {
        ...state,
        items: state.items.map(item =>
            item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
        };
    }
    return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
    };
    case 'REMOVE_FROM_CART':
    return { 
        ...state, 
        items: state.items.filter(item => item.id !== action.payload) 
    };
    case 'UPDATE_QUANTITY':
    return {
        ...state,
        items: state.items.map(item =>
        item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
    };
    case 'CLEAR_CART':
    return { ...state, items: [] };
    default:
    return state;
}
}

export function CartProvider({ children }) {
const [state, dispatch] = useReducer(cartReducer, { items: [] });

// Cargar carrito desde localStorage al inicializar
useEffect(() => {
    const savedCart = cartService.get();
    dispatch({ type: 'SET_CART', payload: savedCart });
}, []);

// Guardar carrito en localStorage cuando cambie
useEffect(() => {
    cartService.save(state.items);
}, [state.items]);

const value = {
    cart: state.items,
    addToCart: (product) => dispatch({ type: 'ADD_TO_CART', payload: product }),
    removeFromCart: (productId) => dispatch({ type: 'REMOVE_FROM_CART', payload: productId }),
    updateQuantity: (productId, quantity) => dispatch({ 
    type: 'UPDATE_QUANTITY', 
    payload: { id: productId, quantity } 
    }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    getTotal: () => state.items.reduce((total, item) => total + (item.price * item.quantity), 0),
    getTotalItems: () => state.items.reduce((total, item) => total + item.quantity, 0)
};

return (
    <CartContext.Provider value={value}>
    {children}
    </CartContext.Provider>
);
}

export function useCart() {
const context = useContext(CartContext);
if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
}
return context;
}