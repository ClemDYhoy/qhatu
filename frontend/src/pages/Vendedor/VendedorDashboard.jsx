// C:\qhatu\frontend\src\pages\Vendedor\VendedorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import api from '../../services/api';
import './VendedorDashboard.css';

const VendedorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('carritos');
  
  // Estados
  const [carritos, setCarritos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [stats, setStats] = useState({
    carritosHoy: 0,
    ventasHoy: 0,
    totalVentas: 0,
    comision: 0
  });
  
  const [selectedCarrito, setSelectedCarrito] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Iconos
  const Icon = {
    ShoppingCart: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
    CheckCircle: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    DollarSign: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    Package: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
    Eye: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    Edit: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
    MessageCircle: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    LogOut: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
    )
  };

  // Verificar autenticación
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
    loadData();
  }, [navigate]);

  // Cargar datos
  const loadData = async () => {
    setLoading(true);
    try {
      const [carritosRes, ventasRes, statsRes] = await Promise.all([
        api.get('/carritos/pendientes'),
        api.get('/ventas/mis-ventas'),
        api.get('/analytics/vendedor-stats')
      ]);

      setCarritos(carritosRes.data);
      setVentas(ventasRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ver detalles del carrito
  const handleViewCarrito = async (carrito) => {
    try {
      const response = await api.get(`/carritos/${carrito.carrito_id}/detalle`);
      setSelectedCarrito(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error cargando carrito:', error);
    }
  };

  // Confirmar venta
  const handleConfirmarVenta = async (carritoId) => {
    if (!window.confirm('¿Confirmar esta venta? Se actualizará el inventario.')) return;
    
    try {
      await api.post(`/ventas/confirmar`, { carrito_id: carritoId });
      alert('✅ Venta confirmada exitosamente');
      loadData();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error confirmando venta:', error);
      alert('❌ Error al confirmar venta');
    }
  };

  // Modificar carrito
  const handleModificarCarrito = (carrito) => {
    navigate(`/vendedor/editar-carrito/${carrito.carrito_id}`);
  };

  // Contactar cliente por WhatsApp
  const handleContactarCliente = (carrito) => {
    const mensaje = `Hola ${carrito.cliente_nombre}, soy ${user.nombre_completo} de Qhatu. Te contacto sobre tu pedido #${carrito.carrito_id}`;
    const url = `https://wa.me/51${carrito.cliente_telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  // Cerrar sesión
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="vendedor-loading">
        <div className="spinner-large"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="vendedor-dashboard">
      {/* Sidebar */}
      <aside className="vendedor-sidebar">
        <div className="vendedor-sidebar-header">
          <h2>🛒 Panel Vendedor</h2>
          <p className="vendedor-user-info">{user?.nombre_completo || user?.email}</p>
        </div>

        <nav className="vendedor-nav">
          <button 
            className={`vendedor-nav-item ${activeTab === 'carritos' ? 'active' : ''}`}
            onClick={() => setActiveTab('carritos')}
          >
            <Icon.ShoppingCart />
            <span>Carritos Pendientes</span>
          </button>
          
          <button 
            className={`vendedor-nav-item ${activeTab === 'ventas' ? 'active' : ''}`}
            onClick={() => setActiveTab('ventas')}
          >
            <Icon.CheckCircle />
            <span>Mis Ventas</span>
          </button>
        </nav>

        <button className="vendedor-logout-btn" onClick={handleLogout}>
          <Icon.LogOut />
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="vendedor-main">
        {/* Header */}
        <header className="vendedor-header">
          <h1>
            {activeTab === 'carritos' ? 'Carritos Pendientes' : 'Mis Ventas'}
          </h1>
        </header>

        {/* Stats */}
        <div className="vendedor-stats">
          <div className="stat-card stat-primary">
            <div className="stat-icon"><Icon.ShoppingCart /></div>
            <div className="stat-info">
              <p className="stat-label">Carritos Hoy</p>
              <h3 className="stat-value">{stats.carritosHoy || 0}</h3>
            </div>
          </div>

          <div className="stat-card stat-success">
            <div className="stat-icon"><Icon.CheckCircle /></div>
            <div className="stat-info">
              <p className="stat-label">Ventas Hoy</p>
              <h3 className="stat-value">{stats.ventasHoy || 0}</h3>
            </div>
          </div>

          <div className="stat-card stat-info">
            <div className="stat-icon"><Icon.DollarSign /></div>
            <div className="stat-info">
              <p className="stat-label">Total Ventas</p>
              <h3 className="stat-value">S/ {stats.totalVentas?.toFixed(2) || '0.00'}</h3>
            </div>
          </div>

          <div className="stat-card stat-warning">
            <div className="stat-icon"><Icon.Package /></div>
            <div className="stat-info">
              <p className="stat-label">Comisión</p>
              <h3 className="stat-value">S/ {stats.comision?.toFixed(2) || '0.00'}</h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="vendedor-content">
          {activeTab === 'carritos' && (
            <div className="carritos-list">
              {carritos.length === 0 ? (
                <div className="empty-state">
                  <Icon.ShoppingCart />
                  <p>No hay carritos pendientes</p>
                </div>
              ) : (
                carritos.map(carrito => (
                  <div key={carrito.carrito_id} className="carrito-card">
                    <div className="carrito-header">
                      <h3>Carrito #{carrito.carrito_id}</h3>
                      <span className="carrito-date">
                        {new Date(carrito.creado_en).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="carrito-body">
                      <div className="carrito-info">
                        <p><strong>Cliente:</strong> {carrito.cliente_nombre || 'Anónimo'}</p>
                        <p><strong>Email:</strong> {carrito.cliente_email || '-'}</p>
                        <p><strong>Teléfono:</strong> {carrito.cliente_telefono || '-'}</p>
                        <p><strong>Items:</strong> {carrito.total_items || 0}</p>
                      </div>

                      <div className="carrito-total">
                        <p className="total-label">Total</p>
                        <p className="total-value">S/ {carrito.total?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>

                    <div className="carrito-actions">
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleViewCarrito(carrito)}
                      >
                        <Icon.Eye /> Ver Detalle
                      </button>
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleModificarCarrito(carrito)}
                      >
                        <Icon.Edit /> Modificar
                      </button>
                      <button 
                        className="btn btn-sm btn-success"
                        onClick={() => handleContactarCliente(carrito)}
                      >
                        <Icon.MessageCircle /> WhatsApp
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'ventas' && (
            <div className="table-container">
              <table className="vendedor-table">
                <thead>
                  <tr>
                    <th>ID Venta</th>
                    <th>Cliente</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map(venta => (
                    <tr key={venta.venta_id}>
                      <td>#{venta.numero_venta}</td>
                      <td>{venta.cliente_nombre}</td>
                      <td>{venta.total_items || 0}</td>
                      <td>S/ {venta.total}</td>
                      <td>
                        <span className={`badge badge-${venta.estado}`}>
                          {venta.estado}
                        </span>
                      </td>
                      <td>{new Date(venta.fecha_venta).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-sm btn-primary">Ver</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Detalle Carrito */}
      {showDetailModal && selectedCarrito && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalle del Carrito #{selectedCarrito.carrito_id}</h3>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="carrito-detalle-info">
                <h4>Información del Cliente</h4>
                <p><strong>Nombre:</strong> {selectedCarrito.cliente_nombre}</p>
                <p><strong>Email:</strong> {selectedCarrito.cliente_email}</p>
                <p><strong>Teléfono:</strong> {selectedCarrito.cliente_telefono}</p>
                <p><strong>Dirección:</strong> {selectedCarrito.direccion || '-'}</p>
              </div>

              <div className="carrito-detalle-items">
                <h4>Productos</h4>
                {selectedCarrito.items?.map(item => (
                  <div key={item.item_id} className="detalle-item">
                    <div className="item-info">
                      <p className="item-nombre">{item.producto_nombre}</p>
                      <p className="item-cantidad">Cantidad: {item.cantidad}</p>
                    </div>
                    <p className="item-precio">S/ {item.subtotal?.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="carrito-detalle-total">
                <p><strong>Subtotal:</strong> S/ {selectedCarrito.subtotal?.toFixed(2)}</p>
                <p><strong>Descuento:</strong> S/ {selectedCarrito.descuento_total?.toFixed(2)}</p>
                <p className="total-final"><strong>Total:</strong> S/ {selectedCarrito.total?.toFixed(2)}</p>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Cerrar
              </button>
              <button 
                className="btn btn-success"
                onClick={() => handleConfirmarVenta(selectedCarrito.carrito_id)}
              >
                Confirmar Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendedorDashboard;