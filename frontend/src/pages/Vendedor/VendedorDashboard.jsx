// C:\qhatu\frontend\src\pages\Vendedor\VendedorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import api from '../../services/api';

import Sidebar from './sections/Sidebar';
import NavBar from './sections/NavBar';
import SalesPending from './sections/SalesPending/SalesPending';
import Historial from './sections/Historial/Historial';
import InventarioAlertas from './sections/InventarioAlertas/InventarioAlertas';
import IAAsistente from './sections/IAAsistente/IAAsistente';
import Analytics from './sections/Analytics/Analytics';
import DashboardOverview from './sections/DashboardOverview/DashboardOverview';

import './VendedorDashboard.css';

const VendedorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('inicio'); // ← Nueva sección inicio

  const [stats, setStats] = useState({
    carritosHoy: 7,
    ventasHoy: 23,
    totalVentas: 5890,
    comision: 294.50,
  });

  // Verificación de autenticación y rol
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return navigate('/login');
    if (currentUser.rol_nombre !== 'vendedor') return navigate('/');

    setUser(currentUser);
    setLoading(false);
  }, [navigate]);

  // Cargar estadísticas con refresco automático
  const loadStats = async () => {
    try {
      const response = await api.get('/analytics/vendedor-stats');
      setStats(response.data || {
        carritosHoy: 0,
        ventasHoy: 0,
        totalVentas: 0,
        comision: 0,
      });
    } catch (error) {
      console.warn('Endpoint /analytics/vendedor-stats no existe aún (404). Usando datos por defecto.');
      // ← DATOS DE PRUEBA PARA QUE SE VEA ALGO
      setStats({
        carritosHoy: 7,
        ventasHoy: 23,
        totalVentas: 5890,
        comision: 294.50,
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadStats();
      const interval = setInterval(loadStats, 120000); // Cada 2 minutos
      return () => clearInterval(interval);
    }
  }, [user]);



  const renderContent = () => {
    switch (activeSection) {
      case 'inicio':
        return <DashboardOverview setActiveSection={setActiveSection} />;
      case 'ventas-pendientes':
        return <SalesPending loadStats={loadStats} />; // ← Para refrescar al confirmar venta
      case 'historial':
        return <Historial />;
      case 'analytics':
        return <Analytics />;
      case 'inventario':
        return <InventarioAlertas />;
      case 'ia-asistente':
        return <IAAsistente />;
      default:
        return <DashboardOverview />;
    }
  };

  if (loading) {
    return (
      <div className="vendedor-loading">
        <div className="spinner"></div>
        <p>Cargando tu dashboard...</p>
      </div>
    );
  }

  return (
    <div className="vendedor-dashboard-container">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        user={user}
      />

      <div className="vendedor-main-content">
        <NavBar user={user} stats={stats} />

        <main className="vendedor-content-area">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default VendedorDashboard;