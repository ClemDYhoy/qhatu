import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { useApp } from '../contexts/AppContext';

export const useProducts = () => {
const { state, dispatch } = useApp();
const [error, setError] = useState(null);

useEffect(() => {
    const fetchProducts = async () => {
    try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const products = await productService.getAll();
        dispatch({ type: 'SET_PRODUCTS', payload: products });
        setError(null);
    } catch (err) {
        setError('Error al cargar los productos');
        console.error(err);
    } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
    }
    };

    fetchProducts();
}, [dispatch]);

const searchProducts = async (query) => {
    try {
    dispatch({ type: 'SET_LOADING', payload: true });
    const results = await productService.search(query);
    dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
    setError(null);
    } catch (err) {
    setError('Error al buscar productos');
    console.error(err);
    } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
    }
};

return {
    products: state.products,
    searchResults: state.searchResults,
    isLoading: state.isLoading,
    error,
    searchProducts
};
};

export default useProducts; 