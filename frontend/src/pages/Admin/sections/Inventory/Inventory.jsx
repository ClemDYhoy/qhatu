// sections/Inventory/Inventory.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Modal from '../../components/Modal';
import ProductForm from './components/ProductForm';
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllCategoriesFlat
} from '../../../../services/api';
import './Inventory.css';

const money = (v) => `S/ ${(parseFloat(v) || 0).toFixed(2)}`;
const badgeTone = (estado = '') => {
  const e = estado.toLowerCase();
  if (e.includes('agot')) return 'out';
  if (e.includes('cr')) return 'crit';
  if (e.includes('bajo') || e.includes('low')) return 'low';
  return 'ok';
};

const IconPlus = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const IconSearch = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
const IconEdit = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>);
const IconTrash = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>);

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, cRes] = await Promise.all([getAdminProducts(), getAllCategoriesFlat()]);
      setProducts(pRes?.data || []);
      setCategories(cRes?.data || []);
    } catch (err) {
      setError('No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const showNotice = (text) => {
    setNotice(text);
    setTimeout(() => setNotice(null), 3000);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      (p.nombre || '').toLowerCase().includes(q) ||
      (p.categoria?.nombre || '').toLowerCase().includes(q)
    );
  }, [products, search]);

  const openCreate = () => { setSelected(null); setFormError(null); setShowModal(true); };
  const openEdit = (p) => { setSelected(p); setFormError(null); setShowModal(true); };

  const handleSave = async (data) => {
    setSaving(true);
    setFormError(null);
    try {
      if (selected) await updateProduct(selected.producto_id, data);
      else await createProduct(data);
      setShowModal(false);
      showNotice(selected ? 'Producto actualizado.' : 'Producto creado.');
      await load();
    } catch (err) {
      setFormError(err.message || 'Error al guardar el producto.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.nombre}"?`)) return;
    try {
      await deleteProduct(p.producto_id);
      showNotice('Producto eliminado.');
      await load();
    } catch (err) {
      alert(err.message || 'No se pudo eliminar el producto.');
    }
  };

  return (
    <div className="inventory-section">
      <div className="section-header">
        <h1>Gestión de Inventario</h1>
        <button className="btn-primary" onClick={openCreate} type="button">
          <IconPlus /> Nuevo producto
        </button>
      </div>

      {notice && <div className="inv-notice">{notice}</div>}
      {error && <div className="inv-error">{error}</div>}

      <div className="inv-toolbar">
        <div className="inv-search">
          <IconSearch />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o categoría..."
            aria-label="Buscar productos"
          />
        </div>
        <span className="inv-count">{filtered.length} producto(s)</span>
      </div>

      {loading ? (
        <div className="inventory-loading">
          <div className="spinner" />
          <p>Cargando inventario...</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="inv-empty">No hay productos que coincidan.</p>
      ) : (
        <div className="inv-table-wrapper">
          <table className="inv-table">
            <thead>
              <tr>
                <th aria-label="Imagen"></th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th aria-label="Acciones"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.producto_id}>
                  <td>
                    <img
                      className="inv-thumb"
                      src={p.url_imagen || '/awaiting-image.jpeg'}
                      alt={p.nombre}
                      onError={(e) => { e.currentTarget.src = '/awaiting-image.jpeg'; }}
                    />
                  </td>
                  <td>
                    <span className="inv-name">{p.nombre}</span>
                    {p.destacado && <span className="inv-star">Destacado</span>}
                  </td>
                  <td>{p.categoria?.nombre || '—'}</td>
                  <td className="inv-price">{money(p.precio)}</td>
                  <td>{p.stock}</td>
                  <td>
                    <span className={`inv-badge inv-badge--${badgeTone(p.estado_stock)}`}>
                      {p.estado_stock || '—'}
                    </span>
                  </td>
                  <td className="inv-actions">
                    <button type="button" onClick={() => openEdit(p)} aria-label="Editar producto"><IconEdit /></button>
                    <button type="button" className="is-danger" onClick={() => handleDelete(p)} aria-label="Eliminar producto"><IconTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selected ? 'Editar producto' : 'Nuevo producto'}
        size="large"
      >
        <ProductForm
          product={selected}
          categories={categories}
          onSave={handleSave}
          onCancel={() => setShowModal(false)}
          saving={saving}
          error={formError}
        />
      </Modal>
    </div>
  );
};

export default Inventory;
