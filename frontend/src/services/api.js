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

/**
 * Obtener productos con filtros
 * @param {Object} filters - Filtros de búsqueda
 * @param {string} filters.search - Texto de búsqueda
 * @param {number} filters.categoria_id - ID de categoría
 * @param {number} filters.priceMin - Precio mínimo
 * @param {number} filters.priceMax - Precio máximo
 * @param {string} filters.availability - Disponibilidad (in_stock, low, critical, out)
 * @param {boolean} filters.highlighted - Solo destacados
 * @param {string} filters.orderBy - Campo de ordenamiento
 * @param {string} filters.order - Dirección (ASC, DESC)
 * @param {number} filters.limit - Límite de resultados
 * @param {number} filters.offset - Offset para paginación
 */
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

/**
 * Obtener un producto por ID
 * @param {number} id - ID del producto
 */
export const getProductById = async (id) => {
  return fetchAPI(`/products/${id}`);
};

/**
 * Obtener productos destacados
 * @param {number} limit - Cantidad de productos (máx. 20)
 */
export const getFeaturedProducts = async (limit = 4) => {
  return fetchAPI(`/products/featured?limit=${limit}`);
};

/**
 * Obtener productos más vendidos
 * @param {number} limit - Cantidad de productos (máx. 20)
 */
export const getBestSellers = async (limit = 4) => {
  return fetchAPI(`/products/best-sellers?limit=${limit}`);
};

/**
 * Obtener productos recientes
 * @param {number} limit - Cantidad de productos (máx. 20)
 */
export const getRecentProducts = async (limit = 4) => {
  return fetchAPI(`/products/recent?limit=${limit}`);
};

/**
 * Obtener productos por categoría
 * @param {number} categoryId - ID de la categoría
 * @param {number} limit - Cantidad de productos
 */
export const getProductsByCategory = async (categoryId, limit = null) => {
  const params = limit ? `?limit=${limit}` : '';
  return fetchAPI(`/products/category/${categoryId}${params}`);
};

/**
 * Obtener rango de precios
 * @param {number} categoria_id - ID de categoría (opcional)
 */
export const getPriceRange = async (categoria_id = null) => {
  const query = categoria_id ? `?categoria_id=${categoria_id}` : '';
  return fetchAPI(`/products/price-range${query}`);
};

/**
 * Buscar productos por texto
 * @param {string} query - Texto de búsqueda
 * @param {number} limit - Cantidad de resultados
 */
export const searchProducts = async (query, limit = 10) => {
  return fetchAPI(`/products/search?q=${encodeURIComponent(query)}&limit=${limit}`);
};

// === CATEGORÍAS ===

/**
 * Obtener todas las categorías
 */
export const getCategories = async () => {
  return fetchAPI('/categories');
};

/**
 * Obtener una categoría por ID
 * @param {number} id - ID de la categoría
 */
export const getCategoryById = async (id) => {
  return fetchAPI(`/categories/${id}`);
};

/**
 * Obtener categorías principales (sin padre)
 */
export const getMainCategories = async () => {
  return fetchAPI('/categories?main=true');
};

/**
 * Obtener subcategorías de una categoría
 * @param {number} parentId - ID de la categoría padre
 */
export const getSubCategories = async (parentId) => {
  return fetchAPI(`/categories?parent_id=${parentId}`);
};

// === CARRUSELES ===

/**
 * Obtener todos los carruseles activos
 */
export const getCarousels = async () => {
  return fetchAPI('/carousels');
};

/**
 * Obtener carrusel por ID
 * @param {number} id - ID del carrusel
 */
export const getCarouselById = async (id) => {
  return fetchAPI(`/carousels/${id}`);
};

// === AUTENTICACIÓN ===

/**
 * Iniciar sesión
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 */
export const login = async (email, password) => {
  return fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
};

/**
 * Registrar nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @param {string} userData.email - Email
 * @param {string} userData.password - Contraseña
 * @param {string} userData.nombre - Nombre completo
 */
export const register = async (userData) => {
  return fetchAPI('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};

/**
 * Obtener perfil del usuario actual
 */
export const getProfile = async () => {
  return fetchAPI('/auth/profile');
};

/**
 * Cerrar sesión
 */
export const logout = async () => {
  return fetchAPI('/auth/logout', {
    method: 'POST'
  });
};

/**
 * Solicitar restablecimiento de contraseña
 * @param {string} email - Email del usuario
 */
export const requestPasswordReset = async (email) => {
  return fetchAPI('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
};

/**
 * Restablecer contraseña
 * @param {string} token - Token de restablecimiento
 * @param {string} newPassword - Nueva contraseña
 */
export const resetPassword = async (token, newPassword) => {
  return fetchAPI('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword })
  });
};

// === USUARIOS (Admin) ===

/**
 * Obtener todos los usuarios (requiere admin)
 */
export const getUsers = async () => {
  return fetchAPI('/users');
};

/**
 * Actualizar usuario (requiere admin)
 * @param {number} id - ID del usuario
 * @param {Object} userData - Datos a actualizar
 */
export const updateUser = async (id, userData) => {
  return fetchAPI(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  });
};

/**
 * Eliminar usuario (requiere admin)
 * @param {number} id - ID del usuario
 */
export const deleteUser = async (id) => {
  return fetchAPI(`/users/${id}`, {
    method: 'DELETE'
  });
};

// === ANALYTICS (Admin) ===

/**
 * Obtener estadísticas del dashboard
 */
export const getAnalytics = async () => {
  return fetchAPI('/analytics');
};

/**
 * Obtener productos con stock bajo
 */
export const getLowStockProducts = async () => {
  return fetchAPI('/analytics/low-stock');
};

/**
 * Obtener productos más vendidos (período específico)
 * @param {string} period - Período (day, week, month, year)
 */
export const getTopSelling = async (period = 'month') => {
  return fetchAPI(`/analytics/top-selling?period=${period}`);
};

// Exportar todas las funciones como default también
export default {
  // Productos
  getProducts,
  getProductById,
  getFeaturedProducts,
  getBestSellers,
  getRecentProducts,
  getProductsByCategory,
  getPriceRange,
  searchProducts,
  
  // Categorías
  getCategories,
  getCategoryById,
  getMainCategories,
  getSubCategories,
  
  // Carruseles
  getCarousels,
  getCarouselById,
  
  // Autenticación
  login,
  register,
  getProfile,
  logout,
  requestPasswordReset,
  resetPassword,
  
  // Usuarios
  getUsers,
  updateUser,
  deleteUser,
  
  // Analytics
  getAnalytics,
  getLowStockProducts,
  getTopSelling
};