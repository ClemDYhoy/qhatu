import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../../services/api.js';
import Input from '../../ui/Input/Input.jsx';
import './Register.css';

function Register({ onClose, onSwitchToLogin }) {
const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    telefono: ''
});
const [error, setError] = useState('');
const [successMessage, setSuccessMessage] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [emailValid, setEmailValid] = useState(null);
const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    requirements: {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
    }
});
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

// Validación de fortaleza de contraseña
useEffect(() => {
    if (formData.contrasena) {
    checkPasswordStrength(formData.contrasena);
    } else {
    setPasswordStrength({
        score: 0,
        requirements: {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
        }
    });
    }
}, [formData.contrasena]);

// Cerrar modal con ESC
useEffect(() => {
    const handleEsc = (e) => {
    if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
}, [onClose]);

const checkPasswordStrength = (password) => {
    const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;
    
    setPasswordStrength({
    score,
    requirements
    });
};

const getPasswordStrengthColor = () => {
    if (passwordStrength.score === 0) return 'transparent';
    if (passwordStrength.score <= 2) return 'var(--error)';
    if (passwordStrength.score <= 3) return 'var(--warning)';
    return 'var(--success)';
};

const getPasswordStrengthText = () => {
    if (passwordStrength.score === 0) return '';
    if (passwordStrength.score <= 2) return 'Débil';
    if (passwordStrength.score <= 3) return 'Media';
    if (passwordStrength.score <= 4) return 'Fuerte';
    return 'Muy Fuerte';
};

const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
};

const validateForm = () => {
    // Validar nombre (mínimo 2 caracteres, solo letras y espacios)
    if (!formData.nombre.trim()) {
    setError('El nombre es obligatorio');
    return false;
    }
    
    if (formData.nombre.trim().length < 2) {
    setError('El nombre debe tener al menos 2 caracteres');
    return false;
    }
    
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombre.trim())) {
    setError('El nombre solo puede contener letras y espacios');
    return false;
    }

    if (!formData.correo.trim()) {
    setError('El correo electrónico es obligatorio');
    return false;
    }

    if (!emailValid) {
    setError('Por favor ingresa un correo electrónico válido');
    return false;
    }

    // Validar teléfono si se proporciona
    if (formData.telefono && formData.telefono.trim()) {
    const phoneRegex = /^(\+?51)?[0-9]{9}$/;
    if (!phoneRegex.test(formData.telefono.replace(/\s/g, ''))) {
        setError('El número de teléfono debe tener 9 dígitos');
        return false;
    }
    }

    if (formData.contrasena.length < 8) {
    setError('La contraseña debe tener al menos 8 caracteres');
    return false;
    }

    if (passwordStrength.score < 3) {
    setError('La contraseña debe cumplir al menos 3 requisitos de seguridad');
    return false;
    }

    if (formData.contrasena !== formData.confirmarContrasena) {
    setError('Las contraseñas no coinciden');
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
    // Normalizar datos antes de enviar
    const userData = {
        nombre: formData.nombre.trim(),
        correo: formData.correo.toLowerCase().trim(),
        contrasena: formData.contrasena,
        telefono: formData.telefono ? formData.telefono.replace(/\s/g, '') : null,
        rol: 'cliente'
    };

    const { data } = await register(userData);
    
    // Mostrar mensaje de éxito
    setSubmitSuccess(true);
    setSuccessMessage('¡Usuario registrado correctamente!');
    
    if (submitBtnRef.current) {
        submitBtnRef.current.classList.add('success');
    }
    
    // Guardar datos del usuario
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Animación de éxito
    const modalContent = document.querySelector('.auth-modal-content');
    if (modalContent) {
        modalContent.classList.add('success-animation');
    }
    
    // Cerrar modal después de mostrar el mensaje de éxito
    setTimeout(() => {
        onClose();
        navigate('/products');
    }, 2000);

    } catch (error) {
    let errorMessage = 'Error al registrar la cuenta';
    
    // Manejar errores específicos
    if (error.message.includes('correo')) {
        errorMessage = 'Este correo electrónico ya está registrado';
    } else if (error.message.includes('teléfono')) {
        errorMessage = 'Este número de teléfono ya está registrado';
    } else if (error.message.includes('nombre')) {
        errorMessage = 'Ya existe un usuario con este nombre';
    } else if (error.message.includes('usuario ya existe')) {
        errorMessage = 'Ya existe una cuenta con estos datos';
    } else {
        errorMessage = error.message || 'Error al registrar la cuenta';
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
        <h2 className="text-gradient">Crear Cuenta</h2>
        <p>Únete a nuestra comunidad</p>
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
        
        {/* Nombre */}
        <div className="form-group">
            <div className="form-input-container">
            <Input
                type="text"
                label="Nombre o alias:"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                required
                autoFocus
                maxLength={100}
                placeholder="Ingresa tu nombre"
            />
            </div>
        </div>

        {/* Email */}
        <div className="form-group">
            <div className="form-input-container">
            <Input
                type="email"
                label="Correo Electrónico:"
                value={formData.correo}
                onChange={(e) => handleInputChange('correo', e.target.value)}
                required
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

        {/* Teléfono */}
        <div className="form-group">
            <Input
            type="tel"
            label="Teléfono: (Opcional)"
            value={formData.telefono}
            onChange={(e) => handleInputChange('telefono', e.target.value)}
            placeholder="+51 999 999 999"
            maxLength={20}
            />
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
            
            {/* Indicador de fortaleza de contraseña */}
            {formData.contrasena && (
            <div className="password-strength">
                <div className="strength-bar">
                <div 
                    className="strength-fill"
                    style={{
                    width: `${(passwordStrength.score / 5) * 100}%`,
                    backgroundColor: getPasswordStrengthColor()
                    }}
                ></div>
                </div>
                <div className="strength-text">
                Fortaleza: <span style={{color: getPasswordStrengthColor()}}>
                    {getPasswordStrengthText()}
                </span>
                </div>
                
                {/* Requisitos de contraseña */}
                <div className="password-requirements">
                <div className={`requirement ${passwordStrength.requirements.length ? 'met' : ''}`}>
                    • Mínimo 8 caracteres
                </div>
                <div className={`requirement ${passwordStrength.requirements.uppercase ? 'met' : ''}`}>
                    • Una letra mayúscula
                </div>
                <div className={`requirement ${passwordStrength.requirements.lowercase ? 'met' : ''}`}>
                    • Una letra minúscula
                </div>
                <div className={`requirement ${passwordStrength.requirements.number ? 'met' : ''}`}>
                    • Un número
                </div>
                <div className={`requirement ${passwordStrength.requirements.special ? 'met' : ''}`}>
                    • Un carácter especial
                </div>
                </div>
            </div>
            )}
        </div>

        {/* Confirmar Contraseña */}
        <div className="form-group">
            <div className="form-input-container">
            <Input
                type={showConfirmPassword ? "text" : "password"}
                label="Confirmar Contraseña:"
                value={formData.confirmarContrasena}
                onChange={(e) => handleInputChange('confirmarContrasena', e.target.value)}
                required
                maxLength={255}
                className={
                formData.confirmarContrasena && 
                formData.contrasena !== formData.confirmarContrasena ? 'error' : 
                formData.confirmarContrasena && 
                formData.contrasena === formData.confirmarContrasena ? 'valid' : ''
                }
            />
            <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
            </div>
            {formData.confirmarContrasena && formData.contrasena !== formData.confirmarContrasena && (
            <div className="validation-message error">
                Las contraseñas no coinciden
            </div>
            )}
        </div>

        <button 
            ref={submitBtnRef}
            type="submit" 
            className={`submit-btn ${isLoading ? 'loading' : ''} ${submitSuccess ? 'success' : ''}`}
            disabled={isLoading}
        >
            <span className="btn-content">
            {isLoading ? 'Creando Cuenta...' : 'Crear Cuenta'}
            </span>
            
            <span className="btn-loading">
            <div className="spinner"></div>
            Registrando...
            </span>

            <svg className="checkmark" viewBox="0 0 52 52">
            <path d="M14.1 27.2l7.1 7.2 16.7-16.8" fill="none" stroke="#000" strokeWidth="6"/>
            </svg>
        </button>
        </form> 

        <div className="auth-modal-footer text-center">
        <p className="mb-4">
            ¿Ya tienes cuenta?{' '}
            <button className="auth-switch-btn" onClick={onSwitchToLogin}>
            Inicia sesión aquí
            </button>
        </p>
        <p className="terms-text">
            Al registrarte, aceptas nuestros{' '}
            <a href="/terms" className="auth-link">Términos de Servicio</a> y{' '}
            <a href="/privacy" className="auth-link">Política de Privacidad</a>
        </p>
        </div>
    </div>
    </div>
);
}

export default Register;