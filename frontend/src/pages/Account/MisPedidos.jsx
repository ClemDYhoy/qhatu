import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMisPedidos } from '../../services/api';
import './Account.css';

const formatPrice = (v) => `S/. ${(parseFloat(v) || 0).toFixed(2)}`;
const formatDate = (v) => {
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d) ? '' : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
};

const MisPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getMisPedidos()
      .then((res) => {
        if (!active) return;
        setPedidos(res?.data || []);
      })
      .catch(() => active && setError('No se pudieron cargar tus pedidos.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return (
    <div className="account-page">
      <div className="container">
        <div className="account-header">
          <h1 className="account-title">Mis Pedidos</h1>
          <p className="account-subtitle">Revisa el estado y el detalle de tus compras.</p>
        </div>

        {loading && (
          <div className="account-state">
            <div className="account-spinner" />
            <p>Cargando tus pedidos...</p>
          </div>
        )}

        {!loading && error && <div className="account-alert account-alert--error">{error}</div>}

        {!loading && !error && pedidos.length === 0 && (
          <div className="account-state">
            <h3>Aún no tienes pedidos</h3>
            <p>Cuando hagas tu primera compra, aparecerá aquí.</p>
            <Link to="/products" className="account-btn account-btn--primary" style={{ marginTop: '1rem' }}>Ver productos</Link>
          </div>
        )}

        {!loading && !error && pedidos.map((p) => (
          <div className="order-card" key={p.venta_id}>
            <div className="order-card__top">
              <div>
                <div className="order-card__num">Pedido {p.numero_venta || `#${p.venta_id}`}</div>
                <div className="order-card__meta">
                  {formatDate(p.fecha_venta || p.creado_en)} · {(p.items?.length || 0)} producto(s)
                </div>
              </div>
              <span className="order-card__status">{p.estado || 'pendiente'}</span>
              <span className="order-card__total">{formatPrice(p.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MisPedidos;
