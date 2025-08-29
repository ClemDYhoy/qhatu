import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const CarouselEditor = () => {
const [images, setImages] = useState([]); // Estado para las imágenes del carrusel

// Cargar datos iniciales del carrusel al montar el componente
useEffect(() => {
    const fetchCarousel = async () => {
    try {
        const response = await api.get('/carousel');
        setImages(response.data.images || []);
    } catch (err) {
        console.error('Error al cargar el carrusel:', err);
    }
    };
    fetchCarousel();
}, []);

// Agregar un nuevo slide al carrusel
const handleAdd = () => {
    setImages([...images, { url: '', title: '', description: '' }]);
};

// Actualizar un campo específico de un slide
const handleChange = (index, field, value) => {
    const newImages = [...images];
    newImages[index][field] = value;
    setImages(newImages);
};

// Guardar los cambios en el backend
const handleSave = async () => {
    try {
    await api.put('/carousel', { images });
    alert('Carrusel actualizado exitosamente');
    } catch (err) {
    console.error('Error al guardar:', err);
    alert('Error al actualizar el carrusel');
    }
};

return (
    <div style={{ padding: '20px' }}>
    <h2>Editor de Carrusel</h2>
    {images.map((img, index) => (
        <div key={index} style={{ marginBottom: '15px', border: '1px solid #ccc', padding: '10px' }}>
        <label>URL de Imagen:</label>
        <input
            type="text"
            value={img.url}
            onChange={(e) => handleChange(index, 'url', e.target.value)}
            placeholder="Pega la URL de la imagen (ej. desde S3 o web)"
            style={{ width: '100%', marginBottom: '5px' }}
        />
        <label>Título:</label>
        <input
            type="text"
            value={img.title}
            onChange={(e) => handleChange(index, 'title', e.target.value)}
            placeholder="Título del slide"
            style={{ width: '100%', marginBottom: '5px' }}
        />
        <label>Descripción:</label>
        <input
            type="text"
            value={img.description}
            onChange={(e) => handleChange(index, 'description', e.target.value)}
            placeholder="Descripción del slide"
            style={{ width: '100%', marginBottom: '5px' }}
        />
        </div>
    ))}
    <button
        onClick={handleAdd}
        style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}
    >
        Agregar Nuevo Slide
    </button>
    <button
        onClick={handleSave}
        style={{ padding: '5px 10px', backgroundColor: '#2196F3', color: 'white', border: 'none', cursor: 'pointer' }}
    >
        Guardar Cambios
    </button>
    </div>
);
};

export default CarouselEditor;