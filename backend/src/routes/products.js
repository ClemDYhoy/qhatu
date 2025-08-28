import express from 'express';
import Product from '../models/Product.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
try {
    const { page = 1, limit = 10, category, sort, search, type } = req.query;
    let query = { isActive: true };
    if (category) query.category = { $regex: new RegExp(category, 'i') };
    if (type) query.type = { $regex: new RegExp(type, 'i') };
    if (search) query.$text = { $search: search };

    const products = await Product.find(query)
    .sort(sort ? { [sort]: 1 } : { createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);
    res.json({ products, totalPages: Math.ceil(total / limit), currentPage: page, total });
} catch (error) {
    res.status(500).json({ message: error.message });
}
});

// POST /api/products (autenticado)
router.post('/', auth, async (req, res) => {
try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
} catch (error) {
    res.status(400).json({ message: error.message });
}
});

export default router;