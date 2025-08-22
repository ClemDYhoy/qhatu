import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import ProductList from '../../components/products/ProductList/ProductList';
import Button from '../../components/ui/Button/Button';
import './Home.css';

const Home = () => {
const { products, isLoading } = useProducts();
const featuredProducts = products.slice(0, 6);

return (
    <div className="home">
        {/* Hero Section */}
        <section className="hero">
            <div className="container">
            <div className="hero-content">
                <h1 className="hero-title">
                Descubre productos importados <span className="highlight">sin barreras</span>
                </h1>
                <p className="hero-description">
                Qhatu Marca conecta a hispanohablantes con productos internacionales, 
                con información traducida y adaptada culturalmente.
                </p>
                <div className="hero-actions">
                <Link to="/products">
                    <Button variant="primary" size="large">
                    Explorar Productos
                    </Button>
                </Link>
                </div>
            </div>
            </div>
        </section>

        {/* Featured Products */}
        <section className="featured-products">
            <div className="container">
            <h2 className="section-title">Productos Destacados</h2>
            <ProductList products={featuredProducts} isLoading={isLoading} />
            
            <div className="view-all">
                <Link to="/products">
                <Button variant="secondary">
                    Ver Todos los Productos
                </Button>
                </Link>
            </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="features">
            <div className="container">
            <h2 className="section-title">¿Por qué elegir Qhatu Marca?</h2>
            <div className="features-grid">
                <div className="feature-card">
                <div className="feature-icon">🌎</div>
                <h3>Productos Globales</h3>
                <p>Accede a productos internacionales sin salir de casa.</p>
                </div>
                
                <div className="feature-card">
                <div className="feature-icon">📖</div>
                <h3>Información en Español</h3>
                <p>Toda la información de productos traducida y contextualizada.</p>
                </div>
                
                <div className="feature-card">
                <div className="feature-icon">💬</div>
                <h3>Compra por WhatsApp</h3>
                <p>Proceso de compra simple y familiar a través de WhatsApp.</p>
                </div>
                
                <div className="feature-card">
                <div className="feature-icon">🚚</div>
                <h3>Envíos Confiables</h3>
                <p>Coordinamos todo el proceso de envío por ti.</p>
                </div>
            </div>
            </div>
        </section>
    </div>
);
};

export default Home;
