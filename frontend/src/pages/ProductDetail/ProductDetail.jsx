import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import whatsappService from '../../services/whatsappService';
import './ProductDetail.css';

// ============================================
// ICONOS SVG
// ============================================
const IconCart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const IconWhatsApp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41A11.82 11.82 0 0 0 12.05 0zm0 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.08-.12-.28-.2-.57-.35z" />
  </svg>
);
const IconMinus = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const IconPlus = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
const IconCheck = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);
const IconAlert = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16.5" x2="12.01" y2="16.5"/></svg>);
const IconZoom = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>);
const IconChevron = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>);
const IconStar = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>);
const IconTruck = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>);
const IconShield = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3z"/><path d="M9 12l2 2 4-4"/></svg>);
const IconBox = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>);

const formatPrice = (value) => `S/. ${(parseFloat(value) || 0).toFixed(2)}`;

// Factor de aumento del zoom estilo Amazon
const ZOOM_FACTOR = 2.5;

const saveToRecentlyViewed = (product) => {
  try {
    let viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    viewed = viewed.filter((p) => p.producto_id !== product.producto_id);
    viewed.unshift(product);
    localStorage.setItem('recentlyViewed', JSON.stringify(viewed.slice(0, 10)));
  } catch (err) {
    console.error('Error al guardar en historial:', err);
  }
};

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, isInCart, getProductQuantity } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const mainImageRef = useRef(null);
  const lensRef = useRef(null);
  const resultRef = useRef(null);
  const [zoomActive, setZoomActive] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setProduct(null);
    setImageError(false);
    setQuantity(1);

    getProductById(id)
      .then((response) => {
        if (!active) return;
        const data = response?.data;
        if (!data) {
          setError('Producto no encontrado');
        } else {
          setProduct(data);
          saveToRecentlyViewed(data);
        }
      })
      .catch(() => {
        if (active) setError('Producto no encontrado');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [id]);

  const prices = useMemo(() => {
    if (!product) return { precio: 0, precioDescuento: null, hasDiscount: false, discountPercent: 0, finalPrice: 0 };
    const precio = parseFloat(product.precio) || 0;
    const precioDescuento = product.precio_descuento ? parseFloat(product.precio_descuento) : null;
    const hasDiscount = !!precioDescuento && precioDescuento < precio;
    const discountPercent = hasDiscount ? Math.round(((precio - precioDescuento) / precio) * 100) : 0;
    const finalPrice = hasDiscount ? precioDescuento : precio;
    return { precio, precioDescuento, hasDiscount, discountPercent, finalPrice };
  }, [product]);

  const stockInfo = useMemo(() => {
    if (!product) return { stock: 0, isOut: true, isLow: false, maxAvailable: 0, inCart: false, cartQuantity: 0 };
    const stock = product.stock || 0;
    const cartQuantity = getProductQuantity(product.producto_id);
    const inCart = isInCart(product.producto_id);
    const maxAvailable = Math.max(0, Math.min(stock - cartQuantity, 99));
    return {
      stock,
      isOut: stock === 0,
      isLow: stock > 0 && stock < 10,
      maxAvailable,
      inCart,
      cartQuantity
    };
  }, [product, getProductQuantity, isInCart]);

  const imageUrl = imageError || !product?.url_imagen ? '/awaiting-image.jpeg' : product.url_imagen;

  const handleIncrement = useCallback(() => {
    setQuantity((q) => (q < stockInfo.maxAvailable ? q + 1 : q));
  }, [stockInfo.maxAvailable]);

  const handleDecrement = useCallback(() => {
    setQuantity((q) => Math.max(1, q - 1));
  }, []);

  const handleQuantityChange = useCallback((e) => {
    const val = parseInt(e.target.value, 10) || 1;
    setQuantity(Math.max(1, Math.min(val, stockInfo.maxAvailable || 1)));
  }, [stockInfo.maxAvailable]);

  const handleAddToCart = useCallback(async () => {
    if (!product || stockInfo.isOut || stockInfo.maxAvailable <= 0 || isAdding) return;
    setIsAdding(true);
    try {
      const result = await addToCart(product.producto_id, Math.min(quantity, stockInfo.maxAvailable));
      if (result?.success !== false) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    } catch (err) {
      console.error('Error al agregar al carrito:', err);
    } finally {
      setIsAdding(false);
    }
  }, [product, quantity, stockInfo, addToCart, isAdding]);

  const handleWhatsApp = useCallback(() => {
    if (!product) return;
    whatsappService.consultProduct({ ...product, precio: prices.precio, precio_descuento: prices.precioDescuento });
  }, [product, prices]);

  // Zoom estilo Amazon: lente que sigue el cursor + panel con la zona ampliada
  const handleZoomEnter = useCallback(() => setZoomActive(true), []);

  const handleZoomMove = useCallback((e) => {
    const main = mainImageRef.current;
    const lens = lensRef.current;
    const result = resultRef.current;
    if (!main || !lens || !result) return;

    const rect = main.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    if (!W || !H) return;

    const lensW = W / ZOOM_FACTOR;
    const lensH = H / ZOOM_FACTOR;

    let x = e.clientX - rect.left - lensW / 2;
    let y = e.clientY - rect.top - lensH / 2;
    x = Math.max(0, Math.min(x, W - lensW));
    y = Math.max(0, Math.min(y, H - lensH));

    lens.style.width = `${lensW}px`;
    lens.style.height = `${lensH}px`;
    lens.style.left = `${x}px`;
    lens.style.top = `${y}px`;

    result.style.backgroundSize = `${W * ZOOM_FACTOR}px ${H * ZOOM_FACTOR}px`;
    result.style.backgroundPosition = `${-x * ZOOM_FACTOR}px ${-y * ZOOM_FACTOR}px`;
  }, []);

  const handleZoomLeave = useCallback(() => setZoomActive(false), []);

  if (loading) {
    return (
      <div className="pd-state">
        <div className="pd-spinner" />
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-state pd-state--error">
        <div className="pd-state__icon"><IconAlert /></div>
        <h2>Producto no encontrado</h2>
        <p>El producto que buscas no existe o ya no está disponible.</p>
        <Link to="/products" className="pd-btn pd-btn--primary">Volver al catálogo</Link>
      </div>
    );
  }

  return (
    <div className="pd-page">
      <div className="pd-container">
        <nav className="pd-breadcrumb" aria-label="Ruta de navegación">
          <Link to="/">Inicio</Link>
          <IconChevron />
          <Link to="/products">Productos</Link>
          {product.categoria?.nombre && (
            <>
              <IconChevron />
              <Link to={`/products?categoria_id=${product.categoria_id}`}>{product.categoria.nombre}</Link>
            </>
          )}
          <IconChevron />
          <span aria-current="page">{product.nombre}</span>
        </nav>

        <div className="pd-layout">
          {/* GALERÍA */}
          <div className="pd-gallery">
            <div className="pd-gallery__stage">
            <div
              className={`pd-gallery__main ${zoomActive ? 'is-zoom-active' : ''}`}
              ref={mainImageRef}
              onMouseEnter={handleZoomEnter}
              onMouseMove={handleZoomMove}
              onMouseLeave={handleZoomLeave}
              aria-label="Imagen del producto"
            >
              <img
                src={imageUrl}
                alt={product.nombre}
                onError={() => setImageError(true)}
              />
              <span className="pd-zoom-lens" ref={lensRef} aria-hidden="true" />
              {!zoomActive && (
                <span className="pd-gallery__hint">
                  <IconZoom /> Pasa el cursor para ampliar
                </span>
              )}
            </div>
            <div
              className="pd-zoom-result"
              ref={resultRef}
              style={{ display: zoomActive ? 'block' : 'none', backgroundImage: `url(${imageUrl})` }}
              aria-hidden="true"
            />
            </div>
          </div>

          {/* INFO */}
          <div className="pd-info">
            {product.categoria?.nombre && (
              <span className="pd-category">{product.categoria.nombre}</span>
            )}

            <h1 className="pd-title">{product.nombre}</h1>

            <div className="pd-rating">
              <span className="pd-rating__stars">
                <IconStar /><IconStar /><IconStar /><IconStar /><IconStar />
              </span>
              <span className="pd-rating__text">
                4.8 · {product.ventas > 0 ? `${product.ventas} vendidos` : 'Nuevo'}
              </span>
            </div>

            <div className="pd-price">
              <span className="pd-price__current">{formatPrice(prices.finalPrice)}</span>
              {prices.hasDiscount && (
                <>
                  <span className="pd-price__old">{formatPrice(prices.precio)}</span>
                  <span className="pd-price__badge">-{prices.discountPercent}%</span>
                </>
              )}
            </div>
            {prices.hasDiscount && (
              <p className="pd-price__savings">
                Ahorras {formatPrice(prices.precio - prices.precioDescuento)}
              </p>
            )}

            <div className="pd-stock">
              {stockInfo.isOut ? (
                <span className="pd-stock__badge pd-stock__badge--out"><IconAlert /> Agotado</span>
              ) : stockInfo.isLow ? (
                <span className="pd-stock__badge pd-stock__badge--low"><IconAlert /> Últimas {stockInfo.stock} unidades</span>
              ) : (
                <span className="pd-stock__badge pd-stock__badge--available"><IconCheck /> Disponible ({stockInfo.stock} en stock)</span>
              )}
              {stockInfo.inCart && (
                <span className="pd-stock__cart">Ya tienes {stockInfo.cartQuantity} en el carrito</span>
              )}
            </div>

            {product.descripcion && (
              <div className="pd-description">
                <h2>Descripción</h2>
                <p>{product.descripcion}</p>
              </div>
            )}

            {(product.peso || product.unidad_medida) && (
              <ul className="pd-meta">
                {product.peso && <li><IconBox /><span><strong>Peso:</strong> {product.peso} g</span></li>}
                {product.unidad_medida && <li><IconBox /><span><strong>Unidad:</strong> {product.unidad_medida}</span></li>}
              </ul>
            )}

            {!stockInfo.isOut && stockInfo.maxAvailable > 0 && !stockInfo.inCart && (
              <div className="pd-quantity">
                <span className="pd-quantity__label">Cantidad</span>
                <div className="pd-quantity__controls">
                  <button onClick={handleDecrement} disabled={quantity <= 1} aria-label="Disminuir cantidad"><IconMinus /></button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    max={stockInfo.maxAvailable}
                    aria-label="Cantidad"
                  />
                  <button onClick={handleIncrement} disabled={quantity >= stockInfo.maxAvailable} aria-label="Aumentar cantidad"><IconPlus /></button>
                </div>
                <span className="pd-quantity__hint">Máximo {stockInfo.maxAvailable}</span>
              </div>
            )}

            <div className="pd-actions">
              <button
                className={`pd-btn pd-btn--primary ${added ? 'is-added' : ''}`}
                onClick={handleAddToCart}
                disabled={stockInfo.isOut || stockInfo.maxAvailable <= 0 || isAdding}
              >
                {added ? (<><IconCheck /> Agregado</>) : (<><IconCart /> {stockInfo.isOut ? 'No disponible' : 'Agregar al carrito'}</>)}
              </button>
              <button className="pd-btn pd-btn--whatsapp" onClick={handleWhatsApp}>
                <IconWhatsApp /> Consultar por WhatsApp
              </button>
            </div>

            <ul className="pd-benefits">
              <li><IconTruck /> Envío gratis en compras desde S/. 50</li>
              <li><IconShield /> Productos 100% originales</li>
              <li><IconBox /> Empaque cuidado y seguro</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductDetail;
