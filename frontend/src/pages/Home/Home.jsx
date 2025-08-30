import { useEffect, useState, useCallback } from 'react';
import { productService } from '../../services/productService';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  // Datos de promociones (podrían venir de una API en el futuro)
  const promotions = [
    {
      id: 1,
      title: "50% OFF Snacks Japoneses",
      description: "Disfruta de tus snacks favoritos con un descuento increíble",
      image: "https://images.unsplash.com/photo-1599669454699-248893623464?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
      discount: "50%",
      timeLeft: "24:00:00",
      backgroundColor: "#ff0066"
    },
    {
      id: 2,
      title: "2x1 en Bebidas Coreanas",
      description: "Llévate el doble por el mismo precio, ¡solo por hoy!",
      image: "https://images.unsplash.com/photo-1554866585-cd948608c467?ixlib=rb-4.0.3&auto=format&fit=crop&w=715&q=80",
      discount: "2x1",
      timeLeft: "18:30:25",
      backgroundColor: "#f3e82c"
    },
    {
      id: 3,
      title: "30% OFF en Postres Italianos",
      description: "Endulza tu día con nuestras delicias italianas",
      image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80",
      discount: "30%",
      timeLeft: "12:45:15",
      backgroundColor: "#00cc99"
    },
    {
      id: 4,
      title: "Envío Gratis en Compras Mayores a $50",
      description: "Ahorra en el envío de tus productos favoritos",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80",
      discount: "FREE",
      timeLeft: "48:00:00",
      backgroundColor: "#0099ff"
    }
  ];

  // Función para avanzar el carrusel automáticamente
  const nextPromo = useCallback(() => {
    setCurrentPromoIndex((prevIndex) => 
      prevIndex === promotions.length - 1 ? 0 : prevIndex + 1
    );
  }, [promotions.length]);

  useEffect(() => {
    // Cargar productos
    setIsLoading(true);
    productService.getAll()
      .then(data => {
        const productsData = data.products || [];
        setProducts(productsData);
        setFeaturedProducts(productsData.slice(0, 3));
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Home - Error:', error);
        setIsLoading(false);
      });

    // Configurar intervalo para el carrusel automático
    const interval = setInterval(nextPromo, 5000);
    return () => clearInterval(interval);
  }, [nextPromo]);

  // Manejar clic en los indicadores del carrusel
  const handlePromoClick = (index) => {
    setCurrentPromoIndex(index);
  };

  return (
    <main className="qhatu-home">
      
      {/* Carrusel de Promociones */}
      <section className="qhatu-promo-section">
        <div className="container">
          <div className="qhatu-section-header">
            <h2 className="qhatu-section-title">Ofertas que Explotan de Sabor 💥</h2>
            <p className="qhatu-section-subtitle">Aprovecha estas promociones por tiempo limitado</p>
          </div>
          
          <div className="qhatu-promo-carousel">
            <div className="qhatu-promo-container" 
                 style={{ transform: `translateX(-${currentPromoIndex * 100}%)` }}>
              {promotions.map((promo, index) => (
                <div 
                  key={promo.id} 
                  className="qhatu-promo-slide"
                  style={{ backgroundColor: promo.backgroundColor }}
                >
                  <div className="qhatu-promo-content">
                    <div className="qhatu-promo-badge">{promo.discount} OFF</div>
                    <h3 className="qhatu-promo-title">{promo.title}</h3>
                    <p className="qhatu-promo-desc">{promo.description}</p>
                    <div className="qhatu-promo-timer">
                      <span className="qhatu-promo-time-label">Termina en:</span>
                      <span className="qhatu-promo-time">{promo.timeLeft}</span>
                    </div>
                    <button className="qhatu-btn qhatu-btn-promo qhatu-promo-cta">
                      ¡Agarra tu Deal!
                    </button>
                  </div>
                  <div className="qhatu-promo-image">
                    <img src={promo.image} alt={promo.title} />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="qhatu-promo-indicators">
              {promotions.map((_, index) => (
                <button
                  key={index}
                  className={`qhatu-promo-indicator ${index === currentPromoIndex ? 'active' : ''}`}
                  onClick={() => handlePromoClick(index)}
                  aria-label={`Ir a promoción ${index + 1}`}
                />
              ))}
            </div>
            
            <button 
              className="qhatu-promo-nav qhatu-promo-prev"
              onClick={() => setCurrentPromoIndex(prev => prev === 0 ? promotions.length - 1 : prev - 1)}
              aria-label="Promoción anterior"
            >
              ‹
            </button>
            <button 
              className="qhatu-promo-nav qhatu-promo-next"
              onClick={() => setCurrentPromoIndex(prev => prev === promotions.length - 1 ? 0 : prev + 1)}
              aria-label="Siguiente promoción"
            >
              ›
            </button>
          </div>
        </div>
      </section>

      <section className="qhatu-services-horizontal-section">
        <div className="qhatu-services-horizontal-container">
          <div className="qhatu-services-horizontal-content">
            <h2 className="qhatu-services-horizontal-title">Te brindamos una experiencia única</h2>
            
            <div className="qhatu-services-horizontal-grid">
              {/* Servicio 1: Envíos */}
              <div className="qhatu-service-horizontal-item">
                <div className="qhatu-service-horizontal-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 116 0h3a.75.75 0 00.75-.75V15z" />
                    <path d="M8.25 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zM15.75 6.75a.75.75 0 00-.75.75v11.25c0 .087.015.17.042.248a3 3 0 015.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 00-3.732-10.104 1.837 1.837 0 00-1.47-.725H15.75z" />
                    <path d="M19.5 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
                  </svg>
                </div>
                <div className="qhatu-service-horizontal-text">
                  <h3>Envíos todo Huanuco</h3>
                  <p>Delivery 24 a 48 Hrs</p>
                </div>
              </div>
              
              {/* Servicio 2: Compras seguras */}
              <div className="qhatu-service-horizontal-item">
                <div className="qhatu-service-horizontal-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1.5a.75.75 0 01.75.75V7.5h-1.5V2.25A.75.75 0 0112 1.5zM11.25 7.5v5.69l-1.72-1.72a.75.75 0 00-1.06 1.06l3 3a.75.75 0 001.06 0l3-3a.75.75 0 10-1.06-1.06l-1.72 1.72V7.5h3.75a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9a3 3 0 013-3h3.75z" />
                  </svg>
                </div>
                <div className="qhatu-service-horizontal-text">
                  <h3>Compras seguras</h3>
                  <p>En todos los pedidos</p>
                </div>
              </div>
              
              {/* Servicio 3: 100% Seguro */}
              <div className="qhatu-service-horizontal-item">
                <div className="qhatu-service-horizontal-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="qhatu-service-horizontal-text">
                  <h3>100% Seguro</h3>
                  <p>Vea nuestros beneficios</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>




      {/* Featured Products */}
      <section className="qhatu-section">
        <div className="container">
          <div className="qhatu-section-header">
            <h2 className="qhatu-section-title">Productos Destacados</h2>
            <p className="qhatu-section-subtitle">Lo más buscado por nuestra comunidad</p>
          </div>

          {isLoading ? (
            <div className="qhatu-loading">
              <div className="qhatu-loading-spinner"></div>
              <p>Cargando productos...</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="qhatu-products-grid">
              {featuredProducts.map(product => (
                <div key={product._id} className="qhatu-product-card">
                  <div className="qhatu-product-image">
                    <img 
                      src={product.image || 'https://via.placeholder.com/300x300?text=Producto'} 
                      alt={product.name} 
                    />
                    <div className="qhatu-product-overlay">
                      <button className="qhatu-btn qhatu-btn-primary">Ver Detalles</button>
                    </div>
                  </div>
                  <div className="qhatu-product-info">
                    <h3 className="qhatu-product-name">{product.name}</h3>
                    <p className="qhatu-product-description">
                      {product.description?.substring(0, 60)}...
                    </p>
                    <div className="qhatu-product-meta">
                      <span className="qhatu-product-price">${product.price}</span>
                      <div className="qhatu-product-rating">
                        ★★★★☆
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="qhatu-empty-state">
              <div className="qhatu-empty-icon">🛒</div>
              <h3>No hay productos disponibles</h3>
              <p>Pronto tendremos novedades para ti</p>
            </div>
          )}
        </div>
      </section>

      {/* Value Proposition */}
      <section className="qhatu-values">
        <div className="container">
          <div className="qhatu-values-grid">
            <div className="qhatu-value-card">
              <div className="qhatu-value-icon">🌎</div>
              <h3>Productos Globales</h3>
              <p>Accede a productos de todo el mundo sin complicaciones ni barreras idiomáticas</p>
            </div>
            <div className="qhatu-value-card">
              <div className="qhatu-value-icon">📦</div>
              <h3>Envíos Rápidos</h3>
              <p>Recibe tus pedidos en tiempo récord con seguimiento incluido</p>
            </div>
            <div className="qhatu-value-card">
              <div className="qhatu-value-icon">🛡️</div>
              <h3>Compra Segura</h3>
              <p>Transacciones protegidas y garantía de satisfacción</p>
            </div>
            <div className="qhatu-value-card">
              <div className="qhatu-value-icon">💬</div>
              <h3>Compra por WhatsApp</h3>
              <p>Proceso simplificado mediante la app que ya conoces y usas</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;