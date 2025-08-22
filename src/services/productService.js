import api from './api';

export const productService = {
getAll: async () => {
    try {
    const response = await api.get('/products');
    return response.data;
    } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
    }
},

getById: async (id) => {
    try {
    const response = await api.get(`/products/${id}`);
    return response.data;
    } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
    }
},

search: async (query) => {
    try {
    const response = await api.get(`/products/search?q=${query}`);
    return response.data;
    } catch (error) {
    console.error('Error searching products:', error);
    throw error;
    }
}
};