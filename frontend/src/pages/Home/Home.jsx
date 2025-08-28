import { useEffect, useState } from 'react';
import { productService } from '../../services/productService';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    productService.getAll()
      .then(data => {
        console.log('Home - Fetched data:', data);
        const productsData = data.products || [];
        setProducts(productsData);
        
        // Seleccionar productos destacados (los primeros 3 o aleatorios)
        setFeaturedProducts(productsData.slice(0, 3));
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Home - Error:', error);
        setIsLoading(false);
      });
  }, []);

  return (
    <main className="oe-home">
      {/* Hero Section */}
      <section className="oe-hero-banner">
        <div className="oe-hero-content">
          <h1 className="oe-hero-title">
            Bienvenido a <span className="oe-hero-accent">Qhatu Store</span>
          </h1>
          <p className="oe-hero-subtitle">
            Descubre productos importados exclusivos, adaptados culturalmente para la comunidad hispanohablante
          </p>
          <button className="oe-btn oe-btn-primary oe-hero-cta">
            Explorar Productos
          </button>
        </div>
        <div className="oe-hero-visual">
          <div className="oe-hero-blob"></div>
          <img 
            src="https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80" 
            alt="Qhatu Store - Productos importados" 
            className="oe-hero-image"
          />
        </div>
      </section>

      {/* Featured Products */}
      <section className="oe-section">
        <div className="container">
          <div className="oe-section-header">
            <h2 className="oe-section-title">Productos Destacados</h2>
            <p className="oe-section-subtitle">Lo más buscado por nuestros clientes</p>
          </div>

          {isLoading ? (
            <div className="oe-loading">
              <div className="oe-loading-spinner"></div>
              <p>Cargando productos...</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="oe-products-grid">
              {featuredProducts.map(product => (
                <div key={product._id} className="oe-product-card">
                  <div className="oe-product-image">
                    <img 
                      src={product.image || 'https://via.placeholder.com/300x300?text=Producto'} 
                      alt={product.name} 
                    />
                    <div className="oe-product-overlay">
                      <button className="oe-btn oe-btn-primary">Ver Detalles</button>
                    </div>
                  </div>
                  <div className="oe-product-info">
                    <h3 className="oe-product-name">{product.name}</h3>
                    <p className="oe-product-description">
                      {product.description?.substring(0, 60)}...
                    </p>
                    <div className="oe-product-meta">
                      <span className="oe-product-price">${product.price}</span>
                      <div className="oe-product-rating">
                        ★★★★☆
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="oe-empty-state">
              <div className="oe-empty-icon">🛒</div>
              <h3>No hay productos disponibles</h3>
              <p>Pronto tendremos novedades para ti</p>
            </div>
          )}
        </div>
      </section>

      {/* Value Proposition */}
      <section className="oe-values">
        <div className="container">
          <div className="oe-values-grid">
            <div className="oe-value-card">
              <div className="oe-value-icon">🌎</div>
              <h3>Productos Globales</h3>
              <p>Accede a productos de todo el mundo sin complicaciones</p>
            </div>
            <div className="oe-value-card">
              <div className="oe-value-icon">📦</div>
              <h3>Envíos Rápidos</h3>
              <p>Recibe tus pedidos en tiempo récord con seguimiento incluido</p>
            </div>
            <div className="oe-value-card">
              <div className="oe-value-icon">🛡️</div>
              <h3>Compra Segura</h3>
              <p>Transacciones protegidas y garantía de satisfacción</p>
            </div>
          </div>
        </div>
      </section>

      {/* All Products */}
      {products.length > 0 && (
        <section className="oe-section oe-section-alt">
          <div className="container">
            <div className="oe-section-header">
              <h2 className="oe-section-title">Nuestro Catálogo</h2>
              <p className="oe-section-subtitle">{products.length} productos disponibles</p>
            </div>
            
            <div className="oe-products-list">
              {products.map(product => (
                <div key={product._id} className="oe-product-list-item">
                  <div className="oe-product-list-image">
                    <img 
                      src={product.image || 'https://via.placeholder.com/100x100?text=Producto'} 
                      alt={product.name} 
                    />
                  </div>
                  <div className="oe-product-list-details">
                    <h3>{product.name}</h3>
                    <p>{product.description?.substring(0, 100)}...</p>
                  </div>
                  <div className="oe-product-list-actions">
                    <span className="oe-product-price">${product.price}</span>
                    <button className="oe-btn oe-btn-outline">Añadir al carrito</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default Home;