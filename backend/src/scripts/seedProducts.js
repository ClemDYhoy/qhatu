import { sequelize, Category, Product } from '../models/index.js';

const seedProducts = async () => {
    try {
        // Sincronizar modelos con la base de datos
        await sequelize.sync({ force: false });

        // Verificar categorías
        const categories = await Category.findAll();
        if (categories.length === 0) {
            throw new Error('No hay categorías en la base de datos. Ejecuta la inicialización de categorías primero.');
        }

        // Productos de ejemplo
        const products = [
            {
                nombre: 'Chocolate Suizo Premium',
                descripcion: 'Chocolate artesanal importado de Suiza',
                precio: 15.50,
                stock: 50,
                categoria_id: 2, // Chocolates
                destacado: true,
                url_imagen: '/images/chocolate_suizo.png'
            },
            {
                nombre: 'Ramen Picante Coreano',
                descripcion: 'Ramen instantáneo con sabor picante',
                precio: 8.99,
                stock: 15,
                categoria_id: 13, // Picante
                destacado: false,
                url_imagen: '/images/ramen_picante.png'
            },
            {
                nombre: 'Bubble Tea de Mango',
                descripcion: 'Bebida refrescante con perlas de tapioca',
                precio: 5.75,
                stock: 5,
                categoria_id: 15, // Bubble Tea
                destacado: true,
                url_imagen: '/images/bubble_tea_mango.png'
            },
            {
                nombre: 'Soju de Melocotón',
                descripcion: 'Licor coreano de melocotón',
                precio: 20.00,
                stock: 0,
                categoria_id: 20, // Soju
                destacado: false,
                url_imagen: '/images/soju_melocoton.png'
            }
        ];

        // Insertar en la tabla productos
        await Product.bulkCreate(products, { ignoreDuplicates: true });
        console.log('Productos inicializados con éxito');
    } catch (error) {
        console.error('Error al inicializar productos:', error);
    } finally {
        await sequelize.close();
    }
};

seedProducts();