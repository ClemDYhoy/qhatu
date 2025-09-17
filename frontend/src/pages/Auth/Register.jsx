
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../api';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import '../../styles/global.css';
import './Register.css';

function Register() {
const [nombre, setNombre] = useState('');
const [correo, setCorreo] = useState('');
const [contrasena, setContrasena] = useState('');
const [telefono, setTelefono] = useState('');
const [error, setError] = useState('');
const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    const { data } = await register({ nombre, correo, contrasena, telefono });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    navigate('/products');
    } catch (error) {
    setError(error.response?.data?.error || 'Error al registrar');
    }
};

return (
    <div className="register-container">
    <h2>Registrarse</h2>
    {error && <p className="error">{error}</p>}
    <form onSubmit={handleSubmit}>
        <Input
        type="text"
        label="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
        />
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
        <Input
        type="text"
        label="Teléfono (opcional)"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        />
        <Button type="submit">Registrarse</Button>
    </form>
    <p>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
    </p>
    </div>
);
}

export default Register;