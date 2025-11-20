import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../../components/products/ProductCard/ProductCard';
import './Home.css';

// ====================================
// ICONOS SVG PROFESIONALES
// ====================================
const Icons = {
  star: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 2l2.5 6.5L19 10l-6.5 2.5L10 19l-2.5-6.5L1 10l6.5-2.5L10 2z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  fire: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 2s1.5 3 1.5 5.5c0 2-1.5 3.5-3 3.5s-3-1.5-3-3.5c0 0 0-1 .5-2M5 9c-1 1.5-2 3.5-2 5.5 0 3.5 2.5 6 6 6s6-2.5 6-6c0-3-2-6-4-8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  candy: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="10" cy="10" r="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 3v14M3 10h14" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  tag: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 10l-8 8-8-8V2h8l8 8z" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="6" cy="6" r="1" fill="currentColor"/>
    </svg>
  ),
  truck: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 3h11v9H1zM12 6h4l3 3v3h-3M5 16a2 2 0 100-4 2 2 0 000 4zM15 16a2 2 0 100-4 2 2 0 000 4z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  shield: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 2L3 5v5c0 4 2.5 7 7 9 4.5-2 7-5 7-9V5l-7-3z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  box: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 1L2 5v10l8 4 8-4V5l-8-4zM10 11V1M2 5l8 4M18 5l-8 4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  mapPin: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 8c0 4-6 10-6 10S4 12 4 8a6 6 0 1112 0z" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="10" cy="8" r="2"/>
    </svg>
  ),
  phone: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 14v3a2 2 0 01-2 2h-1a15 15 0 01-13-13V5a2 2 0 012-2h3l2 5-2 2a11 11 0 006 6l2-2 5 2z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  arrowRight: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  checkCircle: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="10" cy="10" r="8"/>
      <path d="M6 10l2 2 5-5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  star2: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 1l2.5 6.5L19 10l-6.5 2.5L10 19l-2.5-6.5L1 10l6.5-2.5L10 1z"/>
    </svg>
  )
};

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [dulcesProducts, setDulcesProducts] = useState([]);
  const [carruseles, setCarruseles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carruselError, setCarruselError] = useState(null);

  // Carrusel
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  // Auto-play
  useEffect(() => {
    if (carruseles.length <= 1 || isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % carruseles.length);
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, [carruseles.length, isPaused]);

  const goToSlide = (index) => setActiveIndex(index);
  const handlePrev = () => setActiveIndex(prev => (prev - 1 + carruseles.length) % carruseles.length);
  const handleNext = () => setActiveIndex(prev => (prev + 1) % carruseles.length);

  // Scroll header
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          document.body.classList.toggle('scrolled', window.scrollY > window.innerHeight * 0.3);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cargar carruseles
  const fetchCarruseles = async () => {
    try {
      setCarruselError(null);
      const response = await api.get('/carousels');
      const data = response.data?.data || response.data || [];
      const activos = data.filter(c => c.activo === true || c.activo === 1);
      setCarruseles(activos);
      setActiveIndex(0);
    } catch (err) {
      console.error('Error cargando carruseles:', err);
      setCarruselError('No se pudieron cargar los destacados');
      setCarruseles([]);
    }
  };

  // Cargar productos destacados (destacado = 1)
  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get('/products', {
        params: {
          destacado: 1,
          limit: 7
        }
      });
      const products = response.data?.data || response.data || [];
      setFeaturedProducts(products);
    } catch (err) {
      console.error('Error cargando productos destacados:', err);
      setFeaturedProducts([]);
    }
  };

  // Cargar más vendidos (ordenados por ventas DESC)
  const fetchBestSellers = async () => {
    try {
      const response = await api.get('/products', {
        params: {
          orderBy: 'ventas',
          order: 'DESC',
          limit: 7
        }
      });
      const products = response.data?.data || response.data || [];
      setBestSellers(products);
    } catch (err) {
      console.error('Error cargando más vendidos:', err);
      setBestSellers([]);
    }
  };

  // Cargar productos de la categoría Dulces (categoria_id = 1)
  const fetchDulcesProducts = async () => {
    try {
      const response = await api.get('/products', {
        params: {
          categoria_id: 1,
          limit: 7
        }
      });
      const products = response.data?.data || response.data || [];
      setDulcesProducts(products);
    } catch (err) {
      console.error('Error cargando dulces:', err);
      setDulcesProducts([]);
    }
  };

  // Cargar todos los datos
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      await Promise.all([
        fetchCarruseles(),
        fetchFeaturedProducts(),
        fetchBestSellers(),
        fetchDulcesProducts()
      ]);

      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="home-loading">
        <div className="spinner"></div>
        <p className="loading-text">Cargando productos premium...</p>
      </div>
    );
  }

  return (
    <div className="home-pro">

      {/* HERO SECTION */}
      <section className="hero-pro">
        <div className="hero-container">
          <div className="hero-badge-pro">
            {Icons.star2}
            <span>Todo lo que Tu Antojo Pide</span>
          </div>
          <h1 className="hero-title-pro">Disfruta Cada Momento con Sabor</h1>
          <p className="hero-desc-pro">
            Descubre una selección irresistible de dulces, snacks, bebidas y más, perfecta para tus antojos y momentos especiales en Huánuco
          </p>
          <div className="hero-features-pro">
            <div className="hero-item-pro">{Icons.truck}<span>Envío gratis +S/50</span></div>
            <div className="hero-item-pro">{Icons.shield}<span>100% originales</span></div>
            <div className="hero-item-pro">{Icons.box}<span>Empaque cuidado y seguro</span></div>
          </div>
        </div>
      </section>

      {/* CARRUSEL PREMIUM 2025 - ULTRA PROFESIONAL */}
      {carruseles.length > 0 ? (
        <section className="section-pro promo-bg">
          <div 
            className="premium-carousel"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Botones de navegación */}
            <button 
              className="carousel-nav-btn carousel-nav-prev"
              onClick={handlePrev}
              aria-label="Oferta anterior"
            >
              <svg width="32" height="32" viewBox="0 0 26 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18L9 12L15 6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button 
              className="carousel-nav-btn carousel-nav-next"
              onClick={handleNext}
              aria-label="Siguiente oferta"
            >
              <svg width="32" height="32" viewBox="0 0 22 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18L15 12L9 6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>  
            </button>

            {/* Slides */}
            <div className="premium-carousel-track-container">
              <div 
                className="premium-carousel-track"
                style={{
                  transform: `translateX(-${activeIndex * 100}%)`,
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {carruseles.map((carrusel) => (
                  <div key={carrusel.carrusel_id} className="premium-carousel-slide">
                    <div 
                      className="premium-slide-bg"
                      style={{
                        backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 100%), url(${carrusel.url_imagen || '/awaiting-image.jpeg'})`,
                      }}
                    />
                    <div className="premium-slide-content">
                      <div className="premium-slide-text">
                        <div className="premium-slide-cta">
                          <Link to="/products" className="premium-cta-btn">
                            Ver oferta {Icons.arrowRight}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contador + Indicadores Premium */}
            <div className="premium-carousel-controls">
              <div className="premium-slide-counter"></div>
              <div className="premium-indicators">
                {carruseles.map((_, index) => (
                  <div
                    key={index}
                    className={`premium-indicator ${index === activeIndex ? 'active' : ''}`}
                    onClick={() => goToSlide(index)}
                  >
                    <div className="premium-indicator-bar">
                      <div 
                        className="premium-indicator-fill"
                        style={{
                          width: index === activeIndex ? '100%' : '0%',
                          transition: index === activeIndex ? 'width 5s linear' : 'none'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : carruselError ? (
        <section className="section-pro promo-bg">
          <div className="container-pro">
            <div className="carousel-error-premium">
              <p>No se pudieron cargar las ofertas del momento</p>
              <button onClick={fetchCarruseles} className="retry-btn-premium">
                Reintentar carga
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {/* PRODUCTOS DESTACADOS */}
      {featuredProducts.length > 0 && (
        <section className="section-pro">
          <div className="container-pro">
            <div className="section-header-pro">
              <div className="header-content-pro">
                <div className="icon-badge-pro primary">{Icons.star}</div>
                <div>
                  <h2 className="section-title-pro">Productos Destacados</h2>
                  <p className="section-subtitle-pro">Los más populares de esta semana</p>
                </div>
              </div>
              <Link to="/products?destacado=1" className="link-view-pro">Ver todos {Icons.arrowRight}</Link>
            </div>
            <div className="products-grid-pro">
              {featuredProducts.map(product => (
                <ProductCard key={product.producto_id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MÁS VENDIDOS */}
      {bestSellers.length > 0 && (
        <section className="section-pro bestseller-bg">
          <div className="container-pro">
            <div className="section-header-pro">
              <div className="header-content-pro">
                <div className="icon-badge-pro red">{Icons.fire}</div>
                <div>
                  <h2 className="section-title-pro">Más Vendidos</h2>
                  <p className="section-subtitle-pro">Los favoritos de nuestros clientes</p>
                </div>
              </div>
              <Link to="/products?orderBy=ventas" className="link-view-pro">Ver todos {Icons.arrowRight}</Link>
            </div>
            <div className="products-grid-pro">
              {bestSellers.map(product => (
                <ProductCard key={product.producto_id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DULCES IMPORTADOS */}
      {dulcesProducts.length > 0 && (
        <section className="section-pro">
          <div className="container-pro">
            <div className="section-header-pro">
              <div className="header-content-pro">
                <div className="icon-badge-pro secondary">{Icons.candy}</div>
                <div>
                  <h2 className="section-title-pro">Dulces Importados</h2>
                  <p className="section-subtitle-pro">Sabores auténticos de todo el mundo</p>
                </div>
              </div>
              <Link to="/products?categoria_id=1" className="link-view-pro">Ver todos {Icons.arrowRight}</Link>
            </div>
            <div className="products-grid-pro">
              {dulcesProducts.map(product => (
                <ProductCard key={product.producto_id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* INFO SECTION */}
      <section className="info-section-pro">
        <div className="container-pro">
          <div className="info-grid-pro">
            <div className="info-card-pro">
              <div className="info-icon-pro">{Icons.mapPin}</div>
              <h3 className="info-title-pro">Nuestra Ubicación</h3>
              <p className="info-text-pro">Av. Juan Velasco Alvarado 748, Pillco Marca</p>
              <p className="info-text-pro secondary">Lunes a Domingo: 8:00 AM - 10:00 PM</p>
            </div>
            <div className="info-card-pro">
              <div className="info-icon-pro">{Icons.phone}</div>
              <h3 className="info-title-pro">Contacto Directo</h3>
              <p className="info-text-pro">+51 952 682 285</p>
              <p className="info-text-pro secondary">ventas@qhatu.com</p>
            </div>
            <div className="info-card-pro">
              <div className="info-icon-pro">{Icons.truck}</div>
              <h3 className="info-title-pro">Delivery Express</h3>
              <p className="info-text-pro">Entrega en 24-48 horas</p>
              <p className="info-text-pro secondary">Cobertura en todo Huánuco</p>
            </div>
            <div className="info-card-pro">
              <div className="info-icon-pro">{Icons.checkCircle}</div>
              <h3 className="info-title-pro">Garantía de Calidad</h3>
              <p className="info-text-pro">Productos 100% originales</p>
              <p className="info-text-pro secondary">Satisfacción garantizada</p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="stats-section-pro">
        <div className="container-pro">
          <div className="stats-grid-pro">
            <div className="stat-item-pro">
              <div className="stat-number-pro">500+</div>
              <div className="stat-label-pro">Productos disponibles</div>
            </div>
            <div className="stat-item-pro">
              <div className="stat-number-pro">2,000+</div>
              <div className="stat-label-pro">Clientes satisfechos</div>
            </div>
            <div className="stat-item-pro">
              <div className="stat-number-pro">1,500+</div>
              <div className="stat-label-pro">Entregas realizadas</div>
            </div>
            <div className="stat-item-pro">
              <div className="stat-number-pro">4.9/5</div>
              <div className="stat-label-pro">Calificación promedio</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;