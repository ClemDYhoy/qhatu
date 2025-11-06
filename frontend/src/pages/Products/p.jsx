// C:\qhatu\frontend\src\pages\Products\Products.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/products/ProductCard/ProductCard';
import { getProducts, getCategories, getCategoryStats } from '../../services/api';
import './Products.css';

// Iconos SVG Premium
const FilterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const CategoryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
    <line x1="7" y1="7" x2="7.01" y2="7"></line>
  </svg>
);

const PriceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const StockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
  </svg>
);

const SortIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M7 12h10M10 18h4"></path>
  </svg>
);

const ClearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

// Iconos de categorías
const CategoryChipIcon = ({ type }) => {
  const icons = {
    todos: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    ),
    dulces: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="8"/>
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
      </svg>
    ),
    snacks: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12h18M3 6h18M3 18h18"/>
      </svg>
    ),
    ramen: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 2v20M16 2v20M4 12h16"/>
        <circle cx="12" cy="12" r="8"/>
      </svg>
    ),
    bebidas: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2l2 20h8l2-20H6z"/>
        <path d="M6 8h12"/>
      </svg>
    ),
    licores: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 2h8v6l-4 4-4-4V2z"/>
        <path d="M6 12v8a2 2 0 002 2h8a2 2 0 002-2v-8"/>
      </svg>
    ),
    otros: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M9 9h6v6H9z"/>
      </svg>
    )
  };
  return icons[type] || icons.otros;
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filtros locales
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categoria_id: searchParams.get('categoria_id') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    availability: searchParams.get('availability') || '',
    orderBy: searchParams.get('orderBy') || 'nombre',
    order: searchParams.get('order') || 'ASC',
    limit: 12,
    offset: 0
  });

  // Función auxiliar para asignar iconos
  const getCategoryIconType = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('dulce')) return 'dulces';
    if (name.includes('snack')) return 'snacks';
    if (name.includes('ramen') || name.includes('fideo')) return 'ramen';
    if (name.includes('bebida')) return 'bebidas';
    if (name.includes('licor') || name.includes('sake') || name.includes('soju')) return 'licores';
    return 'otros';
  };

  useEffect(() => {
    loadCategoriesWithStats();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadCategoriesWithStats = async () => {
    try {
      const [categoriesRes, statsRes] = await Promise.all([
        getCategories(),
        getCategoryStats()
      ]);

      const cats = categoriesRes.data || categoriesRes || [];
      setCategories(cats);

      if (statsRes.success && statsRes.data) {
        const { total_general, categorias } = statsRes.data;

        // Construir array de categorías principales con conteo real
        const mainCats = [
          {
            id: '',
            name: 'Todos',
            icon: 'todos',
            count: total_general
          },
          ...categorias.map(cat => ({
            id: cat.categoria_id,
            name: cat.nombre,
            icon: getCategoryIconType(cat.nombre),
            count: cat.total_productos,
            disponibles: cat.disponibles
          }))
        ];

        setMainCategories(mainCats);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts(filters);
      setProducts(response.data || []);
      setPagination(response.pagination || {
        total: response.data?.length || 0,
        currentPage: 1,
        totalPages: 1,
        hasPrev: false,
        hasNext: false
      });
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProducts([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value, offset: 0 };
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([k, v]) => {
        if (v && k !== 'limit' && k !== 'offset') {
          params.set(k, v);
        }
      });
      setSearchParams(params);
      return newFilters;
    });
  }, [setSearchParams]);

  const clearFilters = () => {
    setFilters({
      search: '',
      categoria_id: '',
      priceMin: '',
      priceMax: '',
      availability: '',
      orderBy: 'nombre',
      order: 'ASC',
      limit: 12,
      offset: 0
    });
    setSearchParams({});
    setMobileFiltersOpen(false);
  };

  const handlePageChange = (newOffset) => {
    setFilters(prev => ({ ...prev, offset: newOffset }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryName = (id) => {
    const category = categories.find(cat => cat.categoria_id == id);
    return category?.nombre || 'Categoría';
  };

  return (
    <div className="products-page">
      <div className="container">
        {/* Header móvil */}
        <div className="mobile-filters-header">
          <button 
            className="btn btn-gold btn-sm"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          >
            <FilterIcon />
            Filtros
          </button>
          <div className="products-count-mobile">
            {pagination && (
              <span className="count-badge">
                {pagination.total} productos
              </span>
            )}
          </div>
        </div>

        <div className="products-layout">
          {/* Sidebar de filtros */}
          <aside className={`products-filters ${mobileFiltersOpen ? 'mobile-open' : ''}`}>
            <div className="filters-header">
              <h3>
                <FilterIcon />
                Filtros
              </h3>
              <button onClick={clearFilters} className="clear-btn">
                <ClearIcon />
                Limpiar
              </button>
            </div>

            {/* Búsqueda */}
            <div className="filter-group">
              <label>
                <SearchIcon />
                Buscar productos
              </label>
              <input
                type="text"
                placeholder="Ej: Papas fritas, bebidas..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="search-input"
              />
            </div>

            {/* Categoría */}
            <div className="filter-group">
              <label>
                <CategoryIcon />
                Categoría
              </label>
              <select
                value={filters.categoria_id}
                onChange={(e) => updateFilter('categoria_id', e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categories
                  .filter(cat => !cat.padre_id)
                  .map(cat => (
                    <option key={cat.categoria_id} value={cat.categoria_id}>
                      {cat.nombre}
                    </option>
                  ))}
              </select>
            </div>

            {/* Rango de precio */}
            <div className="filter-group">
              <label>
                <PriceIcon />
                Rango de Precio
              </label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Mín"
                  value={filters.priceMin}
                  onChange={(e) => updateFilter('priceMin', e.target.value)}
                />
                <span className="separator">-</span>
                <input
                  type="number"
                  placeholder="Máx"
                  value={filters.priceMax}
                  onChange={(e) => updateFilter('priceMax', e.target.value)}
                />
              </div>
            </div>

            {/* Disponibilidad */}
            <div className="filter-group">
              <label>
                <StockIcon />
                Disponibilidad
              </label>
              <select
                value={filters.availability}
                onChange={(e) => updateFilter('availability', e.target.value)}
              >
                <option value="">Todos los productos</option>
                <option value="in_stock">En stock</option>
                <option value="low">Pocas unidades</option>
                <option value="out">Agotado</option>
              </select>
            </div>

            {/* Filtros activos */}
            {(filters.search || filters.categoria_id || filters.priceMin || filters.priceMax || filters.availability) && (
              <div className="active-filters">
                <h4>Filtros activos:</h4>
                <div className="filter-tags">
                  {filters.search && (
                    <span className="filter-tag">
                      "{filters.search}"
                      <button onClick={() => updateFilter('search', '')}>×</button>
                    </span>
                  )}
                  {filters.categoria_id && (
                    <span className="filter-tag">
                      {getCategoryName(filters.categoria_id)}
                      <button onClick={() => updateFilter('categoria_id', '')}>×</button>
                    </span>
                  )}
                  {(filters.priceMin || filters.priceMax) && (
                    <span className="filter-tag">
                      S/.{filters.priceMin || '0'} - S/.{filters.priceMax || '∞'}
                      <button onClick={() => {
                        updateFilter('priceMin', '');
                        updateFilter('priceMax', '');
                      }}>×</button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </aside>

          {/* Contenido principal */}
          <main className="products-content">
            {/* Header con contador y ordenamiento */}
            <div className="products-header">
              <div className="products-count">
                {pagination ? (
                  <h2>
                    <span className="text-gradient">{pagination.total}</span> productos encontrados
                    {(filters.search || filters.categoria_id) && (
                      <span className="search-context">
                        {filters.search && ` para "${filters.search}"`}
                        {filters.categoria_id && ` en ${getCategoryName(filters.categoria_id)}`}
                      </span>
                    )}
                  </h2>
                ) : (
                  <h2>Explorar productos</h2>
                )}
              </div>
              
              <div className="products-sort">
                <label>
                  <SortIcon />
                  Ordenar por:
                </label>
                <select
                  value={`${filters.orderBy}-${filters.order}`}
                  onChange={(e) => {
                    const [orderBy, order] = e.target.value.split('-');
                    updateFilter('orderBy', orderBy);
                    updateFilter('order', order);
                  }}
                >
                  <option value="nombre-ASC">Nombre (A-Z)</option>
                  <option value="nombre-DESC">Nombre (Z-A)</option>
                  <option value="precio-ASC">Precio (menor a mayor)</option>
                  <option value="precio-DESC">Precio (mayor a menor)</option>
                  <option value="ventas-DESC">Más vendidos</option>
                  <option value="creado_en-DESC">Más recientes</option>
                </select>
              </div>
            </div>

            {/* Barra de Categorías - REPOSICIONADA AQUÍ */}
            <div className="categories-bar-content">
              <div className="categories-scroll">
                {mainCategories.map(cat => (
                  <button
                    key={cat.id}
                    className={`category-chip ${filters.categoria_id == cat.id ? 'active' : ''}`}
                    onClick={() => updateFilter('categoria_id', cat.id === '' ? '' : cat.id)}
                  >
                    <CategoryChipIcon type={cat.icon} />
                    <span className="category-name">{cat.name}</span>
                    {cat.count > 0 && <span className="category-count">{cat.count}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de productos */}
            {loading ? (
              <div className="products-loading">
                <div className="spinner"></div>
                <p>Cargando productos...</p>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="products-grid">
                  {products.map(product => (
                    <ProductCard 
                      key={product.producto_id} 
                      product={product}
                      categoryName={getCategoryName(product.categoria_id)}
                    />
                  ))}
                </div>

                {pagination && pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(filters.offset - filters.limit)}
                      disabled={!pagination.hasPrev}
                      className="pagination-btn"
                    >
                      ← Anterior
                    </button>
                    
                    <div className="pagination-info">
                      <span className="current-page">{pagination.currentPage}</span>
                      <span className="page-of">de {pagination.totalPages}</span>
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(filters.offset + filters.limit)}
                      disabled={!pagination.hasNext}
                      className="pagination-btn"
                    >
                      Siguiente →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="products-empty">
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <h3>No se encontraron productos</h3>
                  <p>Intenta ajustar los filtros o buscar otros términos</p>
                  <button onClick={clearFilters} className="btn btn-gold">
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;