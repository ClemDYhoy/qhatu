import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import Button from '../../ui/Button/Button';
import './ProductCard.css';

const ProductCard = ({ product }) => {
const { addToCart } = useCart();

const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
};

return (
    <Link to={`/product/${product.id}`} className="product-card">
        <div className="product-image">
            {product.image ? (
            <img src={product.image} alt={product.name} />
            ) : (
            <div className="product-image-placeholder">
                {product.name.charAt(0).toUpperCase()}
            </div>
            )}
        </div>
        
        <div className="product-content">
            <h3 className="product-title">{product.name}</h3>
            <p className="product-description">{product.description}</p>
            
            <div className="product-footer">
            <span className="product-price">${product.price}</span>
            <Button 
                variant="primary" 
                size="small" 
                onClick={handleAddToCart}
            >
                Agregar
            </Button>
            </div>
        </div>
    </Link>
);
};

export default ProductCard;