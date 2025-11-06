// C:\qhatu\frontend\src\services\api.js

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Función helper para hacer requests
const fetchAPI = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Error en la petición');
    }

    return data;
  } catch (error) {
    console.error(`Error en ${endpoint}:`, error);
    throw error;
  }
};

// === PRODUCTOS ===
export const getProducts = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });

  const queryString = queryParams.toString();
  return fetchAPI(`/products${queryString ? `?${queryString}` : ''}`);
};

export const getProductById = async (id) => {
  return fetchAPI(`/products/${id}`);
};

export const getFeaturedProducts = async (limit = 4) => {
  return fetchAPI(`/products/featured?limit=${limit}`);
};

export const getBestSellers = async (limit = 4) => {
  return fetchAPI(`/products/best-sellers?limit=${limit}`);
};

export const getRecentProducts = async (limit = 4) => {
  return fetchAPI(`/products/recent?limit=${limit}`);
};

export const getPriceRange = async (categoria_id) => {
  const query = categoria_id ? `?categoria_id=${categoria_id}` : '';
  return fetchAPI(`/products/price-range${query}`);
};

// === NUEVO: ESTADÍSTICAS DE PRODUCTOS POR CATEGORÍA ===
export const getCategoryStats = async () => {
  return fetchAPI('/products/stats-by-category');
};

// === CATEGORÍAS ===
export const getCategories = async () => {
  return fetchAPI('/categories');
};

export const getCategoryById = async (id) => {
  return fetchAPI(`/categories/${id}`);
};

// === CARRUSELES ===
export const getCarousels = async () => {
  return fetchAPI('/carousels');
};

// === AUTENTICACIÓN ===
export const login = async (email, password) => {
  return fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
};

export const register = async (userData) => {
  return fetchAPI('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};

export const getProfile = async () => {
  return fetchAPI('/auth/profile');
};

export default {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getBestSellers,
  getRecentProducts,
  getPriceRange,
  getCategoryStats,
  getCategories,
  getCategoryById,
  getCarousels,
  login,
  register,
  getProfile
};