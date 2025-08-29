import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Corrección aquí
import api from '../utils/api';

export const useAuth = () => {
const [user, setUser] = useState(null);

useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
    try {
        const decoded = jwtDecode(token); // Usa la función importada correctamente
        setUser({ id: decoded.id, role: decoded.role });
    } catch (err) {
        localStorage.removeItem('token');
    }
    }
}, []);

const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser({ role: data.role });
    return data.role;
};

const register = async (email, password) => {
    await api.post('/auth/register', { email, password });
};

const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
};

return { user, login, register, logout };
};