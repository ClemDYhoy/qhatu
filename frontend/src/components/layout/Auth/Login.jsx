import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../../services/api.js';
import Input from '../../ui/Input/Input.jsx';
import './Login.css';

function Login({ onClose, onSwitchToRegister }) {
const [formData, setFormData] = useState({
    correo: '',
    contrasena: ''
});
const [error, setError] = useState('');
const [successMessage, setSuccessMessage] = useState('');
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

// Cerrar modal con ESC
useEffect(() => {
    const handleEsc = (e) => {
    if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
}, [onClose]);

const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
};

const validateForm = () => {
    if (!formData.correo.trim()) {
    setError('El correo electrónico es obligatorio');
    return false;
    }

    if (!emailValid) {
    setError('Por favor ingresa un correo electrónico válido');
    return false;
    }

    if (!formData.contrasena.trim()) {
    setError('La contraseña es obligatoria');
    return false;
    }

    if (formData.contrasena.length < 8) {
    setError('La contraseña debe tener al menos 8 caracteres');
    return false;
    }

    return true;
};

const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
    const response = await login(formData);
    
    // Mostrar mensaje de éxito
    setSubmitSuccess(true);
    setSuccessMessage('¡Inicio de sesión exitoso!');
    
    if (submitBtnRef.current) {
        submitBtnRef.current.classList.add('success');
    }
    
    // Guardar datos del usuario
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));

    window.dispatchEvent(new Event('userDataChanged'));
    
    // Animación de éxito
    const modalContent = document.querySelector('.auth-modal-content');
    if (modalContent) {
        modalContent.classList.add('login-success');
    }
    
    // Cerrar modal y navegar según el rol
    setTimeout(() => {
        onClose();
        if (response.user.rol === 'admin') {
        navigate('/admin');
        } else {
        navigate('/products');
        }
    }, 1200);

    } catch (error) {
    console.error('Error en login:', error);
    
    let errorMessage = 'Error al iniciar sesión';
    
    // Manejar errores específicos
    if (error.response && error.response.data) {
        const serverError = error.response.data.error || error.response.data.message;
        
        if (serverError) {
        if (serverError.includes('Credenciales inválidas') || serverError.includes('invalid')) {
            errorMessage = 'Correo o contraseña incorrectos. Verifica tus datos.';
        } else if (serverError.includes('usuario no encontrado') || serverError.includes('not found')) {
            errorMessage = 'No existe una cuenta con este correo electrónico.';
        } else if (serverError.includes('cuenta desactivada') || serverError.includes('inactive')) {
            errorMessage = 'Tu cuenta está desactivada. Contacta al administrador.';
        } else {
            errorMessage = serverError;
        }
        }
    } else if (error.message) {
        if (error.message.includes('timeout')) {
        errorMessage = 'Tiempo de espera agotado. Verifica tu conexión.';
        } else if (error.message.includes('Network Error')) {
        errorMessage = 'Error de conexión. Verifica que el servidor esté funcionando.';
        } else {
        errorMessage = error.message;
        }
    }
    
    setError(errorMessage);
    
    // Animación de error
    const modalContent = document.querySelector('.auth-modal-content');
    if (modalContent) {
        modalContent.classList.add('error-shake');
        setTimeout(() => {
        modalContent.classList.remove('error-shake');
        }, 600);
    }
    } finally {
    setIsLoading(false);
    }
};

const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
};

return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
    <div className="auth-modal-background"></div>
    <div className="auth-modal-content scale-in" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Cerrar">
        <span className="close-icon"></span>
        </button>
        
        <div className="auth-modal-header">
        <h2 className="text-gradient">Iniciar Sesión</h2>
        <p>Accede a tu cuenta para descubrir experiencias únicas</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
        {/* Mensaje de error */}
        {error && <div className="auth-error-message fade-in">{error}</div>}
        
        {/* Mensaje de éxito */}
        {successMessage && (
            <div className="auth-success-message fade-in">
            <span className="success-icon">✓</span>
            {successMessage}
            </div>
        )}
        
        {/* Email */}
        <div className="form-group">
            <div className="form-input-container">
            <Input
                type="email"
                label="Correo Electrónico:"
                value={formData.correo}
                onChange={(e) => handleInputChange('correo', e.target.value)}
                required
                autoFocus
                maxLength={255}
                placeholder="ejemplo@correo.com"
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
        
        {/* Contraseña */}
        <div className="form-group">
            <div className="form-input-container">
            <Input
                type={showPassword ? "text" : "password"}
                label="Contraseña:"
                value={formData.contrasena}
                onChange={(e) => handleInputChange('contrasena', e.target.value)}
                required
                maxLength={255}
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