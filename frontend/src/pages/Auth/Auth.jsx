import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [isLogin, setIsLogin] = useState(true); // Alterna entre login y register
const { login, register } = useAuth();
const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    if (isLogin) {
        // Iniciar Sesión
        const role = await login(email, password);
        if (role === 'admin') {
        navigate('/admin/dashboard');
        } else {
        navigate('/');
        }
        alert('Inicio de sesión exitoso');
    } else {
        // Registrar
        await register(email, password);
        alert('Cuenta creada exitosamente. Por favor, inicia sesión.');
        setIsLogin(true); // Cambia a login después de registrar
    }
    } catch (err) {
    alert('Error: ' + (err.response?.data?.error || 'Intenta de nuevo'));
    }
};

return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
    <h2>{isLogin ? 'Iniciar Sesión' : 'Registrar Cuenta'}</h2>
    <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
        <label>Email:</label>
        <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingresa tu email"
            required
            style={{ width: '100%', padding: '5px' }}
        />
        </div>
        <div style={{ marginBottom: '10px' }}>
        <label>Contraseña:</label>
        <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresa tu contraseña"
            required
            style={{ width: '100%', padding: '5px' }}
        />
        </div>
        <button
        type="submit"
        style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', marginRight: '10px' }}
        >
        {isLogin ? 'Iniciar Sesión' : 'Registrar'}
        </button>
        <button
        type="button"
        onClick={() => setIsLogin(!isLogin)}
        style={{ padding: '10px 20px', backgroundColor: '#2196F3', color: 'white', border: 'none', cursor: 'pointer' }}
        >
        {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
        </button>
    </form>
    </div>
);
};

export default Auth;