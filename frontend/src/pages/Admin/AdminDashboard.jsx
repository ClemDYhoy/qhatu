import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getSearchTerms, getPopularProducts } from '../../api';
import Button from '../../components/ui/Button/Button';
import '../../styles/global.css';
import './AdminDashboard.css';

function AdminDashboard() {
const [searchTerms, setSearchTerms] = useState([]);
const [popularProducts, setPopularProducts] = useState([]);
const navigate = useNavigate();

useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.rol !== 'admin') {
    navigate('/login');
    }
    const fetchAnalytics = async () => {
    try {
        const [termsRes, productsRes] = await Promise.all([getSearchTerms(), getPopularProducts()]);
        setSearchTerms(termsRes.data);
        setPopularProducts(productsRes.data);
    } catch (error) {
        console.error('Error al obtener analíticas:', error);
    }
    };
    fetchAnalytics();
}, [navigate]);

return (
    <div className="admin-dashboard-container">
    <h2>Panel de Administración</h2>
    <Link to="/admin/carousel-editor">
        <Button>Editar Carrusel</Button>
    </Link>
    <section>
        <h3>Términos de Búsqueda Populares</h3>
        <ul>
        {searchTerms.map((term) => (
            <li key={term.termino_busqueda}>
            {term.termino_busqueda}: {term.count} búsquedas
            </li>
        ))}
        </ul>
    </section>
    <section>
        <h3>Productos Populares</h3>
        <ul>
        {popularProducts.map((product) => (
            <li key={`${product.id_producto}-${product.tipo_interaccion}`}>
            {product.nombre} ({product.tipo_interaccion}): {product.count}
            </li>
        ))}
        </ul>
    </section>
    </div>
);
}

export default AdminDashboard;