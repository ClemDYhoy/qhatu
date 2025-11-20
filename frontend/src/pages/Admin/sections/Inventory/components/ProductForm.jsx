// sections/Inventory/components/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import './ProductForm.css';

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria_id: '',
    url_imagen: '',
    destacado: false
  });

  const [errors, setErrors] = useState({});

  // Categorías disponibles (luego vendrán de la API)
  const categories = [
    { id: 1, nombre: 'Dulces' },
    { id: 2, nombre: 'Chocolates' },
    { id: 6, nombre: 'Snacks' },
    { id: 10, nombre: 'Ramen y Fideos' },
    { id: 14, nombre: 'Bebidas' }
  ];

  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        precio: product.precio || '',
        stock: product.stock || '',
        categoria_id: product.categoria_id || '',
        url_imagen: product.url_imagen || '',
        destacado: product.destacado || false
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.precio || formData.precio <= 0) newErrors.precio = 'El precio debe ser mayor a 0';
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'El stock no puede ser negativo';
    if (!formData.categoria_id) newErrors.categoria_id = 'Selecciona una categoría';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSave({
        ...formData,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
        categoria_id: parseInt(formData.categoria_id)
      });
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      {/* Nombre */}
      <div className="form-group">
        <label htmlFor="nombre">Nombre del Producto *</label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className={errors.nombre ? 'error' : ''}
          placeholder="Ej: Chocolate Suizo Premium"
        />
        {errors.nombre && <span className="error-message">{errors.nombre}</span>}
      </div>

      {/* Descripción */}
      <div className="form-group">
        <label htmlFor="descripcion">Descripción</label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          rows={3}
          placeholder="Descripción del producto..."
        />
      </div>

      {/* Precio y Stock */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="precio">Precio (S/) *</label>
          <input
            type="number"
            id="precio"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            step="0.01"
            min="0"
            className={errors.precio ? 'error' : ''}
            placeholder="15.50"
          />
          {errors.precio && <span className="error-message">{errors.precio}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="stock">Stock *</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            className={errors.stock ? 'error' : ''}
            placeholder="50"
          />
          {errors.stock && <span className="error-message">{errors.stock}</span>}
        </div>
      </div>

      {/* Categoría */}
      <div className="form-group">
        <label htmlFor="categoria_id">Categoría *</label>
        <select
          id="categoria_id"
          name="categoria_id"
          value={formData.categoria_id}
          onChange={handleChange}
          className={errors.categoria_id ? 'error' : ''}
        >
          <option value="">Seleccionar categoría...</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
        {errors.categoria_id && <span className="error-message">{errors.categoria_id}</span>}
      </div>

      {/* URL Imagen */}
      <div className="form-group">
        <label htmlFor="url_imagen">URL de Imagen</label>
        <input
          type="url"
          id="url_imagen"
          name="url_imagen"
          value={formData.url_imagen}
          onChange={handleChange}
          placeholder="https://ejemplo.com/imagen.jpg"
        />
      </div>

      {/* Destacado */}
      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="destacado"
            checked={formData.destacado}
            onChange={handleChange}
          />
          <span>Marcar como producto destacado</span>
        </label>
      </div>

      {/* Botones */}
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-submit">
          {product ? 'Actualizar' : 'Crear'} Producto
        </button>
      </div>
    </form>
  );
};

export default ProductForm;

/* 
CSS ESPECIFICACIONES (ProductForm.css):
- .product-form: display flex, flex-direction column, gap 20px
- .form-group: display flex, flex-direction column, gap 8px
- .form-group label: font-size 14px, font-weight 600, color #2c3e50
- .form-group input, .form-group textarea, .form-group select: padding 10px 15px, border 1px solid #ddd, border-radius 6px, font-size 14px, font-family inherit
- .form-group input:focus, .form-group textarea:focus, .form-group select:focus: outline none, border-color #3498db
- .form-group input.error, .form-group select.error: border-color #e74c3c
- .error-message: color #e74c3c, font-size 12px, margin-top 4px
- .form-row: display grid, grid-template-columns 1fr 1fr, gap 15px
- .checkbox-group label: flex-direction row, align-items center, gap 8px, cursor pointer
- .checkbox-group input[type="checkbox"]: width auto, margin 0
- .form-actions: display flex, justify-content flex-end, gap 10px, padding-top 20px, border-top 1px solid #ecf0f1
- .btn-cancel: padding 10px 20px, background #ecf0f1, color #2c3e50, border none, border-radius 6px, cursor pointer, font-size 14px, font-weight 600
- .btn-cancel:hover: background #d5dbdb
- .btn-submit: padding 10px 20px, background #27ae60, color white, border none, border-radius 6px, cursor pointer, font-size 14px, font-weight 600
- .btn-submit:hover: background #229954
*/