import React, { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import ProductList from '../../components/products/ProductList/ProductList';
import SearchBar from '../../components/products/SearchBar/SearchBar';
import './Products.css';

const Products = () => {
const { products, searchResults, isLoading, searchProducts } = useProducts();
const [searchQuery, setSearchQuery] = useState('');
const [isSearching, setIsSearching] = useState(false);

const displayedProducts = isSearching ? searchResults : products;

const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
    setIsSearching(false);
    } else {
    setIsSearching(true);
    searchProducts(query);
    }
};

return (
    <div className="products-page">
        <div className="container">
            <h1 className="section-title">Nuestros Productos</h1>
            
            <div className="products-header">
            <SearchBar 
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Buscar productos..."
            />
            
            {isSearching && (
                <div className="search-results-info">
                <p>
                    {searchResults.length} resultado(s) encontrado(s) para "{searchQuery}"
                </p>
                <button 
                    className="clear-search"
                    onClick={() => {
                    setSearchQuery('');
                    setIsSearching(false);
                    }}
                >
                    Limpiar búsqueda
                </button>
                </div>
            )}
            </div>

            <ProductList 
            products={displayedProducts} 
            isLoading={isLoading} 
            />
        </div>
    </div>
);
};

export default Products;