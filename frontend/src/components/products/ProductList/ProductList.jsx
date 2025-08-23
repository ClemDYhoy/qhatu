import React from 'react';
import ProductCard from '../ProductCard/ProductCard';
import './ProductList.css';

const ProductList = ({ products, isLoading }) => {
if (isLoading) {
    return (
    <div className="product-list-loading">
        <div className="loading-spinner"></div>
        <p>Cargando productos...</p>
    </div>
    );
}

if (!products || products.length === 0) {
    return (
    <div className="product-list-empty">
        <p>No se encontraron productos.</p>
    </div>
    );
}

return (
    <div className="product-list">
    {products.map(product => (
        <ProductCard key={product.id} product={product} />
    ))}
    </div>
);
};

export default ProductList;