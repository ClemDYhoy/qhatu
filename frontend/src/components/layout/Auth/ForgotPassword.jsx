import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../../api';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Input/Input';
import '../../../styles/global.css';
import './ForgotPassword.css';

function ForgotPassword() {
const [correo, setCorreo] = useState('');
const [message, setMessage] = useState('');
const [error, setError] = useState('');

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    await forgotPassword({ correo });
    setMessage('Correo de recuperación enviado');
    setError('');
    } catch (error) {
    setError(error.response?.data?.error || 'Error al enviar correo');
    setMessage('');
    }
};

return (
    <div className="forgot-password-container">
    <h2>Recuperar Contraseña</h2>
    {message && <p className="success">{message}</p>}
    {error && <p className="error">{error}</p>}
    <form onSubmit={handleSubmit}>
        <Input
        type="email"
        label="Correo"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        required
        />
        <Button type="submit">Enviar Correo</Button>
    </form>
    <p>
        <Link to="/login">Volver al inicio de sesión</Link>
    </p>
    </div>
);
}

export default ForgotPassword;