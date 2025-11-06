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

    // === Agregado: Guardar en "Productos vistos recientemente" ===
    const saveToRecentlyViewed = (product) => {
        try {
            let viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
           
            // Remover si ya existe
            viewed = viewed.filter(p => p.producto_id !== product.producto_id);
           
            // Agregar al inicio
            viewed.unshift(product);
           
            // Mantener solo los últimos 10
            viewed = viewed.slice(0, 10);
           
            localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
        } catch (err) {
            console.error('Error al guardar en historial:', err);
        }
    };

    // === useEffect mejorado (reemplaza el original) ===
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const products = await getProducts({ id });
                if (products.length > 0) {
                    const productData = products[0];
                    setProduct(productData);
                   
                    // Guardar en productos vistos recientemente
                    saveToRecentlyViewed(productData);
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