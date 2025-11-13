// C:\qhatu\frontend\src\components\layout\Auth\Register.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import authService from '../../../services/authService';
import './Register.css';

// ====================================
// 🎨 ICONOS SVG
// ====================================
const Icons = {
  Alert: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  
  Success: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  
  EyeOff: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  
  Eye: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  
  Mail: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  
  Phone: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  
  Lock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  
  Spinner: () => (
    <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  ),

  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),

  CheckCircle: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  )
};

// ====================================
// 🧩 COMPONENTE PRINCIPAL
// ====================================
const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre_completo: '',
    telefono: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // ====================================
  // 🔧 EFECTOS
  // ====================================
  useEffect(() => {
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';

    // Manejar tecla ESC
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !loading) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [loading]);

  // ====================================
  // 🔧 VALIDACIONES
  // ====================================
  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('El email es requerido');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un email válido');
      return false;
    }

    if (!formData.nombre_completo.trim()) {
      setError('El nombre completo es requerido');
      return false;
    }

    if (formData.nombre_completo.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return false;
    }

    if (!formData.password) {
      setError('La contraseña es requerida');
      return false;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    if (formData.telefono && formData.telefono.length < 9) {
      setError('El teléfono debe tener al menos 9 dígitos');
      return false;
    }

    return true;
  };

  // ====================================
  // 🔧 HANDLERS - CORREGIDOS
  // ====================================
  const handleClose = () => {
    if (loading) return;
    
    setIsClosing(true);
    setTimeout(() => {
      // Navegar hacia atrás en el historial para cerrar el modal
      navigate(-1);
    }, 200);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      handleClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authService.register({
        email: formData.email.trim(),
        password: formData.password,
        nombre_completo: formData.nombre_completo.trim(),
        telefono: formData.telefono.trim() || null
      });

      // Marcar registro como completo y mostrar éxito
      setRegistrationComplete(true);
      setSuccess('¡Usuario registrado correctamente!');
      setLoading(false);
      
      // Cerrar automáticamente después de 2 segundos
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (err) {
      console.error('❌ Error en registro:', err);
      setError(err.message || 'Error al crear la cuenta. Intenta nuevamente.');
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔐 Iniciando autenticación con Google...');
      
      await authService.googleAuth(credentialResponse.credential);
      
      // Marcar como completo y mostrar éxito
      setRegistrationComplete(true);
      setSuccess('¡Bienvenido! Iniciando sesión...');
      setLoading(false);

      // Cerrar automáticamente después de 1.5 segundos
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (err) {
      console.error('❌ Error en autenticación con Google:', err);
      setError(err.message || 'Error al conectar con Google. Intenta con email.');
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('❌ Error al iniciar sesión con Google');
    setError('No se pudo conectar con Google. Intenta nuevamente.');
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    // Cerrar este modal y abrir el de login
    handleClose();
    setTimeout(() => {
      navigate('/login', { state: { from: location.state?.from } });
    }, 250);
  };

  // ====================================
  // 🎨 RENDER
  // ====================================
  return (
    <div className={`auth-overlay ${isClosing ? 'closing' : ''}`} onClick={handleOverlayClick}>
      <div className="auth-modal">
        <button 
          className="auth-close" 
          onClick={handleClose}
          aria-label="Cerrar registro"
          disabled={loading}
          type="button"
        >
          <Icons.Close />
        </button>

        <div className="auth-content">
          {/* Header - Solo mostrar si no hay éxito de registro */}
          {!registrationComplete && (
            <div className="auth-header">
              <h1 className="auth-title">Crear Cuenta</h1>
              <p className="auth-subtitle">
                Únete a Qhatu y disfruta de ofertas exclusivas
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="alert alert-error">
              <Icons.Alert />
              <span>{error}</span>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="alert alert-success">
              <Icons.Success />
              <span>{success}</span>
            </div>
          )}

          {/* Estado de éxito completo */}
          {registrationComplete && (
            <div className="success-state">
              <div className="success-icon">
                <Icons.CheckCircle />
              </div>
              <p className="success-message">¡Usuario registrado correctamente!</p>
              <p className="success-subtitle">Redirigiendo...</p>
            </div>
          )}

          {/* Formulario normal (solo si no hay registro completo) */}
          {!registrationComplete && (
            <>
              {/* Google Login */}
              <div className="social-login">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  text="signup_with"
                  locale="es"
                  shape="rectangular"
                />
              </div>

              {/* Divider */}
              <div className="divider">
                <span>o continúa con email</span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="auth-form" noValidate>
                <div className="form-grid">
                  {/* Nombre */}
                  <div className="input-group">
                    <label htmlFor="nombre" className="input-label">
                      <Icons.User />
                      <span>Nombre completo</span>
                      <span className="required">*</span>
                    </label>
                    <input
                      id="nombre"
                      type="text"
                      name="nombre_completo"
                      className="input-field"
                      placeholder="Ej: Juan Pérez García"
                      value={formData.nombre_completo}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      autoFocus
                      minLength={3}
                    />
                  </div>

                  {/* Email */}
                  <div className="input-group">
                    <label htmlFor="email" className="input-label">
                      <Icons.Mail />
                      <span>Email</span>
                      <span className="required">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      className="input-field"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      disabled={loading}
                    />
                  </div>

                  {/* Teléfono */}
                  <div className="input-group">
                    <label htmlFor="telefono" className="input-label">
                      <Icons.Phone />
                      <span>Teléfono</span>
                      <span className="optional">(opcional)</span>
                    </label>
                    <input
                      id="telefono"
                      type="tel"
                      name="telefono"
                      className="input-field"
                      placeholder="999 999 999"
                      value={formData.telefono}
                      onChange={handleChange}
                      disabled={loading}
                      pattern="[0-9]{9,15}"
                    />
                    <span className="input-hint">Para notificaciones de pedidos</span>
                  </div>

                  {/* Password */}
                  <div className="input-group">
                    <label htmlFor="password" className="input-label">
                      <Icons.Lock />
                      <span>Contraseña</span>
                      <span className="required">*</span>
                    </label>
                    <div className="input-with-icon">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        className="input-field"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="input-icon-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                      </button>
                    </div>
                    <span className="input-hint">Mínimo 6 caracteres</span>
                  </div>

                  {/* Confirm Password */}
                  <div className="input-group">
                    <label htmlFor="confirmPassword" className="input-label">
                      <Icons.Lock />
                      <span>Confirmar contraseña</span>
                      <span className="required">*</span>
                    </label>
                    <div className="input-with-icon">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        className="input-field"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="input-icon-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={loading}
                        tabIndex={-1}
                        aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showConfirmPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Icons.Spinner />
                      <span>Creando cuenta...</span>
                    </>
                  ) : (
                    'Crear cuenta'
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="auth-footer">
                <p className="footer-text">
                  ¿Ya tienes cuenta?{' '}
                  <a href="/login" onClick={handleLoginClick} className="footer-link">
                    Inicia sesión
                  </a>
                </p>
                <p className="footer-legal">
                  Al registrarte, aceptas nuestros{' '}
                  <a href="/terminos" target="_blank" rel="noopener noreferrer">Términos</a>
                  {' y '}
                  <a href="/privacidad" target="_blank" rel="noopener noreferrer">Privacidad</a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;