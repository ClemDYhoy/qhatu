import React, { useState, useEffect } from 'react';
import SearchBar from '../../components/products/SearchBar/SearchBar';
import ProductList from '../../components/products/ProductList/ProductList';
import { getProducts } from '../../api';
import '../../styles/global.css';
import './Products.css';

function Products() {
const [products, setProducts] = useState([]);
const [total, setTotal] = useState(0);
const [page, setPage] = useState(1);
const [filters, setFilters] = useState({
    categoria_id: '',
    tipo_comida_id: '',
    etiqueta_id: '',
    es_importado: '',
    marca: '',
    precio_min: '',
    precio_max: '',
    termino_busqueda: '',
});

useEffect(() => {
    const fetchProducts = async () => {
    try {
        const { data } = await getProducts({ ...filters, page });
        setProducts(data.products);
        setTotal(data.total);
    } catch (error) {
        console.error('Error al obtener productos:', error);
    }
    };
    fetchProducts();
}, [filters, page]);

const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
};

return (
    <div className="products-container">
    <h2>Productos</h2>
    <SearchBar onFilterChange={handleFilterChange} />
    <ProductList products={products} total={total} page={page} setPage={setPage} />
    </div>
);
}

export default Products;