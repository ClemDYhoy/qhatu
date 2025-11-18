import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../services/authService';
import './UserProfile.css';

// SVG Icons Components
const Icons = {
  Close: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  MapPin: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Lock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Mail: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Phone: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Clock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Key: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  ),
  CheckCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  XCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  AlertCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Shield: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Crown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L15 9L22 9.5L17 14.5L18.5 22L12 18L5.5 22L7 14.5L2 9.5L9 9L12 2Z" />
    </svg>
  ),
  Briefcase: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  Package: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  ShoppingBag: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
};

const UserProfile = ({ isOpen, onClose, user, onUserUpdate }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});
  
  // Form state
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
    pais: 'Perú',
    codigo_postal: ''
  });

  // Load user data
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
        pais: user.pais || 'Perú',
        codigo_postal: user.codigo_postal || ''
      });
      setErrors({});
      setMessage({ type: '', text: '' });
    }
  }, [user, isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('profile-panel-open');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('profile-panel-open');
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('profile-panel-open');
    };
  }, [isOpen]);

  // Validation functions
  const validateField = (name, value) => {
    const validations = {
      nombre_completo: {
        test: (v) => v.trim().length >= 3,
        message: 'El nombre debe tener al menos 3 caracteres'
      },
      telefono: {
        test: (v) => !v || /^9\d{8}$/.test(v),
        message: 'Teléfono debe tener 9 dígitos y empezar con 9'
      },
      documento_numero: {
        test: (v) => {
          if (!v) return true;
          const tipo = formData.documento_tipo;
          if (tipo === 'DNI') return /^\d{8}$/.test(v);
          if (tipo === 'RUC') return /^\d{11}$/.test(v);
          if (tipo === 'CE') return /^[A-Z0-9]{9,12}$/.test(v);
          return true;
        },
        message: 'Formato de documento inválido'
      },
      codigo_postal: {
        test: (v) => !v || /^\d{5}$/.test(v),
        message: 'Código postal debe tener 5 dígitos'
      },
      fecha_nacimiento: {
        test: (v) => {
          if (!v) return true;
          const date = new Date(v);
          const today = new Date();
          const age = today.getFullYear() - date.getFullYear();
          return age >= 13 && age <= 120;
        },
        message: 'Debe ser mayor de 13 años'
      }
    };

    const validation = validations[name];
    if (validation && !validation.test(value)) {
      return validation.message;
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre_completo.trim()) {
      newErrors.nombre_completo = 'El nombre completo es obligatorio';
    }

    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showMessage('error', 'Por favor corrige los errores en el formulario');
      return;
    }

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
      
      if (onUserUpdate) {
        onUserUpdate(data.usuario);
      }
      
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

  const formatDate = (dateString) => {
    if (!dateString) return 'No registrado';
    return new Date(dateString).toLocaleString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = () => {
    const roleIcons = {
      super_admin: <Icons.Crown />,
      vendedor: <Icons.Briefcase />,
      almacenero: <Icons.Package />,
      cliente: <Icons.ShoppingBag />
    };

    const roleLabels = {
      super_admin: 'Administrador',
      vendedor: 'Vendedor',
      almacenero: 'Almacenero',
      cliente: 'Cliente'
    };

    return (
      <span className={`role-badge role-${user?.rol_nombre}`}>
        {roleIcons[user?.rol_nombre]}
        {roleLabels[user?.rol_nombre] || 'Usuario'}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="profile-overlay" onClick={onClose} />
      
      <div className={`profile-panel ${isOpen ? 'open' : ''}`}>
        
        {/* Header */}
        <div className="profile-header">
          <h2>
            <Icons.User />
            Mi Perfil
          </h2>
          <button className="close-btn" onClick={onClose} aria-label="Cerrar">
            <Icons.Close />
          </button>
        </div>

        {/* Avatar Section */}
        <div className="profile-avatar-section">
          <div className="avatar-large">
            {user?.foto_perfil_url ? (
              <img src={user.foto_perfil_url} alt={user.nombre_completo} />
            ) : (
              <span className="avatar-initials">
                {user?.nombre_completo?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
              </span>
            )}
          </div>
          <h3>{user?.nombre_completo || 'Usuario'}</h3>
          <p className="user-email-display">
            <Icons.Mail />
            {user?.email}
          </p>
          {getRoleBadge()}
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <Icons.User />
            Información Personal
          </button>
          <button
            className={`tab ${activeTab === 'direccion' ? 'active' : ''}`}
            onClick={() => setActiveTab('direccion')}
          >
            <Icons.MapPin />
            Dirección
          </button>
          <button
            className={`tab ${activeTab === 'seguridad' ? 'active' : ''}`}
            onClick={() => setActiveTab('seguridad')}
          >
            <Icons.Lock />
            Seguridad
          </button>
        </div>

        {/* Messages */}
        {message.text && (
          <div className={`profile-message ${message.type}`}>
            {message.type === 'success' ? <Icons.CheckCircle /> : <Icons.XCircle />}
            {message.text}
          </div>
        )}

        {/* Content */}
        <form onSubmit={handleSubmit} className="profile-content">
          
          {/* Personal Tab */}
          {activeTab === 'personal' && (
            <div className="tab-content">
              <div className="form-group">
                <label htmlFor="nombre_completo">
                  Nombre Completo <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="nombre_completo"
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Ej: Juan Pérez García"
                  className={errors.nombre_completo ? 'error' : ''}
                />
                {errors.nombre_completo && (
                  <small className="error-message">
                    <Icons.AlertCircle />
                    {errors.nombre_completo}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="disabled-input"
                />
                <small>El email no se puede modificar</small>
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <div className="input-with-icon">
                  <Icons.Phone />
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="962000000"
                    pattern="9[0-9]{8}"
                    maxLength="9"
                    className={errors.telefono ? 'error' : ''}
                  />
                </div>
                {errors.telefono && (
                  <small className="error-message">
                    <Icons.AlertCircle />
                    {errors.telefono}
                  </small>
                )}
                <small>Formato: 9 dígitos (inicia con 9)</small>
              </div>

              <div className="form-group">
                <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
                <input
                  type="date"
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  max={new Date().toISOString().split('T')[0]}
                  className={errors.fecha_nacimiento ? 'error' : ''}
                />
                {errors.fecha_nacimiento && (
                  <small className="error-message">
                    <Icons.AlertCircle />
                    {errors.fecha_nacimiento}
                  </small>
                )}
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
                    onBlur={handleBlur}
                    placeholder={
                      formData.documento_tipo === 'DNI' ? '70000001' :
                      formData.documento_tipo === 'RUC' ? '20100000001' :
                      'ABC123456'
                    }
                    maxLength={
                      formData.documento_tipo === 'RUC' ? '11' :
                      formData.documento_tipo === 'DNI' ? '8' : '12'
                    }
                    className={errors.documento_numero ? 'error' : ''}
                  />
                  {errors.documento_numero && (
                    <small className="error-message">
                      <Icons.AlertCircle />
                      {errors.documento_numero}
                    </small>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Address Tab */}
          {activeTab === 'direccion' && (
            <div className="tab-content">
              <div className="form-group">
                <label htmlFor="direccion">Dirección Completa</label>
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
                  placeholder="Ej: Huánuco, Amarilis, Pillco Marca"
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

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="pais">País</label>
                  <input
                    type="text"
                    id="pais"
                    name="pais"
                    value={formData.pais}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="codigo_postal">Código Postal</label>
                  <input
                    type="text"
                    id="codigo_postal"
                    name="codigo_postal"
                    value={formData.codigo_postal}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="10001"
                    maxLength="5"
                    className={errors.codigo_postal ? 'error' : ''}
                  />
                  {errors.codigo_postal && (
                    <small className="error-message">
                      <Icons.AlertCircle />
                      {errors.codigo_postal}
                    </small>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'seguridad' && (
            <div className="tab-content">
              <div className="security-section">
                
                <div className="security-item">
                  <div className="security-icon">
                    <Icons.Key />
                  </div>
                  <div className="security-info">
                    <h4>Contraseña</h4>
                    <p>Última actualización: {formatDate(user?.actualizado_en)}</p>
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
                  <div className={`security-icon ${user?.email_verificado ? 'verified' : 'unverified'}`}>
                    <Icons.Mail />
                  </div>
                  <div className="security-info">
                    <h4>Email Verificado</h4>
                    <p className={user?.email_verificado ? 'verified' : 'unverified'}>
                      {user?.email_verificado ? (
                        <>
                          <Icons.CheckCircle /> Verificado
                        </>
                      ) : (
                        <>
                          <Icons.XCircle /> No verificado
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="security-item">
                  <div className={`security-icon ${user?.telefono_verificado ? 'verified' : 'unverified'}`}>
                    <Icons.Phone />
                  </div>
                  <div className="security-info">
                    <h4>Teléfono Verificado</h4>
                    <p className={user?.telefono_verificado ? 'verified' : 'unverified'}>
                      {user?.telefono_verificado ? (
                        <>
                          <Icons.CheckCircle /> Verificado
                        </>
                      ) : (
                        <>
                          <Icons.XCircle /> No verificado
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="security-item">
                  <div className="security-icon">
                    <Icons.Clock />
                  </div>
                  <div className="security-info">
                    <h4>Último Acceso</h4>
                    <p>{formatDate(user?.ultimo_acceso)}</p>
                  </div>
                </div>

                <div className="security-item">
                  <div className="security-icon">
                    <Icons.Shield />
                  </div>
                  <div className="security-info">
                    <h4>Estado de Cuenta</h4>
                    <p>
                      <span className={`status-badge status-${user?.estado}`}>
                        {user?.estado === 'activo' && 'Activa'}
                        {user?.estado === 'inactivo' && 'Inactiva'}
                        {user?.estado === 'bloqueado' && 'Bloqueada'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="security-item">
                  <div className="security-icon">
                    <Icons.User />
                  </div>
                  <div className="security-info">
                    <h4>Miembro desde</h4>
                    <p>{formatDate(user?.creado_en)}</p>
                  </div>
                </div>

                <div className="security-item">
                  <div className="security-icon auth-provider">
                    {user?.auth_provider === 'google' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    ) : (
                      <Icons.Mail />
                    )}
                  </div>
                  <div className="security-info">
                    <h4>Método de Autenticación</h4>
                    <p>
                      {user?.auth_provider === 'google' ? 'Autenticado con Google' : 'Email y Contraseña'}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Action Buttons */}
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
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Icons.CheckCircle />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </>
  );
};

export default UserProfile;