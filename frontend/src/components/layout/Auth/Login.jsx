import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';

// SVG Icons Components
const Icons = {
  Email: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  Lock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Eye: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  EyeOff: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  Alert: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Info: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  Google: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  ),
  Spinner: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinner-icon">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
    </svg>
  )
};

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const infoMessage = location.state?.message;

  useEffect(() => {
    const token = localStorage.getItem('qhatu_token');
    const userData = localStorage.getItem('qhatu_user');
   
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        console.log('Usuario ya autenticado:', user.email);
       
        const redirectMap = {
          'super_admin': '/admin',
          'vendedor': '/vendedor',
          'almacenero': '/almacenero',
          'cliente': '/'
        };
       
        const redirectTo = redirectMap[user.rol_nombre] || '/';
        navigate(redirectTo, { replace: true });
      } catch (err) {
        console.error('Error al parsear usuario:', err);
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
   
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('El email es requerido');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email inválido');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
   
    if (!validateForm()) return;
    setError('');
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const testCredentials = {
        'admin@qhatu.com': { password: 'admin123', rol: 'super_admin', nombre: 'Admin Principal' },
        'vendedor@qhatu.com': { password: 'vendedor123', rol: 'vendedor', nombre: 'María Vendedora' },
        'almacenero@qhatu.com': { password: 'almacenero123', rol: 'almacenero', nombre: 'Carlos Almacenero' },
        'cliente@qhatu.com': { password: 'cliente123', rol: 'cliente', nombre: 'Ana Cliente' }
      };
      const user = testCredentials[formData.email.toLowerCase()];
      if (!user || user.password !== formData.password) {
        throw new Error('Credenciales inválidas');
      }
      const userData = {
        email: formData.email,
        nombre_completo: user.nombre,
        rol_nombre: user.rol
      };
      localStorage.setItem('qhatu_token', 'fake_token_' + Date.now());
      localStorage.setItem('qhatu_user', JSON.stringify(userData));
      if (formData.remember) {
        localStorage.setItem('qhatu_remember', 'true');
      }
      setAttemptCount(0);
      const redirectMap = {
        'super_admin': '/admin',
        'vendedor': '/vendedor',
        'almacenero': '/almacenero',
        'cliente': '/'
      };
      const redirectTo = redirectMap[user.rol] || '/';
      console.log(`Login exitoso. Redirigiendo a: ${redirectTo}`);
     
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setAttemptCount(prev => prev + 1);
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    alert('Google login demo - En producción conectaría con OAuth');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-circle">
              <Icons.Lock />
            </div>
          </div>
          <h1 className="auth-title">Iniciar Sesión</h1>
          <p className="auth-subtitle">Ingresa a tu cuenta de Qhatu</p>
        </div>

        {infoMessage && !error && (
          <div className="alert alert-info">
            <Icons.Info />
            <span>{infoMessage}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <Icons.Alert />
            <span>{error}</span>
          </div>
        )}

        <button className="btn-google" onClick={handleGoogleLogin} disabled={loading}>
          <Icons.Google />
          <span>Continuar con Google</span>
        </button>

        <div className="divider">
          <span>o continúa con email</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <div className="input-icon">
                <Icons.Email />
              </div>
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <div className="input-icon">
                <Icons.Lock />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                className="input-action"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                disabled={loading}
              />
              <span>Recordarme</span>
            </label>
            <a href="/forgot-password" className="link">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !formData.email || !formData.password}
          >
            {loading ? (
              <>
                <Icons.Spinner />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <span>Iniciar Sesión</span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="footer-text">
            ¿No tienes cuenta?{' '}
            <a href="/register" className="link-primary">
              Regístrate gratis
            </a>
          </p>
        </div>

        <div className="test-credentials">
          <h4 className="test-title">Credenciales de Prueba</h4>
          <div className="test-list">
            <div className="test-item">
              <strong>Admin:</strong> admin@qhatu.com / admin123
            </div>
            <div className="test-item">
              <strong>Vendedor:</strong> vendedor@qhatu.com / vendedor123
            </div>
            <div className="test-item">
              <strong>Almacenero:</strong> almacenero@qhatu.com / almacenero123
            </div>
            <div className="test-item">
              <strong>Cliente:</strong> cliente@qhatu.com / cliente123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;