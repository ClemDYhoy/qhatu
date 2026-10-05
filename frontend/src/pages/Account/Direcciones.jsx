import React, { useState } from 'react';
import { updateMyProfile } from '../../services/api';
import { useApp } from '../../contexts/AppContext';
import './Account.css';

const Direcciones = () => {
  const { user } = useApp();
  const [form, setForm] = useState({
    direccion: user?.direccion || '',
    distrito: user?.distrito || '',
    ciudad: user?.ciudad || 'Huánuco',
    departamento: user?.departamento || 'Huánuco',
    codigo_postal: user?.codigo_postal || ''
  });
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await updateMyProfile(form);
      if (res?.success === false) throw new Error(res.message || 'No se pudo guardar');
      setMsg({ type: 'success', text: 'Dirección guardada correctamente.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Error al guardar la dirección.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="account-page">
      <div className="container">
        <div className="account-header">
          <h1 className="account-title">Mis Direcciones</h1>
          <p className="account-subtitle">Guarda tu dirección para agilizar tus entregas.</p>
        </div>

        <div className="account-card" style={{ maxWidth: 620 }}>
          {msg && <div className={`account-alert account-alert--${msg.type}`}>{msg.text}</div>}
          <form onSubmit={handleSave}>
            <div className="account-form-row">
              <label className="account-label">Dirección</label>
              <input className="account-input" value={form.direccion} onChange={set('direccion')} placeholder="Av. / Calle y número" />
            </div>
            <div className="account-form-row">
              <label className="account-label">Distrito</label>
              <input className="account-input" value={form.distrito} onChange={set('distrito')} />
            </div>
            <div className="account-form-row">
              <label className="account-label">Ciudad</label>
              <input className="account-input" value={form.ciudad} onChange={set('ciudad')} />
            </div>
            <div className="account-form-row">
              <label className="account-label">Departamento</label>
              <input className="account-input" value={form.departamento} onChange={set('departamento')} />
            </div>
            <div className="account-form-row">
              <label className="account-label">Código postal</label>
              <input className="account-input" value={form.codigo_postal} onChange={set('codigo_postal')} />
            </div>
            <div className="account-actions">
              <button type="submit" className="account-btn account-btn--primary" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar dirección'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Direcciones;
