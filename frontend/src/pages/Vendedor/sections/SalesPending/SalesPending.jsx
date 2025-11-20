// C:\qhatu\frontend\src\pages\Vendedor\sections\SalesPending\SalesPending.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { useSocket } from '../../../../hooks/useSocket';
import { obtenerVentasPendientes } from '../../../../services/ventasService';
import SaleCard from './components/SaleCard';

/**
 * 📦 Panel de Ventas Pendientes (Vendedor)
 * Con notificaciones en tiempo real via Socket.IO
 */
const SalesPending = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket(user);

  const [ventas, setVentas] = useState([]);
  const [totales, setTotales] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pendiente'); // pendiente | confirmada | todas
  const [notificacion, setNotificacion] = useState(null);

  /**
   * Cargar ventas pendientes
   */
  const cargarVentas = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await obtenerVentasPendientes();

      if (response.success) {
        setVentas(response.data);
        setTotales(response.totales);
      }
    } catch (err) {
      console.error('Error al cargar ventas:', err);
      setError(err.message || 'Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Efecto inicial: cargar ventas
   */
  useEffect(() => {
    cargarVentas();
  }, []);

  /**
   * Efecto Socket.IO: escuchar nuevas ventas
   */
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Nueva venta pendiente
    socket.on('nueva-venta-pendiente', (data) => {
      console.log('🔔 Nueva venta recibida:', data);

      // Mostrar notificación
      setNotificacion({
        tipo: 'nueva',
        mensaje: `¡Nueva venta ${data.numero_venta}!`,
        venta: data
      });

      // Recargar lista
      cargarVentas();

      // Ocultar notificación después de 5 segundos
      setTimeout(() => setNotificacion(null), 5000);

      // Reproducir sonido (opcional)
      try {
        new Audio('/notification.mp3').play();
      } catch (e) {
        console.log('No se pudo reproducir sonido');
      }
    });

    // Venta confirmada
    socket.on('venta-confirmada', (data) => {
      console.log('✅ Venta confirmada:', data);
      
      setNotificacion({
        tipo: 'confirmada',
        mensaje: `Venta ${data.numero_venta} confirmada`,
        venta: data
      });

      cargarVentas();

      setTimeout(() => setNotificacion(null), 3000);
    });

    // Cleanup
    return () => {
      socket.off('nueva-venta-pendiente');
      socket.off('venta-confirmada');
    };
  }, [socket, isConnected]);

  /**
   * Filtrar ventas según estado
   */
  const ventasFiltradas = ventas.filter(venta => {
    if (filter === 'todas') return true;
    return venta.estado === filter;
  });

  /**
   * Manejar confirmación de venta
   */
  const handleVentaConfirmada = () => {
    cargarVentas();
  };

  return (
    <div className="sales-pending">
      {/* Header */}
      <div className="sales-pending-header">
        <div className="sales-pending-title">
          <h1>📦 Ventas Pendientes</h1>
          
          {/* Indicador de conexión Socket.IO */}
          <div className={`socket-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="socket-indicator" />
            <span>{isConnected ? 'En línea' : 'Desconectado'}</span>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="sales-stats">
          <div className="stat-card">
            <span className="stat-icon">⏳</span>
            <div className="stat-info">
              <span className="stat-value">{totales.total_pendientes || 0}</span>
              <span className="stat-label">Pendientes</span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <div className="stat-info">
              <span className="stat-value">{totales.total_confirmadas || 0}</span>
              <span className="stat-label">Confirmadas</span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">💰</span>
            <div className="stat-info">
              <span className="stat-value">S/.{totales.monto_total || '0.00'}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">📱</span>
            <div className="stat-info">
              <span className="stat-value">{totales.enviados_whatsapp || 0}</span>
              <span className="stat-label">WhatsApp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notificación flotante */}
      {notificacion && (
        <div className={`notification ${notificacion.tipo}`}>
          <span className="notification-icon">
            {notificacion.tipo === 'nueva' ? '🔔' : '✅'}
          </span>
          <div className="notification-content">
            <p className="notification-message">{notificacion.mensaje}</p>
            {notificacion.venta && (
              <p className="notification-detail">
                Cliente: {notificacion.venta.cliente_nombre} - 
                Total: S/.{notificacion.venta.total}
              </p>
            )}
          </div>
          <button 
            className="notification-close"
            onClick={() => setNotificacion(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="sales-filters">
        <button
          className={`filter-btn ${filter === 'pendiente' ? 'active' : ''}`}
          onClick={() => setFilter('pendiente')}
        >
          ⏳ Pendientes ({totales.total_pendientes || 0})
        </button>

        <button
          className={`filter-btn ${filter === 'confirmada' ? 'active' : ''}`}
          onClick={() => setFilter('confirmada')}
        >
          ✅ Confirmadas ({totales.total_confirmadas || 0})
        </button>

        <button
          className={`filter-btn ${filter === 'procesando' ? 'active' : ''}`}
          onClick={() => setFilter('procesando')}
        >
          📦 Procesando ({totales.total_procesando || 0})
        </button>

        <button
          className={`filter-btn ${filter === 'todas' ? 'active' : ''}`}
          onClick={() => setFilter('todas')}
        >
          📋 Todas ({ventas.length})
        </button>

        <button
          className="btn-refresh"
          onClick={cargarVentas}
          disabled={loading}
        >
          {loading ? '🔄' : '🔃'} Actualizar
        </button>
      </div>

      {/* Lista de ventas */}
      <div className="sales-list">
        {loading && ventas.length === 0 ? (
          <div className="sales-loading">
            <div className="spinner" />
            <p>Cargando ventas...</p>
          </div>
        ) : error ? (
          <div className="sales-error">
            <span>⚠️</span>
            <p>{error}</p>
            <button onClick={cargarVentas}>Reintentar</button>
          </div>
        ) : ventasFiltradas.length === 0 ? (
          <div className="sales-empty">
            <span>📦</span>
            <h3>No hay ventas {filter !== 'todas' ? filter + 's' : ''}</h3>
            <p>Las nuevas ventas aparecerán aquí automáticamente</p>
          </div>
        ) : (
          <div className="sales-grid">
            {ventasFiltradas.map((venta) => (
              <SaleCard
                key={venta.venta_id}
                venta={venta}
                onConfirm={handleVentaConfirmada}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesPending;

/**
 * 🎨 GUÍA DE CSS
 * 
 * Contenedor principal:
 * - .sales-pending: padding, max-width, margin auto
 * 
 * Header:
 * - .sales-pending-header: mb-6
 * - .sales-pending-title: flex between, items-center, mb-4
 * - .socket-status: flex gap-2, items-center, text-sm
 * - .socket-indicator: width 8px, height 8px, rounded-full
 * - .socket-status.connected .socket-indicator: bg-green-500, animate-pulse
 * - .socket-status.disconnected .socket-indicator: bg-red-500
 * 
 * Stats:
 * - .sales-stats: grid 4 columnas, gap-4, mb-6
 * - .stat-card: bg-white, rounded, shadow, p-4, flex gap-3
 * - .stat-icon: text-3xl
 * - .stat-info: flex-col
 * - .stat-value: text-2xl, font-bold
 * - .stat-label: text-sm, text-gray-600
 * 
 * Notificación:
 * - .notification: fixed top-4 right-4, bg-white, shadow-lg, rounded, p-4
 * - .notification.nueva: border-l-4 border-blue-500
 * - .notification.confirmada: border-l-4 border-green-500
 * - .notification: flex gap-3, items-start, z-50, animate-slideInRight
 * - .notification-icon: text-2xl
 * - .notification-message: font-semibold
 * - .notification-detail: text-sm, text-gray-600
 * - .notification-close: ml-auto, hover:bg-gray-100
 * 
 * Filtros:
 * - .sales-filters: flex gap-2, mb-4, flex-wrap
 * - .filter-btn: px-4, py-2, rounded, border, hover:bg-gray-50
 * - .filter-btn.active: bg-blue-500, text-white, border-blue-500
 * - .btn-refresh: ml-auto, bg-green-500, text-white
 * 
 * Lista:
 * - .sales-list: min-height 400px
 * - .sales-grid: grid 2-3 columnas (responsive), gap-4
 * - .sales-loading: centrado, flex-col, gap-2
 * - .sales-error: centrado, bg-red-50, p-6, rounded
 * - .sales-empty: centrado, text-gray-400, p-8
 * 
 * Responsive:
 * - Mobile: .sales-stats grid 2 columnas, .sales-grid 1 columna
 * - Tablet: .sales-stats grid 2 columnas, .sales-grid 2 columnas
 * - Desktop: .sales-stats grid 4 columnas, .sales-grid 3 columnas
 * 
 * Animaciones:
 * - @keyframes slideInRight: from translateX(100%), to translateX(0)
 */