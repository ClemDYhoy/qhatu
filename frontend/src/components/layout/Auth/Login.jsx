// C:\qhatu\frontend\src\components\layout\Auth\Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import authService from '../../../services/authService';
import './Login.css';

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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  
  Info: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
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
  
  Mail: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
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
  )
};

// ====================================
// 🧩 COMPONENTE PRINCIPAL
// ====================================
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const infoMessage = location.state?.message;

  // ====================================
  // 🔧 EFECTOS
  // ====================================
  
  // Bloquear scroll del body y manejar ESC
  useEffect(() => {
    document.body.style.overflow = 'hidden';

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

  // Mostrar mensaje informativo si existe
  useEffect(() => {
    if (infoMessage) {
      setInfo(infoMessage);
    }
  }, [infoMessage]);

  // ====================================
  // 🔧 REDIRECCIÓN INTELIGENTE
  // ====================================
  const getRedirectRoute = (role) => {
    const routes = {
      super_admin: '/admin',
      vendedor: '/vendedor',
      almacenero: '/almacenero',
      cliente: '/'
    };
    return routes[role] || '/';
  };

  const redirectAfterLogin = (user) => {
    const userRole = user.rol_nombre;
    const isStaff = ['super_admin', 'vendedor', 'almacenero'].includes(userRole);
    
    let redirectTo = '/';

    if (isStaff) {
      redirectTo = getRedirectRoute(userRole);
      console.log('✅ Staff detectado. Redirigiendo a:', redirectTo);
    } else {
      if (from && from !== '/login' && from !== '/register') {
        redirectTo = from;
        console.log('✅ Cliente vuelve a:', from);
      } else {
        console.log('✅ Cliente va al home');
      }
    }

    // Disparar evento global para actualizar UI
    window.dispatchEvent(new Event('userDataChanged'));

    // Mostrar éxito y redirigir
    setSuccess('¡Bienvenido! Iniciando sesión...');
    
    setTimeout(() => {
      navigate(redirectTo, { replace: true });
    }, 1000);
  };

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

    if (!formData.password) {
      setError('La contraseña es requerida');
      return false;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    return true;
  };

  // ====================================
  // 🔧 HANDLERS
  // ====================================
  const handleClose = () => {
    if (loading) return;
    navigate(-1);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      handleClose();
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setError('');
    setSuccess('');
    setInfo('');
    setLoading(true);

    try {
      const response = await authService.login(formData.email.trim(), formData.password);

      if (response.success && response.user) {
        if (formData.remember) {
          localStorage.setItem('qhatu_remember', 'true');
        }
        
        redirectAfterLogin(response.user);
      }

    } catch (err) {
      console.error('❌ Error en login:', err);
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    setSuccess('');
    setInfo('');

    try {
      console.log('🔐 Iniciando autenticación con Google...');
      
      const result = await authService.googleAuth(credentialResponse.credential);
      
      if (result.success && result.user) {
        redirectAfterLogin(result.user);
      }

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

  const handleRegisterClick = (e) => {
    e.preventDefault();
    navigate('/register', { 
      state: { 
        backgroundLocation: location.state?.backgroundLocation,
        from: location.state?.from 
      } 
    });
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate('/forgot-password', { 
      state: { 
        backgroundLocation: location.state?.backgroundLocation 
      } 
    });
  };

  // ====================================
  // 🎨 RENDER
  // ====================================
  return (
    <div className="auth-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal">
        <button 
          className="auth-close" 
          onClick={handleClose}
          aria-label="Cerrar"
          disabled={loading}
          type="button"
        >
          <Icons.Close />
        </button>

        <div className="auth-content">
          {/* Header */}
          <div className="auth-header">
            <h1 className="auth-title">Iniciar Sesión</h1>
            <p className="auth-subtitle">
              Bienvenido de vuelta a Qhatu
            </p>
          </div>

          {/* Mensajes */}
          {info && !error && !success && (
            <div className="alert alert-info">
              <Icons.Info />
              <span>{info}</span>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <Icons.Alert />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <Icons.Success />
              <span>{success}</span>
            </div>
          )}

          {/* Google Login */}
          {!success && (
            <>
              <div className="social-login">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  text="signin_with"
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
                      autoFocus
                    />
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
                        autoComplete="current-password"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="input-icon-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
                      >
                        {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Opciones */}
                <div className="form-options">
                  <label className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={formData.remember}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <span className="checkbox-label">Recordarme</span>
                  </label>
                  <a 
                    href="/forgot-password" 
                    onClick={handleForgotPassword}
                    className="forgot-link"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading || !formData.email || !formData.password}
                >
                  {loading ? (
                    <>
                      <Icons.Spinner />
                      <span>Iniciando sesión...</span>
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="auth-footer">
                <p className="footer-text">
                  ¿No tienes cuenta?{' '}
                  <a href="/register" onClick={handleRegisterClick} className="footer-link">
                    Regístrate gratis
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;