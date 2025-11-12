// C:\qhatu\frontend\src\pages\Almacenero\AlmaceneroDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import api from '../../services/api';
import './AlmaceneroDashboard.css';

const AlmaceneroDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventario');
  
  // Estados
  const [productos, setProductos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [stats, setStats] = useState({
    totalProductos: 0,
    productosAgotados: 0,
    productosBajoStock: 0,
    valorInventario: 0
  });

  const [showStockModal, setShowStockModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showBannerModal, setShowBannerModal] = useState(false);

  // Iconos
  const Icon = {
    Package: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
    AlertTriangle: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    DollarSign: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    TrendingDown: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
        <polyline points="17 18 23 18 23 12"/>
      </svg>
    ),
    Image: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
    Plus: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
    Edit: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
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
    
    if (currentUser.rol_nombre !== 'almacenero') {
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
      const [productosRes, alertasRes, statsRes] = await Promise.all([
        api.get('/products'),
        api.get('/analytics/alertas-inventario'),
        api.get('/analytics/stats-inventario')
      ]);

      setProductos(productosRes.data);
      setAlertas(alertasRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar stock
  const handleUpdateStock = async (productData) => {
    try {
      await api.put(`/products/${editingProduct.producto_id}/stock`, {
        stock: productData.stock,
        motivo: productData.motivo
      });
      
      alert('✅ Stock actualizado correctamente');
      loadData();
      setShowStockModal(false);
    } catch (error) {
      console.error('Error actualizando stock:', error);
      alert('❌ Error al actualizar stock');
    }
  };

  // Crear banner de descuento
  const handleCreateBanner = async (bannerData) => {
    try {
      await api.post('/discount-banners', bannerData);
      alert('✅ Banner de descuento creado');
      setShowBannerModal(false);
    } catch (error) {
      console.error('Error creando banner:', error);
      alert('❌ Error al crear banner');
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Obtener clase de alerta según nivel
  const getAlertClass = (nivel) => {
    switch(nivel) {
      case 'critico': return 'alert-danger';
      case 'urgente': return 'alert-warning';
      case 'informativo': return 'alert-info';
      default: return 'alert-info';
    }
  };

  if (loading) {
    return (
      <div className="almacenero-loading">
        <div className="spinner-large"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="almacenero-dashboard">
      {/* Sidebar */}
      <aside className="almacenero-sidebar">
        <div className="almacenero-sidebar-header">
          <h2>📦 Panel Almacén</h2>
          <p className="almacenero-user-info">{user?.nombre_completo || user?.email}</p>
        </div>

        <nav className="almacenero-nav">
          <button 
            className={`almacenero-nav-item ${activeTab === 'inventario' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventario')}
          >
            <Icon.Package />
            <span>Inventario</span>
          </button>
          
          <button 
            className={`almacenero-nav-item ${activeTab === 'alertas' ? 'active' : ''}`}
            onClick={() => setActiveTab('alertas')}
          >
            <Icon.AlertTriangle />
            <span>Alertas</span>
          </button>

          <button 
            className={`almacenero-nav-item ${activeTab === 'carruseles' ? 'active' : ''}`}
            onClick={() => setActiveTab('carruseles')}
          >
            <Icon.Image />
            <span>Carruseles</span>
          </button>
        </nav>

        <button className="almacenero-logout-btn" onClick={handleLogout}>
          <Icon.LogOut />
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="almacenero-main">
        {/* Header */}
        <header className="almacenero-header">
          <h1>
            {activeTab === 'inventario' && 'Gestión de Inventario'}
            {activeTab === 'alertas' && 'Alertas de Stock'}
            {activeTab === 'carruseles' && 'Carruseles y Promociones'}
          </h1>
        </header>

        {/* Stats */}
        <div className="almacenero-stats">
          <div className="stat-card stat-info">
            <div className="stat-icon"><Icon.Package /></div>
            <div className="stat-info">
              <p className="stat-label">Total Productos</p>
              <h3 className="stat-value">{stats.totalProductos || 0}</h3>
            </div>
          </div>

          <div className="stat-card stat-danger">
            <div className="stat-icon"><Icon.TrendingDown /></div>
            <div className="stat-info">
              <p className="stat-label">Agotados</p>
              <h3 className="stat-value">{stats.productosAgotados || 0}</h3>
            </div>
          </div>

          <div className="stat-card stat-warning">
            <div className="stat-icon"><Icon.AlertTriangle /></div>
            <div className="stat-info">
              <p className="stat-label">Bajo Stock</p>
              <h3 className="stat-value">{stats.productosBajoStock || 0}</h3>
            </div>
          </div>

          <div className="stat-card stat-success">
            <div className="stat-icon"><Icon.DollarSign /></div>
            <div className="stat-info">
              <p className="stat-label">Valor Inventario</p>
              <h3 className="stat-value">S/ {stats.valorInventario?.toFixed(2) || '0.00'}</h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="almacenero-content">
          {/* INVENTARIO TAB */}
          {activeTab === 'inventario' && (
            <div className="table-container">
              <table className="almacenero-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Precio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map(producto => (
                    <tr key={producto.producto_id}>
                      <td>#{producto.producto_id}</td>
                      <td>
                        <div className="producto-info">
                          <img 
                            src={producto.url_imagen || '/awaiting-image.jpeg'} 
                            alt={producto.nombre}
                            className="producto-thumb"
                          />
                          <span>{producto.nombre}</span>
                        </div>
                      </td>
                      <td>{producto.categoria_nombre || '-'}</td>
                      <td>
                        <span className={`stock-indicator ${
                          producto.stock === 0 ? 'stock-agotado' :
                          producto.stock < 10 ? 'stock-bajo' :
                          'stock-normal'
                        }`}>
                          {producto.stock}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${producto.estado_stock?.toLowerCase()}`}>
                          {producto.estado_stock}
                        </span>
                      </td>
                      <td>S/ {producto.precio}</td>
                      <td>
                        <button 
                          className="btn-icon btn-edit"
                          onClick={() => {
                            setEditingProduct(producto);
                            setShowStockModal(true);
                          }}
                          title="Actualizar Stock"
                        >
                          <Icon.Edit />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ALERTAS TAB */}
          {activeTab === 'alertas' && (
            <div className="alertas-container">
              {alertas.length === 0 ? (
                <div className="empty-state">
                  <Icon.AlertTriangle />
                  <p>No hay alertas activas</p>
                </div>
              ) : (
                <div className="alertas-list">
                  {alertas.map((alerta, index) => (
                    <div key={index} className={`alerta-card ${getAlertClass(alerta.nivel)}`}>
                      <div className="alerta-header">
                        <Icon.AlertTriangle />
                        <h4>{alerta.titulo}</h4>
                        <span className="alerta-nivel">{alerta.nivel}</span>
                      </div>
                      <p className="alerta-mensaje">{alerta.mensaje}</p>
                      <div className="alerta-productos">
                        {alerta.productos?.map(prod => (
                          <div key={prod.producto_id} className="alerta-producto-item">
                            <span>{prod.nombre}</span>
                            <span className="producto-stock">Stock: {prod.stock}</span>
                          </div>
                        ))}
                      </div>
                      {alerta.accion_sugerida && (
                        <div className="alerta-actions">
                          <p className="alerta-sugerencia">
                            <strong>Sugerencia:</strong> {alerta.accion_sugerida}
                          </p>
                          {alerta.crear_banner && (
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => {
                                setEditingProduct(alerta.productos[0]);
                                setShowBannerModal(true);
                              }}
                            >
                              <Icon.Plus /> Crear Banner Descuento
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CARRUSELES TAB */}
          {activeTab === 'carruseles' && (
            <div className="carruseles-container">
              <div className="carruseles-header">
                <p>Gestiona los carruseles y banners de descuento de la tienda</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/admin/carousel-editor')}
                >
                  <Icon.Image /> Editor de Carruseles
                </button>
              </div>
              <div className="carruseles-info">
                <div className="info-card">
                  <h3>🎨 Carruseles Principales</h3>
                  <p>Gestiona las imágenes del carrusel de la página principal</p>
                </div>
                <div className="info-card">
                  <h3>🏷️ Banners de Descuento</h3>
                  <p>Crea promociones automáticas basadas en alertas de stock</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal Actualizar Stock */}
      {showStockModal && editingProduct && (
        <StockModal
          product={editingProduct}
          onSave={handleUpdateStock}
          onClose={() => setShowStockModal(false)}
        />
      )}

      {/* Modal Crear Banner */}
      {showBannerModal && editingProduct && (
        <BannerModal
          product={editingProduct}
          onSave={handleCreateBanner}
          onClose={() => setShowBannerModal(false)}
        />
      )}
    </div>
  );
};

// Modal Actualizar Stock
const StockModal = ({ product, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    stock: product.stock || 0,
    motivo: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Actualizar Stock: {product.nombre}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Stock Actual: <strong>{product.stock}</strong></label>
          </div>
          <div className="form-group">
            <label>Nuevo Stock *</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
              required
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Motivo *</label>
            <select
              value={formData.motivo}
              onChange={(e) => setFormData({...formData, motivo: e.target.value})}
              required
            >
              <option value="">Seleccionar...</option>
              <option value="reposicion">Reposición</option>
              <option value="ajuste">Ajuste de inventario</option>
              <option value="devolucion">Devolución</option>
              <option value="perdida">Pérdida/Rotura</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Actualizar Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal Crear Banner
const BannerModal = ({ product, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    titulo: `¡Oferta en ${product.nombre}!`,
    porcentaje_descuento: 20,
    fecha_fin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      categoria_id: product.categoria_id
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Crear Banner de Descuento</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Título del Banner *</label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Porcentaje de Descuento *</label>
            <input
              type="number"
              value={formData.porcentaje_descuento}
              onChange={(e) => setFormData({...formData, porcentaje_descuento: parseInt(e.target.value)})}
              required
              min="1"
              max="100"
            />
          </div>
          <div className="form-group">
            <label>Válido hasta *</label>
            <input
              type="date"
              value={formData.fecha_fin}
              onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Crear Banner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlmaceneroDashboard;