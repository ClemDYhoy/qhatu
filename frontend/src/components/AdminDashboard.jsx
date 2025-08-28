import { useState } from 'react';
import { productService } from '../services/productService';

const AdminDashboard = () => {
const [product, setProduct] = useState({ name: '', description: '', price: 0, category: '', image: '' });
const [message, setMessage] = useState('');

const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token'); // Asume autenticación previa
    if (!token) {
    setMessage('Please log in first');
    return;
    }
    try {
    const response = await productService.create(product, token);
    setMessage('Product added successfully!');
    setProduct({ name: '', description: '', price: 0, category: '', image: '' });
    } catch (error) {
    setMessage('Error adding product: ' + error.message);
    }
};

return (
    <div>
    <h2>Admin Dashboard</h2>
    <form onSubmit={handleSubmit}>
        <input value={product.name} onChange={e => setProduct({ ...product, name: e.target.value })} placeholder="Name" required />
        <input value={product.description} onChange={e => setProduct({ ...product, description: e.target.value })} placeholder="Description" required />
        <input type="number" value={product.price} onChange={e => setProduct({ ...product, price: e.target.value })} placeholder="Price" required />
        <input value={product.category} onChange={e => setProduct({ ...product, category: e.target.value })} placeholder="Category" required />
        <input value={product.image} onChange={e => setProduct({ ...product, image: e.target.value })} placeholder="Image URL" />
        <button type="submit">Add Product</button>
    </form>
    {message && <p>{message}</p>}
    </div>
);
};

export default AdminDashboard;