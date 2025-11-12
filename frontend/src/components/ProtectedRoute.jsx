// C:\qhatu\frontend\src\components\ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import authService from '../services/authService';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      // Verificar si hay token
      if (!authService.isAuthenticated()) {
        console.log('❌ No hay token, redirigiendo a login');
        setIsVerifying(false);
        setIsAuthenticated(false);
        return;
      }

      // Obtener usuario de localStorage
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser) {
        console.log('❌ No hay usuario en localStorage');
        setIsVerifying(false);
        setIsAuthenticated(false);
        return;
      }

      console.log('✅ Usuario encontrado:', currentUser.email);
      console.log('👤 Rol:', currentUser.rol_nombre);
      console.log('🔒 Roles permitidos:', allowedRoles);
      
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsVerifying(false);
    };

    verifyAuth();
  }, [location.pathname]);

  // Mostrar loading mientras verifica
  if (isVerifying) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="spinner" style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Verificando permisos...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated || !user) {
    console.log('🔐 No autenticado, redirigiendo a /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si hay roles específicos requeridos, verificar
  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = allowedRoles.includes(user.rol_nombre);
    
    if (!hasPermission) {
      console.log(`❌ Acceso denegado`);
      console.log(`   Rol actual: ${user.rol_nombre}`);
      console.log(`   Roles permitidos:`, allowedRoles);
      
      // Redirigir al dashboard correspondiente según su rol
      const redirectTo = authService.getRedirectRoute(user.rol_nombre);
      console.log(`↩️  Redirigiendo a: ${redirectTo}`);
      
      return (
        <Navigate 
          to={redirectTo} 
          replace 
          state={{ 
            message: 'No tienes permisos para acceder a esa página',
            deniedFrom: location.pathname 
          }} 
        />
      );
    }
  }

  console.log('✅ Acceso permitido a:', location.pathname);
  return children;
};

export default ProtectedRoute;