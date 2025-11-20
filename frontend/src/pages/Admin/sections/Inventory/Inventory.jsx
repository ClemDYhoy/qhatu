// sections/Inventory/Inventory.jsx
import React, { useState, useEffect } from 'react';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import StockAlerts from './components/StockAlerts';
import ExpiryAlerts from './components/ExpiryAlerts';
import Modal from '../../components/Modal';
import './Inventory.css';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'alerts'

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // TODO: Llamar a API
      // const response = await inventoryApi.getProducts();
      
      // Datos simulados
      setProducts([
        { 
          producto_id: 1, 
          nombre: 'Chocolate Suizo', 
          precio: 15.50, 
          stock: 45, 
          categoria_nombre: 'Chocolates',
          estado_stock: 'Habido'
        },
        { 
          producto_id: 2, 
          nombre: 'Ramen Picante', 
          precio: 8.99, 
          stock: 8, 
          categoria_nombre: 'Fideos',
          estado_stock: 'Habido'
        }
      ]);
      
      setLoading(false);
    } catch (error) {
      console.error('Error cargando productos:', error);
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    
    try {
      // TODO: Llamar a API
      // await inventoryApi.deleteProduct(productId);
      setProducts(products.filter(p => p.producto_id !== productId));
      console.log('Producto eliminado:', productId);
    } catch (error) {
      console.error('Error eliminando producto:', error);
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      // TODO: Llamar a API
      if (selectedProduct) {
        // Editar
        console.log('Editar producto:', productData);
      } else {
        // Crear
        console.log('Crear producto:', productData);
      }
      
      setShowProductModal(false);
      loadProducts();
    } catch (error) {
      console.error('Error guardando producto:', error);
    }
  };

  if (loading) {
    return (
      <div className="inventory-loading">
        <div className="spinner"></div>
        <p>Cargando inventario...</p>
      </div>
    );
  }

  return (
    <div className="inventory-section">
      {/* Header */}
      <div className="section-header">
        <h1>📦 Gestión de Inventario</h1>
        <button className="btn-primary" onClick={handleCreateProduct}>
          ➕ Nuevo Producto
        </button>
      </div>

      {/* Tabs */}
      <div className="inventory-tabs">
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Productos ({products.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          ⚠️ Alertas
        </button>
      </div>

      {/* Contenido según tab activo */}
      {activeTab === 'products' && (
        <ProductList 
          products={products}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
      )}

      {activeTab === 'alerts' && (
        <div className="alerts-container">
          <StockAlerts products={products} />
          <ExpiryAlerts />
        </div>
      )}

      {/* Modal de Producto */}
      <Modal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title={selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
        size="large"
      >
        <ProductForm 
          product={selectedProduct}
          onSave={handleSaveProduct}
          onCancel={() => setShowProductModal(false)}
        />
      </Modal>
    </div>
  );
};

export default Inventory;

/* 
CSS ESPECIFICACIONES (Inventory.css):
- .inventory-section: padding 30px
- .section-header: display flex, justify-content space-between, align-items center, margin-bottom 30px
- .btn-primary: padding 12px 24px, background #27ae60, color white, border none, border-radius 6px, cursor pointer, font-size 14px, font-weight 600
- .btn-primary:hover: background #229954
- .inventory-tabs: display flex, gap 10px, margin-bottom 30px, border-bottom 2px solid #ecf0f1
- .tab-btn: padding 12px 24px, background none, border none, border-bottom 3px solid transparent, cursor pointer, font-size 15px, color #7f8c8d, transition all 0.3s
- .tab-btn.active: color #3498db, border-bottom-color #3498db, font-weight 600
- .tab-btn:hover: color #2c3e50
- .alerts-container: display grid, grid-template-columns 1fr 1fr, gap 20px
- .inventory-loading: display flex, flex-direction column, align-items center, justify-content center, min-height 400px
*/