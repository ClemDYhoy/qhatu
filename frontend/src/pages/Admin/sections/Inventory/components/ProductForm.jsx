// sections/Inventory/components/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import './ProductForm.css';

const EMPTY = {
  nombre: '',
  descripcion: '',
  precio: '',
  precio_descuento: '',
  stock: '',
  categoria_id: '',
  url_imagen: '',
  destacado: false,
  peso: '',
  unidad_medida: '',
  umbral_bajo_stock: 20,
  umbral_critico_stock: 10
};

const ProductForm = ({ product, categories = [], onSave, onCancel, saving = false, error = null }) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setForm({
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        precio: product.precio ?? '',
        precio_descuento: product.precio_descuento ?? '',
        stock: product.stock ?? '',
        categoria_id: product.categoria_id ?? '',
        url_imagen: product.url_imagen || '',
        destacado: !!product.destacado,
        peso: product.peso ?? '',
        unidad_medida: product.unidad_medida || '',
        umbral_bajo_stock: product.umbral_bajo_stock ?? 20,
        umbral_critico_stock: product.umbral_critico_stock ?? 10
      });
    } else {
      setForm(EMPTY);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const e2 = {};
    if (!form.nombre.trim() || form.nombre.trim().length < 3) e2.nombre = 'Mínimo 3 caracteres';
    if (!form.precio || Number(form.precio) <= 0) e2.precio = 'Debe ser mayor a 0';
    if (form.precio_descuento !== '' && Number(form.precio_descuento) >= Number(form.precio)) {
      e2.precio_descuento = 'Debe ser menor al precio';
    }
    if (form.stock === '' || Number(form.stock) < 0) e2.stock = 'Stock inválido';
    if (!form.categoria_id) e2.categoria_id = 'Selecciona una categoría';
    setErrors(e2);
    return Object.keys(e2).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      nombre: form.nombre.trim(),
      descripcion: form.descripcion,
      precio: Number(form.precio),
      precio_descuento: form.precio_descuento === '' ? null : Number(form.precio_descuento),
      stock: parseInt(form.stock, 10),
      categoria_id: parseInt(form.categoria_id, 10),
      url_imagen: form.url_imagen,
      destacado: !!form.destacado,
      peso: form.peso === '' ? null : Number(form.peso),
      unidad_medida: form.unidad_medida,
      umbral_bajo_stock: parseInt(form.umbral_bajo_stock, 10) || 20,
      umbral_critico_stock: parseInt(form.umbral_critico_stock, 10) || 10
    });
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      {error && <div className="pf-alert pf-alert--error">{error}</div>}

      <div className="form-group">
        <label htmlFor="nombre">Nombre del producto</label>
        <input id="nombre" name="nombre" value={form.nombre} onChange={handleChange}
          className={errors.nombre ? 'error' : ''} placeholder="Ej: Buldak Carbonara 130 g" />
        {errors.nombre && <span className="error-message">{errors.nombre}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="descripcion">Descripción</label>
        <textarea id="descripcion" name="descripcion" rows={3} value={form.descripcion}
          onChange={handleChange} placeholder="Descripción del producto..." />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="precio">Precio (S/)</label>
          <input type="number" step="0.01" min="0" id="precio" name="precio" value={form.precio}
            onChange={handleChange} className={errors.precio ? 'error' : ''} placeholder="15.50" />
          {errors.precio && <span className="error-message">{errors.precio}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="precio_descuento">Precio con descuento (S/)</label>
          <input type="number" step="0.01" min="0" id="precio_descuento" name="precio_descuento"
            value={form.precio_descuento} onChange={handleChange}
            className={errors.precio_descuento ? 'error' : ''} placeholder="Opcional" />
          {errors.precio_descuento && <span className="error-message">{errors.precio_descuento}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="stock">Stock</label>
          <input type="number" min="0" id="stock" name="stock" value={form.stock}
            onChange={handleChange} className={errors.stock ? 'error' : ''} placeholder="50" />
          {errors.stock && <span className="error-message">{errors.stock}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="categoria_id">Categoría</label>
          <select id="categoria_id" name="categoria_id" value={form.categoria_id}
            onChange={handleChange} className={errors.categoria_id ? 'error' : ''}>
            <option value="">Seleccionar categoría...</option>
            {categories.map((c) => (
              <option key={c.categoria_id} value={c.categoria_id}>{c.nombre}</option>
            ))}
          </select>
          {errors.categoria_id && <span className="error-message">{errors.categoria_id}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="url_imagen">Imagen (URL o ruta local)</label>
        <input id="url_imagen" name="url_imagen" value={form.url_imagen} onChange={handleChange}
          placeholder="https://... o /products/1.jpg" />
        {form.url_imagen && (
          <img
            className="pf-preview"
            src={form.url_imagen}
            alt="Previsualización"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            onLoad={(e) => { e.currentTarget.style.display = 'block'; }}
          />
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="peso">Peso (g)</label>
          <input type="number" step="0.01" min="0" id="peso" name="peso" value={form.peso}
            onChange={handleChange} placeholder="Opcional" />
        </div>
        <div className="form-group">
          <label htmlFor="unidad_medida">Unidad de medida</label>
          <input id="unidad_medida" name="unidad_medida" value={form.unidad_medida}
            onChange={handleChange} placeholder="Ej: 130 g, 350 ml" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="umbral_bajo_stock">Aviso de stock bajo</label>
          <input type="number" min="0" id="umbral_bajo_stock" name="umbral_bajo_stock"
            value={form.umbral_bajo_stock} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="umbral_critico_stock">Aviso de stock crítico</label>
          <input type="number" min="0" id="umbral_critico_stock" name="umbral_critico_stock"
            value={form.umbral_critico_stock} onChange={handleChange} />
        </div>
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input type="checkbox" name="destacado" checked={form.destacado} onChange={handleChange} />
          <span>Marcar como producto destacado</span>
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={saving}>Cancelar</button>
        <button type="submit" className="btn-submit" disabled={saving}>
          {saving ? 'Guardando...' : (product ? 'Actualizar producto' : 'Crear producto')}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
