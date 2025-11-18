// C:\qhatu\frontend\src\components\layout\UserProfile\UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../services/authService';
import './UserProfile.css';

const UserProfile = ({ isOpen, onClose, user, onUserUpdate }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    genero: '',
    documento_tipo: 'DNI',
    documento_numero: '',
    direccion: '',
    distrito: '',
    ciudad: 'Huánuco',
    departamento: 'Huánuco',
    codigo_postal: ''
  });

  // Cargar datos del usuario
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        nombre_completo: user.nombre_completo || '',
        email: user.email || '',
        telefono: user.telefono || '',
        fecha_nacimiento: user.fecha_nacimiento ? user.fecha_nacimiento.split('T')[0] : '',
        genero: user.genero || '',
        documento_tipo: user.documento_tipo || 'DNI',
        documento_numero: user.documento_numero || '',
        direccion: user.direccion || '',
        distrito: user.distrito || '',
        ciudad: user.ciudad || 'Huánuco',
        departamento: user.departamento || 'Huánuco',
        codigo_postal: user.codigo_postal || ''
      });
    }
  }, [user, isOpen]);

  // Cerrar al presionar ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevenir scroll cuando está abierto Y agregar clase al body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('profile-panel-open'); // ← AGREGAR CLASE
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('profile-panel-open'); // ← REMOVER CLASE
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('profile-panel-open'); // ← LIMPIAR
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar perfil');
      }

      const data = await response.json();
      showMessage('success', '✅ Perfil actualizado exitosamente');
      
      // Actualizar usuario en contexto
      if (onUserUpdate) {
        onUserUpdate(data.usuario);
      }
      
      // Actualizar localStorage
      authService.setUser(data.usuario);
      
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', '❌ Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    navigate('/forgot-password');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="profile-overlay" onClick={onClose} />
      
      {/* Panel lateral */}
      <div className={`profile-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="profile-header">
          <h2>Mi Perfil</h2>
          <button className="close-btn" onClick={onClose} aria-label="Cerrar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Avatar y nombre */}
        <div className="profile-avatar-section">
          <div className="avatar-large">
            {user?.foto_perfil_url ? (
              <img src={user.foto_perfil_url} alt={user.nombre_completo} />
            ) : (
              <span className="avatar-initials">
                {user?.nombre_completo?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
              </span>
            )}
          </div>
          <h3>{user?.nombre_completo || 'Usuario'}</h3>
          <p className="user-email-display">{user?.email}</p>
          <span className={`role-badge role-${user?.rol_nombre}`}>
            {user?.rol_nombre === 'super_admin' && '👑 Administrador'}
            {user?.rol_nombre === 'vendedor' && '💼 Vendedor'}
            {user?.rol_nombre === 'almacenero' && '📦 Almacenero'}
            {user?.rol_nombre === 'cliente' && '🛍️ Cliente'}
          </span>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            📋 Información Personal
          </button>
          <button
            className={`tab ${activeTab === 'direccion' ? 'active' : ''}`}
            onClick={() => setActiveTab('direccion')}
          >
            📍 Dirección
          </button>
          <button
            className={`tab ${activeTab === 'seguridad' ? 'active' : ''}`}
            onClick={() => setActiveTab('seguridad')}
          >
            🔒 Seguridad
          </button>
        </div>

        {/* Mensajes */}
        {message.text && (
          <div className={`profile-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Contenido */}
        <form onSubmit={handleSubmit} className="profile-content">
          
          {/* Tab: Información Personal */}
          {activeTab === 'personal' && (
            <div className="tab-content">
              <div className="form-group">
                <label htmlFor="nombre_completo">Nombre Completo *</label>
                <input
                  type="text"
                  id="nombre_completo"
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Juan Pérez García"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                  className="disabled-input"
                />
                <small>El email no se puede modificar</small>
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej: 962000000"
                  pattern="[0-9]{9}"
                  maxLength="9"
                />
                <small>Formato: 9 dígitos</small>
              </div>

              <div className="form-group">
                <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
                <input
                  type="date"
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label htmlFor="genero">Género</label>
                <select
                  id="genero"
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="Otro">Otro</option>
                  <option value="Prefiero no decir">Prefiero no decir</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="documento_tipo">Tipo de Documento</label>
                  <select
                    id="documento_tipo"
                    name="documento_tipo"
                    value={formData.documento_tipo}
                    onChange={handleChange}
                  >
                    <option value="DNI">DNI</option>
                    <option value="RUC">RUC</option>
                    <option value="CE">Carnet de Extranjería</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="documento_numero">N° Documento</label>
                  <input
                    type="text"
                    id="documento_numero"
                    name="documento_numero"
                    value={formData.documento_numero}
                    onChange={handleChange}
                    placeholder="Ej: 70000001"
                    maxLength="11"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Dirección */}
          {activeTab === 'direccion' && (
            <div className="tab-content">
              <div className="form-group">
                <label htmlFor="direccion">Dirección</label>
                <textarea
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Ej: Jr. Dos de Mayo 456, 2do piso"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="distrito">Distrito</label>
                <input
                  type="text"
                  id="distrito"
                  name="distrito"
                  value={formData.distrito}
                  onChange={handleChange}
                  placeholder="Ej: Huánuco, Amarilis"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ciudad">Ciudad</label>
                  <input
                    type="text"
                    id="ciudad"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="departamento">Departamento</label>
                  <input
                    type="text"
                    id="departamento"
                    name="departamento"
                    value={formData.departamento}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="codigo_postal">Código Postal</label>
                <input
                  type="text"
                  id="codigo_postal"
                  name="codigo_postal"
                  value={formData.codigo_postal}
                  onChange={handleChange}
                  placeholder="Ej: 10001"
                  maxLength="5"
                />
              </div>
            </div>
          )}

          {/* Tab: Seguridad */}
          {activeTab === 'seguridad' && (
            <div className="tab-content">
              <div className="security-section">
                <div className="security-item">
                  <div className="security-icon">🔑</div>
                  <div className="security-info">
                    <h4>Contraseña</h4>
                    <p>Última actualización: {user?.actualizado_en ? new Date(user.actualizado_en).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleChangePassword}
                  >
                    Cambiar
                  </button>
                </div>

                <div className="security-item">
                  <div className="security-icon">📧</div>
                  <div className="security-info">
                    <h4>Email Verificado</h4>
                    <p>{user?.email_verificado ? '✅ Verificado' : '❌ No verificado'}</p>
                  </div>
                </div>

                <div className="security-item">
                  <div className="security-icon">📱</div>
                  <div className="security-info">
                    <h4>Teléfono Verificado</h4>
                    <p>{user?.telefono_verificado ? '✅ Verificado' : '❌ No verificado'}</p>
                  </div>
                </div>

                <div className="security-item">
                  <div className="security-icon">🕐</div>
                  <div className="security-info">
                    <h4>Último Acceso</h4>
                    <p>{user?.ultimo_acceso ? new Date(user.ultimo_acceso).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          {(activeTab === 'personal' || activeTab === 'direccion') && (
            <div className="profile-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-save"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          )}
        </form>
      </div>
    </>
  );
};

export default UserProfile;