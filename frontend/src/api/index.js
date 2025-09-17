import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const login = async (credentials) => axios.post(`${API_URL}/auth/login`, credentials);
export const register = async (userData) => axios.post(`${API_URL}/auth/register`, userData);
export const forgotPassword = async (email) => axios.post(`${API_URL}/auth/forgot-password`, email);
export const resetPassword = async (token, password) => axios.post(`${API_URL}/auth/reset-password/${token}`, { contrasena: password });
export const getProducts = async (filters) => axios.get(`${API_URL}/products`, { params: filters });
export const getProductById = async (id) => axios.get(`${API_URL}/products/${id}`);
export const createProduct = async (product) => axios.post(`${API_URL}/products`, product, { headers: getAuthHeader() });
export const updateProduct = async (id, product) => axios.put(`${API_URL}/products/${id}`, product, { headers: getAuthHeader() });
export const deleteProduct = async (id) => axios.delete(`${API_URL}/products/${id}`, { headers: getAuthHeader() });
export const getCarousel = async () => axios.get(`${API_URL}/carousel`);
export const createCarouselSlide = async (slide) => axios.post(`${API_URL}/carousel`, slide, { headers: getAuthHeader() });
export const updateCarouselSlide = async (id, slide) => axios.put(`${API_URL}/carousel/${id}`, slide, { headers: getAuthHeader() });
export const deleteCarouselSlide = async (id) => axios.delete(`${API_URL}/carousel/${id}`, { headers: getAuthHeader() });
export const getSearchTerms = async () => axios.get(`${API_URL}/analytics/search-terms`, { headers: getAuthHeader() });
export const getPopularProducts = async () => axios.get(`${API_URL}/analytics/popular-products`, { headers: getAuthHeader() });