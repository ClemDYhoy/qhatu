import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/products/ProductCard/ProductCard';
import DiscountBanner from '../../components/DiscountBanner/DiscountBanner';
import { getProducts, getCategories, getPriceRange } from '../../services/api';
import './Products.css';

// ============================================
// === ICONOS SVG ===
// ============================================

const FilterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CategoryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const PriceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const StockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const SortIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M7 12h10M10 18h4" />
  </svg>
);

const ClearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

// Iconos de categorías mejorados
const CategoryChipIcon = ({ type }) => {
  const icons = {
    todos: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    dulces: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <g transform="rotate(-25 12 12)">
          <path d="M2 12h4l2-2.5 2 2.5h4l2-2.5 2 2.5h4"/>
          <rect x="6" y="6" width="12" height="12" rx="3"/>
          <path d="M3 8l3 4M21 8l-3 4M3 16l3-4M21 16l-3-4"/>
          <line x1="10" y1="9" x2="10" y2="15" strokeWidth="2.5"/>
          <line x1="14" y1="9" x2="14" y2="15" strokeWidth="2.5"/>
        </g>
      </svg>
    ),
    snacks: (
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7"/>
        <circle cx="18" cy="18" r="6.5"/>
        <circle cx="10" cy="9" r="1.2" fill="currentColor"/>
        <circle cx="13" cy="11" r="1" fill="currentColor"/>
        <circle cx="9" cy="13" r="1" fill="currentColor"/>
        <circle cx="17" cy="16" r="1.2" fill="currentColor"/>
        <circle cx="20" cy="19" r="1" fill="currentColor"/>
        <circle cx="16" cy="20" r="1" fill="currentColor"/>
      </svg>
    ),
    ramen: (
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 17h20l-2 6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2l-2-6z"/>
        <ellipse cx="14" cy="17" rx="10" ry="2.5"/>
        <path d="M8 12c1 2 2 3.5 3 4.5M20 12c-1 2-2 3.5-3 4.5"/>
        <path d="M10 10c1-1.5 2-2.5 4-2.5s3 1 4 2.5"/>
        <circle cx="12" cy="13" r="1.2" fill="currentColor"/>
        <circle cx="16" cy="13" r="1.2" fill="currentColor"/>
        <line x1="9" y1="17" x2="9" y2="10" strokeWidth="2.5"/>
        <line x1="13" y1="17" x2="13" y2="11" strokeWidth="2.5"/>
        <line x1="17" y1="17" x2="17" y2="11" strokeWidth="2.5"/>
        <line x1="19" y1="5" x2="21" y2="14" strokeWidth="3"/>
        <line x1="22" y1="6" x2="24" y2="15" strokeWidth="3"/>
      </svg>
    ),
    bebidas: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8z"/>
        <path d="M6 8V6a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2"/>
        <line x1="14" y1="2" x2="16" y2="6"/>
        <circle cx="10" cy="14" r="1.5" fill="currentColor"/>
        <circle cx="14" cy="16" r="1.5" fill="currentColor"/>
        <circle cx="11" cy="18" r="1" fill="currentColor"/>
        <circle cx="8" cy="16" r="1" fill="currentColor"/>
      </svg>
    ),
    licores: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="14" cy="4" rx="4" ry="1.8"/>
        <path d="M10 4v2.5a1.5 1.5 0 0 0 1.5 1.5h5a1.5 1.5 0 0 0 1.5-1.5V4"/>
        <path d="M9 8h10l-1.5 17a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5L9 8z"/>
        <rect x="10.5" y="12" width="7" height="10" rx="1" fill="currentColor" opacity="0.3"/>
        <line x1="11" y1="15" x2="17" y2="15" strokeWidth="2.5"/>
        <line x1="11" y1="19" x2="17" y2="19" strokeWidth="2.5"/>
      </svg>
    ),
    otros: (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="10" width="14" height="14" rx="2"/>
      <path d="M7 14h14M14 10V4"/>
      <path d="M10 4h8"/>
      <path d="M12 17a2 2 0 0 1 4 0c0 1-2 1.5-2 2.5"/>
      <circle cx="14" cy="21.5" r="0.8" fill="currentColor"/>
    </svg>
    ),
  };
  return icons[type] || icons.otros;
};

// ============================================
// === COMPONENTE PRINCIPAL ===
// ============================================

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estados principales
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filtros iniciales desde URL
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

  // ============================================
  // === FUNCIONES AUXILIARES ===
  // ============================================

  /**
   * Determina el tipo de icono para una categoría
   */
  const getCategoryIconType = useCallback((categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('dulce') || name.includes('chocolate') || name.includes('galleta') || name.includes('caramelo') || name.includes('gomita')) return 'dulces';
    if (name.includes('snack') || name.includes('papa') || name.includes('piqueo') || name.includes('salado')) return 'snacks';
    if (name.includes('ramen') || name.includes('fideo') || name.includes('sopa')) return 'ramen';
    if (name.includes('bebida') || name.includes('bubble tea') || name.includes('refresco') || name.includes('energizante')) return 'bebidas';
    if (name.includes('licor') || name.includes('sake') || name.includes('soju') || name.includes('whisky') || name.includes('vino')) return 'licores';
    return 'otros';
  }, []);

  /**
   * Obtiene el nombre de una categoría por ID
   */
  const getCategoryName = useCallback((id) => {
    const category = categories.find(cat => cat.categoria_id == id);
    return category?.nombre || 'Categoría';
  }, [categories]);

  /**
   * Texto descriptivo para estados de disponibilidad
   */
  const getAvailabilityText = useCallback((status) => {
    const texts = {
      in_stock: 'En stock',
      low: 'Pocas unidades',
      critical: 'Stock crítico',
      out: 'Agotado'
    };
    return texts[status] || 'Todos';
  }, []);

  // ============================================
  // === CARGA DE DATOS ===
  // ============================================

  /**
   * Carga todas las categorías
   */
  const loadCategories = useCallback(async () => {
    try {
      const response = await getCategories();
      const cats = response.data || response || [];
      setCategories(cats);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }, []);

  /**
   * Carga rango de precios disponibles
   */
  const loadPriceRange = useCallback(async () => {
    try {
      const response = await getPriceRange(filters.categoria_id || null);
      
      if (response.success && response.data) {
        setPriceRange({
          min: response.data.min || 0,
          max: response.data.max || 1000
        });
      }
    } catch (error) {
      console.error('Error al cargar rango de precios:', error);
    }
  }, [filters.categoria_id]);

  /**
   * Carga productos con filtros aplicados
   */
  const loadProducts = useCallback(async () => {
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
  }, [filters]);

  // ============================================
  // === MANEJO DE FILTROS ===
  // ============================================

  /**
   * Actualiza un filtro específico
   */
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value, offset: 0 };
      
      // Actualizar URL params
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

  /**
   * Limpia todos los filtros
   */
  const clearFilters = useCallback(() => {
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
  }, [setSearchParams]);

  /**
   * Maneja cambio de página
   */
  const handlePageChange = useCallback((newOffset) => {
    setFilters(prev => ({ ...prev, offset: newOffset }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /**
   * Maneja selección de categoría desde el banner
   */
  const handleBannerCategorySelect = useCallback((categoryId) => {
    updateFilter('categoria_id', categoryId);
    // Scroll suave hacia los productos
    setTimeout(() => {
      const productsSection = document.querySelector('.products-content');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, [updateFilter]);

  // ============================================
  // === EFFECTS ===
  // ============================================

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadPriceRange();
  }, [loadPriceRange]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ============================================
  // === COMPUTED VALUES ===
  // ============================================

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.search ||
      filters.categoria_id ||
      filters.priceMin ||
      filters.priceMax ||
      filters.availability
    );
  }, [filters]);

  // Categorías principales para la barra horizontal
  const mainCategories = useMemo(() => {
    const mainCats = categories.filter(cat => !cat.padre_id);
    
    return [
      { id: '', name: 'Todos', icon: 'todos' },
      ...mainCats.map(cat => ({
        id: cat.categoria_id,
        name: cat.nombre,
        icon: getCategoryIconType(cat.nombre)
      }))
    ];
  }, [categories, getCategoryIconType]);

  // ============================================
  // === RENDER ===
  // ============================================

  return (
    <div className="products-page">
      <div className="container">
        
        {/* ========== BANNER DE DESCUENTOS ========== */}
        <DiscountBanner onCategorySelect={handleBannerCategorySelect} />
        
        {/* Header móvil con contador y botón de filtros */}
        <div className="mobile-filters-header">
          <button 
            className="btn btn-gold btn-sm"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            aria-label="Toggle filters"
          >
            <FilterIcon />
            Filtros
            {hasActiveFilters && <span className="filter-count-badge" />}
          </button>
          <div className="products-count-mobile">
            {pagination && (
              <span className="count-badge">
                {pagination.total} {pagination.total === 1 ? 'producto' : 'productos'}
              </span>
            )}
          </div>
        </div>

        <div className="products-layout">
          
          {/* ========== SIDEBAR DE FILTROS ========== */}
          <aside className={`products-filters ${mobileFiltersOpen ? 'mobile-open' : ''}`}>
            <div className="filters-header">
              <h3>
                <FilterIcon />
                Filtros
              </h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="clear-btn">
                  <ClearIcon />
                  Limpiar
                </button>
              )}
            </div>

            {/* Búsqueda por texto */}
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

            {/* Selector de categoría */}
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

            {/* Rango de precios */}
            <div className="filter-group">
              <label>
                <PriceIcon />
                Rango de Precio
              </label>
              <div className="price-range-display">
                <span>S/. {filters.priceMin || priceRange.min.toFixed(2)}</span>
                <span>-</span>
                <span>S/. {filters.priceMax || priceRange.max.toFixed(2)}</span>
              </div>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder={`Mín: ${priceRange.min.toFixed(2)}`}
                  min={priceRange.min}
                  max={priceRange.max}
                  step="0.01"
                  value={filters.priceMin}
                  onChange={(e) => updateFilter('priceMin', e.target.value)}
                />
                <span className="separator">-</span>
                <input
                  type="number"
                  placeholder={`Máx: ${priceRange.max.toFixed(2)}`}
                  min={priceRange.min}
                  max={priceRange.max}
                  step="0.01"
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
                <option value="critical">Stock crítico</option>
                <option value="out">Agotado</option>
              </select>
            </div>

            {/* Filtros activos */}
            {hasActiveFilters && (
              <div className="active-filters">
                <h4>Filtros activos:</h4>
                <div className="filter-tags">
                  {filters.search && (
                    <span className="filter-tag">
                      Buscar: "{filters.search}"
                      <button onClick={() => updateFilter('search', '')} aria-label="Remove search filter">×</button>
                    </span>
                  )}
                  {filters.categoria_id && (
                    <span className="filter-tag">
                      {getCategoryName(filters.categoria_id)}
                      <button onClick={() => updateFilter('categoria_id', '')} aria-label="Remove category filter">×</button>
                    </span>
                  )}
                  {(filters.priceMin || filters.priceMax) && (
                    <span className="filter-tag">
                      S/.{filters.priceMin || priceRange.min.toFixed(2)} - S/.{filters.priceMax || priceRange.max.toFixed(2)}
                      <button 
                        onClick={() => {
                          updateFilter('priceMin', '');
                          updateFilter('priceMax', '');
                        }}
                        aria-label="Remove price filter"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.availability && (
                    <span className="filter-tag">
                      {getAvailabilityText(filters.availability)}
                      <button onClick={() => updateFilter('availability', '')} aria-label="Remove availability filter">×</button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </aside>

          {/* ========== CONTENIDO PRINCIPAL ========== */}
          <main className="products-content">
            
            {/* Header con contador y ordenamiento */}
            <div className="products-header">
              <div className="products-count">
                {pagination ? (
                  <h2>
                    <span className="text-gradient">{pagination.total}</span>{' '}
                    {pagination.total === 1 ? 'producto encontrado' : 'productos encontrados'}
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
                    setFilters(prev => ({ ...prev, orderBy, order, offset: 0 }));
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

            {/* Barra de categorías con navegación - SIN useRef */}
            <div className="categories-bar-content">
              <button 
                className="category-nav-btn category-nav-prev"
                onClick={() => {
                  const container = document.querySelector('.categories-scroll');
                  if (container) {
                    container.scrollBy({ left: -200, behavior: 'smooth' });
                  }
                }}
                aria-label="Anterior"
              >
                <ChevronLeftIcon />
              </button>

              <div className="categories-scroll">
                {mainCategories.map(cat => (
                  <button
                    key={cat.id}
                    className={`category-chip ${filters.categoria_id == cat.id ? 'active' : ''}`}
                    onClick={() => updateFilter('categoria_id', cat.id === '' ? '' : cat.id)}
                    aria-label={`Filtrar por ${cat.name}`}
                  >
                    <CategoryChipIcon type={cat.icon} />
                    <span className="category-name">{cat.name}</span>
                  </button>
                ))}
              </div>

              <button 
                className="category-nav-btn category-nav-next"
                onClick={() => {
                  const container = document.querySelector('.categories-scroll');
                  if (container) {
                    container.scrollBy({ left: 200, behavior: 'smooth' });
                  }
                }}
                aria-label="Siguiente"
              >
                <ChevronRightIcon />
              </button>
            </div>

            {/* Grid de productos o estados */}
            {loading ? (
              <div className="products-loading">
                <div className="spinner" />
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

                {/* Paginación */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(filters.offset - filters.limit)}
                      disabled={!pagination.hasPrev}
                      className="pagination-btn"
                      aria-label="Previous page"
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
                      aria-label="Next page"
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
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="btn btn-gold">
                      Limpiar filtros
                    </button>
                  )}
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