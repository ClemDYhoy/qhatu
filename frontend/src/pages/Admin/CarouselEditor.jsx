import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCarousel, createCarouselSlide, updateCarouselSlide, deleteCarouselSlide } from '../../api';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import '../../styles/global.css';
import './CarouselEditor.css';

function CarouselEditor() {
const [slides, setSlides] = useState([]);
const [newSlide, setNewSlide] = useState({
    id_producto: '',
    imagen_url: '',
    titulo: '',
    descripcion: '',
    descuento_porcentaje: '',
    fecha_inicio: '',
    fecha_fin: '',
    prioridad: 0,
});
const navigate = useNavigate();

useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.rol !== 'admin') {
    navigate('/login');
    }
    const fetchSlides = async () => {
    try {
        const { data } = await getCarousel();
        setSlides(data);
    } catch (error) {
        console.error('Error al obtener carrusel:', error);
    }
    };
    fetchSlides();
}, [navigate]);

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    await createCarouselSlide(newSlide);
    alert('Slide creado');
    setNewSlide({
        id_producto: '',
        imagen_url: '',
        titulo: '',
        descripcion: '',
        descuento_porcentaje: '',
        fecha_inicio: '',
        fecha_fin: '',
        prioridad: 0,
    });
    const { data } = await getCarousel();
    setSlides(data);
    } catch (error) {
    alert(error.response?.data?.error || 'Error al crear slide');
    }
};

const handleUpdate = async (id, updatedSlide) => {
    try {
    await updateCarouselSlide(id, updatedSlide);
    alert('Slide actualizado');
    const { data } = await getCarousel();
    setSlides(data);
    } catch (error) {
    alert(error.response?.data?.error || 'Error al actualizar slide');
    }
};

const handleDelete = async (id) => {
    try {
    await deleteCarouselSlide(id);
    alert('Slide eliminado');
    const { data } = await getCarousel();
    setSlides(data);
    } catch (error) {
    alert(error.response?.data?.error || 'Error al eliminar slide');
    }
};

return (
    <div className="carousel-editor-container">
    <h2>Editor de Carrusel</h2>
    <section>
        <h3>Crear Slide</h3>
        <form onSubmit={handleSubmit}>
        <Input
            type="number"
            label="Producto ID"
            value={newSlide.id_producto}
            onChange={(e) => setNewSlide({ ...newSlide, id_producto: e.target.value })}
        />
        <Input
            type="text"
            label="Imagen URL"
            value={newSlide.imagen_url}
            onChange={(e) => setNewSlide({ ...newSlide, imagen_url: e.target.value })}
            required
        />
        <Input
            type="text"
            label="Título"
            value={newSlide.titulo}
            onChange={(e) => setNewSlide({ ...newSlide, titulo: e.target.value })}
            required
        />
        <Input
            type="text"
            label="Descripción"
            value={newSlide.descripcion}
            onChange={(e) => setNewSlide({ ...newSlide, descripcion: e.target.value })}
        />
        <Input
            type="number"
            label="Descuento (%)"
            value={newSlide.descuento_porcentaje}
            onChange={(e) => setNewSlide({ ...newSlide, descuento_porcentaje: e.target.value })}
        />
        <Input
            type="datetime-local"
            label="Fecha Inicio"
            value={newSlide.fecha_inicio}
            onChange={(e) => setNewSlide({ ...newSlide, fecha_inicio: e.target.value })}
            required
        />
        <Input
            type="datetime-local"
            label="Fecha Fin"
            value={newSlide.fecha_fin}
            onChange={(e) => setNewSlide({ ...newSlide, fecha_fin: e.target.value })}
            required
        />
        <Input
            type="number"
            label="Prioridad"
            value={newSlide.prioridad}
            onChange={(e) => setNewSlide({ ...newSlide, prioridad: e.target.value })}
        />
        <Button type="submit">Crear Slide</Button>
        </form>
    </section>
    <section>
        <h3>Slides Actuales</h3>
        {slides.map((slide) => (
        <div key={slide.id_carrusel} className="slide-item">
            <img src={slide.imagen_url} alt={slide.titulo} />
            <h4>{slide.titulo}</h4>
            <Button onClick={() => handleDelete(slide.id_carrusel)}>Eliminar</Button>
        </div>
        ))}
    </section>
    </div>
);
}

export default CarouselEditor;