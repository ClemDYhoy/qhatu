import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../../api.js'; // Importación corregida (named export)
import Button from '../../ui/Button/Button.jsx';
import Input from '../../ui/Input/Input.jsx';
import '../../../styles/global.css';
import './Login.css';

function Login() {
const [correo, setCorreo] = useState('');
const [contrasena, setContrasena] = useState('');
const [error, setError] = useState('');
const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
    const { data } = await login({ correo, contrasena });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    navigate(data.user.rol === 'admin' ? '/admin' : '/products');
    } catch (error) {
    setError(error.message || 'Error al iniciar sesión');
    }
};

return (
    <div className="login-container">
    <h2>Iniciar Sesión</h2>
    {error && <p className="error">{error}</p>}
    <form onSubmit={handleSubmit}>
        <Input
        type="email"
        label="Correo"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        required
        />
        <Input
        type="password"
        label="Contraseña"
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
        required
        />
        <Button type="submit">Iniciar Sesión</Button>
    </form>
    <p>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
    </p>
    <p>
        <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
    </p>
    </div>
);
}

export default Login;