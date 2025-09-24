import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../../api.js';
import Input from '../../ui/Input/Input.jsx';
import './Login.css';

function Login({ onClose, onSwitchToRegister }) {
const [formData, setFormData] = useState({
    correo: '',
    contrasena: ''
});
const [error, setError] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [emailValid, setEmailValid] = useState(null);
const [submitSuccess, setSubmitSuccess] = useState(false);
const navigate = useNavigate();
const submitBtnRef = useRef(null);

// Validación de email en tiempo real
useEffect(() => {
    if (formData.correo) {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo);
    setEmailValid(isValid);
    } else {
    setEmailValid(null);
    }
}, [formData.correo]);

const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
};

const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!emailValid) {
    setError('Por favor ingresa un correo electrónico válido');
    return;
    }

    setError('');
    setIsLoading(true);

    try {
    const { data } = await login(formData);
    
    // Animación de éxito
    setSubmitSuccess(true);
    submitBtnRef.current.classList.add('success');
    
    setTimeout(() => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Cerrar modal con animación
        document.querySelector('.auth-modal-content').classList.add('success-animation');
        
        setTimeout(() => {
        navigate(data.user.rol === 'admin' ? '/admin' : '/products');
        onClose();
        }, 600);
        
    }, 1000);

    } catch (error) {
    setError(error.message || 'Error al iniciar sesión');
    document.querySelector('.auth-modal-content').classList.add('error-shake');
    setTimeout(() => {
        document.querySelector('.auth-modal-content').classList.remove('error-shake');
    }, 600);
    } finally {
    setIsLoading(false);
    }
};

return (
    <div className="auth-modal-overlay">
    <div className="auth-modal-background"></div>
    <div className="auth-modal-content scale-in" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
        <span className="close-icon"></span>
        </button>
        
        <div className="auth-modal-header">
        <h2>Iniciar Sesión</h2>
        <p>Accede a tu cuenta para descubrir experiencias únicas</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="auth-error-message">{error}</div>}
        
        <div className="form-group">
            <div className="form-input-container">
            <Input
                type="email"
                label="Correo Electrónico:"
                value={formData.correo}
                onChange={(e) => handleInputChange('correo', e.target.value)}
                required
                autoFocus
                className={emailValid === false ? 'error' : emailValid ? 'valid' : ''}
            />
            {emailValid && (
                <span className="email-validation valid">✓</span>
            )}
            {emailValid === false && (
                <span className="email-validation invalid">✗</span>
            )}
            </div>
        </div>
        
        <div className="form-group">
            <div className="form-input-container">
            <Input
                type={showPassword ? "text" : "password"}
                label="Contraseña:"
                value={formData.contrasena}
                onChange={(e) => handleInputChange('contrasena', e.target.value)}
                required
            />
            <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
            </div>
        </div>

        <button 
            ref={submitBtnRef}
            type="submit" 
            className={`submit-btn ${isLoading ? 'loading' : ''} ${submitSuccess ? 'success' : ''}`}
            disabled={isLoading}
        >
            <span className="btn-content">
            {isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
            </span>
            
            <span className="btn-loading">
            <div className="spinner"></div>
            Procesando...
            </span>

            <svg className="checkmark" viewBox="0 0 52 52">
            <path d="M14.1 27.2l7.1 7.2 16.7-16.8" fill="none" stroke="#000" strokeWidth="6"/>
            </svg>
        </button>
        </form>

        <div className="auth-modal-footer text-center">
        <p className="mb-4">
            ¿No tienes cuenta?{' '}
            <button className="auth-switch-btn" onClick={onSwitchToRegister}>
            Regístrate aquí
            </button>
        </p>
        <p>
            <a href="/forgot-password" className="auth-link">
            ¿Olvidaste tu contraseña?
            </a>
        </p>
        </div>
    </div>
    </div>
);
}

export default Login;