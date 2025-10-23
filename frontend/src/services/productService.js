const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getProducts = async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/products${query ? `?${query}` : ''}`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Error al obtener productos');
    return await response.json();
};

export const getCategories = async () => {
    const response = await fetch(`${API_URL}/categories`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Error al obtener categorías');
    return await response.json();
};

export const getCarousels = async () => {
    const response = await fetch(`${API_URL}/carousels`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Error al obtener carruseles');
    return await response.json();
};

export const createCarousel = async (carouselData) => {
    const response = await fetch(`${API_URL}/carousels`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        },
        body: JSON.stringify(carouselData)
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Error al crear carrusel');
    return await response.json();
};

export const updateCarousel = async (id, carouselData) => {
    const response = await fetch(`${API_URL}/carousels/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
        },
        body: JSON.stringify(carouselData)
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Error al actualizar carrusel');
    return await response.json();
};

export const deleteCarousel = async (id) => {
    const response = await fetch(`${API_URL}/carousels/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Error al eliminar carrusel');
    return await response.json();
};

export const register = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Error al registrar usuario');
    return await response.json();
};

export const login = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Error al iniciar sesión');
    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
};

export const getProfile = async () => {
    const response = await fetch(`${API_URL}/users/profile`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Error al obtener perfil');
    return await response.json();
};