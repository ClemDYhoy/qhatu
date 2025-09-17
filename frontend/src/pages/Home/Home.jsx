import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCarousel, getProducts } from '../../api';
import Carousel from '../../components/Carousel/Carousel';
import ProductCard from '../../components/products/ProductCard/ProductCard';
import '../../styles/global.css';
import './Home.css';

function Home() {
  const [carouselSlides, setCarouselSlides] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [carouselRes, productsRes] = await Promise.all([
          getCarousel(),
          getProducts({ page: 1, limit: 6 })
        ]);
        console.log('Carousel Data:', carouselRes.data); // Depuración
        console.log('Products Data:', productsRes.data); // Depuración
        setCarouselSlides(carouselRes.data || []);
        setFeaturedProducts(productsRes.data.products || []);
      } catch (error) {
        setError('Error al cargar los datos. Asegúrate de que el backend esté corriendo en http://localhost:5000.');
        console.error('Home - Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="home-container">
      <h1>Bienvenido a Qhatu Marca</h1>
      {isLoading ? (
        <p className="loading">Cargando...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          {carouselSlides.length > 0 ? (
            <Carousel slides={carouselSlides} />
          ) : (
            <p>No hay promociones disponibles</p>
          )}
          <section className="featured-products">
            <h2>Productos Destacados</h2>
            {featuredProducts.length > 0 ? (
              <div className="product-grid">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id_producto} product={product} />
                ))}
              </div>
            ) : (
              <p>No hay productos destacados disponibles</p>
            )}
          </section>
          <Link to="/products" className="products-link">Ver Todos los Productos</Link>
        </>
      )}
    </div>
  );
}

export default Home;