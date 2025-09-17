import React from 'react';
import ProductCard from '../ProductCard/ProductCard';
import Button from '../../ui/Button/Button';
import './ProductList.css';

function ProductList({ products, total, page, setPage }) {
const limit = 10;
const totalPages = Math.ceil(total / limit);

return (
    <div className="product-list">
    {products.map((product) => (
        <ProductCard key={product.id_producto} product={product} />
    ))}
    <div className="pagination">
        <Button
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        >
        Anterior
        </Button>
        <span>Página {page} de {totalPages}</span>
        <Button
        onClick={() => setPage(page + 1)}
        disabled={page === totalPages}
        >
        Siguiente
        </Button>
    </div>
    </div>
);
}

export default ProductList;