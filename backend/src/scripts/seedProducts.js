import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Importar el modelo correctamente
const Product = mongoose.model('Product', new mongoose.Schema({
name: {
    type: String,
    required: true,
    trim: true
},
description: {
    type: String,
    required: true
},
price: {
    type: Number,
    required: true,
    min: 0
},
originalPrice: {
    type: Number,
    min: 0
},
image: {
    type: String,
    required: true
},
images: [{
    type: String
}],
category: {
    type: String,
    required: true
},
features: [{
    type: String
}],
specifications: {
    type: Map,
    of: String
},
stock: {
    type: Number,
    required: true,
    min: 0
},
rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
},
reviews: [{
    user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    },
    rating: {
    type: Number,
    min: 1,
    max: 5
    },
    comment: String,
    createdAt: {
    type: Date,
    default: Date.now
    }
}],
tags: [{
    type: String
}],
isActive: {
    type: Boolean,
    default: true
},
isNew: {
    type: Boolean,
    default: false
},
discount: {
    type: Number,
    min: 0,
    max: 100
}
}, {
timestamps: true
}));

const sampleProducts = [
{
    name: "SmartWatch Pro Series 5",
    description: "Reloj inteligente con monitor de salud avanzado, resistente al agua y batería de larga duración. Perfecto para deportistas y vida activa.",
    price: 199.99,
    originalPrice: 249.99,
    image: "/images/products/smartwatch-pro.jpg",
    category: "Tecnología",
    features: ["Resistente al agua", "Monitoreo cardiaco", "GPS integrado", "Batería 7 días"],
    stock: 15,
    rating: 4.8,
    isNew: true,
    discount: 20
},
{
    name: "Auriculares Bluetooth Premium",
    description: "Auriculares inalámbricos con cancelación de ruido activa y sonido surround de alta fidelidad. Experiencia auditiva inmersiva.",
    price: 149.99,
    image: "/images/products/headphones-premium.jpg",
    category: "Audio",
    features: ["Cancelación de ruido", "30h batería", "Carga rápida", "Resistentes al agua"],
    stock: 25,
    rating: 4.9,
    isNew: true
},
{
    name: "Cámara 4K Profesional",
    description: "Cámara digital con sensor de 20MP, grabación 4K y estabilización óptica. Ideal para creadores de contenido.",
    price: 499.99,
    image: "/images/products/4k-camera.jpg",
    category: "Fotografía",
    features: ["Sensor 20MP", "Grabación 4K", "Estabilización óptica", "Wi-Fi/Bluetooth"],
    stock: 8,
    rating: 4.7
},
{
    name: "Kit de Skincare Coreano",
    description: "Set completo de skincare con ingredientes naturales. Hidratación profunda y cuidado facial premium.",
    price: 89.99,
    image: "/images/products/skincare-kit.jpg",
    category: "Belleza",
    features: ["Ingredientes naturales", "Hidratación profunda", "Para todo tipo de piel", "Libre de crueldad"],
    stock: 30,
    rating: 4.6
},
{
    name: "Cafetera Automática Italiana",
    description: "Máquina de café espresso automática con molinillo integrado. Prepara café profesional en casa.",
    price: 299.99,
    image: "/images/products/espresso-machine.jpg",
    category: "Hogar",
    features: ["Molinillo integrado", "Panel táctil", "Auto-limpiante", "App control"],
    stock: 12,
    rating: 4.8
},
{
    name: "Zapatillas Running Elite",
    description: "Zapatillas deportivas de alto rendimiento con amortiguación avanzada y tecnología de respiración.",
    price: 129.99,
    image: "/images/products/running-shoes.jpg",
    category: "Deportes",
    features: ["Amortiguación avanzada", "Material transpirable", "Suela anti-deslizante", "Tecnología energy return"],
    stock: 20,
    rating: 4.5
}
];

const seedDatabase = async () => {
try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Limpiar colección existente
    await mongoose.connection.db.collection('products').deleteMany({});
    console.log('✅ Cleared existing products');

    // Insertar productos de ejemplo
    await mongoose.connection.db.collection('products').insertMany(sampleProducts);
    console.log('✅ Added sample products to database');

    // Verificar inserción
    const count = await mongoose.connection.db.collection('products').countDocuments();
    console.log(`📦 Total products in database: ${count}`);

    process.exit(0);
} catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
}
};

seedDatabase();