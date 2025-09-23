import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../../api';
import Button from '../../ui/Button/Button';
import Input from '../../ui/Input/Input';
import '../../../styles/global.css';
import './ResetPassword.css';

function ResetPassword() {
const [contrasena, setContrasena] = useState('');
const [message, setMessage] = useState('');
const [error, setError] = useState('');
const { token } = useParams();
const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    await resetPassword(token, contrasena);
    setMessage('Contraseña restablecida correctamente');
    setError('');
    setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
    setError(error.response?.data?.error || 'Error al restablecer contraseña');
    setMessage('');
    }
};

return (
    <div className="reset-password-container">
    <h2>Restablecer Contraseña</h2>
    {message && <p className="success">{message}</p>}
    {error && <p className="error">{error}</p>}
    <form onSubmit={handleSubmit}>
        <Input
        type="password"
        label="Nueva Contraseña"
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
        required
        />
        <Button type="submit">Restablecer</Button>
    </form>
    <p>
        <Link to="/login">Volver al inicio de sesión</Link>
    </p>
    </div>
);
}

export default ResetPassword;