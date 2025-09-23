export const cartService = {
get: () => {
    try {
    const cart = localStorage.getItem('qhatu_cart');
    if (cart === null) return [];
    const parsedCart = JSON.parse(cart);
    // Validar que parsedCart sea un array
    if (!Array.isArray(parsedCart)) {
        console.warn('Cart data is not an array, resetting to empty');
        return [];
    }
    return parsedCart;
    } catch (error) {
    console.error('Error loading cart from localStorage:', error.message);
    return [];
    }
},

save: (items) => {
    try {
    if (!Array.isArray(items)) {
        console.error('Items must be an array');
        return false;
    }
    localStorage.setItem('qhatu_cart', JSON.stringify(items));
    return true;
    } catch (error) {
    console.error('Error saving cart to localStorage:', error.message);
    return false;
    }
},

clear: () => {
    try {
    localStorage.removeItem('qhatu_cart');
    return true;
    } catch (error) {
    console.error('Error clearing cart from localStorage:', error.message);
    return false;
    }
},
};