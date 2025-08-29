import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Register = () => {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const { register } = useAuth();
const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    await register(email, password);
    alert('Cuenta creada. Ahora inicia sesión.');
    navigate('/login');
    } catch (err) {
    alert('Error al registrar');
    }
};

return (
    <div>
    <h2>Registrar Nueva Cuenta</h2>
    <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">Registrar</button>
    </form>
    </div>
);
};

export default Register;