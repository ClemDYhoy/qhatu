// C:\qhatu\frontend\src\contexts\AppContext.jsx
import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import authService from '../services/authService';

const AppContext = createContext();

const initialState = {
  user: null,
  products: [],
  searchResults: [],
  isLoading: true, // Cambiado a true para mostrar loading inicial
  isAuthenticated: false,
  authChecked: false // Nuevo: para saber si ya verificamos la sesión
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload,
        isAuthenticated: !!action.payload,
        authChecked: true,
        isLoading: false
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        authChecked: true,
        isLoading: false
      };
    
    case 'AUTH_CHECKED':
      return {
        ...state,
        authChecked: true,
        isLoading: false
      };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // ============================================
  // 🔐 VERIFICAR SESIÓN AL MONTAR LA APP
  // ============================================
  useEffect(() => {
    const verifySession = async () => {
      console.log('🔍 Verificando sesión...');
      
      try {
        const token = authService.getToken();
        
        if (!token) {
          console.log('ℹ️ No hay token guardado');
          dispatch({ type: 'AUTH_CHECKED' });
          return;
        }

        // Verificar token con el backend
        const result = await authService.verifyToken();
        
        if (result.success && result.user) {
          console.log('✅ Sesión válida:', result.user.email);
          dispatch({ type: 'SET_USER', payload: result.user });
        } else {
          console.log('⚠️ Token inválido o expirado');
          authService.clearAuth();
          dispatch({ type: 'AUTH_CHECKED' });
        }
      } catch (error) {
        console.error('❌ Error verificando sesión:', error);
        authService.clearAuth();
        dispatch({ type: 'AUTH_CHECKED' });
      }
    };

    verifySession();
  }, []);

  // ============================================
  // 📡 ESCUCHAR CAMBIOS EN LOCALSTORAGE
  // ============================================
  useEffect(() => {
    const handleStorageChange = () => {
      const user = authService.getUser();
      const token = authService.getToken();
      
      if (!token) {
        dispatch({ type: 'LOGOUT' });
      } else if (user) {
        dispatch({ type: 'SET_USER', payload: user });
      }
    };

    // Escuchar cambios personalizados
    window.addEventListener('userDataChanged', handleStorageChange);
    
    // Escuchar cambios en otras pestañas
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('userDataChanged', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // ============================================
  // 🔧 ACCIONES DE AUTENTICACIÓN
  // ============================================
  const login = useCallback(async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const result = await authService.login(email, password);
      
      if (result.success && result.user) {
        dispatch({ type: 'SET_USER', payload: result.user });
        return result;
      }
      
      throw new Error(result.message || 'Error al iniciar sesión');
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const result = await authService.register(userData);
      
      if (result.success && result.user) {
        dispatch({ type: 'SET_USER', payload: result.user });
        return result;
      }
      
      throw new Error(result.message || 'Error al registrar');
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, []);

  const googleLogin = useCallback(async (credential) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const result = await authService.googleAuth(credential);
      
      if (result.success && result.user) {
        dispatch({ type: 'SET_USER', payload: result.user });
        return result;
      }
      
      throw new Error(result.message || 'Error con Google');
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
      console.log('✅ Sesión cerrada');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      // Forzar logout local aunque falle el backend
      authService.clearAuth();
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const updateUser = useCallback((userData) => {
    const currentUser = authService.getUser();
    const updatedUser = { ...currentUser, ...userData };
    authService.setUser(updatedUser);
    dispatch({ type: 'SET_USER', payload: updatedUser });
  }, []);

  // ============================================
  // 📦 CONTEXT VALUE
  // ============================================
  const contextValue = useMemo(() => ({
    // Estado
    state,
    dispatch,
    
    // Usuario
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    authChecked: state.authChecked,
    isLoading: state.isLoading,
    
    // Acciones
    login,
    register,
    googleLogin,
    logout,
    updateUser,
    
    // Utilidades
    hasRole: (role) => {
      if (!state.user) return false;
      if (Array.isArray(role)) {
        return role.includes(state.user.rol_nombre);
      }
      return state.user.rol_nombre === role;
    },
    
    isAdmin: () => state.user?.rol_nombre === 'super_admin',
    isVendedor: () => state.user?.rol_nombre === 'vendedor',
    isAlmacenero: () => state.user?.rol_nombre === 'almacenero',
    isCliente: () => state.user?.rol_nombre === 'cliente'
  }), [state, login, register, googleLogin, logout, updateUser]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de un AppProvider');
  }
  return context;
}

export default AppContext;