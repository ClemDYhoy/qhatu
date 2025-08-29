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