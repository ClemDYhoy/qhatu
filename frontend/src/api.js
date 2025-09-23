import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3001/api' });

api.interceptors.request.use(config => {
const token = localStorage.getItem('token');
if (token) config.headers.Authorization = `Bearer ${token}`;
return config;
}, error => Promise.reject(error));

// Auth
export const login = async (credentials) => {
try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
} catch (error) {
    console.error('Error en login:', error);
    throw error.response?.data?.error || 'Error al iniciar sesión';
}
};

export const register = async (userData) => {
try {
    const response = await api.post('/auth/register', userData);
    return response.data;
} catch (error) {
    console.error('Error en register:', error);
    throw error.response?.data?.error || 'Error al registrar';
}
};

export const forgotPassword = async (email) => {
try {
    const response = await api.post('/auth/forgot-password', { correo: email });
    return response.data;
} catch (error) {
    console.error('Error en forgotPassword:', error);
    throw error.response?.data?.error || 'Error al enviar correo';
}
};

export const resetPassword = async (token, password) => {
try {
    const response = await api.post(`/auth/reset-password/${token}`, { contrasena: password });
    return response.data;
} catch (error) {
    console.error('Error en resetPassword:', error);
    throw error.response?.data?.error || 'Error al restablecer contraseña';
}
};

// Products
export const getProducts = async (filters = {}) => {
try {
    const response = await api.get('/products', { params: filters });
    return response.data;
} catch (error) {
    console.error('Error en getProducts:', error);
    throw error.response?.data?.error || 'Error al obtener productos';
}
};

export const getProductById = async (id) => {
try {
    const response = await api.get(`/products/${id}`);
    return response.data;
} catch (error) {
    console.error('Error en getProductById:', error);
    throw error.response?.data?.error || 'Error al obtener producto';
}
};

export const createProduct = async (product) => {
try {
    const response = await api.post('/products', product);
    return response.data;
} catch (error) {
    console.error('Error en createProduct:', error);
    throw error.response?.data?.error || 'Error al crear producto';
}
};

export const updateProduct = async (id, product) => {
try {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
} catch (error) {
    console.error('Error en updateProduct:', error);
    throw error.response?.data?.error || 'Error al actualizar producto';
}
};

export const deleteProduct = async (id) => {
try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
} catch (error) {
    console.error('Error en deleteProduct:', error);
    throw error.response?.data?.error || 'Error al eliminar producto';
}
};

// Carousel
export const getCarousel = async () => {
try {
    const response = await api.get('/carousel');
    return response.data;
} catch (error) {
    console.error('Error en getCarousel:', error);
    throw error.response?.data?.error || 'Error al obtener carrusel';
}
};

export const createCarouselSlide = async (slide) => {
try {
    const response = await api.post('/carousel', slide);
    return response.data;
} catch (error) {
    console.error('Error en createCarouselSlide:', error);
    throw error.response?.data?.error || 'Error al crear slide';
}
};

export const updateCarouselSlide = async (id, slide) => {
try {
    const response = await api.put(`/carousel/${id}`, slide);
    return response.data;
} catch (error) {
    console.error('Error en updateCarouselSlide:', error);
    throw error.response?.data?.error || 'Error al actualizar slide';
}
};

export const deleteCarouselSlide = async (id) => {
try {
    const response = await api.delete(`/carousel/${id}`);
    return response.data;
} catch (error) {
    console.error('Error en deleteCarouselSlide:', error);
    throw error.response?.data?.error || 'Error al eliminar slide';
}
};

// Analytics (solo para admin)
export const getSearchTerms = async () => {
try {
    const response = await api.get('/analytics/search-terms');
    return response.data;
} catch (error) {
    console.error('Error en getSearchTerms:', error);
    throw error.response?.data?.error || 'Error al obtener términos de búsqueda';
}
};

export const getPopularProducts = async () => {
try {
    const response = await api.get('/analytics/popular-products');
    return response.data;
} catch (error) {
    console.error('Error en getPopularProducts:', error);
    throw error.response?.data?.error || 'Error al obtener productos populares';
}
};

export default api;