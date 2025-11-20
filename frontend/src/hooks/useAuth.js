// C:\qhatu\frontend\src\hooks\useAuth.js
import { useApp } from '../contexts/AppContext';

/**
 * 🔐 Hook de autenticación
 * Retorna usuario y métodos de auth del AppContext
 * 
 * @returns {Object} Usuario, autenticación y métodos
 * 
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export const useAuth = () => {
  const appContext = useApp();
  
  if (!appContext) {
    throw new Error('useAuth debe usarse dentro de un AppProvider');
  }

  return {
    // Estado
    user: appContext.user,
    isAuthenticated: appContext.isAuthenticated,
    authChecked: appContext.authChecked,
    isLoading: appContext.isLoading,
    
    // Métodos de autenticación
    login: appContext.login,
    register: appContext.register,
    googleLogin: appContext.googleLogin,
    logout: appContext.logout,
    updateUser: appContext.updateUser,
    
    // Utilidades de roles
    hasRole: appContext.hasRole,
    isAdmin: appContext.isAdmin,
    isVendedor: appContext.isVendedor,
    isAlmacenero: appContext.isAlmacenero,
    isCliente: appContext.isCliente
  };
};

export default useAuth;