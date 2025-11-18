import React, { useState, useEffect, useCallback } from 'react';
import { getActiveDiscountBanners, registerBannerInteraction } from '../../services/api';
import './DiscountBanner.css';

const DiscountBanner = ({ onCategorySelect }) => {
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const registerInteraction = useCallback(async (bannerId, type) => {
    try {
      await registerBannerInteraction(bannerId, type);
    } catch (error) {
      console.error('Error al registrar interacción:', error);
    }
  }, []);

  const loadBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getActiveDiscountBanners();
      
      if (response.success && response.data?.length > 0) {
        setBanners(response.data);
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

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const handleBannerClick = useCallback((banner) => {
    registerInteraction(banner.banner_id, 'click');
    if (onCategorySelect) {
      onCategorySelect(banner.categoria_id);
    }
  }, [registerInteraction, onCategorySelect]);

  const goToSlide = useCallback((index) => {
    setCurrentBanner(index);
    if (banners[index]?.banner_id) {
      registerInteraction(banners[index].banner_id, 'vista');
    }
  }, [banners, registerInteraction]);

  if (loading) {
    return (
      <div className="discount-section">
        <div className="discount-hero">
          <div className="hero-content">
            <div className="skeleton-badge"></div>
            <div className="skeleton-title"></div>
            <div className="skeleton-subtitle"></div>
          </div>
          <div className="hero-stats-grid">
            <div className="stat-skeleton"></div>
            <div className="stat-skeleton"></div>
            <div className="stat-skeleton"></div>
            <div className="stat-skeleton"></div>
          </div>
        </div>
        <div className="features-grid">
          <div className="feature-skeleton"></div>
          <div className="feature-skeleton"></div>
          <div className="feature-skeleton"></div>
        </div>
        <div className="discount-banner-skeleton">
          <div className="skeleton-content"></div>
        </div>
      </div>
    );
  }

  if (error || banners.length === 0) {
    return null;
  }

  const banner = banners[currentBanner];

  return (
    <div className="discount-section">
      {/* Features Grid */}
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h3 className="feature-title">Compra Segura</h3>
          <p className="feature-description">Protección garantizada en todas tus transacciones</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <h3 className="feature-title">Envío Rápido</h3>
          <p className="feature-description">Entregas en 24-48 horas en productos seleccionados</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3 className="feature-title">Soporte 24/7</h3>
          <p className="feature-description">Atención al cliente siempre disponible para ti</p>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="trust-bar">
        <div className="trust-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
          <span>Ofertas verificadas</span>
        </div>
        <div className="trust-divider"></div>
        <div className="trust-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>Pago seguro</span>
        </div>
        <div className="trust-divider"></div>
        <div className="trust-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Miles de usuarios</span>
        </div>
        <div className="trust-divider"></div>
        <div className="trust-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>Garantía de satisfacción</span>
        </div>
      </div>

      {/* Banner Principal */}
      <div className="banner-content">
        <div className="banner-header">
          <div className="banner-tag">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
            <span>OFERTA ESPECIAL</span>
          </div>

          {banner.dias_restantes != null && banner.dias_restantes <= 3 && (
            <div className="banner-urgency">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>Últimas horas</span>
            </div>
          )}
        </div>

        <h2 className="banner-title">{banner.titulo}</h2>
        
        {banner.descripcion && (
          <p className="banner-description">{banner.descripcion}</p>
        )}

        <div className="banner-discount">
          <div className="discount-badge">
            <div className="discount-main">
              <span className="discount-percentage">
                {parseFloat(banner.porcentaje_descuento).toFixed(0)}%
              </span>
              <span className="discount-label">OFF</span>
            </div>
            <div className="discount-save">
              Ahorra hasta ${(parseFloat(banner.porcentaje_descuento) * 10).toFixed(0)}
            </div>
          </div>
          
          <div className="banner-category-box">
            <div className="category-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
            </div>
            <div className="category-info">
              <span className="category-label">Categoría en oferta</span>
              <span className="category-name">{banner.categoria_nombre}</span>
            </div>
          </div>
        </div>

        {banner.dias_restantes != null && (
          <div className="banner-countdown-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="countdown-text">
              {banner.dias_restantes > 1 
                ? `Termina en ${banner.dias_restantes} días` 
                : banner.dias_restantes === 1
                ? 'Último día disponible'
                : 'Termina hoy a las 23:59'}
            </span>
            <div className="countdown-pulse"></div>
          </div>
        )}

        <div className="banner-actions">
          
          
          <button className="banner-cta banner-cta-secondary" onClick={(e) => {
            e.stopPropagation();
            alert('Notificación activada');
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span>Notificarme</span>
          </button>
        </div>

        <div className="banner-benefits">
          <div className="benefit-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>Envío gratis</span>
          </div>
          <div className="benefit-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>Devolución 30 días</span>
          </div>
          <div className="benefit-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>Stock limitado</span>
          </div>
        </div>
      </div>

      {banners.length > 1 && (
        <>
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

          <button
            className="banner-nav banner-nav-prev"
            onClick={(e) => {
              e.stopPropagation();
              goToSlide((currentBanner - 1 + banners.length) % banners.length);
            }}
            aria-label="Banner anterior"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </>
      )}


      {/* Social Proof */}
      <div className="social-proof">
        <div className="proof-avatars">
          <div className="avatar"></div>
          <div className="avatar"></div>
          <div className="avatar"></div>
          <div className="avatar"></div>
          <div className="avatar-more">+{Math.floor(Math.random() * 900) + 100}</div>
        </div>
        <div className="proof-text">
          <strong>{Math.floor(Math.random() * 50) + 20} personas</strong> están viendo estas ofertas ahora
        </div>
        
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