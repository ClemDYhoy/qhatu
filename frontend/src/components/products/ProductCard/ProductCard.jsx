import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

function ProductCard({ product }) {
return (
    <div className="product-card">
    <img src={product.imagen_url} alt={product.nombre} className="product-image" />
    <h3>{product.nombre}</h3>
    <p>{product.descripcion}</p>
    <p>Marca: {product.marca}</p>
    <p>Precio: ${product.precio_final}</p>
    <p>Etiquetas: {product.etiquetas}</p>
    <p>Tipo: {product.tipos_comida}</p>
    <p>Categoría: {product.nombre_categoria}</p>
    <p>Stock: {product.stock}</p>
    <Link to={`/product/${product.id_producto}`} className="product-link">Ver Detalles</Link>
    </div>
);
}

export default ProductCard;
