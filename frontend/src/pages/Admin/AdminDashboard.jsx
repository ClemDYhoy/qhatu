// C:\qhatu\frontend\src\pages\Admin\AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Users from '../../components/Admin/Users';
import '../../styles/global.css';
import './AdminDashboard.css';

function AdminDashboard() {
  const [searchTerms, setSearchTerms] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'SuperAdmin') {
      navigate('/admin/login');
    }
    const fetchAnalytics = async () => {
      try {
        const [termsRes, productsRes] = await Promise.all([
          fetch('http://localhost:5000/api/analytics/search-terms').then(res => res.json()),
          fetch('http://localhost:5000/api/analytics/popular-products').then(res => res.json()),
        ]);
        setSearchTerms(termsRes.data || []);
        setPopularProducts(productsRes.data || []);
      } catch (error) {
        console.error('Error al obtener analíticas:', error);
      }
    };
    fetchAnalytics();
  }, [navigate]);

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <>
            <h3>Términos de Búsqueda Populares</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {searchTerms.map((term) => (
                <li key={term.termino_busqueda} style={{ margin: '0.5rem 0' }}>
                  {term.termino_busqueda}: {term.count} búsquedas
                </li>
              ))}
            </ul>
            <h3>Productos Populares</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {popularProducts.map((product) => (
                <li key={`${product.id_producto}-${product.tipo_interaccion}`} style={{ margin: '0.5rem 0' }}>
                  {product.nombre} ({product.tipo_interaccion}): {product.count}
                </li>
              ))}
            </ul>
          </>
        );
      case 'users':
        return <Users />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard-container">
      <h2>Panel de Administración</h2>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <Link to="/admin/carousel-editor">
          <button
            style={{ padding: '0.5rem 1rem', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Editar Carrusel
          </button>
        </Link>
        <button
          onClick={() => setActiveSection('users')}
          style={{ padding: '0.5rem 1rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Gestionar Usuarios
        </button>
      </div>
      <section>{renderSection()}</section>
    </div>
  );
}

export default AdminDashboard;