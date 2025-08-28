import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import fs from 'fs';

dotenv.config();

const seedDatabase = async () => {
try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    const rawData = fs.readFileSync('./src/scripts/openfoodfacts_products.json', 'utf8');
    const products = JSON.parse(rawData);

    const filteredProducts = products.map(item => ({
    name: item.product_name || 'Unnamed Product',
    description: item.generic_name || item.ingredients_text || 'No description',
    price: item.energy_100g || Math.floor(Math.random() * 100) + 10,
    image: item.image_url || '/images/default-product.jpg',
    category: item.categories_tags?.[0]?.split(',')[0] || 'Uncategorized',
    features: item.allergens || item.ingredients || [],
    stock: Math.floor(Math.random() * 50) + 10,
    rating: Math.random() * 5,
    isActive: true,
    discount: Math.floor(Math.random() * 30)
    })).filter(p => p.category && ['snacks', 'beverages', 'sweets', 'alcoholic-beverages', 'instant-foods'].some(cat => p.category.toLowerCase().includes(cat)));

    await Product.insertMany(filteredProducts);
    console.log(`Added ${filteredProducts.length} real products to database`);

    process.exit(0);
} catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
}
};

seedDatabase();