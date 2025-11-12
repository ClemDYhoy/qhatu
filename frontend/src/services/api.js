// C:\qhatu\frontend\src\services\api.js
import axios from 'axios';

// ============================================
// === CONFIGURACIÓN BASE ===
// ============================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const isDevelopment = import.meta.env.VITE_APP_ENV === 'development';

// Validación de configuración al cargar
if (isDevelopment) {
  console.log('🔧 API Configuration:', {
    API_URL,
    env: import.meta.env.VITE_APP_ENV,
    mode: import.meta.env.MODE
  });
}

// ============================================
// === AXIOS INSTANCE ===
// ============================================

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('qhatu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (isDevelopment) {
      console.log(`🌐 ${config.method.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('❌ Error en request:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Token expirado
      if (status === 401 && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('qhatu_token');
        localStorage.removeItem('qhatu_user');
        window.location.href = '/login?expired=true';
      }

      console.error(`❌ Error ${status}:`, data.message || error.message);
    } else if (error.request) {
      console.error('❌ Error de red: No se pudo conectar con el servidor');
    } else {
      console.error('❌ Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// ============================================
// === UTILIDADES ===
// ============================================

const log = {
  info: (...args) => isDevelopment && console.log('ℹ️', ...args),
  error: (...args) => isDevelopment && console.error('❌', ...args),
  warn: (...args) => isDevelopment && console.warn('⚠️', ...args),
  success: (...args) => isDevelopment && console.log('✅', ...args)
};

const buildQueryString = (params) => {
  const filtered = Object.entries(params || {})
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => [key, String(value)]);
  
  return filtered.length > 0 ? `?${new URLSearchParams(filtered).toString()}` : '';
};

// ============================================
// === CLIENTE HTTP FETCH (para compatibilidad) ===
// ============================================

const fetchAPI = async (endpoint, options = {}) => {
  const token = localStorage.getItem('qhatu_token');
  const url = `${API_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  log.info(`🌐 ${options.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, config);
    
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      log.success(`${response.status} - Sin contenido`);
      return { success: true };
    }

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      log.warn('Respuesta no-JSON recibida:', text);
      data = { raw: text };
    }

    if (!response.ok) {
      const errorMessage = data.error || data.message || data.msg || `Error ${response.status}`;
      log.error(`${response.status} - ${errorMessage}`, data);
      
      if (response.status === 401) {
        localStorage.removeItem('qhatu_token');
        localStorage.removeItem('qhatu_user');
        window.location.href = '/login';
      }
      
      throw new Error(errorMessage);
    }

    log.success(`${response.status} - Éxito`, data);
    return data;
    
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      log.error('Error de conexión - ¿Está el backend corriendo?');
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté activo.');
    }
    
    log.error(`Error en ${endpoint}:`, error.message);
    throw error;
  }
};

// ============================================
// === EXPORTAR AXIOS PARA AUTHSERVICE ===
// ============================================

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('qhatu_token', token);
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    localStorage.removeItem('qhatu_token');
  }
};

export { apiClient as default };

// ============================================
// === PRODUCTOS ===
// ============================================

export const getProducts = async (filters = {}) => {
  const queryString = buildQueryString(filters);
  return fetchAPI(`/products${queryString}`);
};

export const getProductById = async (id) => {
  if (!id) throw new Error('ID de producto requerido');
  return fetchAPI(`/products/${id}`);
};

export const getFeaturedProducts = async (limit = 4) => {
  return fetchAPI(`/products/featured${buildQueryString({ limit })}`);
};

export const getBestSellers = async (limit = 4) => {
  return fetchAPI(`/products/best-sellers${buildQueryString({ limit })}`);
};

export const getRecentProducts = async (limit = 4) => {
  return fetchAPI(`/products/recent${buildQueryString({ limit })}`);
};

export const getProductsByCategory = async (categoryId, options = {}) => {
  if (!categoryId) throw new Error('ID de categoría requerido');
  const queryString = buildQueryString(options);
  return fetchAPI(`/products/category/${categoryId}${queryString}`);
};

export const getPriceRange = async (categoria_id = null) => {
  const query = buildQueryString({ categoria_id });
  return fetchAPI(`/products/price-range${query}`);
};

export const searchProducts = async (query, options = {}) => {
  if (!query || query.trim().length === 0) {
    throw new Error('Consulta de búsqueda requerida');
  }
  
  const params = { q: query.trim(), ...options };
  const queryString = buildQueryString(params);
  return fetchAPI(`/products/search${queryString}`);
};

export const getCategoryStats = async () => {
  return fetchAPI('/products/stats-by-category');
};

// ============================================
// === CATEGORÍAS ===
// ============================================

export const getCategories = async (options = {}) => {
  const queryString = buildQueryString(options);
  return fetchAPI(`/categories${queryString}`);
};

export const getCategoryById = async (id) => {
  if (!id) throw new Error('ID de categoría requerido');
  return fetchAPI(`/categories/${id}`);
};

export const getMainCategories = async () => {
  return getCategories({ main: true });
};

export const getSubCategories = async (parentId) => {
  if (!parentId) throw new Error('ID de categoría padre requerido');
  return getCategories({ parent_id: parentId });
};

// ============================================
// === CARRUSELES ===
// ============================================

export const getCarousels = async () => {
  return fetchAPI('/carousels');
};

export const getCarouselById = async (id) => {
  if (!id) throw new Error('ID de carrusel requerido');
  return fetchAPI(`/carousels/${id}`);
};

// ============================================
// === AUTENTICACIÓN (FETCH) ===
// ============================================

export const login = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email y contraseña requeridos');
  }
  
  return fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
};

export const register = async (userData) => {
  const required = ['email', 'password', 'nombre_completo'];
  const missing = required.filter(field => !userData[field]);
  
  if (missing.length > 0) {
    throw new Error(`Campos requeridos faltantes: ${missing.join(', ')}`);
  }
  
  return fetchAPI('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};

export const getProfile = async () => {
  return fetchAPI('/auth/profile');
};

export const logout = async () => {
  try {
    await fetchAPI('/auth/logout', { method: 'POST' });
  } finally {
    localStorage.removeItem('qhatu_token');
    localStorage.removeItem('qhatu_user');
  }
};

export const requestPasswordReset = async (email) => {
  if (!email) throw new Error('Email requerido');
  
  return fetchAPI('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
};

export const resetPassword = async (token, newPassword) => {
  if (!token || !newPassword) {
    throw new Error('Token y nueva contraseña requeridos');
  }
  
  return fetchAPI('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword })
  });
};

// ============================================
// === USUARIOS (Admin) ===
// ============================================

export const getUsers = async (options = {}) => {
  const queryString = buildQueryString(options);
  return fetchAPI(`/users${queryString}`);
};

export const updateUser = async (id, userData) => {
  if (!id) throw new Error('ID de usuario requerido');
  
  return fetchAPI(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  });
};

export const deleteUser = async (id) => {
  if (!id) throw new Error('ID de usuario requerido');
  
  return fetchAPI(`/users/${id}`, {
    method: 'DELETE'
  });
};

// ============================================
// === ANALYTICS (Admin) ===
// ============================================

export const getAnalytics = async () => {
  return fetchAPI('/analytics');
};

export const getLowStockProducts = async () => {
  return fetchAPI('/analytics/low-stock');
};

export const getTopSelling = async (period = 'month') => {
  const validPeriods = ['day', 'week', 'month', 'year'];
  if (!validPeriods.includes(period)) {
    throw new Error(`Período inválido. Usa: ${validPeriods.join(', ')}`);
  }
  
  return fetchAPI(`/analytics/top-selling${buildQueryString({ period })}`);
};

// ============================================
// === BANNERS DE DESCUENTO ===
// ============================================

export const getActiveDiscountBanners = async () => {
  return fetchAPI('/banners-descuento/activos');
};

export const getDiscountBannerById = async (id) => {
  if (!id) throw new Error('ID de banner requerido');
  return fetchAPI(`/banners-descuento/${id}`);
};

export const registerBannerInteraction = async (bannerId, tipo) => {
  if (!bannerId) throw new Error('ID de banner requerido');
  if (!['vista', 'click'].includes(tipo)) {
    throw new Error('Tipo debe ser "vista" o "click"');
  }
  
  return fetchAPI('/banners-descuento/interaccion', {
    method: 'POST',
    body: JSON.stringify({ banner_id: bannerId, tipo })
  });
};

// ============================================
// === HEALTH CHECK ===
// ============================================

export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_URL.replace('/api', '')}/health`);
    return await response.json();
  } catch (error) {
    log.error('Health check falló:', error);
    return { status: 'unhealthy', error: error.message };
  }
};