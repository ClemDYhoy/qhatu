import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { useCart } from '../../contexts/CartContext';
import Button from '../../components/ui/Button/Button';
import './ProductDetail.css';

const ProductDetail = () => {
const { id } = useParams();
const [product, setProduct] = useState(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);
const { addToCart } = useCart();

useEffect(() => {
    const fetchProduct = async () => {
    try {
        setIsLoading(true);
        const productData = await productService.getById(id);
        setProduct(productData);
        setError(null);
    } catch (err) {
        setError('Error al cargar el producto');
        console.error(err);
    } finally {
        setIsLoading(false);
    }
    };

    fetchProduct();
}, [id]);

const handleAddToCart = () => {
    addToCart(product);
};

if (isLoading) {
    return (
    <div className="product-detail-loading">
        <div className="loading-spinner"></div>
        <p>Cargando producto...</p>
    </div>
    );
}

if (error || !product) {
    return (
    <div className="product-detail-error">
        <h2>Producto no encontrado</h2>
        <p>{error || 'El producto que buscas no existe.'}</p>
        <Link to="/products">
        <Button variant="primary">Volver a Productos</Button>
        </Link>
    </div>
    );
}

return (
    <div className="product-detail">
        <div className="container">
            <nav className="breadcrumb">
            <Link to="/">Inicio</Link> / <Link to="/products">Productos</Link> / <span>{product.name}</span>
            </nav>

            <div className="product-detail-content">
                <div className="product-image-section">
                    {product.image ? (
                    <img src={product.image} alt={product.name} className="product-detail-image" />
                    ) : (
                    <div className="product-detail-image-placeholder">
                        {product.name.charAt(0).toUpperCase()}
                    </div>
                    )}
                </div>

                <div className="product-info-section">
                    <h1 className="product-detail-title">{product.name}</h1>
                    <p className="product-detail-price">${product.price}</p>
                    
                    <div className="product-detail-description">
                    <h3>Descripción</h3>
                    <p>{product.description}</p>
                    </div>

                    {product.details && (
                    <div className="product-detail-specs">
                        <h3>Características</h3>
                        <ul>
                        {product.details.map((detail, index) => (
                            <li key={index}>{detail}</li>
                        ))}
                        </ul>
                    </div>
                    )}

                    <div className="product-detail-actions">
                    <Button 
                        variant="primary" 
                        size="large" 
                        onClick={handleAddToCart}
                        className="add-to-cart-btn"
                    >
                        Agregar al Carrito
                    </Button>
                    
                    <Link to="/products">
                        <Button variant="secondary">
                        Seguir Comprando
                        </Button>
                    </Link>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
};

export default ProductDetail;