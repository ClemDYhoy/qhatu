import React, { useState, useEffect } from 'react';
import { getCategories, getProducts } from '../../services/productService';
import './SearchBar.css';

const SearchBar = ({ onFilterChange }) => {
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        category: '',
        priceMin: '',
        priceMax: '',
        availability: 'all',
        search: '',
        highlighted: false
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (error) {
                console.error('Error al cargar categorías:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const products = await getProducts(filters);
            onFilterChange(products);
        } catch (error) {
            console.error('Error al filtrar productos:', error);
        }
    };

    return (
        <div className="p-4 bg-gray-100">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                <select
                    name="category"
                    value={filters.category}
                    onChange={handleInputChange}
                    className="p-2 border rounded"
                >
                    <option value="">Todas las Categorías</option>
                    {categories.map((cat) => (
                        <option key={cat.categoria_id} value={cat.nombre}>
                            {cat.nombre} {cat.padre_id ? '(Subcategoría)' : ''}
                        </option>
                    ))}
                </select>
                <input
                    type="number"
                    name="priceMin"
                    value={filters.priceMin}
                    onChange={handleInputChange}
                    placeholder="Precio Mín."
                    className="p-2 border rounded"
                />
                <input
                    type="number"
                    name="priceMax"
                    value={filters.priceMax}
                    onChange={handleInputChange}
                    placeholder="Precio Máx."
                    className="p-2 border rounded"
                />
                <select
                    name="availability"
                    value={filters.availability}
                    onChange={handleInputChange}
                    className="p-2 border rounded"
                >
                    <option value="all">Todos (En Stock)</option>
                    <option value="low">Pocas Unidades (&lt;20)</option>
                    <option value="critical">Stock Crítico (&lt;=10)</option>
                    <option value="out">Agotado</option>
                </select>
                <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleInputChange}
                    placeholder="Buscar productos..."
                    className="p-2 border rounded"
                />
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="highlighted"
                        checked={filters.highlighted}
                        onChange={handleInputChange}
                    />
                    Destacados
                </label>
                <button type="submit" className="p-2 bg-blue-500 text-white rounded">
                    Filtrar
                </button>
            </form>
        </div>
    );
};

export default SearchBar;