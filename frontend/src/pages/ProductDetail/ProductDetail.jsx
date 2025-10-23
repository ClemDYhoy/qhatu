import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { CartContext } from '../../contexts/CartContext';
import { getProducts } from '../../services/productService';
import './ProductDetail.css';

const ProductDetail = () => {
    const { addToCart } = useContext(CartContext);
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const products = await getProducts({ id });
                if (products.length > 0) {
                    setProduct(products[0]);
                } else {
                    setError('Producto no encontrado');
                }
            } catch (err) {
                setError(err.message);
            }
        };
        fetchProduct();
    }, [id]);

    if (error) return <div className="error">Error: {error}</div>;
    if (!product) return <div className="loading">Cargando producto...</div>;

    return (
        <div className="product-detail">
            <img src={product.url_imagen} alt={product.nombre} />
            <div className="product-info">
                <h2>{product.nombre}</h2>
                <p>{product.descripcion}</p>
                <p>Precio: ${product.precio}</p>
                <p>Stock: {product.stock} ({product.estado_stock})</p>
                <p>Categoría: {product.categoria?.nombre}</p>
                <button onClick={() => addToCart(product)}>Agregar al Carrito</button>
            </div>
        </div>
    );
};

export default ProductDetail;