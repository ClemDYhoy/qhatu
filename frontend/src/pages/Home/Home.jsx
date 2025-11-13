import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

// ====================================
// 🎨 ICONOS SVG PROFESIONALES
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
  eye: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 10s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6z" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="10" cy="10" r="3"/>
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
  clock: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="10" cy="10" r="8"/>
      <path d="M10 5v5l3 3" strokeLinecap="round" strokeLinejoin="round"/>
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
  users: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 17v-2a4 4 0 00-8 0v2M10 9a3 3 0 100-6 3 3 0 000 6zM18 17v-2a4 4 0 00-3-3.87M15 1.13A4 4 0 0118 5a4 4 0 01-3 3.87" strokeLinecap="round" strokeLinejoin="round"/>
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
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manejo de scroll mejorado para transición suave
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPosition = window.scrollY;
          const contextualHeight = window.innerHeight * 0.5; // 50vh
          
          if (scrollPosition > contextualHeight * 0.3) {
            document.body.classList.add('scrolled');
          } else {
            document.body.classList.remove('scrolled');
          }
          
          ticking = false;
        });
        
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Datos simulados para demostración
  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setFeaturedProducts([
        { producto_id: 1, nombre: 'Snickers Original', precio: 5.50, url_imagen: '/awaiting-image.jpeg', stock: 50 },
        { producto_id: 2, nombre: 'M&M\'s Chocolate', precio: 4.90, url_imagen: '/awaiting-image.jpeg', stock: 35 },
        { producto_id: 3, nombre: 'KitKat Chunky', precio: 6.20, url_imagen: '/awaiting-image.jpeg', stock: 28 },
        { producto_id: 4, nombre: 'Twix Caramelo', precio: 5.80, url_imagen: '/awaiting-image.jpeg', stock: 42 },
        { producto_id: 5, nombre: 'Milky Way', precio: 5.30, url_imagen: '/awaiting-image.jpeg', stock: 31 },
        { producto_id: 6, nombre: 'Ferrero Rocher', precio: 12.50, url_imagen: '/awaiting-image.jpeg', stock: 15 },
        { producto_id: 7, nombre: 'Toblerone', precio: 8.90, url_imagen: '/awaiting-image.jpeg', stock: 22 }
      ]);
      setBestSellers([
        { producto_id: 8, nombre: 'Hershey\'s Classic', precio: 7.20, url_imagen: '/awaiting-image.jpeg', ventas: 120 },
        { producto_id: 9, nombre: 'Reese\'s Peanut', precio: 6.80, url_imagen: '/awaiting-image.jpeg', ventas: 98 },
        { producto_id: 10, nombre: 'Lindt Excellence', precio: 14.90, url_imagen: '/awaiting-image.jpeg', ventas: 85 },
        { producto_id: 11, nombre: 'Cadbury Dairy Milk', precio: 8.50, url_imagen: '/awaiting-image.jpeg', ventas: 76 },
        { producto_id: 12, nombre: 'Nutella B-ready', precio: 9.20, url_imagen: '/awaiting-image.jpeg', ventas: 65 },
        { producto_id: 13, nombre: 'Kinder Bueno', precio: 7.90, url_imagen: '/awaiting-image.jpeg', ventas: 58 },
        { producto_id: 14, nombre: 'Bounty Coconut', precio: 5.60, url_imagen: '/awaiting-image.jpeg', ventas: 47 }
      ]);
      setDulcesProducts([
        { producto_id: 15, nombre: 'Haribo Goldbears', precio: 4.50, url_imagen: '/awaiting-image.jpeg' },
        { producto_id: 16, nombre: 'Skittles Original', precio: 4.20, url_imagen: '/awaiting-image.jpeg' },
        { producto_id: 17, nombre: 'Nerds Rainbow', precio: 5.80, url_imagen: '/awaiting-image.jpeg' },
        { producto_id: 18, nombre: 'Sour Patch Kids', precio: 6.50, url_imagen: '/awaiting-image.jpeg' },
        { producto_id: 19, nombre: 'Mentos Rainbow', precio: 3.90, url_imagen: '/awaiting-image.jpeg' },
        { producto_id: 20, nombre: 'Trolli Gummy', precio: 5.20, url_imagen: '/awaiting-image.jpeg' },
        { producto_id: 21, nombre: 'Warheads Extreme', precio: 4.80, url_imagen: '/awaiting-image.jpeg' }
      ]);
      setBanners([
        { banner_id: 1, titulo: 'Black Friday', descripcion: 'Hasta 40% en dulces premium', porcentaje_descuento: 40, categoria_nombre: 'Chocolates', dias_restantes: 5 },
        { banner_id: 2, titulo: 'Cyber Monday', descripcion: 'Ofertas exclusivas online', porcentaje_descuento: 35, categoria_nombre: 'Gomitas', dias_restantes: 7 }
      ]);
      setLoading(false);
    }, 800);
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
            <span>Dulces Premium Importados</span>
          </div>
          <h1 className="hero-title-pro">Endulza Tus Momentos Especiales</h1>
          <p className="hero-desc-pro">
            Descubre la mejor selección de dulces importados con calidad garantizada y entrega inmediata en Huánuco
          </p>
          <div className="hero-features-pro">
            <div className="hero-item-pro">
              {Icons.truck}
              <span>Envío gratis +S/50</span>
            </div>
            <div className="hero-item-pro">
              {Icons.shield}
              <span>100% originales</span>
            </div>
            <div className="hero-item-pro">
              {Icons.box}
              <span>Empaque premium</span>
            </div>
          </div>
        </div>
      </section>

      {/* BANNERS PROMOCIONALES */}
      {banners.length > 0 && (
        <section className="section-pro promo-bg">
          <div className="container-pro">
            <div className="section-header-pro">
              <div className="header-content-pro">
                <div className="icon-badge-pro gold">{Icons.tag}</div>
                <div>
                  <h2 className="section-title-pro">Ofertas Especiales</h2>
                  <p className="section-subtitle-pro">Aprovecha estos descuentos por tiempo limitado</p>
                </div>
              </div>
              <Link to="/products" className="link-view-pro">
                Ver todas {Icons.arrowRight}
              </Link>
            </div>
            <div className="banners-grid-pro">
              {banners.map((banner) => (
                <div key={banner.banner_id} className="banner-card-pro">
                  <div className="banner-discount-pro">{banner.porcentaje_descuento}%</div>
                  <h3 className="banner-title-pro">{banner.titulo}</h3>
                  <p className="banner-desc-pro">{banner.descripcion}</p>
                  <div className="banner-footer-pro">
                    <span className="banner-cat-pro">{banner.categoria_nombre}</span>
                    <span className="banner-time-pro">
                      {Icons.clock}
                      {banner.dias_restantes} días
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
              <Link to="/products?featured=true" className="link-view-pro">
                Ver todos {Icons.arrowRight}
              </Link>
            </div>
            <div className="products-grid-pro">
              {featuredProducts.map((product) => (
                <div key={product.producto_id} className="product-card-pro">
                  <div className="product-image-pro">
                    <img src={product.url_imagen} alt={product.nombre} />
                    {product.stock < 20 && (
                      <span className="product-badge-pro low">Stock bajo</span>
                    )}
                  </div>
                  <div className="product-info-pro">
                    <h3 className="product-name-pro">{product.nombre}</h3>
                    <div className="product-footer-pro">
                      <span className="product-price-pro">S/ {product.precio.toFixed(2)}</span>
                      <button className="btn-add-pro">Agregar</button>
                    </div>
                  </div>
                </div>
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
              <Link to="/products?orderBy=ventas" className="link-view-pro">
                Ver todos {Icons.arrowRight}
              </Link>
            </div>
            <div className="products-grid-pro">
              {bestSellers.map((product) => (
                <div key={product.producto_id} className="product-card-pro">
                  <div className="product-image-pro">
                    <img src={product.url_imagen} alt={product.nombre} />
                    <span className="product-badge-pro hot">Hot</span>
                  </div>
                  <div className="product-info-pro">
                    <h3 className="product-name-pro">{product.nombre}</h3>
                    <div className="product-footer-pro">
                      <span className="product-price-pro">S/ {product.precio.toFixed(2)}</span>
                      <button className="btn-add-pro">Agregar</button>
                    </div>
                  </div>
                </div>
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
              <Link to="/products?category=1" className="link-view-pro">
                Ver todos {Icons.arrowRight}
              </Link>
            </div>
            <div className="products-grid-pro">
              {dulcesProducts.map((product) => (
                <div key={product.producto_id} className="product-card-pro">
                  <div className="product-image-pro">
                    <img src={product.url_imagen} alt={product.nombre} />
                  </div>
                  <div className="product-info-pro">
                    <h3 className="product-name-pro">{product.nombre}</h3>
                    <div className="product-footer-pro">
                      <span className="product-price-pro">S/ {product.precio.toFixed(2)}</span>
                      <button className="btn-add-pro">Agregar</button>
                    </div>
                  </div>
                </div>
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
              <p className="info-text-pro">Jr. 28 de Julio 1234, Huánuco</p>
              <p className="info-text-pro secondary">Lunes a Sábado: 9:00 AM - 8:00 PM</p>
            </div>
            <div className="info-card-pro">
              <div className="info-icon-pro">{Icons.phone}</div>
              <h3 className="info-title-pro">Contacto Directo</h3>
              <p className="info-text-pro">+51 962 123 456</p>
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