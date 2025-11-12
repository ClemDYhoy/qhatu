// C:\qhatu\frontend\src\pages\Admin\AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import api from '../../services/api';
import './AdminDashboard.css';

// ====================================
// 🎨 ICONOS SVG
// ====================================
const Icon = {
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  ShoppingCart: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  ),
  Package: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  DollarSign: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v6m0 6v6"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  Plus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  LogOut: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Edit: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  RefreshCw: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  )
};

// ====================================
// 🎯 COMPONENTE PRINCIPAL
// ====================================
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Estados para datos
  const [stats, setStats] = useState({
    totalVentas: 0,
    totalProductos: 0,
    totalUsuarios: 0,
    gananciasMes: 0,
    ventasHoy: 0,
    productosAgotados: 0
  });
  
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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
  // 📊 CARGAR DATOS (con manejo robusto de errores)
  // ====================================
  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    console.log('📊 Cargando datos del dashboard...');
    setError(null);

    try {
      // Cargar productos (esta ruta SÍ existe)
      const productosResponse = await api.get('/products');
      
      if (productosResponse.data?.success && productosResponse.data?.data) {
        const productosData = productosResponse.data.data;
        setProductos(productosData);
        
        // Calcular estadísticas desde los productos
        const productosAgotados = productosData.filter(p => p.stock === 0).length;
        const totalProductos = productosData.length;
        
        setStats(prev => ({
          ...prev,
          totalProductos,
          productosAgotados
        }));
        
        console.log('✅ Productos cargados:', totalProductos);
        console.log('⚠️  Productos agotados:', productosAgotados);
      }

      // Las demás estadísticas se simularán o se cargarán desde rutas existentes
      // Por ahora, mantener valores por defecto
      
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      setError('Error al cargar datos del dashboard');
      
      // No bloquear la UI, mostrar datos vacíos
      setProductos([]);
    }
  }, [user]);

  // Cargar datos cuando el usuario esté disponible
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  // ====================================
  // 📦 GESTIÓN DE PRODUCTOS
  // ====================================
  const handleEditProduct = (producto) => {
    console.log('📝 Editar producto:', producto);
    // TODO: Implementar modal de edición
    alert(`Editar producto: ${producto.nombre}`);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      await api.delete(`/products/${productId}`);
      setProductos(productos.filter(p => p.producto_id !== productId));
      console.log('✅ Producto eliminado');
    } catch (error) {
      console.error('❌ Error eliminando producto:', error);
      alert('Error al eliminar producto');
    }
  };

  const handleCreateProduct = () => {
    console.log('➕ Crear nuevo producto');
    alert('Función de crear producto en desarrollo');
  };

  // ====================================
  // 🚪 CERRAR SESIÓN
  // ====================================
  const handleLogout = async () => {
    console.log('🚪 Cerrando sesión...');
    await authService.logout();
    navigate('/login');
  };

  // ====================================
  // 🔍 FILTROS
  // ====================================
  const filteredProductos = productos.filter(p => 
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
  // 🎨 RENDER - DASHBOARD
  // ====================================
  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>🏪 Qhatu Admin</h2>
          <p className="admin-user-info">{user?.nombre_completo || user?.email}</p>
          <span className="admin-user-role">{user?.rol_nombre}</span>
        </div>

        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Icon.TrendingUp />
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Icon.Package />
            <span>Productos</span>
          </button>
          
          <button 
            className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Icon.Settings />
            <span>Configuración</span>
          </button>
        </nav>

        <button className="admin-logout-btn" onClick={handleLogout}>
          <Icon.LogOut />
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div>
            <h1>
              {activeTab === 'overview' && '📊 Dashboard General'}
              {activeTab === 'products' && '📦 Gestión de Productos'}
              {activeTab === 'settings' && '⚙️ Configuración'}
            </h1>
            <p className="admin-subtitle">
              Bienvenido, {user?.nombre_completo || user?.email}
            </p>
          </div>
          <div className="admin-header-actions">
            <button 
              className="btn btn-icon" 
              onClick={loadDashboardData}
              title="Recargar datos"
            >
              <Icon.RefreshCw />
            </button>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            <Icon.AlertTriangle />
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Content */}
        <div className="admin-content">
          {/* ========== TAB: OVERVIEW ========== */}
          {activeTab === 'overview' && (
            <>
              <div className="stats-grid">
                <div className="stat-card stat-primary">
                  <div className="stat-icon">
                    <Icon.Package />
                  </div>
                  <div className="stat-info">
                    <p className="stat-label">Total Productos</p>
                    <h3 className="stat-value">{stats.totalProductos}</h3>
                  </div>
                </div>

                <div className="stat-card stat-warning">
                  <div className="stat-icon">
                    <Icon.AlertTriangle />
                  </div>
                  <div className="stat-info">
                    <p className="stat-label">Productos Agotados</p>
                    <h3 className="stat-value">{stats.productosAgotados}</h3>
                  </div>
                </div>

                <div className="stat-card stat-success">
                  <div className="stat-icon">
                    <Icon.ShoppingCart />
                  </div>
                  <div className="stat-info">
                    <p className="stat-label">Total Ventas</p>
                    <h3 className="stat-value">{stats.totalVentas}</h3>
                  </div>
                </div>

                <div className="stat-card stat-info">
                  <div className="stat-icon">
                    <Icon.DollarSign />
                  </div>
                  <div className="stat-info">
                    <p className="stat-label">Ganancias del Mes</p>
                    <h3 className="stat-value">S/ {stats.gananciasMes.toFixed(2)}</h3>
                  </div>
                </div>
              </div>

              {/* Alertas */}
              {stats.productosAgotados > 0 && (
                <div className="alert alert-warning">
                  <Icon.AlertTriangle />
                  <span>
                    Hay {stats.productosAgotados} producto(s) agotado(s) que requieren atención
                  </span>
                </div>
              )}

              {/* Productos más vendidos */}
              <div className="dashboard-card">
                <h3>📈 Productos Más Vendidos</h3>
                <div className="top-products">
                  {productos
                    .filter(p => p.ventas > 0)
                    .sort((a, b) => (b.ventas || 0) - (a.ventas || 0))
                    .slice(0, 5)
                    .map((producto, index) => (
                      <div key={producto.producto_id} className="top-product-item">
                        <span className="top-product-rank">#{index + 1}</span>
                        <div className="top-product-info">
                          <p className="top-product-name">{producto.nombre}</p>
                          <p className="top-product-sales">{producto.ventas} ventas</p>
                        </div>
                        <span className="top-product-price">S/ {producto.precio}</span>
                      </div>
                    ))}
                  {productos.filter(p => p.ventas > 0).length === 0 && (
                    <p className="text-muted">No hay datos de ventas aún</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ========== TAB: PRODUCTS ========== */}
          {activeTab === 'products' && (
            <>
              <div className="content-header">
                <div className="admin-search">
                  <Icon.Search />
                  <input 
                    type="text" 
                    placeholder="Buscar productos..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary" onClick={handleCreateProduct}>
                  <Icon.Plus />
                  Nuevo Producto
                </button>
              </div>

              {filteredProductos.length === 0 ? (
                <div className="empty-state">
                  <Icon.Package />
                  <h3>No se encontraron productos</h3>
                  <p>Intenta con otros términos de búsqueda</p>
                </div>
              ) : (
                <div className="products-grid">
                  {filteredProductos.map(producto => (
                    <div key={producto.producto_id} className="product-card-admin">
                      <img 
                        src={producto.url_imagen || '/awaiting-image.jpeg'} 
                        alt={producto.nombre}
                        className="product-image"
                      />
                      <div className="product-info">
                        <h4>{producto.nombre}</h4>
                        <p className="product-description">{producto.descripcion}</p>
                        <div className="product-meta">
                          <span className="product-price">S/ {producto.precio}</span>
                          <span className={`product-stock ${producto.stock < 10 ? 'low-stock' : ''}`}>
                            Stock: {producto.stock}
                          </span>
                        </div>
                        {producto.ventas > 0 && (
                          <p className="product-sales">
                            🔥 {producto.ventas} vendidos
                          </p>
                        )}
                        <div className="product-actions">
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleEditProduct(producto)}
                          >
                            <Icon.Edit /> Editar
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteProduct(producto.producto_id)}
                          >
                            <Icon.Trash /> Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ========== TAB: SETTINGS ========== */}
          {activeTab === 'settings' && (
            <div className="settings-container">
              <div className="settings-sections">
                <div className="settings-card">
                  <Icon.Settings />
                  <h3>Carruseles y Banners</h3>
                  <p>Gestiona los carruseles de la página principal</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/admin/carousel-editor')}
                  >
                    Ir a Editor de Carruseles
                  </button>
                </div>
                
                <div className="settings-card">
                  <Icon.Users />
                  <h3>Roles y Permisos</h3>
                  <p>Configura los roles del sistema</p>
                  <button className="btn btn-secondary" disabled>
                    Próximamente
                  </button>
                </div>

                <div className="settings-card">
                  <Icon.Package />
                  <h3>Categorías</h3>
                  <p>Gestiona las categorías de productos</p>
                  <button className="btn btn-secondary" disabled>
                    Próximamente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;