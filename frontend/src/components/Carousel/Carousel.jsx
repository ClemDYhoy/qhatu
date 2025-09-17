import React, { useState, useEffect } from 'react';
import Button from '../ui/Button/Button';
import './Carousel.css';

function Carousel({ slides }) {
const [currentSlide, setCurrentSlide] = useState(0);

useEffect(() => {
    const interval = setInterval(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
}, [slides.length]);

const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
};

const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
};

if (!slides || slides.length === 0) {
    return <p>No hay promociones disponibles</p>;
}

return (
    <div className="carousel">
    <Button className="carousel-button prev" onClick={prevSlide}>←</Button>
    <div className="carousel-slide">
        <img src={slides[currentSlide].imagen_url} alt={slides[currentSlide].titulo} />
        <div className="carousel-caption">
        <h3>{slides[currentSlide].titulo}</h3>
        <p>{slides[currentSlide].descripcion}</p>
        {slides[currentSlide].descuento_porcentaje && (
            <p>Descuento: {slides[currentSlide].descuento_porcentaje}%</p>
        )}
        </div>
    </div>
    <Button className="carousel-button next" onClick={nextSlide}>→</Button>
    </div>
);
}

export default Carousel;