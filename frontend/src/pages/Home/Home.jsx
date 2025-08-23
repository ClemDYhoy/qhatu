import { useEffect, useState } from 'react';
import { productService } from '../../services/productService';

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    productService.getAll()
      .then(data => {
        console.log('Home - Fetched data:', data); // Depuración
        // Asegúrate de que setProducts reciba solo el array de products
        setProducts(data.products || []);
      })
      .catch(error => console.error('Home - Error:', error));
  }, []);

  return (
    <div>
      <h1>Welcome to Qhatu Store</h1>
      {products.length > 0 ? (
        products.map(p => <p key={p._id}>{p.name}</p>)
      ) : (
        <p>Loading products...</p>
      )}
    </div>
  );
};

export default Home;