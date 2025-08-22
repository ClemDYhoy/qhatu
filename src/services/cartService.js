export const cartService = {
get: () => {
    try {
    const cart = localStorage.getItem('qhatu_cart');
    return cart ? JSON.parse(cart) : [];
    } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
    }
},

save: (items) => {
    try {
    localStorage.setItem('qhatu_cart', JSON.stringify(items));
    return true;
    } catch (error) {
    console.error('Error saving cart to localStorage:', error);
    return false;
    }
},

clear: () => {
    try {
    localStorage.removeItem('qhatu_cart');
    return true;
    } catch (error) {
    console.error('Error clearing cart from localStorage:', error);
    return false;
    }
}
};