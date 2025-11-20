
// C:\qhatu\frontend\src\pages\Vendedor\sections\Historial\Historial.jsx
// Componente para visualizar el historial completo de ventas del vendedor
// Incluye filtros por fecha, búsqueda por cliente y vista de detalles
// Muestra estadísticas generales y permite ver historial detallado de cada venta

import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import VentaHistorial from './components/VentaHistorial';
import ClienteHistorial from './components/ClienteHistorial';

const Historial = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ventas'); // 'ventas' o 'clientes'
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'

  useEffect(() => {
    loadHistorial();
  }, []);

  const loadHistorial = async () => {
    setLoading(true);
    try {
      const response = await api.get('/ventas/mis-ventas');
      setVentas(response.data);
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar ventas según búsqueda y fecha
  const filteredVentas = ventas.filter(venta => {
    const matchSearch = venta.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        venta.numero_venta?.toString().includes(searchTerm);
    
    if (!matchSearch) return false;

    const ventaDate = new Date(venta.fecha_venta);
    const today = new Date();
    
    switch(dateFilter) {
      case 'today':
        return ventaDate.toDateString() === today.toDateString();
      case 'week':
        const weekAgo = new Date(today.setDate(today.getDate() - 7));
        return ventaDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
        return ventaDate >= monthAgo;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Cargando historial...</p>
      </div>
    );
  }

  return (
    <div className="historial-container">
      <div className="section-header">
        <div>
          <h2>📊 Historial de Ventas</h2>
          <p className="section-subtitle">{ventas.length} ventas realizadas</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'ventas' ? 'active' : ''}`}
          onClick={() => setActiveTab('ventas')}
        >
          🛍️ Ventas
        </button>
        <button 
          className={`tab-btn ${activeTab === 'clientes' ? 'active' : ''}`}
          onClick={() => setActiveTab('clientes')}
        >
          👥 Clientes
        </button>
      </div>

      {/* Filtros */}
      <div className="filters-container">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por cliente o número de venta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="date-filters">
          <button 
            className={`filter-btn ${dateFilter === 'all' ? 'active' : ''}`}
            onClick={() => setDateFilter('all')}
          >
            Todo
          </button>
          <button 
            className={`filter-btn ${dateFilter === 'today' ? 'active' : ''}`}
            onClick={() => setDateFilter('today')}
          >
            Hoy
          </button>
          <button 
            className={`filter-btn ${dateFilter === 'week' ? 'active' : ''}`}
            onClick={() => setDateFilter('week')}
          >
            Esta semana
          </button>
          <button 
            className={`filter-btn ${dateFilter === 'month' ? 'active' : ''}`}
            onClick={() => setDateFilter('month')}
          >
            Este mes
          </button>
        </div>
      </div>

      {/* Contenido según tab activo */}
      <div className="tab-content">
        {activeTab === 'ventas' ? (
          <VentaHistorial ventas={filteredVentas} />
        ) : (
          <ClienteHistorial ventas={ventas} />
        )}
      </div>
    </div>
  );
};

export default Historial;