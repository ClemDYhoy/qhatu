import React, { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({ value, onChange, placeholder = "Buscar..." }) => {
const [inputValue, setInputValue] = useState(value);

const handleSubmit = (e) => {
    e.preventDefault();
    onChange(inputValue);
};

const handleInputChange = (e) => {
    setInputValue(e.target.value);
    // Búsqueda en tiempo real opcional
    // onChange(e.target.value);
};

return (
    <form className="search-bar" onSubmit={handleSubmit}>
        <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="search-input"
        />
        <button type="submit" className="search-button">
            🔍
        </button>
    </form>
);
};

export default SearchBar;