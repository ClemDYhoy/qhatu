// frontend/src/pages/Vendedor/VendedorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Servicios centralizados (gracias a nuestro nuevo index.js)
import { authService, analyticsService, api } from '@/services';

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
  const [activeSection, setActiveSection] = useState('inicio');

  // Estadísticas en tiempo real desde el backend
  const [stats, setStats] = useState({
    carritosHoy: 0,
    ventasHoy: 0,
    ingresosHoy: 0,
    tasaConversion: 0,
    clientesAtendidos: 0,
    comision: 0,
  });

  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // Verificar autenticación y rol
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (currentUser.rol_nombre !== 'vendedor') {
      navigate('/');
      return;
    }

    setUser(currentUser);
    setLoading(false);
  }, [navigate]);

  // Cargar estadísticas con analyticsService (el bueno)
  const cargarEstadisticas = async () => {
    if (!user) return;

    setStatsLoading(true);
    setStatsError(null);

    try {
      const resultado = await analyticsService.obtenerMiRendimiento('hoy');

      if (resultado.success && resultado.data) {
        setStats({
          carritosHoy: resultado.data.carritosHoy || 0,
          ventasHoy: resultado.data.ventasHoy || 0,
          ingresosHoy: resultado.data.ingresosHoy || 0,
          tasaConversion: resultado.data.tasaConversion || 0,
          clientesAtendidos: resultado.data.clientesAtendidos || 0,
          comision: Number(resultado.data.comision) || 0,
        });
      } else {
        throw new Error(resultado.error || 'Datos no disponibles');
      }
    } catch (err) {
      console.warn('analyticsService falló, usando fallback:', err.message);

      // Fallback realista para desarrollo / demo
      setStats({
        carritosHoy: 12,
        ventasHoy: 8,
        ingresosHoy: 485.00,
        tasaConversion: 78,
        clientesAtendidos: 5,
        comision: 72.75,
      });

      setStatsError('Estadísticas en modo demo');
    } finally {
      setStatsLoading(false);
    }
  };

  // Cargar estadísticas al montar y cada 2 minutos
  useEffect(() => {
    if (user) {
      cargarEstadisticas();
      const interval = setInterval(cargarEstadisticas, 120000); // 2 min
      return () => clearInterval(interval);
    }
  }, [user]);

  // Renderizar contenido según sección activa
  const renderContent = () => {
    switch (activeSection) {
      case 'inicio':
        return (
          <DashboardOverview
            stats={stats}
            statsLoading={statsLoading}
            statsError={statsError}
            setActiveSection={setActiveSection}
          />
        );
      case 'ventas-pendientes':
        return <SalesPending onVentaConfirmada={cargarEstadisticas} />;
      case 'historial':
        return <Historial />;
      case 'analytics':
        return <Analytics />;
      case 'inventario':
        return <InventarioAlertas />;
      case 'ia-asistente':
        return <IAAsistente />;
      default:
        return <DashboardOverview stats={stats} statsLoading={statsLoading} />;
    }
  };

  // Pantalla de carga inicial
  if (loading) {
    return (
      <div className="vendedor-loading">
        <div className="spinner"></div>
        <p>Cargando tu dashboard de vendedor...</p>
      </div>
    );
  }

  return (
    <div className="vendedor-dashboard-container">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        user={user}
      />

      {/* Contenido principal */}
      <div className="vendedor-main-content">
        <NavBar user={user} stats={stats} statsLoading={statsLoading} />

        <main className="vendedor-content-area">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default VendedorDashboard;