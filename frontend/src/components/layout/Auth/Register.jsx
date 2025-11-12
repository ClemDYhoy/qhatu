// C:\qhatu\frontend\src\components\layout\Auth\Register.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import authService from '../../../services/authService';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre_completo: '',
    telefono: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // ====================================
  // 🔧 HANDLERS
  // ====================================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    if (!formData.nombre_completo.trim()) {
      setError('El nombre completo es requerido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authService.register({
        email: formData.email,
        password: formData.password,
        nombre_completo: formData.nombre_completo,
        telefono: formData.telefono
      });

      // Redirigir
      navigate(from, { replace: true });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');

    try {
      const result = await authService.googleAuth(credentialResponse.credential);

      // Redirigir
      navigate(from, { replace: true });

    } catch (err) {
      setError(err.message || 'Error con Google. Intenta con email.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Error al conectar con Google. Intenta nuevamente.');
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    navigate('/login', { state: { from: location.state?.from } });
  };

  // ====================================
  // 🎨 RENDER
  // ====================================

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <h2>Crear Cuenta</h2>
          <p className="auth-subtitle">
            Regístrate en Qhatu para guardar tu carrito y recibir ofertas
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="error-message" role="alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* Google Login */}
        <div className="google-login-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            theme="outline"
            size="large"
            text="signup_with"
            width="100%"
            locale="es"
          />
        </div>

        <div className="auth-divider">
          <span>o regístrate con email</span>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="register-nombre">
              Nombre completo
              <span className="required">*</span>
            </label>
            <input
              id="register-nombre"
              type="text"
              name="nombre_completo"
              placeholder="Juan Pérez"
              value={formData.nombre_completo}
              onChange={handleChange}
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email">
              Email
              <span className="required">*</span>
            </label>
            <input
              id="register-email"
              type="email"
              name="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-telefono">
              Teléfono (opcional)
            </label>
            <input
              id="register-telefono"
              type="tel"
              name="telefono"
              placeholder="999 999 999"
              value={formData.telefono}
              onChange={handleChange}
              disabled={loading}
            />
            <small className="form-hint">Para notificaciones por WhatsApp</small>
          </div>

          <div className="form-group">
            <label htmlFor="register-password">
              Contraseña
              <span className="required">*</span>
            </label>
            <div className="password-wrapper">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
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
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            <small className="form-hint">Mínimo 6 caracteres</small>
          </div>

          <div className="form-group">
            <label htmlFor="register-confirm-password">
              Confirmar contraseña
              <span className="required">*</span>
            </label>
            <div className="password-wrapper">
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
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
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creando cuenta...
              </>
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>

        <div className="auth-links">
          <p className="login-prompt">
            ¿Ya tienes cuenta?{' '}
            <a href="/login" onClick={handleLoginClick} className="link-primary">
              Inicia sesión
            </a>
          </p>
        </div>

        <div className="auth-footer">
          <p className="text-muted">
            Al registrarte, aceptas nuestros{' '}
            <a href="/terminos" target="_blank">Términos y Condiciones</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;