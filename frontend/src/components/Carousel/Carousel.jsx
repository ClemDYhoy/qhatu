import React, { useState, useEffect, useCallback } from 'react';
import './Carousel.css';

const Carousel = ({ items = [], autoPlayInterval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = useCallback(() => {
    if (isTransitioning || items.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [items.length, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning || items.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [items.length, isTransitioning]);

  const goToSlide = useCallback((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning]);

  useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return;
    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, autoPlayInterval, items.length]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div 
      className="carousel"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="carousel-container">
        {items.map((item, index) => (
          <div
            key={item.carrusel_id || index}
            className={`carousel-slide ${index === currentIndex ? 'active' : ''} ${
              index === (currentIndex - 1 + items.length) % items.length ? 'prev' : ''
            } ${
              index === (currentIndex + 1) % items.length ? 'next' : ''
            }`}
          >
            <img
              src={item.url_imagen}
              alt={item.titulo || `Slide ${index + 1}`}
              onError={(e) => e.target.src = '/placeholder.png'}
            />
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <button
            className="carousel-control prev"
            onClick={prevSlide}
            disabled={isTransitioning}
            aria-label="Slide anterior"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
          
          <button
            className="carousel-control next"
            onClick={nextSlide}
            disabled={isTransitioning}
            aria-label="Slide siguiente"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>

          <div className="carousel-indicators">
            {items.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                aria-label={`Ir a slide ${index + 1}`}
              />
            ))}
          </div>

          {isAutoPlaying && (
            <div className="carousel-progress">
              <div 
                className="carousel-progress-bar"
                style={{ 
                  animation: `progressBar ${autoPlayInterval}ms linear`
                }}
                key={currentIndex}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Carousel;