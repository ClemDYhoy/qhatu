import React, { useState } from 'react';
import Input from '../../ui/Input/Input';
import Button from '../../ui/Button/Button';
import './SearchBar.css';

function SearchBar({ onFilterChange }) {
const [filters, setFilters] = useState({
    categoria_id: '',
    tipo_comida_id: '',
    etiqueta_id: '',
    es_importado: '',
    marca: '',
    precio_min: '',
    precio_max: '',
    termino_busqueda: '',
});

const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
};

const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(filters);
};

return (
    <form className="search-bar" onSubmit={handleSubmit}>
    <Input
        type="text"
        name="termino_busqueda"
        label="Buscar productos"
        value={filters.termino_busqueda}
        onChange={handleChange}
    />
    <Input
        type="number"
        name="categoria_id"
        label="ID Categoría"
        value={filters.categoria_id}
        onChange={handleChange}
    />
    <Input
        type="number"
        name="tipo_comida_id"
        label="ID Tipo de Comida"
        value={filters.tipo_comida_id}
        onChange={handleChange}
    />
    <Input
        type="number"
        name="etiqueta_id"
        label="ID Etiqueta"
        value={filters.etiqueta_id}
        onChange={handleChange}
    />
    <select name="es_importado" value={filters.es_importado} onChange={handleChange}>
        <option value="">Todos</option>
        <option value="true">Importado</option>
        <option value="false">Local</option>
    </select>
    <Input
        type="text"
        name="marca"
        label="Marca"
        value={filters.marca}
        onChange={handleChange}
    />
    <Input
        type="number"
        name="precio_min"
        label="Precio Mín."
        value={filters.precio_min}
        onChange={handleChange}
    />
    <Input
        type="number"
        name="precio_max"
        label="Precio Máx."
        value={filters.precio_max}
        onChange={handleChange}
    />
    <Button type="submit">Filtrar</Button>
    </form>
);
}

export default SearchBar;