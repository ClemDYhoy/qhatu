import React, { useState } from 'react';
import authService from '../../services/authService';
import { updateMyProfile } from '../../services/api';
import { useApp } from '../../contexts/AppContext';
import './Account.css';

const Configuracion = () => {
  const { user } = useApp();

  const [profile, setProfile] = useState({
    nombre_completo: user?.nombre_completo || '',
    telefono: user?.telefono || '',
    direccion: user?.direccion || '',
    distrito: user?.distrito || ''
  });
  const [profileMsg, setProfileMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState(null);
  const [savingPwd, setSavingPwd] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await updateMyProfile(profile);
      if (res?.success === false) throw new Error(res.message || 'No se pudo actualizar');
      setProfileMsg({ type: 'success', text: 'Datos actualizados correctamente.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Error al actualizar los datos.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPwdMsg(null);
    if (pwd.next.length < 8) {
      setPwdMsg({ type: 'error', text: 'La nueva contraseña debe tener al menos 8 caracteres.' });
      return;
    }
    if (pwd.next !== pwd.confirm) {
      setPwdMsg({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }
    setSavingPwd(true);
    try {
      const res = await authService.changePassword(pwd.current, pwd.next);
      if (res?.success === false) throw new Error(res.message || 'No se pudo cambiar la contraseña');
      setPwd({ current: '', next: '', confirm: '' });
      setPwdMsg({ type: 'success', text: 'Contraseña actualizada correctamente.' });
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.message || 'Error al cambiar la contraseña.' });
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="account-page">
      <div className="container">
        <div className="account-header">
          <h1 className="account-title">Configuración</h1>
          <p className="account-subtitle">Administra tus datos y la seguridad de tu cuenta.</p>
        </div>

        <div className="account-grid">
          <div className="account-card">
            <h2 className="account-card__title">Datos de perfil</h2>
            {profileMsg && <div className={`account-alert account-alert--${profileMsg.type}`}>{profileMsg.text}</div>}
            <form onSubmit={handleProfileSave}>
              <div className="account-form-row">
                <label className="account-label">Correo</label>
                <input className="account-input" value={user?.email || ''} disabled />
              </div>
              <div className="account-form-row">
                <label className="account-label">Nombre completo</label>
                <input className="account-input" value={profile.nombre_completo}
                  onChange={(e) => setProfile({ ...profile, nombre_completo: e.target.value })} />
              </div>
              <div className="account-form-row">
                <label className="account-label">Teléfono</label>
                <input className="account-input" value={profile.telefono}
                  onChange={(e) => setProfile({ ...profile, telefono: e.target.value })} />
              </div>
              <div className="account-form-row">
                <label className="account-label">Dirección</label>
                <input className="account-input" value={profile.direccion}
                  onChange={(e) => setProfile({ ...profile, direccion: e.target.value })} />
              </div>
              <div className="account-form-row">
                <label className="account-label">Distrito</label>
                <input className="account-input" value={profile.distrito}
                  onChange={(e) => setProfile({ ...profile, distrito: e.target.value })} />
              </div>
              <div className="account-actions">
                <button type="submit" className="account-btn account-btn--primary" disabled={savingProfile}>
                  {savingProfile ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>

          <div className="account-card">
            <h2 className="account-card__title">Cambiar contraseña</h2>
            {pwdMsg && <div className={`account-alert account-alert--${pwdMsg.type}`}>{pwdMsg.text}</div>}
            {user?.auth_provider === 'google' ? (
              <p className="account-subtitle">Tu cuenta usa Google. La contraseña se gestiona desde tu cuenta de Google.</p>
            ) : (
              <form onSubmit={handlePasswordSave}>
                <div className="account-form-row">
                  <label className="account-label">Contraseña actual</label>
                  <input type="password" className="account-input" value={pwd.current}
                    onChange={(e) => setPwd({ ...pwd, current: e.target.value })} />
                </div>
                <div className="account-form-row">
                  <label className="account-label">Nueva contraseña</label>
                  <input type="password" className="account-input" value={pwd.next}
                    onChange={(e) => setPwd({ ...pwd, next: e.target.value })} />
                </div>
                <div className="account-form-row">
                  <label className="account-label">Confirmar nueva contraseña</label>
                  <input type="password" className="account-input" value={pwd.confirm}
                    onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} />
                </div>
                <div className="account-actions">
                  <button type="submit" className="account-btn account-btn--primary" disabled={savingPwd}>
                    {savingPwd ? 'Actualizando...' : 'Actualizar contraseña'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;
