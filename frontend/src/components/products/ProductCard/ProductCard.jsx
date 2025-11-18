import React, { useState, useCallback, memo, useMemo } from 'react';
import { useCart } from '../../../contexts/CartContext';
import whatsappService from '../../../services/whatsappService';
import './ProductCard.css';

// ============================================
// ICONOS SVG MEJORADOS
// ============================================

const CartIcon = ({ className = "" }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/>
    <circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

const CartCheckIcon = ({ className = "" }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    {/* Carrito (más delgado) */}
    <g strokeWidth="2" opacity="0.7">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </g>
    {/* Check EXTRA grande y prominente */}
    <polyline 
      points="10 10 13.5 13.5 20 7" 
      strokeWidth="3.5" 
      stroke="currentColor"
      transform="scale(1.5) translate(-5.5 -3)"
    />
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

// ============================================
// COMPONENTE PRINCIPAL MEJORADO
// ============================================

const ProductCard = memo(({ product }) => {
  const { addToCart, isInCart, getProductQuantity, updateQuantity } = useCart();
  const [showDetails, setShowDetails] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  if (!product?.producto_id) return null;

  // ✅ Cálculos memoizados para mejor performance
  const prices = useMemo(() => {
    const precio = parseFloat(product.precio) || 0;
    const precioDescuento = product.precio_descuento ? parseFloat(product.precio_descuento) : null;
    const hasDiscount = precioDescuento && precioDescuento < precio;
    const discountPercent = hasDiscount ? Math.round(((precio - precioDescuento) / precio) * 100) : 0;
    const finalPrice = hasDiscount ? precioDescuento : precio;

    return { precio, precioDescuento, hasDiscount, discountPercent, finalPrice };
  }, [product.precio, product.precio_descuento]);

  const stockInfo = useMemo(() => {
    const stock = product.stock || 0;
    const isOutOfStock = stock === 0;
    const isLowStock = stock > 0 && stock < 10;
    const cartQuantity = getProductQuantity(product.producto_id);
    const inCart = isInCart(product.producto_id);
    const maxAvailable = Math.max(0, Math.min(stock - cartQuantity, 99));

    return { stock, isOutOfStock, isLowStock, cartQuantity, inCart, maxAvailable };
  }, [product.stock, product.producto_id, getProductQuantity, isInCart]);

  // ✅ Handler mejorado con feedback visual
  const handleAddToCart = useCallback(async (e) => {
    e?.stopPropagation();
    
    if (stockInfo.isOutOfStock || quantity < 1 || isAdding) return;

    const qtyToAdd = Math.min(quantity, stockInfo.maxAvailable);
    if (qtyToAdd <= 0) return;

    setIsAdding(true);

    try {
      const success = addToCart(product, qtyToAdd);
      if (success) {
        // Feedback visual exitoso
        setQuantity(1);
        
        // Auto-cerrar modal si está abierto
        if (showDetails) {
          setTimeout(() => {
            // El modal permanece abierto para seguir comprando
          }, 300);
        }
      }
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
    } finally {
      // Delay para mostrar animación
      setTimeout(() => {
        setIsAdding(false);
      }, 600);
    }
  }, [product, quantity, stockInfo.isOutOfStock, stockInfo.maxAvailable, addToCart, isAdding, showDetails]);

  // ✅ Control de cantidad con validación
  const handleQuantityChange = useCallback((e) => {
    const val = parseInt(e.target.value) || 1;
    const newQty = Math.max(1, Math.min(val, stockInfo.maxAvailable));
    setQuantity(newQty);
  }, [stockInfo.maxAvailable]);

  const handleIncrement = useCallback(() => {
    setQuantity(q => {
      const newQty = q + 1;
      return newQty <= stockInfo.maxAvailable ? newQty : q;
    });
  }, [stockInfo.maxAvailable]);

  const handleDecrement = useCallback(() => {
    setQuantity(q => Math.max(1, q - 1));
  }, []);

  // ✅ Modal handlers
  const openModal = useCallback(() => {
    setShowDetails(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setShowDetails(false);
    document.body.style.overflow = 'unset';
  }, []);

  const handleWhatsApp = useCallback((e) => {
    e.stopPropagation();
    whatsappService.consultProduct({ 
      ...product, 
      precio: prices.precio, 
      precio_descuento: prices.precioDescuento 
    });
  }, [product, prices]);

  const formatPrice = useCallback((price) => {
    return `S/. ${(parseFloat(price) || 0).toFixed(2)}`;
  }, []);

  const imageUrl = imageError ? '/awaiting-image.jpeg' : (product.url_imagen || '/awaiting-image.jpeg');

  // ✅ Clases dinámicas para el botón de agregar
  const addButtonClasses = `btn btn--primary ${
    stockInfo.inCart ? 'btn--in-cart' : ''
  } ${isAdding ? 'btn--adding' : ''}`;

  return (
    <>
      {/* ============================================ */}
      {/* TARJETA DE PRODUCTO */}
      {/* ============================================ */}
      <article className="product-card">
        {/* Badges superiores */}
        {(prices.hasDiscount || stockInfo.isOutOfStock || product.destacado) && (
          <div className="product-card__badges">
            {product.destacado && !stockInfo.isOutOfStock && (
              <span className="badge badge--featured">
                <StarIcon /> Destacado
              </span>
            )}
            {prices.hasDiscount && !stockInfo.isOutOfStock && (
              <span className="badge badge--discount">
                <TagIcon /> -{prices.discountPercent}%
              </span>
            )}
            {stockInfo.isOutOfStock && (
              <span className="badge badge--out">Agotado</span>
            )}
          </div>
        )}

        {/* Imagen con overlay de carrito */}
        <div className="product-card__image" onClick={openModal}>
          <img 
            src={imageUrl} 
            alt={product.nombre} 
            loading="lazy" 
            onError={() => setImageError(true)} 
          />
          
        </div>

        {/* Contenido */}
        <div className="product-card__content">
          {product.categoria?.nombre && (
            <p className="product-card__category">{product.categoria.nombre}</p>
          )}
          
          <h3 className="product-card__title" title={product.nombre}>
            {product.nombre}
          </h3>

          {/* Precio */}
          <div className="product-card__price">
            {prices.hasDiscount ? (
              <>
                <span className="price price--old">{formatPrice(prices.precio)}</span>
                <span className="price price--current price--discount">
                  {formatPrice(prices.precioDescuento)}
                </span>
              </>
            ) : (
              <span className="price price--current">{formatPrice(prices.precio)}</span>
            )}
          </div>

          {/* Stock status */}
          <div className="product-card__stock">
            {stockInfo.isOutOfStock ? (
              <span className="stock-status stock-status--out">
                <AlertIcon /> Agotado
              </span>
            ) : stockInfo.isLowStock ? (
              <span className="stock-status stock-status--low">
                <AlertIcon /> Solo {stockInfo.stock} unidades
              </span>
            ) : (
              <span className="stock-status stock-status--available">
                <CheckIcon /> Disponible
              </span>
            )}
          </div>

          {/* Selector de cantidad */}
          {!stockInfo.isOutOfStock && !stockInfo.inCart && (
            <div className="product-card__quantity">
              <button 
                onClick={handleDecrement} 
                disabled={quantity <= 1} 
                className="qty-btn"
                aria-label="Disminuir cantidad"
              >
                <MinusIcon />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={stockInfo.maxAvailable}
                className="qty-input"
                aria-label="Cantidad"
              />
              <button 
                onClick={handleIncrement} 
                disabled={quantity >= stockInfo.maxAvailable} 
                className="qty-btn"
                aria-label="Aumentar cantidad"
              >
                <PlusIcon />
              </button>
            </div>
          )}

          {/* Acciones */}
          <div className="product-card__actions">
            <button
              className={addButtonClasses}
              onClick={handleAddToCart}
              disabled={stockInfo.isOutOfStock || stockInfo.maxAvailable <= 0 || stockInfo.inCart || isAdding}
              aria-label={stockInfo.inCart ? 'Producto en carrito' : 'Agregar al carrito'}
            >
              {stockInfo.inCart ? (
                <>
                  <CartCheckIcon className="icon-animated" />
                </>
              ) : isAdding ? (
                <>
                  <CartIcon className="icon-spin" />
                </>
              ) : (
                <>
                  <CartIcon className="w-4 h-4 inline-block" />
                </>
              )}
            </button>
            
            <button 
              className="btn btn--secondary" 
              onClick={openModal}
              aria-label="Ver detalles"
            >
              <EyeIcon />
            </button>
          </div>
        </div>
      </article>

      {/* ============================================ */}
      {/* MODAL DE DETALLES */}
      {/* ============================================ */}
      {showDetails && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal__close" onClick={closeModal} aria-label="Cerrar">
              <CloseIcon />
            </button>

            <div className="modal__content">
              {/* Imagen grande */}
              <div className="modal__image">
                <img src={imageUrl} alt={product.nombre} onError={() => setImageError(true)} />
                {product.destacado && (
                  <div className="modal__image-badge">
                    <StarIcon /> Destacado
                  </div>
                )}
                {stockInfo.inCart && (
                  <div className="modal__image-in-cart">
                    <CartCheckIcon />
                    <span>{stockInfo.cartQuantity} en tu carrito</span>
                  </div>
                )}
              </div>

              {/* Información */}
              <div className="modal__info">
                {product.categoria?.nombre && (
                  <span className="modal__category">{product.categoria.nombre}</span>
                )}
                
                <h2 className="modal__title">{product.nombre}</h2>
                
                {product.descripcion && (
                  <p className="modal__description">{product.descripcion}</p>
                )}

                {/* Precio detallado */}
                <div className="modal__price-box">
                  {prices.hasDiscount ? (
                    <>
                      <div className="price-detail">
                        <span className="price-detail__label">Precio regular:</span>
                        <span className="price-detail__value price-detail__value--old">
                          {formatPrice(prices.precio)}
                        </span>
                      </div>
                      <div className="price-detail price-detail--main">
                        <span className="price-detail__label">
                          <SavingsIcon /> Precio oferta:
                        </span>
                        <span className="price-detail__value price-detail__value--discount">
                          {formatPrice(prices.precioDescuento)}
                        </span>
                      </div>
                      <div className="price-detail__savings">
                        🎉 Ahorras {formatPrice(prices.precio - prices.precioDescuento)}
                      </div>
                    </>
                  ) : (
                    <div className="price-detail price-detail--main">
                      <span className="price-detail__label">Precio:</span>
                      <span className="price-detail__value">
                        {formatPrice(prices.precio)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stock */}
                <div className="modal__stock">
                  {stockInfo.isOutOfStock ? (
                    <span className="stock-badge stock-badge--out">
                      <AlertIcon /> Agotado
                    </span>
                  ) : stockInfo.isLowStock ? (
                    <span className="stock-badge stock-badge--low">
                      <AlertIcon /> Solo quedan {stockInfo.stock} unidades
                    </span>
                  ) : (
                    <span className="stock-badge stock-badge--available">
                      <CheckIcon /> {stockInfo.stock} disponibles
                    </span>
                  )}
                </div>

                {/* Info extra */}
                {(product.peso || product.unidad_medida) && (
                  <div className="modal__extra-info">
                    {product.peso && (
                      <p>
                        <WeightIcon /> <strong>Peso:</strong> {product.peso}g
                      </p>
                    )}
                    {product.unidad_medida && (
                      <p>
                        <PackageIcon /> <strong>Unidad:</strong> {product.unidad_medida}
                      </p>
                    )}
                  </div>
                )}

                {/* Selector de cantidad en modal */}
                {!stockInfo.isOutOfStock && !stockInfo.inCart && (
                  <div className="modal__quantity-selector">
                    <label htmlFor="modal-quantity">Cantidad:</label>
                    <div className="quantity-controls">
                      <button 
                        onClick={handleDecrement} 
                        disabled={quantity <= 1} 
                        className="qty-btn"
                      >
                        <MinusIcon />
                      </button>
                      <input
                        id="modal-quantity"
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        min="1"
                        max={stockInfo.maxAvailable}
                        className="qty-input qty-input--large"
                      />
                      <button 
                        onClick={handleIncrement} 
                        disabled={quantity >= stockInfo.maxAvailable} 
                        className="qty-btn"
                      >
                        <PlusIcon />
                      </button>
                    </div>
                    <span className="quantity-hint">
                      Máximo disponible: {stockInfo.maxAvailable}
                    </span>
                  </div>
                )}

                {/* Acciones del modal */}
                <div className="modal__actions">
                  <button
                    className={`btn btn--large ${addButtonClasses}`}
                    onClick={handleAddToCart}
                    disabled={stockInfo.isOutOfStock || stockInfo.maxAvailable <= 0 || stockInfo.inCart || isAdding}
                  >
                    {stockInfo.inCart ? (
                      <>
                        <CartCheckIcon className="icon-animated" />
                        <span>Ya está en tu carrito ({stockInfo.cartQuantity})</span>
                      </>
                    ) : isAdding ? (
                      <>
                        <CartIcon className="icon-spin" />
                        <span>Agregando...</span>
                      </>
                    ) : stockInfo.isOutOfStock ? (
                      <>
                        <AlertIcon />
                        <span>No disponible</span>
                      </>
                    ) : (
                      <>
                        <CartIcon />
                        <span>Agregar al carrito</span>
                      </>
                    )}
                  </button>
                  
                  <button 
                    className="btn btn--large btn--whatsapp" 
                    onClick={handleWhatsApp}
                  >
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

// ============================================
// GRID DE PRODUCTOS
// ============================================

export const ProductsGrid = memo(({ products, title, subtitle }) => {
  if (!products || products.length === 0) {
    return (
      <section className="products-section">
        <div className="container">
          <div className="products-empty">
            <p>No hay productos disponibles</p>
          </div>
        </div>
      </section>
    );
  }

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