import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Carousel from '../../components/Carousel/Carousel';
import ProductCard from '../../components/products/ProductCard/ProductCard';
import { getCarousels, getFeaturedProducts, getBestSellers, getRecentProducts } from '../../services/api';
import './Home.css';

// SVG Icons Component
const SVGIcon = ({ name, className = "" }) => {
const icons = {
    premium: (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
    ),
    truck: (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>
    ),
    star: (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
    ),
    gift: (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
    </svg>
    ),
    warning: (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
    ),
    location: (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
    ),
    phone: (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM12 3v10l3-3h6V3h-9z"/>
    </svg>
    ),
    clock: (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
    </svg>
    ),
    shipping: (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>
    ),
    target: (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
        <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
    </svg>
    ),
    package: (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 6h-4c0-2.21-1.79-4-4-4S9 3.79 9 6H3v16h18V6zm-10 0h4c0-1.1-.9-2-2-2s-2 .9-2 2zm10 14H3V8h18v12z"/>
    </svg>
    ),
    happy: (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
    </svg>
    ),
    rating: (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
    ),
    fire: (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
    </svg>
    )
};

return icons[name] || null;
};

const Home = () => {
const [carousels, setCarousels] = useState([]);
const [featuredProducts, setFeaturedProducts] = useState([]);
const [bestSellers, setBestSellers] = useState([]);
const [recentProducts, setRecentProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
    loadHomeData();
}, []);

const loadHomeData = async () => {
    try {
    setLoading(true);
    setError(null);

    const [carouselsRes, featuredRes, bestSellersRes, recentRes] = await Promise.all([
        getCarousels().catch(() => ({ data: [] })),
        getFeaturedProducts(8).catch(() => ({ data: [] })),
        getBestSellers(8).catch(() => ({ data: [] })),
        getRecentProducts(8).catch(() => ({ data: [] }))
    ]);

    setCarousels(carouselsRes.data || carouselsRes || []);
    setFeaturedProducts(featuredRes.data || featuredRes || []);
    setBestSellers(bestSellersRes.data || bestSellersRes || []);
    setRecentProducts(recentRes.data || recentRes || []);

    } catch (err) {
    console.error('Error al cargar datos:', err);
    setError('Error al cargar los datos de la tienda');
    } finally {
    setLoading(false);
    }
};

if (loading) {
    return (
    <div className="home-loading">
        <div className="loading-content">
        <div className="spinner"></div>
        <h3>Cargando productos premium</h3>
        <p>Preparando la mejor experiencia de compra...</p>
        </div>
    </div>
    );
}

return (
    <div className="home">
    {/* Ofertas del Día - Carousel Section */}
    {carousels.length > 0 && (
        <section className="carousel-section">
        <div className="carousel-section-container">
            <div className="carousel-header">
            <div className="carousel-badge">
                <SVGIcon name="fire" className="badge-icon-fire" />
                <span>¡Ofertas Calientes!</span>
            </div>
            <h2 className="carousel-title">Ofertas del Día</h2>
            <p className="carousel-subtitle">
                Descuentos especiales que no puedes dejar pasar
            </p>
            </div>
            <div className="carousel-wrapper">
            <Carousel items={carousels} />
            </div>
        </div>
        </section>
    )}

    {/* Error Handling */}
    {error && (
        <div className="home-error">
        <div className="error-content">
            <SVGIcon name="warning" className="error-icon" />
            <h3>Oops, algo salió mal</h3>
            <p>{error}</p>
            <button onClick={loadHomeData} className="btn btn-red">
            Reintentar Carga
            </button>
        </div>
        </div>
    )}

    {/* Stats Section */}
    <section className="stats-section">
        <div className="stats-grid">
        <div className="stat-card">
            <SVGIcon name="package" className="stat-icon" />
            <div className="stat-content">
            <h3 className="stat-number">500+</h3>
            <p className="stat-label">Productos Únicos</p>
            </div>
        </div>
        <div className="stat-card">
            <SVGIcon name="happy" className="stat-icon" />
            <div className="stat-content">
            <h3 className="stat-number">2,000+</h3>
            <p className="stat-label">Clientes Felices</p>
            </div>
        </div>
        <div className="stat-card">
            <SVGIcon name="shipping" className="stat-icon" />
            <div className="stat-content">
            <h3 className="stat-number">1,500+</h3>
            <p className="stat-label">Envíos Exitosos</p>
            </div>
        </div>
        <div className="stat-card">
            <SVGIcon name="rating" className="stat-icon" />
            <div className="stat-content">
            <h3 className="stat-number">4.9/5</h3>
            <p className="stat-label">Rating Promedio</p>
            </div>
        </div>
        </div>
    </section>

    {/* Contact & Location Section */}
    <section className="contact-section">
        <div className="section-header centered">
        <div className="section-badge gold-badge">
            <SVGIcon name="location" className="badge-icon" />
        </div>
        <h2>Encuéntranos</h2>
        <p className="section-description">
            Visítanos en nuestra tienda física o contáctanos para delivery
        </p>
        </div>
        
        <div className="contact-content">
        <div className="map-container">
            <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62421.03!2d-76.24239958!3d-9.930567792!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91a7c3e8f1e8e1e1%3A0x1e1e1e1e1e1e1e1e!2sHu%C3%A1nuco!5e0!3m2!1sen!2spe!4v1234567890"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="Ubicación Qhatu - Huánuco, Perú"
            />
        </div>
        
        <div className="contact-info">
            <div className="info-grid">
            <div className="info-card">
                <div className="info-icon gold-bg">
                <SVGIcon name="location" />
                </div>
                <div className="info-content">
                <h4>Nuestra Ubicación</h4>
                <p>Huánuco, Perú</p>
                <small>Centro de la ciudad</small>
                </div>
            </div>
            
            <div className="info-card">
                <div className="info-icon red-bg">
                <SVGIcon name="phone" />
                </div>
                <div className="info-content">
                <h4>WhatsApp</h4>
                <a href="https://wa.me/51123456789" target="_blank" rel="noopener noreferrer" className="contact-link">
                    +51 123 456 789
                </a>
                <small>Atendemos 24/7</small>
                </div>
            </div>
            
            <div className="info-card">
                <div className="info-icon gold-bg">
                <SVGIcon name="clock" />
                </div>
                <div className="info-content">
                <h4>Horario de Atención</h4>
                <p>Lunes - Sábado</p>
                <small>9:00 AM - 6:00 PM</small>
                </div>
            </div>
            
            <div className="info-card">
                <div className="info-icon red-bg">
                <SVGIcon name="shipping" />
                </div>
                <div className="info-content">
                <h4>Envío Rápido</h4>
                <p>Entrega en 24-48h</p>
                <small>Todo Huánuco</small>
                </div>
            </div>
            </div>
        </div>
        </div>
    </section>

    {/* CTA Section */}
    <section className="cta-section">
        <div className="cta-content">
        <div className="cta-badge">
            <SVGIcon name="target" />
        </div>
        <h2>¿Listo para endulzar tu día?</h2>
        <p>
            Únete a nuestra comunidad de amantes de los dulces y descubre por qué 
            somos la tienda preferida en Huánuco
        </p>
        <div className="cta-buttons">
            <Link to="/products" className="btn btn-gold btn-lg">
            Comprar Ahora
            </Link>
            <Link to="/contact" className="btn btn-outline btn-lg">
            Contactar
            </Link>
        </div>
        </div>
    </section>
    </div>
);
};

export default Home;