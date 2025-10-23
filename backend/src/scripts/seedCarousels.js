import { sequelize, Carousel } from '../models/index.js';

const seedCarousels = async () => {
    try {
        // Sincronizar modelos con la base de datos
        await sequelize.sync({ force: false });

        // Carruseles de ejemplo
        const carousels = [
            {
                titulo: 'Destacados de Dulces',
                descripcion: 'Promoción de dulces importados',
                url_imagen: '/images/carrusel_dulces.png',
                altura: 300,
                ancho: 1200,
                activo: true
            },
            {
                titulo: 'Ofertas de Bebidas',
                descripcion: 'Bebidas refrescantes en oferta',
                url_imagen: '/images/carrusel_bebidas.png',
                altura: 300,
                ancho: 1200,
                activo: true
            }
        ];

        // Insertar en la tabla carruseles
        await Carousel.bulkCreate(carousels, { ignoreDuplicates: true });
        console.log('Carruseles inicializados con éxito');
    } catch (error) {
        console.error('Error al inicializar carruseles:', error);
    } finally {
        await sequelize.close();
    }
};

seedCarousels();