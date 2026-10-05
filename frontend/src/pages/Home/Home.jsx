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
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 2.25l3.09 6.26 6.91 1-5 4.88L18.18 21 12 17.77 5.82 21 7 14.39 2 9.51l6.91-1L12 2.25z"/>
    </svg>
  ),
  fire: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path 
        d="M10 1s1.5 3 1.5 5.5c0 2-1.5 3.5-3 3.5s-3-1.5-3-3.5c0 0 0-1 .5-2M5 8c-1 1.5-2 3.5-2 5.5 0 3.5 2.5 6 6 6s6-2.5 6-6c0-3-2-6-4-8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  ),
  candy: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <g transform="rotate(-25 12 12)">
          <path d="M2 12h4l2-2.5 2 2.5h4l2-2.5 2 2.5h4"/>
          <rect x="6" y="6" width="12" height="12" rx="3"/>
          <path d="M3 8l3 4M21 8l-3 4M3 16l3-4M21 16l-3-4"/>
          <line x1="10" y1="9" x2="10" y2="15" strokeWidth="2.5"/>
          <line x1="14" y1="9" x2="14" y2="15" strokeWidth="2.5"/>
        </g>
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
  ),
  wine: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {/* Copa superior */}
      <path
        d="M7 3h10l-1 6.5c-.3 2.5-2.2 4.5-4.5 4.5h-1c-2.3 0-4.2-2-4.5-4.5L6 3z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tallo */}
      <line 
        x1="12" 
        y1="14" 
        x2="12" 
        y2="19" 
        strokeLinecap="round"
      />
      {/* Base */}
      <line 
        x1="8" 
        y1="19" 
        x2="16" 
        y2="19" 
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      {/* Nivel del vino */}
      <path
        d="M8 7c1.5 0.8 2.5 1 4 1s2.5-0.2 4-1"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  ),
  alert: (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {/* Triángulo */}
    <path 
      d="M12 2L2 21h20L12 2z" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    {/* Línea de advertencia */}
    <line 
      x1="12" 
      y1="8" 
      x2="12" 
      y2="14" 
      strokeLinecap="round"
      strokeWidth="2.5"
    />
    {/* Punto de exclamación */}
    <circle 
      cx="12" 
      cy="17.5" 
      r="1" 
      fill="currentColor" 
      stroke="none"
    />
  </svg>
),
  bowl: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11h18a9 9 0 0 1-9 9 9 9 0 0 1-9-9z"/>
      <path d="M8 7c0-1.5 1-2 1-3M12 6c0-1.5 1-2 1-3M16 7c0-1.5 1-2 1-3"/>
    </svg>
  ),
  noodles: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11h16l-1.2 7a3 3 0 0 1-3 2.5H8.2a3 3 0 0 1-3-2.5L4 11z"/>
      <path d="M8.5 8L16 4M9.5 8L17 4"/>
      <path d="M8 14c1-1 2 1 3 0s2-1 3 0 2 1 3 0"/>
    </svg>
  ),
  cup: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h12l-1.2 15a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 4z"/>
      <path d="M5 8h14"/>
    </svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v5l3 2"/>
    </svg>
  )
};

// Imágenes referenciales (Pexels) para las tarjetas de categoría
const catImg = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;

// Presentación de categorías (icono + tono + imagen) para la vitrina del home
const CATEGORY_STYLES = {
  dulces: { icon: 'candy', tone: 'gold', image: catImg(1435904) },
  chocolates: { icon: 'candy', tone: 'gold', image: catImg(918327) },
  snacks: { icon: 'bowl', tone: 'red', image: catImg(4110103) },
  ramen: { icon: 'noodles', tone: 'red', image: catImg(1630572) },
  bebidas: { icon: 'cup', tone: 'blue', image: catImg(1170596) },
  licores: { icon: 'wine', tone: 'green', image: catImg(1283219) },
  combos: { icon: 'box', tone: 'gold', image: catImg(2983101) },
  descuentos: { icon: 'tag', tone: 'red', image: catImg(884600) }
};

const getCategoryPresentation = (nombre = '') => {
  const n = nombre.toLowerCase();
  if (n.includes('dulce')) return CATEGORY_STYLES.dulces;
  if (n.includes('chocolate')) return CATEGORY_STYLES.chocolates;
  if (n.includes('snack') || n.includes('papa')) return CATEGORY_STYLES.snacks;
  if (n.includes('ramen') || n.includes('fideo')) return CATEGORY_STYLES.ramen;
  if (n.includes('bebida')) return CATEGORY_STYLES.bebidas;
  if (n.includes('licor') || n.includes('sake')) return CATEGORY_STYLES.licores;
  if (n.includes('combo')) return CATEGORY_STYLES.combos;
  if (n.includes('descuento') || n.includes('oferta')) return CATEGORY_STYLES.descuentos;
  return { icon: 'box', tone: 'gray', image: catImg(264636) };
};

const Home = () => {
  // Estados para cada sección
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [dulcesProducts, setDulcesProducts] = useState([]);
  const [licoresProducts, setLicoresProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [carruseles, setCarruseles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carruselError, setCarruselError] = useState(null);

  // Estados del carrusel
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const touchStartX = useRef(0);

  // Auto-play del carrusel
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

  // Deslizamiento táctil (móvil)
  const handleTouchStart = (e) => { touchStartX.current = e.changedTouches[0].clientX; };
  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) handleNext();
    else handlePrev();
  };

  // Scroll header effect
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

  // ============================================
  // FUNCIONES DE CARGA DE DATOS
  // ============================================

  /**
   * Cargar carruseles activos
   */
  const fetchCarruseles = async () => {
    try {
      setCarruselError(null);
      const response = await api.get('/carousels');
      const data = response.data?.data || response.data || [];
      const activos = data.filter(c => c.activo === true || c.activo === 1);
      setCarruseles(activos);
      setActiveIndex(0);
    } catch (err) {
      console.error('❌ Error cargando carruseles:', err);
      setCarruselError('No se pudieron cargar los destacados');
      setCarruseles([]);
    }
  };

  /**
   * Cargar productos destacados (destacado = 1)
   * Usa la ruta optimizada /products/featured
   */
  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get('/products/featured', {
        params: { limit: 7 }
      });
      const products = response.data?.data || [];
      setFeaturedProducts(products);
      console.log('✅ Productos destacados cargados:', products.length);
    } catch (err) {
      console.error('❌ Error cargando productos destacados:', err);
      setFeaturedProducts([]);
    }
  };

  /**
   * Cargar más vendidos (ordenados por ventas DESC)
   * Usa la ruta optimizada /products/best-sellers
   */
  const fetchBestSellers = async () => {
    try {
      const response = await api.get('/products/best-sellers', {
        params: { limit: 7 }
      });
      const products = response.data?.data || [];
      setBestSellers(products);
      console.log('✅ Más vendidos cargados:', products.length);
    } catch (err) {
      console.error('❌ Error cargando más vendidos:', err);
      setBestSellers([]);
    }
  };

  /**
   * Cargar productos de la categoría Dulces (categoria_id = 1)
   * Usa la ruta /products/by-category/1
   */
  const fetchDulcesProducts = async () => {
    try {
      const response = await api.get('/products/by-category/1', {
        params: { limit: 7 }
      });
      const products = response.data?.data || [];
      setDulcesProducts(products);
      console.log('✅ Dulces cargados:', products.length);
    } catch (err) {
      console.error('❌ Error cargando dulces:', err);
      setDulcesProducts([]);
    }
  };

  /**
   * Cargar productos de la categoría Licores (categoria_id = 18)
   * Usa la ruta /products/by-category/18
   */
  const fetchLicoresProducts = async () => {
    try {
      const response = await api.get('/products/by-category/18', {
        params: { limit: 7 }
      });
      const products = response.data?.data || [];
      setLicoresProducts(products);
      console.log('✅ Licores cargados:', products.length);
    } catch (err) {
      console.error('❌ Error cargando licores:', err);
      setLicoresProducts([]);
    }
  };

  /**
   * Cargar productos con stock bajo
   * Usa la ruta optimizada /products/low-stock
   */
  const fetchLowStockProducts = async () => {
    try {
      const response = await api.get('/products/low-stock', {
        params: { limit: 7 }
      });
      const products = response.data?.data || [];
      setLowStockProducts(products);
      console.log('✅ Stock bajo cargados:', products.length);
    } catch (err) {
      console.error('❌ Error cargando productos de stock bajo:', err);
      setLowStockProducts([]);
    }
  };

  /**
   * Cargar categorías principales con su conteo de productos
   */
  const fetchCategories = async () => {
    try {
      const [catsRes, statsRes] = await Promise.all([
        api.get('/categories/all/flat'),
        api.get('/products/stats-by-category')
      ]);

      const cats = catsRes.data?.data || catsRes.data || [];
      const stats = statsRes.data?.data?.categorias || [];
      const counts = new Map(stats.map(s => [s.categoria_id, s]));

      const principales = (Array.isArray(cats) ? cats : [])
        .filter(c => !c.padre_id)
        .map(c => ({
          id: c.categoria_id,
          name: c.nombre,
          count: counts.get(c.categoria_id)?.total_productos || 0,
          ...getCategoryPresentation(c.nombre)
        }))
        .filter(c => c.count > 0)
        .sort((a, b) => b.count - a.count);

      setCategories(principales);
    } catch (err) {
      console.error('❌ Error cargando categorías:', err);
      setCategories([]);
    }
  };

  /**
   * Cargar todos los datos al montar el componente
   */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        await Promise.all([
          fetchCarruseles(),
          fetchFeaturedProducts(),
          fetchBestSellers(),
          fetchDulcesProducts(),
          fetchLicoresProducts(),
          fetchLowStockProducts(),
          fetchCategories()
        ]);
        console.log('✅ Todos los datos cargados correctamente');
      } catch (error) {
        console.error('❌ Error cargando datos del home:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Revelado al hacer scroll (respeta prefers-reduced-motion)
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('.home-pro .reveal'));
    if (!nodes.length) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      nodes.forEach(el => el.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

    nodes.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loading, categories.length]);

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="home-loading">
        <div className="spinner"></div>
        <p className="loading-text">Cargando productos premium...</p>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="home-pro">

      {/* HERO SECTION */}
      <section className="hero-pro">
        <div className="hero-container">
          <div className="hero-badge-pro">
            {Icons.shield}
            <span>Productos importados 100% originales</span>
          </div>
          <h1 className="hero-title-pro">Productos importados con calidad garantizada</h1>
          <p className="hero-desc-pro">
            Dulces, snacks, bebidas y más, seleccionados para tu día a día. Compra fácil y recibe en Huánuco.
          </p>
          <div className="hero-cta-pro">
            <Link to="/products" className="hero-btn-pro hero-btn-pro--primary">
              Explorar catálogo {Icons.arrowRight}
            </Link>
            <Link to="/products?mostrar_descuentos=true" className="hero-btn-pro hero-btn-pro--ghost">
              Ver ofertas de hoy
            </Link>
          </div>
          <div className="hero-features-pro">
            <div className="hero-item-pro">{Icons.truck}<span>Envío gratis +S/50</span></div>
            <div className="hero-item-pro">{Icons.shield}<span>100% originales</span></div>
            <div className="hero-item-pro">{Icons.box}<span>Empaque cuidado y seguro</span></div>
          </div>
        </div>
      </section>

      {/* CARRUSEL PREMIUM */}
      {carruseles.length > 0 ? (
        <section className="section-pro promo-bg">
          <div 
            className="premium-carousel"
            role="region"
            aria-roledescription="carrusel"
            aria-label="Ofertas destacadas"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
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
              <p>{carruselError}</p>
              <button onClick={fetchCarruseles} className="retry-btn-premium">
                Reintentar carga
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {/* CATEGORÍAS */}
      {categories.length > 0 && (
        <section className="section-pro categories-section-pro reveal">
          <div className="container-pro">
            <div className="section-header-pro">
              <div className="header-content-pro">
                <div className="icon-badge-pro primary">{Icons.box}</div>
                <div>
                  <h3 className="section-title-pro">Explora por categoría</h3>
                  <p className="section-subtitle-pro">Encuentra justo lo que buscas navegando por nuestras categorías.</p>
                </div>
              </div>
              <Link to="/products" className="link-view-pro">Ver catálogo {Icons.arrowRight}</Link>
            </div>
            <div className="categories-grid-pro">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/products?categoria_id=${cat.id}`}
                  className={`category-card-pro tone-${cat.tone}`}
                  style={{ backgroundImage: `url('${cat.image}')` }}
                >
                  <span className="category-card-pro__overlay" aria-hidden="true" />
                  <span className="category-card-pro__icon" aria-hidden="true">{Icons[cat.icon]}</span>
                  <span className="category-card-pro__body">
                    <span className="category-card-pro__name">{cat.name}</span>
                    <span className="category-card-pro__count">{cat.count} producto{cat.count !== 1 ? 's' : ''}</span>
                  </span>
                  <span className="category-card-pro__arrow" aria-hidden="true">{Icons.arrowRight}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRODUCTOS DESTACADOS */}
      {featuredProducts.length > 0 && (
        <section className="section-pro reveal">
          <div className="container-pro">
            <div className="section-header-pro">
              <div className="header-content-pro">
                <div className="icon-badge-pro primary">{Icons.star}</div>
                <div>
                  <h3 className="section-title-pro">Nuevos y Destacados</h3>
                  <p className="section-subtitle-pro">Una selección de productos nuevos y destacados para esta temporada.</p>
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
        <section className="section-pro bestseller-bg reveal">
          <div className="container-pro">
            <div className="section-header-pro">
              <div className="header-content-pro">
                <div className="icon-badge-pro red">{Icons.fire}</div>
                <div>
                  <h3 className="section-title-pro">Más Vendidos</h3>
                  <p className="section-subtitle-pro">Los favoritos indiscutibles de nuestros clientes.</p>
                </div>
              </div>
              <Link to="/products?orderBy=ventas&order=DESC" className="link-view-pro">Ver todos {Icons.arrowRight}</Link>
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
        <section className="section-pro dulces-bg reveal">
          <div className="container-pro">
            <div className="section-header-pro">
              <div className="header-content-pro">
                <div className="icon-badge-pro secondary">{Icons.candy}</div>
                <div>
                  <h3 className="section-title-pro">Lo mejor de Dulces</h3>
                  <p className="section-subtitle-pro">Una colección especial de sabores dulces que encantan a todos.</p>
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

      {/* LICORES PREMIUM */}
      {licoresProducts.length > 0 && (
        <section className="section-pro licores-bg reveal">
          <div className="container-pro">
            <div className="section-header-pro">
              <div className="header-content-pro">
                <div className="icon-badge-pro wine">{Icons.wine}</div>
                <div>
                  <h3 className="section-title-pro">Lo Último en Licores</h3>
                  <p className="section-subtitle-pro">Descubre bebidas ideales para compartir, celebrar o relajarte.</p>
                </div>
              </div>
              <Link to="/products?categoria_id=18" className="link-view-pro">Ver todos {Icons.arrowRight}</Link>
            </div>
            <div className="products-grid-pro">
              {licoresProducts.map(product => (
                <ProductCard key={product.producto_id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ÚLTIMAS UNIDADES */}
      {lowStockProducts.length > 0 && (
        <section className="section-pro lowstock-bg reveal">
          <div className="container-pro">
            <div className="section-header-pro">
              <div className="header-content-pro">
                <div className="icon-badge-pro alert">{Icons.alert}</div>
                <div>
                  <h3 className="section-title-pro">Antes de que se Agoten</h3>
                  <p className="section-subtitle-pro">Lo más pedido está por agotarse. Aún estás a tiempo de llevarlo</p>
                </div>
              </div>
              <Link to="/products?low_stock=true" className="link-view-pro">Ver todos {Icons.arrowRight}</Link>
            </div>
            <div className="products-grid-pro">
              {lowStockProducts.map(product => (
                <ProductCard key={product.producto_id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CÓMO COMPRAR */}
      <section className="how-section-pro reveal">
        <div className="container-pro">
          <div className="section-header-pro section-header-pro--center">
            <div className="header-content-pro">
              <div className="icon-badge-pro primary">{Icons.box}</div>
              <div>
                <h3 className="section-title-pro">Comprar es muy fácil</h3>
                <p className="section-subtitle-pro">En tres pasos tienes tus productos favoritos en casa.</p>
              </div>
            </div>
          </div>
          <div className="how-grid-pro">
            {[
              { n: '01', t: 'Elige tus productos', d: 'Explora el catálogo y arma tu carrito con lo que más te guste.' },
              { n: '02', t: 'Pide por WhatsApp', d: 'Envía tu pedido en un clic y te confirmamos disponibilidad y total.' },
              { n: '03', t: 'Recíbelo en casa', d: 'Coordinamos la entrega en Huánuco, rápida y segura.' }
            ].map(step => (
              <div className="how-step-pro" key={step.n}>
                <span className="how-step-pro__num">{step.n}</span>
                <h4 className="how-step-pro__title">{step.t}</h4>
                <p className="how-step-pro__desc">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INFO SECTION */}
      <section className="info-section-pro reveal">
        <div className="container-pro">
          <div className="info-grid-pro">
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

      {/* UBICACIÓN + MAPA */}
      <section className="location-section-pro reveal">
        <div className="container-pro">
          <div className="location-grid-pro">
            <div className="location-info-pro">
              <span className="location-eyebrow-pro">{Icons.mapPin} Visítanos</span>
              <h3 className="location-title-pro">Encuéntranos en Huánuco</h3>
              <p className="location-text-pro">
                Te esperamos en nuestra tienda con la mejor selección de productos importados.
                Pasa a conocerlos o escríbenos para coordinar tu pedido.
              </p>
              <ul className="location-list-pro">
                <li>{Icons.mapPin}<span>Av. Juan Velasco Alvarado 748, Pillco Marca, Huánuco</span></li>
                <li><span className="location-clock" aria-hidden="true">{Icons.clock}</span><span>Lunes a Domingo: 8:00 AM - 10:00 PM</span></li>
                <li>{Icons.phone}<span>+51 952 682 285</span></li>
              </ul>
              <div className="location-actions-pro">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Av.+Juan+Velasco+Alvarado+748,+Pillco+Marca,+Hu%C3%A1nuco"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="location-btn-pro location-btn-pro--primary"
                >
                  Cómo llegar {Icons.arrowRight}
                </a>
                <a
                  href="https://wa.me/51952682285"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="location-btn-pro location-btn-pro--ghost"
                >
                  Escribir por WhatsApp
                </a>
              </div>
            </div>
            <div className="location-map-pro">
              <iframe
                title="Ubicación de Qhatu en el mapa"
                src="https://www.google.com/maps?q=Av.%20Juan%20Velasco%20Alvarado%20748%2C%20Pillco%20Marca%2C%20Hu%C3%A1nuco&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="stats-section-pro reveal">
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