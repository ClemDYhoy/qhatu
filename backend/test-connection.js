import { sequelize, Category, Product, Carousel } from './src/models/index.js';

async function testConnection() {
    try {
        // Verificar conexión a la base de datos
        await sequelize.authenticate();
        console.log('Conexión a la base de datos exitosa');

        // Sincronizar modelos
        await sequelize.sync({ force: false });
        console.log('Modelos sincronizados con la base de datos');

        // Verificar que Carousel sea un modelo válido
        if (typeof Carousel.findAll !== 'function') {
            throw new Error('Carousel.findAll no es una función. Verifica la definición del modelo Carousel.');
        }

        // Consultar categorías
        const categories = await Category.findAll({
            include: [{ model: Category, as: 'parent' }]
        });
        console.log('Categorías encontradas:', categories.length);

        // Consultar productos
        const products = await Product.findAll({
            include: [{ model: Category, as: 'categoria' }]
        });
        console.log('Productos encontrados:', products.length);

        // Consultar carruseles
        const carousels = await Carousel.findAll();
        console.log('Carruseles encontrados:', carousels.length);

    } catch (error) {
        console.error('Error en la prueba de conexión:', error);
    } finally {
        await sequelize.close();
    }
}

testConnection();