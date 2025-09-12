import React, { useState } from 'react';
import api from '../../../services/api.js';
import './Login.css';

const Login = ({ onClose, onSwitchToRegister }) => {
const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    try {
    const res = await api.post('/auth/login', formData);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setError('');
    onClose();
    } catch (err) {
    setError(err.response?.data?.message || 'Error en login');
    }
};

return (
    <div className="oe-modal-overlay" onClick={onClose}>
    <div className="oe-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="oe-modal-header">
        <h2>Iniciar Sesión</h2>
        <button className="oe-modal-close" onClick={onClose}>
            ×
        </button>
        </div>

        {error && <p className="oe-error">{error}</p>}

        <form onSubmit={handleSubmit} className="oe-auth-form">
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

        <button type="submit" className="oe-btn oe-btn-primary oe-btn-full">
            Iniciar Sesión
        </button>
        </form>

        <div className="oe-auth-footer">
        <p>
            ¿No tienes cuenta?{' '}
            <button className="oe-link-btn" onClick={onSwitchToRegister}>
            Regístrate aquí
            </button>
        </p>
        </div>
    </div>
    </div>
);
};

export default Login;