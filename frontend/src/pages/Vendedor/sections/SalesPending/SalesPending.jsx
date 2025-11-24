// C:\qhatu\frontend\src\pages\Vendedor\sections\SalesPending\SalesPending.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { useSocket } from '../../../../hooks/useSocket';
import { obtenerVentasPendientes } from '../../../../services/ventasService';
import SaleCard from './components/SaleCard';
import './SalesPending.css';

// SVG Icons
const Icons = {
  Package: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  CheckCircle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Zap: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  DollarSign: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  MessageCircle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  AlertCircle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  RefreshCw: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36" />
    </svg>
  ),
  X: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Wifi: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.94 0M12 20h.01" />
    </svg>
  ),
  WifiOff: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10 10 0 0 0 5 12.55" />
      <path d="M5 12.55v.01" />
      <path d="M21.17 16.98a10 10 0 0 0-9.16-9.4" />
      <path d="M9.13 9.13A6 6 0 0 0 5.56 15.56" />
      <path d="M18.44 18.44a6 6 0 0 0-8.87-8.87" />
    </svg>
  ),
};

const SalesPending = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket(user);

  const [ventas, setVentas] = useState([]);
  const [totales, setTotales] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pendiente');
  const [notificacion, setNotificacion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const audioRef = useRef(null);
  const notificationTimeoutRef = useRef(null);

  const cargarVentas = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Cargando ventas pendientes...');
      const response = await obtenerVentasPendientes({ limite: 100 });

      if (response.success) {
        console.log(`${response.data.length} ventas cargadas`);
        setVentas(response.data);
        setTotales(response.totales);
      } else {
        throw new Error(response.message || 'Error al cargar ventas');
      }
    } catch (err) {
      console.error('Error al cargar ventas:', err);
      setError(err.message || 'Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  const reproducirSonido = () => {
    try {
      if (audioRef.current) {
        audioRef.current.play().catch(e => {
          console.log('No se pudo reproducir audio personalizado');
        });
      } else {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
        
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.5);
      }
    } catch (e) {
      console.log('No se pudo reproducir sonido');
    }
  };

  const mostrarNotificacionEscritorio = (venta) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Nueva Venta - ${venta.numero_venta}`, {
        body: `Cliente: ${venta.cliente_nombre}\nTotal: S/.${parseFloat(venta.total).toFixed(2)}`,
        icon: '/logo-oe.png',
        tag: `venta-${venta.venta_id}`,
        requireInteraction: true
      });
    }
  };

  useEffect(() => {
    cargarVentas();

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Permiso de notificaciones:', permission);
      });
    }

    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('Socket no conectado');
      return;
    }

    console.log('Socket conectado, escuchando eventos...');

    socket.on('nueva-venta-pendiente', (data) => {
      console.log('Nueva venta recibida:', data);

      const nuevaVenta = {
        venta_id: data.venta_id,
        numero_venta: data.numero_venta,
        cliente_nombre: data.cliente_nombre,
        cliente_telefono: data.cliente_telefono,
        total: parseFloat(data.total),
        estado: 'pendiente',
        fecha_venta: data.fecha || new Date().toISOString(),
        items: [],
        enviado_whatsapp: data.enviado_whatsapp || false
      };

      setVentas(prevVentas => [nuevaVenta, ...prevVentas]);

      setTotales(prevTotales => ({
        ...prevTotales,
        total_pendientes: (prevTotales.total_pendientes || 0) + 1,
        monto_total: (parseFloat(prevTotales.monto_total || 0) + parseFloat(data.total)).toFixed(2),
        enviados_whatsapp: data.enviado_whatsapp 
          ? (prevTotales.enviados_whatsapp || 0) + 1 
          : prevTotales.enviados_whatsapp
      }));

      setNotificacion({
        tipo: 'nueva',
        titulo: `Nueva Venta ${data.numero_venta}`,
        mensaje: `Cliente: ${data.cliente_nombre}`,
        detalle: `Total: S/.${parseFloat(data.total).toFixed(2)} - ${data.items_count} producto(s)`,
        venta: nuevaVenta
      });

      reproducirSonido();
      mostrarNotificacionEscritorio(nuevaVenta);

      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
      notificationTimeoutRef.current = setTimeout(() => {
        setNotificacion(null);
      }, 8000);
    });

    socket.on('venta-confirmada', (data) => {
      console.log('Venta confirmada:', data.numero_venta);

      setVentas(prevVentas => 
        prevVentas.map(v => 
          v.venta_id === data.venta_id 
            ? { ...v, estado: 'confirmada' }
            : v
        )
      );

      setTotales(prevTotales => ({
        ...prevTotales,
        total_pendientes: Math.max((prevTotales.total_pendientes || 0) - 1, 0),
        total_confirmadas: (prevTotales.total_confirmadas || 0) + 1
      }));

      setNotificacion({
        tipo: 'confirmada',
        titulo: 'Venta Confirmada',
        mensaje: `${data.numero_venta} confirmada exitosamente`,
        detalle: null
      });

      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
      notificationTimeoutRef.current = setTimeout(() => {
        setNotificacion(null);
      }, 3000);
    });

    socket.on('stock-actualizado', (data) => {
      console.log('Stock actualizado:', data);
    });

    return () => {
      console.log('Desconectando listeners de Socket.IO');
      socket.off('nueva-venta-pendiente');
      socket.off('venta-confirmada');
      socket.off('stock-actualizado');
    };
  }, [socket, isConnected]);

  const ventasFiltradas = ventas.filter(venta => {
    const cumpleEstado = filter === 'todas' || venta.estado === filter;
    const cumpleBusqueda = !searchTerm || 
      venta.numero_venta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venta.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase());
    return cumpleEstado && cumpleBusqueda;
  });

  const handleVentaConfirmada = () => {
    console.log('Venta confirmada, recargando lista...');
    cargarVentas();
  };

  const cerrarNotificacion = () => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotificacion(null);
  };

  return (
    <div className="sales-pending">
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

      {/* Header Principal */}
      <div className="sales-pending-header">
        <div className="header-top">
          <div className="header-title">
            <div className="title-icon">{Icons.Package}</div>
            <div>
              <h1>Ventas Pendientes</h1>
              <p>Gestiona tus ventas en tiempo real</p>
            </div>
          </div>

          {/* Indicador de conexión */}
          <div className={`socket-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="socket-icon">
              {isConnected ? Icons.Wifi : Icons.WifiOff}
            </span>
            <span className="socket-text">
              {isConnected ? 'En línea' : 'Desconectado'}
            </span>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="sales-stats">
          <div className="stat-card stat-pending">
            <div className="stat-icon-wrapper">{Icons.Clock}</div>
            <div className="stat-content">
              <span className="stat-label">Pendientes</span>
              <span className="stat-value">{totales.total_pendientes || 0}</span>
            </div>
          </div>

          <div className="stat-card stat-confirmed">
            <div className="stat-icon-wrapper">{Icons.CheckCircle}</div>
            <div className="stat-content">
              <span className="stat-label">Confirmadas</span>
              <span className="stat-value">{totales.total_confirmadas || 0}</span>
            </div>
          </div>

          <div className="stat-card stat-processing">
            <div className="stat-icon-wrapper">{Icons.Zap}</div>
            <div className="stat-content">
              <span className="stat-label">Procesando</span>
              <span className="stat-value">{totales.total_procesando || 0}</span>
            </div>
          </div>

          <div className="stat-card stat-money">
            <div className="stat-icon-wrapper">{Icons.DollarSign}</div>
            <div className="stat-content">
              <span className="stat-label">Total</span>
              <span className="stat-value">S/.{totales.monto_total || '0.00'}</span>
            </div>
          </div>

          <div className="stat-card stat-whatsapp">
            <div className="stat-icon-wrapper">{Icons.MessageCircle}</div>
            <div className="stat-content">
              <span className="stat-label">WhatsApp</span>
              <span className="stat-value">{totales.enviados_whatsapp || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notificación Flotante */}
      {notificacion && (
        <div className={`notification notification-${notificacion.tipo}`}>
          <div className="notification-icon-wrapper">
            <span className="notification-icon">
              {notificacion.tipo === 'nueva' ? Icons.Bell : Icons.CheckCircle}
            </span>
          </div>
          
          <div className="notification-content">
            <p className="notification-title">{notificacion.titulo}</p>
            <p className="notification-message">{notificacion.mensaje}</p>
            {notificacion.detalle && (
              <p className="notification-detail">{notificacion.detalle}</p>
            )}
          </div>

          <button 
            className="notification-close"
            onClick={cerrarNotificacion}
            title="Cerrar"
          >
            {Icons.X}
          </button>
        </div>
      )}

      {/* Controles */}
      <div className="sales-controls">
        {/* Buscador */}
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por número de venta o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtros */}
        <div className="sales-filters">
          <button
            className={`filter-btn ${filter === 'pendiente' ? 'active' : ''}`}
            onClick={() => setFilter('pendiente')}
          >
            {Icons.Clock}
            <span>Pendientes</span>
            <span className="filter-count">{totales.total_pendientes || 0}</span>
          </button>

          <button
            className={`filter-btn ${filter === 'confirmada' ? 'active' : ''}`}
            onClick={() => setFilter('confirmada')}
          >
            {Icons.CheckCircle}
            <span>Confirmadas</span>
            <span className="filter-count">{totales.total_confirmadas || 0}</span>
          </button>

          <button
            className={`filter-btn ${filter === 'procesando' ? 'active' : ''}`}
            onClick={() => setFilter('procesando')}
          >
            {Icons.Zap}
            <span>Procesando</span>
            <span className="filter-count">{totales.total_procesando || 0}</span>
          </button>

          <button
            className={`filter-btn ${filter === 'todas' ? 'active' : ''}`}
            onClick={() => setFilter('todas')}
          >
            {Icons.Package}
            <span>Todas</span>
            <span className="filter-count">{ventas.length}</span>
          </button>

          <button
            className="btn-refresh"
            onClick={cargarVentas}
            disabled={loading}
            title="Recargar ventas"
          >
            <span className={loading ? 'spin' : ''}>{Icons.RefreshCw}</span>
            <span>Actualizar</span>
          </button>
        </div>
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
            <span className="error-icon">{Icons.AlertCircle}</span>
            <h3>Error al cargar ventas</h3>
            <p>{error}</p>
            <button className="btn-retry" onClick={cargarVentas}>
              {Icons.RefreshCw} Reintentar
            </button>
          </div>
        ) : ventasFiltradas.length === 0 ? (
          <div className="sales-empty">
            <span className="empty-icon">{Icons.Package}</span>
            <h3>No hay ventas {filter !== 'todas' ? filter + 's' : ''}</h3>
            <p>Las nuevas ventas aparecerán aquí automáticamente en tiempo real</p>
            {!isConnected && (
              <div className="empty-warning">
                <span>{Icons.AlertCircle}</span>
                <p>Socket desconectado. Las notificaciones en tiempo real no funcionarán.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="sales-grid">
            {ventasFiltradas.map((venta) => (
              <SaleCard
                key={`venta-${venta.venta_id}-${venta.numero_venta}`}
                venta={venta}
                onConfirm={handleVentaConfirmada}
              />
            ))}
          </div>
        )}
      </div>

      {/* Indicador de actualización en tiempo real */}
      {isConnected && ventas.length > 0 && (
        <div className="realtime-indicator">
          <span className="pulse-dot" />
          <span>Actualizando en tiempo real</span>
        </div>
      )}
    </div>
  );
};

export default SalesPending;