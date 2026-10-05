import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/products/ProductCard/ProductCard';
import { getFavorites } from '../../utils/favorites';
import './Account.css';

const Favoritos = () => {
  const [favoritos, setFavoritos] = useState([]);

  useEffect(() => {
    const load = () => setFavoritos(getFavorites());
    load();
    window.addEventListener('favoritesChanged', load);
    return () => window.removeEventListener('favoritesChanged', load);
  }, []);

  return (
    <div className="account-page">
      <div className="container">
        <div className="account-header">
          <h1 className="account-title">Favoritos</h1>
          <p className="account-subtitle">Los productos que guardaste con el corazón.</p>
        </div>

        {favoritos.length === 0 ? (
          <div className="account-state">
            <h3>No tienes favoritos todavía</h3>
            <p>Toca el corazón en un producto para guardarlo aquí.</p>
            <Link to="/products" className="account-btn account-btn--primary" style={{ marginTop: '1rem' }}>Ver productos</Link>
          </div>
        ) : (
          <div className="account-products-grid">
            {favoritos.map((product) => (
              <ProductCard key={product.producto_id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favoritos;
