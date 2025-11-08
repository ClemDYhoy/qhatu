// Configuración base
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Función helper centralizada para hacer requests a la API
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} options - Opciones de fetch
 * @returns {Promise<any>} Respuesta de la API
 */
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
    
    // Manejo especial para respuestas vacías (204, etc)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true };
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || `Error ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`Error en ${endpoint}:`, error);
    throw error;
  }
};

// ============================================
// === PRODUCTOS ===
// ============================================

/**
 * Obtener productos con filtros avanzados
 * @param {Object} filters - Objeto con filtros opcionales
 * @returns {Promise<Object>} Lista de productos y metadata
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
 * @param {number} limit - Cantidad de productos (opcional)
 */
export const getProductsByCategory = async (categoryId, limit = null) => {
  const params = limit ? `?limit=${limit}` : '';
  return fetchAPI(`/products/category/${categoryId}${params}`);
};

/**
 * Obtener rango de precios de productos
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

/**
 * Obtener estadísticas de productos por categoría
 */
export const getCategoryStats = async () => {
  return fetchAPI('/products/stats-by-category');
};

// ============================================
// === CATEGORÍAS ===
// ============================================

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

// ============================================
// === CARRUSELES ===
// ============================================

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

// ============================================
// === AUTENTICACIÓN ===
// ============================================

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
 * Restablecer contraseña con token
 * @param {string} token - Token de restablecimiento
 * @param {string} newPassword - Nueva contraseña
 */
export const resetPassword = async (token, newPassword) => {
  return fetchAPI('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword })
  });
};

// ============================================
// === USUARIOS (Admin) ===
// ============================================

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

// ============================================
// === ANALYTICS (Admin) ===
// ============================================

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
 * Obtener productos más vendidos en período específico
 * @param {string} period - Período (day, week, month, year)
 */
export const getTopSelling = async (period = 'month') => {
  return fetchAPI(`/analytics/top-selling?period=${period}`);
};

// ============================================
// === BANNERS DE DESCUENTO ===
// ============================================

/**
 * Obtener banners de descuento activos
 */
export const getActiveDiscountBanners = async () => {
  return fetchAPI('/banners-descuento/activos');
};

/**
 * Obtener un banner específico por ID
 * @param {number} id - ID del banner
 */
export const getDiscountBannerById = async (id) => {
  return fetchAPI(`/banners-descuento/${id}`);
};

/**
 * Registrar interacción con banner (vista o click)
 * @param {number} bannerId - ID del banner
 * @param {string} tipo - 'vista' o 'click'
 */
export const registerBannerInteraction = async (bannerId, tipo) => {
  return fetchAPI('/banners-descuento/interaccion', {
    method: 'POST',
    body: JSON.stringify({ banner_id: bannerId, tipo })
  });
};

// ============================================
// === EXPORTACIÓN DEFAULT ===
// ============================================

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
  getCategoryStats,
  
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