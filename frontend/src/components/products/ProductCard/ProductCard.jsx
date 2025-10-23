import React, { useState } from 'react';
import { useCart } from '../../../contexts/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart, isInCart, getProductQuantity } = useCart();
  const [showDetails, setShowDetails] = useState(false);

  const inCart = isInCart(product.producto_id);
  const cartQuantity = getProductQuantity(product.producto_id);
  const hasDiscount = product.precio_descuento && product.precio_descuento < product.precio;
  const discountPercent = hasDiscount 
    ? Math.round(((product.precio - product.precio_descuento) / product.precio) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart(product, 1);
    }
  };

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    const message = encodeURIComponent(
      `Hola! Estoy interesado en: ${product.nombre}\nPrecio: S/. ${hasDiscount ? product.precio_descuento : product.precio}`
    );
    window.open(`https://wa.me/51123456789?text=${message}`, '_blank');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  };

  return (
    <>
      <div className="product-card" onClick={() => setShowDetails(true)}>
        {hasDiscount && (
          <span className="product-badge discount">-{discountPercent}%</span>
        )}
        {product.destacado && (
          <span className="product-badge featured">Destacado</span>
        )}
        {product.stock === 0 && (
          <span className="product-badge out-of-stock">Agotado</span>
        )}

        <div className="product-image">
          <img
            src={product.url_imagen || '/placeholder.png'}
            alt={product.nombre}
            onError={(e) => e.target.src = '/placeholder.png'}
          />
        </div>

        <div className="product-info">
          {product.categoria && (
            <span className="product-category">{product.categoria.nombre}</span>
          )}
          <h3 className="product-name">{product.nombre}</h3>
          {product.descripcion && (
            <p className="product-description">
              {product.descripcion.substring(0, 80)}...
            </p>
          )}

          <div className="product-footer">
            <div className="product-price">
              {hasDiscount ? (
                <>
                  <span className="price-original">{formatPrice(product.precio)}</span>
                  <span className="price-discount">{formatPrice(product.precio_descuento)}</span>
                </>
              ) : (
                <span className="price-current">{formatPrice(product.precio)}</span>
              )}
            </div>

            {product.stock > 0 && (
              <span className="product-stock">
                {product.stock} {product.unidad_medida || 'unidades'}
              </span>
            )}
          </div>

          <div className="product-actions">
            <button
              className="btn-add-cart"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {inCart ? `En carrito (${cartQuantity})` : 'Agregar'}
            </button>
            <button className="btn-details" onClick={() => setShowDetails(true)}>
              Detalles
            </button>
          </div>
        </div>
      </div>

      {/* Modal de detalles */}
      {showDetails && (
        <div className="product-modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDetails(false)}>
              ×
            </button>

            <div className="modal-content">
              <div className="modal-image">
                <img
                  src={product.url_imagen || '/placeholder.png'}
                  alt={product.nombre}
                  onError={(e) => e.target.src = '/placeholder.png'}
                />
              </div>

              <div className="modal-info">
                {product.categoria && (
                  <span className="category-badge">{product.categoria.nombre}</span>
                )}
                <h2>{product.nombre}</h2>
                <p className="description">{product.descripcion}</p>

                <div className="price-section">
                  {hasDiscount ? (
                    <>
                      <span className="price-original">{formatPrice(product.precio)}</span>
                      <span className="price-discount">{formatPrice(product.precio_descuento)}</span>
                      <span className="discount-badge">-{discountPercent}%</span>
                    </>
                  ) : (
                    <span className="price-current">{formatPrice(product.precio)}</span>
                  )}
                </div>

                <div className="stock-info">
                  <span className={`stock-badge ${product.stock === 0 ? 'out' : product.stock < 10 ? 'low' : 'available'}`}>
                    {product.stock === 0 
                      ? 'Agotado' 
                      : product.stock < 10 
                        ? `Solo quedan ${product.stock}` 
                        : `${product.stock} disponibles`}
                  </span>
                </div>

                <div className="modal-actions">
                  <button
                    className="btn-add-cart-large"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                  >
                    {inCart ? `En carrito (${cartQuantity})` : 'Agregar al carrito'}
                  </button>
                  <button className="btn-whatsapp" onClick={handleWhatsApp}>
                    <span>💬</span> Cotizar por WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;