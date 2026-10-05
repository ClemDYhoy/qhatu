// sections/Dashboard/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../../services/api';
import './Dashboard.css';

const money = (v) => `S/ ${(parseFloat(v) || 0).toFixed(2)}`;
const dayLabel = (fecha) => {
  const d = new Date(fecha);
  return isNaN(d) ? '' : d.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit' });
};

// ==================== ICONOS ====================
const IcoMoney = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>);
const IcoBag = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>);
const IcoBox = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>);
const IcoAlert = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>);
const IcoTicket = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>);
const IcoCart = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>);
const IcoSpark = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z"/><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg>);
const IcoRefresh = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>);

const Kpi = ({ icon, label, value, accent = 'gold', sub }) => (
  <div className={`kpi kpi--${accent}`}>
    <div className="kpi__icon">{icon}</div>
    <div className="kpi__body">
      <span className="kpi__label">{label}</span>
      <span className="kpi__value">{value}</span>
      {sub && <span className="kpi__sub">{sub}</span>}
    </div>
  </div>
);

const SalesBars = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="panel__empty">Aún no hay ventas registradas en este período.</p>;
  }
  const values = data.map((d) => parseFloat(d.ingresos) || 0);
  const max = Math.max(...values, 1);
  return (
    <div className="bars">
      {data.map((d, i) => (
        <div className="bars__wrapper" key={i}>
          <div className="bars__track">
            <div className="bars__bar" style={{ height: `${Math.max(6, (values[i] / max) * 100)}%` }} title={money(d.ingresos)}>
              <span className="bars__value">{money(d.ingresos)}</span>
            </div>
          </div>
          <span className="bars__label">{dayLabel(d.fecha)}</span>
        </div>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [aiOnline, setAiOnline] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, kpis, summary, top, low, health] = await Promise.allSettled([
        api.get('/analytics/dashboard'),
        api.get('/analytics-ventas/kpis'),
        api.get('/analytics/sales-summary', { params: { days: 7 } }),
        api.get('/analytics/top-selling', { params: { days: 30, limit: 5 } }),
        api.get('/products/low-stock', { params: { limit: 6 } }),
        api.get('/ml/health')
      ]);

      const val = (r) => (r.status === 'fulfilled' ? r.value?.data : null);

      setAiOnline(health.status === 'fulfilled');
      setData({
        kpisGeneral: val(dash)?.data || {},
        kpis: val(kpis)?.data || {},
        sales: val(summary)?.data || { summary: {}, by_day: [] },
        top: val(top)?.data || [],
        lowStock: val(low)?.data || []
      });
    } catch (err) {
      setError('No se pudieron cargar los datos del panel.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large" />
        <p>Cargando panel...</p>
      </div>
    );
  }

  const g = data?.kpisGeneral || {};
  const k = data?.kpis || {};
  const sales = data?.sales || { summary: {}, by_day: [] };
  const top = data?.top || [];
  const lowStock = data?.lowStock || [];

  const insights = [];
  if (Number(g.productos_bajo_stock) > 0) {
    insights.push({ tone: 'warn', text: `${g.productos_bajo_stock} producto(s) con stock bajo o crítico: prioriza el reabastecimiento.` });
  }
  if (top[0]) {
    insights.push({ tone: 'info', text: `El más vendido es "${top[0].nombre}" (${top[0].categoria_nombre || 'sin categoría'}).` });
  }
  if (Number(g.carritos_activos) > 0) {
    insights.push({ tone: 'info', text: `${g.carritos_activos} carrito(s) activos sin convertir: buenos candidatos para seguimiento por WhatsApp.` });
  }
  if (Number(k.ticket_promedio) > 0) {
    insights.push({ tone: 'good', text: `Ticket promedio de ${money(k.ticket_promedio)}. Sugerencia: ofrece combos para subir el promedio.` });
  }
  if (Number(k.descuentos_aplicados) === 0 && Number(k.total_ventas) > 0) {
    insights.push({ tone: 'info', text: 'No se aplicaron descuentos este período; una promoción puntual puede aumentar la conversión.' });
  }
  if (insights.length === 0) {
    insights.push({ tone: 'good', text: 'Todo en orden. Sin alertas relevantes por ahora.' });
  }

  return (
    <div className="dashboard-section">
      <div className="dashboard-topbar">
        <div>
          <h1 className="dashboard-title">Panel de control</h1>
          <p className="dashboard-subtitle">Gestión de ventas e inventario con inteligencia artificial</p>
        </div>
        <div className="dashboard-topbar__actions">
          <span className={`ai-status ${aiOnline ? 'is-on' : 'is-off'}`}>
            <span className="ai-status__dot" />
            {aiOnline ? 'IA activa' : 'IA no disponible'}
          </span>
          <button className="dashboard-refresh" onClick={loadData} type="button">
            <IcoRefresh /> Actualizar
          </button>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {/* KPIs */}
      <div className="kpi-grid">
        <Kpi icon={<IcoMoney />} accent="gold" label="Ingresos de hoy" value={money(g.ingresos_hoy)} />
        <Kpi icon={<IcoBag />} accent="red" label="Ventas de hoy" value={g.ventas_hoy ?? 0} />
        <Kpi icon={<IcoBox />} accent="green" label="Productos disponibles" value={g.productos_disponibles ?? 0} />
        <Kpi icon={<IcoAlert />} accent="amber" label="Stock bajo" value={g.productos_bajo_stock ?? 0} sub="requieren atención" />
        <Kpi icon={<IcoTicket />} accent="blue" label="Ticket promedio" value={money(k.ticket_promedio)} />
        <Kpi icon={<IcoCart />} accent="gray" label="Carritos activos" value={g.carritos_activos ?? 0} />
      </div>

      {/* Chart + IA */}
      <div className="dashboard-row-2">
        <div className="panel">
          <div className="panel__head">
            <h3 className="panel__title">Ingresos de los últimos 7 días</h3>
            <span className="panel__muted">Total {money(sales.summary?.ingresos_totales)}</span>
          </div>
          <SalesBars data={sales.by_day} />
        </div>

        <div className="panel panel--ai">
          <div className="panel__head">
            <h3 className="panel__title"><IcoSpark /> Insights de IA</h3>
          </div>
          <ul className="ai-insights">
            {insights.map((it, i) => (
              <li key={i} className={`ai-insight ai-insight--${it.tone}`}>{it.text}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Top productos + inventario crítico */}
      <div className="dashboard-row-2">
        <div className="panel">
          <div className="panel__head">
            <h3 className="panel__title">Productos más vendidos</h3>
            <Link to="/products" className="panel__link">Ver catálogo</Link>
          </div>
          {top.length === 0 ? (
            <p className="panel__empty">Sin ventas registradas todavía.</p>
          ) : (
            <ul className="mini-list">
              {top.map((p) => (
                <li className="mini-list__item" key={p.producto_id}>
                  <img
                    className="mini-list__img"
                    src={p.url_imagen || '/awaiting-image.jpeg'}
                    alt={p.nombre}
                    onError={(e) => { e.currentTarget.src = '/awaiting-image.jpeg'; }}
                  />
                  <div className="mini-list__info">
                    <span className="mini-list__name">{p.nombre}</span>
                    <span className="mini-list__meta">{p.categoria_nombre || 'Sin categoría'} · {p.total_vendido} vendidos</span>
                  </div>
                  <span className="mini-list__value">{money(p.ingresos_totales)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <div className="panel__head">
            <h3 className="panel__title">Inventario crítico</h3>
            <span className="panel__muted">{lowStock.length} producto(s)</span>
          </div>
          {lowStock.length === 0 ? (
            <p className="panel__empty">Todo el inventario está en niveles saludables.</p>
          ) : (
            <ul className="mini-list">
              {lowStock.map((p) => (
                <li className="mini-list__item" key={p.producto_id}>
                  <img
                    className="mini-list__img"
                    src={p.url_imagen || '/awaiting-image.jpeg'}
                    alt={p.nombre}
                    onError={(e) => { e.currentTarget.src = '/awaiting-image.jpeg'; }}
                  />
                  <div className="mini-list__info">
                    <span className="mini-list__name">{p.nombre}</span>
                    <span className="mini-list__meta">Stock: {p.stock} · {p.estado_stock}</span>
                  </div>
                  <span className={`mini-list__tag mini-list__tag--${(p.estado_stock || '').toLowerCase() === 'crítico' ? 'crit' : 'low'}`}>
                    {p.estado_stock}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
