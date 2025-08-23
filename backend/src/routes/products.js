import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// GET /api/products - Obtener todos los productos
router.get('/', async (req, res) => {
try {
    const { page = 1, limit = 10, category, sort, search } = req.query;
    
    let query = {}; // Cambiado de { isActive: true } para depuración
    console.log('Query being executed:', query);
    
    if (category) {
    query.category = category;
    }
    
    if (search) {
    query.$text = { $search: search };
    }
    
    let sortOptions = {};
    if (sort === 'price_asc') sortOptions.price = 1;
    else if (sort === 'price_desc') sortOptions.price = -1;
    else if (sort === 'rating') sortOptions.rating = -1;
    else if (sort === 'newest') sortOptions.createdAt = -1;
    else sortOptions.createdAt = -1;
    
    const products = await Product.find(query)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);
    console.log('Products found:', products);
    
    const total = await Product.countDocuments(query);
    
    res.json({
    products,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
    });
} catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ message: error.message });
}
});

// GET /api/products/:id - Obtener producto por ID
router.get('/:id', async (req, res) => {
try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
    return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    res.json(product);
} catch (error) {
    res.status(500).json({ message: error.message });
}
});

// GET /api/products/search?q=query - Buscar productos
router.get('/search', async (req, res) => {
try {
    const { q } = req.query;
    
    if (!q) {
    return res.status(400).json({ message: 'Query parameter is required' });
    }
    
    const products = await Product.find({
    $text: { $search: q },
    isActive: true
    }).limit(20);
    
    res.json(products);
} catch (error) {
    res.status(500).json({ message: error.message });
}
});

// POST /api/products - Crear nuevo producto (Admin)
router.post('/', async (req, res) => {
try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
} catch (error) {
    res.status(400).json({ message: error.message });
}
});

export default router; // Asegúrate de que esta línea esté al final