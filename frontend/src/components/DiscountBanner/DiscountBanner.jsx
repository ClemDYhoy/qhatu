import React, { useState, useEffect, useCallback } from 'react';
import { getActiveDiscountBanners, registerBannerInteraction } from '../../services/api';
import './DiscountBanner.css';

const DiscountBanner = ({ onCategorySelect }) => {
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Registrar interacción (memoizada, sin dependencias)
  const registerInteraction = useCallback(async (bannerId, type) => {
    try {
      await registerBannerInteraction(bannerId, type);
    } catch (error) {
      console.error('Error al registrar interacción:', error);
    }
  }, []);

  // ✅ Cargar banners (memoizada correctamente)
  const loadBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getActiveDiscountBanners();
      
      if (response.success && response.data?.length > 0) {
        setBanners(response.data);
        // Registrar vista del primer banner
        if (response.data[0]?.banner_id) {
          await registerInteraction(response.data[0].banner_id, 'vista');
        }
      } else {
        setBanners([]);
      }
    } catch (err) {
      console.error('Error al cargar banners:', err);
      setError(err.message);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, [registerInteraction]);

  // ✅ Cargar banners al montar (solo una vez)
  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  // ✅ Auto-rotación (optimizada)
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // ✅ Handler de click (memoizado)
  const handleBannerClick = useCallback((banner) => {
    registerInteraction(banner.banner_id, 'click');
    if (onCategorySelect) {
      onCategorySelect(banner.categoria_id);
    }
  }, [registerInteraction, onCategorySelect]);

  // ✅ Navegación manual (memoizada)
  const goToSlide = useCallback((index) => {
    setCurrentBanner(index);
    if (banners[index]?.banner_id) {
      registerInteraction(banners[index].banner_id, 'vista');
    }
  }, [banners, registerInteraction]);

  if (loading) {
    return (
      <div className="discount-banner-skeleton">
        <div className="skeleton-content"></div>
      </div>
    );
  }

  if (error || banners.length === 0) {
    return null;
  }

  const banner = banners[currentBanner];

  return (
    <div className="discount-banner-wrapper">
      <div 
        className="discount-banner"
        style={{
          backgroundImage: banner.url_imagen_fondo 
            ? `url(${banner.url_imagen_fondo})` 
            : `linear-gradient(135deg, ${banner.color_fondo} 0%, ${adjustColor(banner.color_fondo, -20)} 100%)`,
          color: banner.color_texto
        }}
        onClick={() => handleBannerClick(banner)}
      >
        <div className="banner-overlay"></div>

        <div className="banner-content">
          <div className="banner-tag">
            <span className="tag-icon">🎉</span>
            <span>OFERTA ESPECIAL</span>
          </div>

          <h2 className="banner-title">{banner.titulo}</h2>
          
          {banner.descripcion && (
            <p className="banner-description">{banner.descripcion}</p>
          )}

          <div className="banner-discount">
            <div className="discount-badge">
              <span className="discount-percentage">
                {parseFloat(banner.porcentaje_descuento).toFixed(0)}%
              </span>
              <span className="discount-label">OFF</span>
            </div>
            
            <div className="banner-category">
              <span className="category-label">En categoría:</span>
              <span className="category-name">{banner.categoria_nombre}</span>
            </div>
          </div>

          {banner.dias_restantes != null && (
            <div className="banner-countdown">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>
                {banner.dias_restantes > 1 
                  ? `${banner.dias_restantes} días restantes` 
                  : banner.dias_restantes === 1
                  ? '¡Último día!'
                  : '¡Termina hoy!'}
              </span>
            </div>
          )}

          <button className="banner-cta">
            Ver productos en oferta
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>

        {banners.length > 1 && (
          <div className="banner-indicators">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentBanner ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(index);
                }}
                aria-label={`Ir a banner ${index + 1}`}
              />
            ))}
          </div>
        )}

        {banners.length > 1 && (
          <>
            <button
              className="banner-nav banner-nav-prev"
              onClick={(e) => {
                e.stopPropagation();
                goToSlide((currentBanner - 1 + banners.length) % banners.length);
              }}
              aria-label="Banner anterior"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              className="banner-nav banner-nav-next"
              onClick={(e) => {
                e.stopPropagation();
                goToSlide((currentBanner + 1) % banners.length);
              }}
              aria-label="Siguiente banner"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const adjustColor = (color, amount) => {
  try {
    const clamp = val => Math.min(Math.max(val, 0), 255);
    const num = parseInt(color.replace('#', ''), 16);
    const r = clamp((num >> 16) + amount);
    const g = clamp(((num >> 8) & 0x00FF) + amount);
    const b = clamp((num & 0x0000FF) + amount);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  } catch {
    return color;
  }
};

export default DiscountBanner;