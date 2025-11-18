// C:\qhatu\frontend\src\components\ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, authChecked, user, isLoading } = useApp();
  const location = useLocation();

  // Mostrar loading mientras se verifica la sesión
  if (!authChecked || isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: '#666', fontSize: '14px' }}>Verificando acceso...</p>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    console.warn('⚠️ Usuario no autenticado, redirigiendo a login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si hay roles específicos requeridos, verificar
  if (allowedRoles.length > 0) {
    const userRole = user?.rol_nombre;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      console.warn(`⚠️ Acceso denegado. Rol requerido: ${allowedRoles.join(', ')}, Rol actual: ${userRole}`);
      
      return (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          minHeight: '60vh'
        }}>
          <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>
            ⛔ Acceso Denegado
          </h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            No tienes permisos para acceder a esta sección.
          </p>
          <p style={{ fontSize: '14px', color: '#999' }}>
            Rol actual: <strong>{userRole || 'Desconocido'}</strong><br />
            Roles permitidos: <strong>{allowedRoles.join(', ')}</strong>
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              marginTop: '2rem',
              padding: '10px 24px',
              background: '#007bff',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Volver al inicio
          </a>
        </div>
      );
    }
  }

  // Usuario autenticado y con rol permitido
  return children;
};

export default ProtectedRoute;