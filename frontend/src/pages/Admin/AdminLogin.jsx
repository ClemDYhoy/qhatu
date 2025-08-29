
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const { login } = useAuth();
const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    const role = await login(email, password);
    if (role === 'admin') {
        navigate('/admin/dashboard');
    } else {
        navigate('/');
    }
    } catch (err) {
    alert('Error de login');
    }
};

return (
    <div>
    <h2>Iniciar Sesión</h2>
    <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">Iniciar Sesión</button>
    </form>
    <p>No tienes cuenta? <a href="/register">Regístrate aquí</a></p>
    </div>
);
};

export default AdminLogin;