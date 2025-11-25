// C:\qhatu\frontend\src\pages\Vendedor\sections\SalesPending\components\EditCartModal.jsx
import React, { useState, useEffect } from 'react';
import { obtenerDetalleVenta } from '../../../../../services/ventasService';
import './EditCartModal.css';

const EditCartModal = ({ venta, onClose, onSave }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    cargarDetalles();
  }, [venta.venta_id]);

  const cargarDetalles = async () => {
    try {
      setLoading(true);
      const response = await obtenerDetalleVenta(venta.venta_id);
      
      if (response.success) {
        setItems(response.data.items || []);
      }
    } catch (error) {
      console.error('Error cargando detalles:', error);
      alert('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.item_id === itemId) {
          const precioFinal = item.precio_descuento || item.precio_unitario;
          return {
            ...item,
            cantidad: newQuantity,
            subtotal: precioFinal * newQuantity
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (itemId) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    
    setItems(prevItems => prevItems.filter(item => item.item_id !== itemId));
  };

  const handleAddProduct = (product) => {
    // Verificar si ya existe
    const existente = items.find(i => i.producto_id === product.producto_id);
    
    if (existente) {
      handleUpdateQuantity(existente.item_id, existente.cantidad + 1);
    } else {
      // Agregar nuevo
      const nuevoItem = {
        item_id: Date.now(), // Temporal
        producto_id: product.producto_id,
        producto_nombre: product.nombre,
        cantidad: 1,
        precio_unitario: product.precio,
        precio_descuento: product.precio_descuento,
        subtotal: product.precio_descuento || product.precio
      };
      
      setItems(prevItems => [...prevItems, nuevoItem]);
    }
    
    setSearchTerm('');
  };

  const calcularTotales = () => {
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    const descuento = items.reduce((sum, item) => {
      if (item.precio_descuento) {
        return sum + ((item.precio_unitario - item.precio_descuento) * item.cantidad);
      }
      return sum;
    }, 0);
    
    return { subtotal, descuento, total: subtotal };
  };

  const handleSave = async () => {
    if (items.length === 0) {
      alert('Debe haber al menos un producto');
      return;
    }

    setSaving(true);
    
    try {
      const totales = calcularTotales();
      
      await onSave({
        items,
        ...totales
      });
      
      onClose();
    } catch (error) {
      console.error('Error guardando cambios:', error);
      alert('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const totales = calcularTotales();

  return (
    <div className="edit-cart-modal-overlay" onClick={onClose}>
      <div className="edit-cart-modal" onClick={e => e.stopPropagation()}>
        <div className="edit-cart-header">
          <h2>Editar Pedido {venta.numero_venta}</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="edit-cart-body">
          {/* Buscador de productos */}
          <div className="product-search">
            <input
              type="text"
              placeholder="Buscar producto para agregar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Lista de items */}
          {loading ? (
            <div className="loading">Cargando...</div>
          ) : (
            <div className="items-list">
              {items.map(item => (
                <div key={item.item_id} className="cart-item-edit">
                  <div className="item-info">
                    <h4>{item.producto_nombre}</h4>
                    <div className="item-prices">
                      {item.precio_descuento ? (
                        <>
                          <span className="price-old">S/.{parseFloat(item.precio_unitario).toFixed(2)}</span>
                          <span className="price-current">S/.{parseFloat(item.precio_descuento).toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="price-current">S/.{parseFloat(item.precio_unitario).toFixed(2)}</span>
                      )}
                    </div>
                  </div>

                  <div className="item-controls">
                    <button
                      className="btn-qty"
                      onClick={() => handleUpdateQuantity(item.item_id, item.cantidad - 1)}
                      disabled={item.cantidad <= 1}
                    >
                      -
                    </button>
                    
                    <input
                      type="number"
                      value={item.cantidad}
                      onChange={e => handleUpdateQuantity(item.item_id, parseInt(e.target.value) || 1)}
                      className="qty-input"
                      min="1"
                    />
                    
                    <button
                      className="btn-qty"
                      onClick={() => handleUpdateQuantity(item.item_id, item.cantidad + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="item-subtotal">
                    S/.{parseFloat(item.subtotal).toFixed(2)}
                  </div>

                  <button
                    className="btn-remove"
                    onClick={() => handleRemoveItem(item.item_id)}
                    title="Eliminar producto"
                  >
                    🗑️
                  </button>
                </div>
              ))}

              {items.length === 0 && (
                <div className="empty-cart">
                  No hay productos en el carrito
                </div>
              )}
            </div>
          )}

          {/* Totales */}
          <div className="cart-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>S/.{totales.subtotal.toFixed(2)}</span>
            </div>
            
            {totales.descuento > 0 && (
              <div className="total-row discount">
                <span>Descuento:</span>
                <span>-S/.{totales.descuento.toFixed(2)}</span>
              </div>
            )}
            
            <div className="total-row final">
              <span>Total:</span>
              <span>S/.{totales.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="edit-cart-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>
          
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || items.length === 0}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCartModal;