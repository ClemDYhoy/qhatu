import api from './api';

export const productService = {
getAll: async (params = {}) => {
    try {
    const response = await api.get('/products', { params });
    console.log('ProductService.getAll response:', response.data); // Depuración
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
    const response = await api.get('/products/search', {
        params: { q: query }
    });
    return response.data;
    } catch (error) {
    console.error('Error searching products:', error);
    throw error;
    }
},

create: async (productData) => {
    try {
    const response = await api.post('/products', productData);
    return response.data;
    } catch (error) {
    console.error('Error creating product:', error);
    throw error;
    }
}
};