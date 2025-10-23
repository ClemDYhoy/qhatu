import React, { useState, useEffect, useContext } from 'react';
import { CartContext } from '../../../contexts/CartContext';
import { getProducts, getCategories } from '../../../services/productService';
import './ProductList.css';

const ProductList = ({ searchTerm }) => {
    const { addToCart } = useContext(CartContext);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        category: '',
        priceMin: '',
        priceMax: '',
        availability: 'all',
        highlighted: false
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    getProducts({ search: searchTerm, ...filters }),
                    getCategories()
                ]);
                setProducts(productsData);
                setCategories(categoriesData);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchData();
    }, [searchTerm, filters]);

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    if (error) return <div className="error">Error: {error}</div>;
    if (products.length === 0 && !error) return <div className="loading">Cargando productos...</div>;

    return (
        <div className="product-list-container">
            <aside className="filters">
                <h3>Filtros</h3>
                <div className="filter-group">
                    <label>Categoría</label>
                    <select name="category" value={filters.category} onChange={handleFilterChange}>
                        <option value="">Todas</option>
                        {categories.map((cat) => (
                            <option key={cat.categoria_id} value={cat.nombre}>
                                {cat.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Precio Mínimo</label>
                    <input
                        type="number"
                        name="priceMin"
                        placeholder="0"
                        value={filters.priceMin}
                        onChange={handleFilterChange}
                    />
                </div>
                <div className="filter-group">
                    <label>Precio Máximo</label>
                    <input
                        type="number"
                        name="priceMax"
                        placeholder="1000"
                        value={filters.priceMax}
                        onChange={handleFilterChange}
                    />
                </div>
                <div className="filter-group">
                    <label>Disponibilidad</label>
                    <select name="availability" value={filters.availability} onChange={handleFilterChange}>
                        <option value="all">Todos</option>
                        <option value="low">Bajo stock</option>
                        <option value="critical">Stock crítico</option>
                        <option value="out">Agotado</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>
                        <input
                            type="checkbox"
                            name="highlighted"
                            checked={filters.highlighted}
                            onChange={handleFilterChange}
                        />
                        Solo destacados
                    </label>
                </div>
            </aside>
            <div className="products">
                {products.map((product) => (
                    <div key={product.producto_id} className="product-card">
                        <img src={product.url_imagen} alt={product.nombre} />
                        <h3>{product.nombre}</h3>
                        <p>{product.descripcion}</p>
                        <p>Precio: ${product.precio}</p>
                        <p>Stock: {product.stock} ({product.estado_stock})</p>
                        <p>Categoría: {product.categoria?.nombre}</p>
                        <button onClick={() => addToCart(product)}>Agregar al Carrito</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductList;