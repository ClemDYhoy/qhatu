import React, { useState } from 'react';
import api from '../../../services/api.js';
import './Register.css';

const Register = ({ onClose, onSwitchToLogin }) => {
const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
});
const [error, setError] = useState('');

const handleInputChange = (e) => {
    setFormData({
    ...formData,
    [e.target.name]: e.target.value,
    });
};

const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
    setError('Las contraseñas no coinciden');
    return;
    }
    try {
    const res = await api.post('/auth/register', {
        nombre: formData.name,
        email: formData.email,
        password: formData.password,
    });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setError('');
    onClose();
    } catch (err) {
    setError(err.response?.data?.message || 'Error en registro');
    }
};

return (
    <div className="oe-modal-overlay" onClick={onClose}>
    <div className="oe-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="oe-modal-header">
        <h2>Crear Cuenta</h2>
        <button className="oe-modal-close" onClick={onClose}>
            ×
        </button>
        </div>

        {error && <p className="oe-error">{error}</p>}

        <form onSubmit={handleSubmit} className="oe-auth-form">
        <div className="oe-form-group">
            <label htmlFor="name">Nombre Completo</label>
            <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            />
        </div>

        <div className="oe-form-group">
            <label htmlFor="email">Email</label>
            <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            />
        </div>

        <div className="oe-form-group">
            <label htmlFor="password">Contraseña</label>
            <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            />
        </div>

        <div className="oe-form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            />
        </div>

        <button type="submit" className="oe-btn oe-btn-primary oe-btn-full">
            Crear Cuenta
        </button>
        </form>

        <div className="oe-auth-footer">
        <p>
            ¿Ya tienes cuenta?{' '}
            <button className="oe-link-btn" onClick={onSwitchToLogin}>
            Inicia sesión aquí
            </button>
        </p>
        </div>
    </div>
    </div>
);
};

export default Register;