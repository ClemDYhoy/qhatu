// C:\qhatu\frontend\src\pages\Admin\AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

// Componentes compartidos
import Sidebar from './components/Sidebar';

// Secciones principales
import Dashboard from './sections/Dashboard/Dashboard';
import Inventory from './sections/Inventory/Inventory';
import AIReports from './sections/AIReports/AIReports';
import Management from './sections/Management/Management';

import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  // ====================================
  // 🔐 VERIFICACIÓN DE AUTENTICACIÓN
  // ====================================
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    
    console.log('🔍 Verificando autenticación en AdminDashboard...');
    console.log('👤 Usuario actual:', currentUser);
    
    if (!currentUser) {
      console.log('❌ No hay usuario, redirigiendo a /login');
      navigate('/login');
      return;
    }
    
    if (currentUser.rol_nombre !== 'super_admin') {
      console.log('❌ Usuario no es super_admin, redirigiendo a:', authService.getRedirectRoute(currentUser.rol_nombre));
      navigate(authService.getRedirectRoute(currentUser.rol_nombre));
      return;
    }
    
    console.log('✅ Acceso permitido a AdminDashboard');
    setUser(currentUser);
    setLoading(false);
  }, [navigate]);

  // ====================================
  // 🚪 CERRAR SESIÓN
  // ====================================
  const handleLogout = async () => {
    console.log('🚪 Cerrando sesión...');
    if (window.confirm('¿Cerrar sesión?')) {
      await authService.logout();
      navigate('/login');
    }
  };

  // ====================================
  // 📄 CAMBIAR SECCIÓN ACTIVA
  // ====================================
  const handleSectionChange = (sectionId) => {
    console.log('📄 Cambiando a sección:', sectionId);
    setActiveSection(sectionId);
  };

  // ====================================
  // 🎨 RENDER - LOADING
  // ====================================
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner-large"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  // ====================================
  // 🎨 RENDER - DASHBOARD INTEGRADO
  // ====================================
  return (
    <div className="admin-dashboard-container">
      {/* Sidebar de Navegación */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        user={user}
        onLogout={handleLogout}
      />

      {/* Contenido Principal */}
      <main className="admin-main-content">
        {/* Renderizar sección activa */}
        {activeSection === 'dashboard' && <Dashboard />}
        {activeSection === 'inventory' && <Inventory />}
        {activeSection === 'ai-reports' && <AIReports />}
        {activeSection === 'management' && <Management />}
      </main>
    </div>
  );
};

export default AdminDashboard;