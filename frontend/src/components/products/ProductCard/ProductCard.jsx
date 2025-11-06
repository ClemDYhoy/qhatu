import React, { useState, useCallback, memo } from 'react';
import { useCart } from '../../../contexts/CartContext';
import whatsappService from '../../../services/whatsappService';
import './ProductCard.css';

// === ICONOS SVG ===
const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/>
    <circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const MinusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const TagIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

const PackageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const WeightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="6"/>
    <path d="M12 14v8"/>
    <path d="M8 22h8"/>
  </svg>
);

const SavingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1v22M17.5 5.5l-11 11M6.5 5.5l11 11"/>
    <circle cx="12" cy="12" r="10"/>
  </svg>
);

// === COMPONENTE PRINCIPAL ===
const ProductCard = memo(({ product }) => {
  const { addToCart, isInCart, getProductQuantity } = useCart();
  const [showDetails, setShowDetails] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);

  if (!product || !product.producto_id) return null;

  // Precios
  const precio = parseFloat(product.precio) || 0;
  const precioDescuento = product.precio_descuento ? parseFloat(product.precio_descuento) : null;
  const hasDiscount = precioDescuento && precioDescuento < precio;
  const discountPercent = hasDiscount ? Math.round(((precio - precioDescuento) / precio) * 100) : 0;
  const finalPrice = hasDiscount ? precioDescuento : precio;

  const stock = product.stock || 0;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock < 10;
  const inCart = isInCart(product.producto_id);
  const cartQuantity = getProductQuantity(product.producto_id);
  const maxAvailable = Math.min(stock - cartQuantity, 99);

  // Handlers
  const handleAddToCart = useCallback((e) => {
    e.stopPropagation();
    if (isOutOfStock || quantity < 1) return;

    const qtyToAdd = Math.min(quantity, maxAvailable);
    if (qtyToAdd > 0) {
      addToCart(product, qtyToAdd);
      setQuantity(1); // Reset
    }
  }, [product, quantity, isOutOfStock, maxAvailable, addToCart]);

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value) || 1;
    setQuantity(Math.max(1, Math.min(val, maxAvailable)));
  };

  const handleIncrement = () => {
    if (quantity < maxAvailable) setQuantity(q => q + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  const openModal = () => {
    setShowDetails(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowDetails(false);
    document.body.style.overflow = 'unset';
  };

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    whatsappService.consultProduct({ ...product, precio, precio_descuento: precioDescuento });
  };

  const formatPrice = (price) => `S/. ${(parseFloat(price) || 0).toFixed(2)}`;
  const imageUrl = imageError ? '/awaiting-image.jpeg' : (product.url_imagen || '/awaiting-image.jpeg');

  return (
    <>
      {/* TARJETA */}
      <article className="product-card">
        {/* Badges */}
        {(hasDiscount || isOutOfStock || product.destacado) && (
          <div className="product-card__badges">
            {product.destacado && !isOutOfStock && (
              <span className="badge badge--featured"><StarIcon /> Destacado</span>
            )}
            {hasDiscount && !isOutOfStock && (
              <span className="badge badge--discount"><TagIcon /> -{discountPercent}%</span>
            )}
            {isOutOfStock && (
              <span className="badge badge--out">Agotado</span>
            )}
          </div>
        )}

        {/* Imagen */}
        <div className="product-card__image" onClick={openModal}>
          <img src={imageUrl} alt={product.nombre} loading="lazy" onError={() => setImageError(true)} />
        </div>

        {/* Contenido */}
        <div className="product-card__content">
          {product.categoria?.nombre && (
            <p className="product-card__category">{product.categoria.nombre}</p>
          )}
          <h3 className="product-card__title" title={product.nombre}>{product.nombre}</h3>

          {/* Precio */}
          <div className="product-card__price">
            {hasDiscount ? (
              <>
                <span className="price price--old">{formatPrice(precio)}</span>
                <span className="price price--current price--discount">{formatPrice(precioDescuento)}</span>
              </>
            ) : (
              <span className="price price--current">{formatPrice(precio)}</span>
            )}
          </div>

          {/* Stock */}
          <div className="product-card__stock">
            {isOutOfStock ? (
              <span className="stock-status stock-status--out"><AlertIcon /> Agotado</span>
            ) : isLowStock ? (
              <span className="stock-status stock-status--low"><AlertIcon /> Pocas unidades</span>
            ) : (
              <span className="stock-status stock-status--available"><CheckIcon /> Disponible</span>
            )}
          </div>

          {/* Cantidad + Agregar */}
          {!isOutOfStock && (
            <div className="product-card__quantity">
              <button onClick={handleDecrement} disabled={quantity <= 1} className="qty-btn"><MinusIcon /></button>
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={maxAvailable}
                className="qty-input"
              />
              <button onClick={handleIncrement} disabled={quantity >= maxAvailable} className="qty-btn"><PlusIcon /></button>
            </div>
          )}

          {/* Acciones */}
          <div className="product-card__actions">
            <button
              className="btn btn--primary"
              onClick={handleAddToCart}
              disabled={isOutOfStock || maxAvailable <= 0}
            >
              <CartIcon />
              <span>{inCart ? `(${cartQuantity})` : 'Agregar'}</span>
            </button>
            <button className="btn btn--secondary" onClick={openModal}>
              <EyeIcon />
            </button>
          </div>
        </div>
      </article>

      {/* MODAL */}
      {showDetails && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal__close" onClick={closeModal}><CloseIcon /></button>

            <div className="modal__content">
              <div className="modal__image">
                <img src={imageUrl} alt={product.nombre} onError={() => setImageError(true)} />
                {product.destacado && <div className="modal__image-badge"><StarIcon /> Destacado</div>}
              </div>

              <div className="modal__info">
                {product.categoria?.nombre && <span className="modal__category">{product.categoria.nombre}</span>}
                <h2 className="modal__title">{product.nombre}</h2>
                {product.descripcion && <p className="modal__description">{product.descripcion}</p>}

                {/* Precio */}
                <div className="modal__price-box">
                  {hasDiscount ? (
                    <>
                      <div className="price-detail">
                        <span className="price-detail__label">Precio regular:</span>
                        <span className="price-detail__value price-detail__value--old">{formatPrice(precio)}</span>
                      </div>
                      <div className="price-detail price-detail--main">
                        <span className="price-detail__label"><SavingsIcon /> Precio oferta:</span>
                        <span className="price-detail__value price-detail__value--discount">{formatPrice(precioDescuento)}</span>
                      </div>
                      <div className="price-detail__savings">
                        Ahorras {formatPrice(precio - precioDescuento)}
                      </div>
                    </>
                  ) : (
                    <div className="price-detail price-detail--main">
                      <span className="price-detail__label">Precio:</span>
                      <span className="price-detail__value">{formatPrice(precio)}</span>
                    </div>
                  )}
                </div>

                {/* Stock */}
                <div className="modal__stock">
                  {isOutOfStock ? (
                    <span className="stock-badge stock-badge--out"><AlertIcon /> Agotado</span>
                  ) : isLowStock ? (
                    <span className="stock-badge stock-badge--low"><AlertIcon /> Solo quedan {stock} unidades</span>
                  ) : (
                    <span className="stock-badge stock-badge--available"><CheckIcon /> {stock} disponibles</span>
                  )}
                </div>

                {/* Info extra */}
                {(product.peso || product.unidad_medida) && (
                  <div className="modal__extra-info">
                    {product.peso && <p><WeightIcon /> <strong>Peso:</strong> {product.peso}g</p>}
                    {product.unidad_medida && <p><PackageIcon /> <strong>Unidad:</strong> {product.unidad_medida}</p>}
                  </div>
                )}

                {/* Acciones */}
                <div className="modal__actions">
                  <button
                    className="btn btn--large btn--primary"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || maxAvailable <= 0}
                  >
                    <CartIcon />
                    <span>{isOutOfStock ? 'No disponible' : inCart ? `En carrito (${cartQuantity})` : 'Agregar al carrito'}</span>
                  </button>
                  <button className="btn btn--large btn--whatsapp" onClick={handleWhatsApp}>
                    <WhatsAppIcon />
                    <span>Consultar por WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );  
});

ProductCard.displayName = 'ProductCard';

// === GRID ===
export const ProductsGrid = memo(({ products, title, subtitle }) => {
  return (
    <section className="products-section">
      <div className="container">
        {(title || subtitle) && (
          <div className="section-header">
            {title && <h2 className="section-title">{title}</h2>}
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
        )}
        <div className="products-grid-three">
          {products.map(product => (
            <ProductCard key={product.producto_id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
});

ProductsGrid.displayName = 'ProductsGrid';

export default ProductCard;