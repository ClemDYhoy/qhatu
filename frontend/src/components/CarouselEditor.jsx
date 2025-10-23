import React, { useState, useEffect } from 'react';
import { getCarousels, createCarousel, updateCarousel, deleteCarousel, getProfile } from '../services/productService';
import './CarouselEditor.css';

const CarouselEditor = () => {
    const [carousels, setCarousels] = useState([]);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        url_imagen: '',
        altura: 300,
        ancho: 1200
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profile = await getProfile();
                setIsAdmin(profile.isAdmin);
                if (profile.isAdmin) {
                    const data = await getCarousels();
                    setCarousels(data);
                }
            } catch (err) {
                setError(err.message);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateCarousel(editingId, formData);
                setCarousels(carousels.map((c) => (c.carrusel_id === editingId ? { ...c, ...formData } : c)));
                setEditingId(null);
            } else {
                const newCarousel = await createCarousel(formData);
                setCarousels([...carousels, newCarousel]);
            }
            setFormData({ titulo: '', descripcion: '', url_imagen: '', altura: 300, ancho: 1200 });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (carousel) => {
        setFormData({
            titulo: carousel.titulo,
            descripcion: carousel.descripcion,
            url_imagen: carousel.url_imagen,
            altura: carousel.altura,
            ancho: carousel.ancho
        });
        setEditingId(carousel.carrusel_id);
    };

    const handleDelete = async (id) => {
        try {
            await deleteCarousel(id);
            setCarousels(carousels.filter((c) => c.carrusel_id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    if (!isAdmin) return <div className="error">Acceso denegado: Solo administradores</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="carousel-editor">
            <h2>Administrar Carruseles</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Título</label>
                    <input
                        type="text"
                        value={formData.titulo}
                        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Descripción</label>
                    <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>URL de Imagen</label>
                    <input
                        type="text"
                        value={formData.url_imagen}
                        onChange={(e) => setFormData({ ...formData, url_imagen: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Altura (px)</label>
                    <input
                        type="number"
                        value={formData.altura}
                        onChange={(e) => setFormData({ ...formData, altura: parseInt(e.target.value) })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Ancho (px)</label>
                    <input
                        type="number"
                        value={formData.ancho}
                        onChange={(e) => setFormData({ ...formData, ancho: parseInt(e.target.value) })}
                        required
                    />
                </div>
                <button type="submit">{editingId ? 'Actualizar' : 'Crear'} Carrusel</button>
            </form>
            <div className="carousel-list">
                {carousels.map((carousel) => (
                    <div key={carousel.carrusel_id} className="carousel-item">
                        <img src={carousel.url_imagen} alt={carousel.titulo} />
                        <h3>{carousel.titulo}</h3>
                        <p>{carousel.descripcion}</p>
                        <button onClick={() => handleEdit(carousel)}>Editar</button>
                        <button onClick={() => handleDelete(carousel.carrusel_id)}>Eliminar</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CarouselEditor;