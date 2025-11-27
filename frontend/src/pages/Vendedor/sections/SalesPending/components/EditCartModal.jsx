import React, { useState, useEffect, useCallback } from 'react';
import { obtenerDetalleVenta } from '../../../../../services/ventasService';
import { getProducts } from '../../../../../services/api';
import './EditCartModal.css';

/**
 * 🛒 MODAL DE EDICIÓN DE CARRITO CON CRUD COMPLETO
 * 
 * Permite:
 * - Ver productos actuales
 * - Modificar cantidades
 * - Eliminar productos
 * - Buscar y agregar nuevos productos
 * - Cálculo automático de totales
 * 
 * @version 2.0.0 - Producción
 */

const EditCartModal = ({ venta, onClose, onSave }) => {
  // ====================================
  // 📊 ESTADOS
  // ====================================
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // ====================================
  // 🔄 CARGAR DETALLES INICIALES
  // ====================================

  useEffect(() => {
    cargarDetalles();
  }, [venta.venta_id]);

  const cargarDetalles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await obtenerDetalleVenta(venta.venta_id);
      
      if (response.success && response.data) {
        const itemsFormateados = (response.data.items || []).map(item => ({
          ...item,
          precio_unitario: parseFloat(item.precio_unitario || 0),
          precio_descuento: item.precio_descuento ? parseFloat(item.precio_descuento) : null,
          cantidad: parseInt(item.cantidad || 1),
          subtotal: parseFloat(item.subtotal || 0)
        }));
        
        setItems(itemsFormateados);
      } else {
        throw new Error(response.message || 'No se pudieron cargar los productos');
      }
    } catch (err) {
      console.error('Error cargando detalles:', err);
      setError(err.message || 'Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  // ====================================
  // 🔍 BÚSQUEDA DE PRODUCTOS
  // ====================================

  const buscarProductos = useCallback(async (termino) => {
    if (!termino || termino.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    
    try {
      const productos = await getProducts({ 
        search: termino.trim(),
        limit: 10
      });

      if (productos && Array.isArray(productos)) {
        // Filtrar productos que ya están en el carrito
        const idsEnCarrito = items.map(item => item.producto_id);
        const productosFiltrados = productos.filter(
          p => !idsEnCarrito.includes(p.producto_id) && p.stock > 0
        );
        
        setSearchResults(productosFiltrados);
        setShowSearchResults(productosFiltrados.length > 0);
      }
    } catch (err) {
      console.error('Error buscando productos:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [items]);

  // Debounce para búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      buscarProductos(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, buscarProductos]);

  // ====================================
  // ✏️ CRUD - ACTUALIZAR CANTIDAD
  // ====================================

  const handleUpdateQuantity = (itemId, newQuantity) => {
    const cantidad = parseInt(newQuantity);
    
    if (isNaN(cantidad) || cantidad < 1) {
      return;
    }

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.item_id === itemId) {
          const precioFinal = item.precio_descuento || item.precio_unitario;
          const nuevoSubtotal = precioFinal * cantidad;
          
          return {
            ...item,
            cantidad: cantidad,
            subtotal: nuevoSubtotal
          };
        }
        return item;
      })
    );
    
    setHasChanges(true);
  };

  const incrementarCantidad = (itemId) => {
    const item = items.find(i => i.item_id === itemId);
    if (item) {
      handleUpdateQuantity(itemId, item.cantidad + 1);
    }
  };

  const decrementarCantidad = (itemId) => {
    const item = items.find(i => i.item_id === itemId);
    if (item && item.cantidad > 1) {
      handleUpdateQuantity(itemId, item.cantidad - 1);
    }
  };

  // ====================================
  // 🗑️ CRUD - ELIMINAR PRODUCTO
  // ====================================

  const handleRemoveItem = (itemId) => {
    const item = items.find(i => i.item_id === itemId);
    
    if (!item) return;

    const confirmar = window.confirm(
      `¿Eliminar "${item.producto_nombre}" del pedido?`
    );
    
    if (!confirmar) return;
    
    setItems(prevItems => prevItems.filter(item => item.item_id !== itemId));
    setHasChanges(true);
  };

  // ====================================
  // ➕ CRUD - AGREGAR PRODUCTO
  // ====================================

  const handleAddProduct = (producto) => {
    // Verificar si ya existe
    const existente = items.find(i => i.producto_id === producto.producto_id);
    
    if (existente) {
      // Incrementar cantidad
      incrementarCantidad(existente.item_id);
    } else {
      // Agregar nuevo producto
      const precioFinal = producto.precio_descuento || producto.precio;
      
      const nuevoItem = {
        item_id: `temp_${Date.now()}`, // ID temporal
        producto_id: producto.producto_id,
        producto_nombre: producto.nombre,
        cantidad: 1,
        precio_unitario: parseFloat(producto.precio),
        precio_descuento: producto.precio_descuento ? parseFloat(producto.precio_descuento) : null,
        subtotal: parseFloat(precioFinal)
      };
      
      setItems(prevItems => [...prevItems, nuevoItem]);
      setHasChanges(true);
    }
    
    // Limpiar búsqueda
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // ====================================
  // 💰 CÁLCULOS
  // ====================================

  const calcularTotales = useCallback(() => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    
    const descuento = items.reduce((sum, item) => {
      if (item.precio_descuento) {
        const desc = (item.precio_unitario - item.precio_descuento) * item.cantidad;
        return sum + desc;
      }
      return sum;
    }, 0);
    
    return { 
      subtotal: Math.max(0, subtotal), 
      descuento: Math.max(0, descuento), 
      total: Math.max(0, subtotal) 
    };
  }, [items]);

  const totales = calcularTotales();

  // ====================================
  // 💾 GUARDAR CAMBIOS
  // ====================================

  const handleSave = async () => {
    if (items.length === 0) {
      alert('⚠️ Debe haber al menos un producto en el pedido');
      return;
    }

    if (!hasChanges) {
      onClose();
      return;
    }

    const confirmar = window.confirm(
      `¿Guardar cambios en el pedido ${venta.numero_venta}?\n\n` +
      `Productos: ${items.length}\n` +
      `Total: S/.${totales.total.toFixed(2)}`
    );

    if (!confirmar) return;

    setSaving(true);
    setError(null);
    
    try {
      // Preparar datos para guardar
      const datosActualizados = {
        venta_id: venta.venta_id,
        items: items.map(item => ({
          producto_id: item.producto_id,
          producto_nombre: item.producto_nombre,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          precio_descuento: item.precio_descuento,
          subtotal: item.subtotal
        })),
        subtotal: totales.subtotal,
        descuento_total: totales.descuento,
        total: totales.total
      };

      await onSave(datosActualizados);
      
      // Cerrar modal
      onClose();
      
    } catch (err) {
      console.error('Error guardando cambios:', err);
      setError(err.message || 'Error al guardar los cambios');
      alert(`❌ Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ====================================
  // 🎨 COMPONENTES UI
  // ====================================

  const SearchResultItem = ({ producto }) => (
    <div 
      className="search-result-item"
      onClick={() => handleAddProduct(producto)}
    >
      <div className="search-result-info">
        <div className="search-result-name">{producto.nombre}</div>
        <div className="search-result-category">{producto.categoria_nombre || 'Sin categoría'}</div>
      </div>
      <div className="search-result-price">
        {producto.precio_descuento ? (
          <>
            <span className="price-old">S/.{parseFloat(producto.precio).toFixed(2)}</span>
            <span className="price-current">S/.{parseFloat(producto.precio_descuento).toFixed(2)}</span>
          </>
        ) : (
          <span className="price-current">S/.{parseFloat(producto.precio).toFixed(2)}</span>
        )}
      </div>
      <button className="btn-add-search">+</button>
    </div>
  );

  const CartItem = ({ item }) => (
    <div className="cart-item-edit">
      <div className="item-info">
        <h4 className="item-name">{item.producto_nombre}</h4>
        <div className="item-prices">
          {item.precio_descuento ? (
            <>
              <span className="price-old">S/.{item.precio_unitario.toFixed(2)}</span>
              <span className="price-current">S/.{item.precio_descuento.toFixed(2)}</span>
              <span className="price-discount">
                -{Math.round(((item.precio_unitario - item.precio_descuento) / item.precio_unitario) * 100)}%
              </span>
            </>
          ) : (
            <span className="price-current">S/.{item.precio_unitario.toFixed(2)}</span>
          )}
        </div>
      </div>

      <div className="item-controls">
        <button
          className="btn-qty btn-minus"
          onClick={() => decrementarCantidad(item.item_id)}
          disabled={item.cantidad <= 1}
          title="Disminuir cantidad"
        >
          −
        </button>
        
        <input
          type="number"
          value={item.cantidad}
          onChange={(e) => handleUpdateQuantity(item.item_id, e.target.value)}
          className="qty-input"
          min="1"
          max="999"
        />
        
        <button
          className="btn-qty btn-plus"
          onClick={() => incrementarCantidad(item.item_id)}
          title="Aumentar cantidad"
        >
          +
        </button>
      </div>

      <div className="item-subtotal">
        <span className="subtotal-label">Subtotal:</span>
        <span className="subtotal-value">S/.{item.subtotal.toFixed(2)}</span>
      </div>

      <button
        className="btn-remove"
        onClick={() => handleRemoveItem(item.item_id)}
        title="Eliminar producto"
      >
        🗑️
      </button>
    </div>
  );

  // ====================================
  // 🎨 RENDER
  // ====================================

  return (
    <div className="edit-cart-modal-overlay" onClick={onClose}>
      <div className="edit-cart-modal" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="edit-cart-header">
          <div className="header-left">
            <h2 className="modal-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              Editar Pedido
            </h2>
            <span className="modal-subtitle">{venta.numero_venta}</span>
          </div>
          
          <button className="btn-close" onClick={onClose} title="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="edit-cart-body">
          
          {/* Buscador de productos */}
          <div className="product-search-section">
            <div className="search-input-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              
              <input
                type="text"
                placeholder="Buscar producto para agregar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                disabled={loading}
              />
              
              {searchLoading && (
                <div className="search-loading">
                  <div className="spinner-mini"></div>
                </div>
              )}
              
              {searchTerm && (
                <button
                  className="btn-clear-search"
                  onClick={() => {
                    setSearchTerm('');
                    setSearchResults([]);
                    setShowSearchResults(false);
                  }}
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Resultados de búsqueda */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="search-results">
                <div className="search-results-header">
                  {searchResults.length} producto{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                </div>
                <div className="search-results-list">
                  {searchResults.map(producto => (
                    <SearchResultItem key={producto.producto_id} producto={producto} />
                  ))}
                </div>
              </div>
            )}

            {showSearchResults && searchResults.length === 0 && !searchLoading && (
              <div className="search-empty">
                No se encontraron productos
              </div>
            )}
          </div>

          {/* Error alert */}
          {error && (
            <div className="alert alert-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner-large"></div>
              <p>Cargando productos...</p>
            </div>
          ) : (
            <>
              {/* Lista de productos en el carrito */}
              <div className="cart-items-section">
                <div className="section-header">
                  <h3 className="section-title">
                    Productos en el pedido ({items.length})
                  </h3>
                  {hasChanges && (
                    <span className="changes-indicator">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                      Cambios sin guardar
                    </span>
                  )}
                </div>

                {items.length > 0 ? (
                  <div className="items-list">
                    {items.map(item => (
                      <CartItem key={item.item_id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="empty-cart">
                    <div className="empty-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                      </svg>
                    </div>
                    <p>No hay productos en el carrito</p>
                    <span>Usa el buscador para agregar productos</span>
                  </div>
                )}
              </div>

              {/* Totales */}
              {items.length > 0 && (
                <div className="cart-totals">
                  <div className="total-row">
                    <span className="total-label">Subtotal:</span>
                    <span className="total-value">S/.{totales.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {totales.descuento > 0 && (
                    <div className="total-row discount">
                      <span className="total-label">Descuento:</span>
                      <span className="total-value">-S/.{totales.descuento.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="total-row final">
                    <span className="total-label">Total:</span>
                    <span className="total-value">S/.{totales.total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="edit-cart-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Cancelar
          </button>
          
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || items.length === 0 || loading}
          >
            {saving ? (
              <>
                <div className="spinner-mini"></div>
                Guardando...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCartModal;