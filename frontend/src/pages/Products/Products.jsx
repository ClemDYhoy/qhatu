import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/products/ProductCard/ProductCard';
import DiscountBanner from '../../components/DiscountBanner/DiscountBanner';
import { getProducts, getProductsWithDiscount, getAllCategoriesFlat, getPriceRange } from '../../services/api';
import './Products.css';

// ============================================
// === ICONOS SVG (MEMOIZADOS) ===
// ============================================

const FilterIcon = React.memo(() => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>));
const SearchIcon = React.memo(() => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>));
const PriceIcon = React.memo(() => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>));
const StockIcon = React.memo(() => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>));
const SortIcon = React.memo(() => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M7 12h10M10 18h4" /></svg>));
const ClearIcon = React.memo(() => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>));
const ChevronLeftIcon = React.memo(() => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>));
const ChevronRightIcon = React.memo(() => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>));
const DiscountTagIcon = React.memo(() => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="9" r="7"/><path d="M14 14l7 7"/><circle cx="9" cy="9" r="2" fill="currentColor"/></svg>));
const GridIcon = React.memo(() => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>));

const CategoryChipIcon = React.memo(({ type }) => {
  const icons = useMemo(() => ({
    todos: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>),
    descuentos: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 11V6.5A2.5 2.5 0 0 1 5.5 4h5L21 14.5l-6.5 6.5L3 11z"/>
        <circle cx="9" cy="9" r="1.6"/>
      </svg>
    ),
    combos: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 11h18"/><path d="M12 8v13"/><path d="M8 8V5a2 2 0 0 1 4 0v3"/><path d="M16 8V5a2 2 0 0 0-4 0v3"/></svg>),
    dulces: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M7 4c1.5 1 3 1.5 5 1.5S15.5 5 17 4"/>
        <path d="M6 6c1.2 1 2.5 1.5 6 1.5S16.8 7 18 6"/>
        <path d="M6.5 7.5l-1 12a2.5 2.5 0 0 0 2.5 2.8h8a2.5 2.5 0 0 0 2.5-2.8l-1-12"/>
        <path d="M10 13l2-2 2 2-2 2-2-2z"/>
      </svg>
    ),
    snacks: (
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="14" cy="14" r="8"/>
        <circle cx="11" cy="11" r="1"/>
        <circle cx="17" cy="11" r="1"/>
        <circle cx="11.5" cy="16" r="1"/>
        <circle cx="16.5" cy="17" r="1"/>
        <circle cx="15" cy="13.5" r="1"/>
      </svg>
    ),
    ramen: (
  <svg width="22" height="22" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.8" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="1" x2="20" y2="10"/>
    <line x1="18" y1="1" x2="10" y2="10"/>

    <path d="M7 7h14l-1.8 14.5a3 3 0 0 1-3 2.5h-4.4a3 3 0 0 1-3-2.5L7 7z"/>
    <ellipse cx="14" cy="7" rx="7" ry="2.4"/>

    <path d="M9.5 15c1-1 2 1 3 0s2-1 3 0 2 1 3 0"/>
  </svg>
),

    bebidas: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="4" width="10" height="20" rx="2.5"/>
        <ellipse cx="14" cy="4" rx="5" ry="2"/>
        <line x1="11" y1="9" x2="17" y2="9"/>
      </svg>
    ),
    licores: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2h4"/>
        <path d="M11 4h6"/>
        <path d="M10 6v4c0 1-1 2-1 3v11a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V13c0-1-1-2-1-3V6"/>
        <line x1="12" y1="15" x2="16" y2="15"/>
      </svg>
    ),
    otros: (
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 9l8-4 8 4"/>
        <rect x="6" y="9" width="16" height="14" rx="2"/>
        <line x1="14" y1="9" x2="14" y2="23"/>
      </svg>
    ),
  }), []);

  return icons[type] || icons.otros;
});

CategoryChipIcon.displayName = 'CategoryChipIcon';

// ============================================
// === COMPONENTE PRINCIPAL OPTIMIZADO ===
// ============================================

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filtros iniciales desde URL
  const initialFilters = useMemo(() => ({
    search: searchParams.get('search') || '',
    categoria_id: searchParams.get('categoria_id') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    availability: searchParams.get('availability') || '',
    mostrar_descuentos: searchParams.get('mostrar_descuentos') === 'true',
    orderBy: searchParams.get('orderBy') || 'stock',
    order: searchParams.get('order') || 'DESC',
    limit: 14,
    offset: Math.max(0, parseInt(searchParams.get('offset') || '0', 10))
  }), [searchParams]);

  const [filters, setFilters] = useState(initialFilters);

  // ============================================
  // === 🔥 MEJORA 1: Detectar si estamos en categoría Descuentos ===
  // ============================================

  const isInDiscountCategory = useMemo(() => {
    if (!filters.categoria_id) return false;
    
    const selectedCategory = allCategories.find(
      cat => cat.categoria_id.toString() === filters.categoria_id.toString()
    );
    
    if (!selectedCategory) return false;
    
    // Verificar si es la categoría de descuentos directamente
    if (selectedCategory.nombre.toLowerCase().includes('descuento')) {
      return true;
    }
    
    // Verificar si el padre es la categoría de descuentos
    if (selectedCategory.padre_id) {
      const parentCategory = allCategories.find(
        cat => cat.categoria_id.toString() === selectedCategory.padre_id.toString()
      );
      return parentCategory?.nombre.toLowerCase().includes('descuento') || false;
    }
    
    return false;
  }, [filters.categoria_id, allCategories]);

  // ============================================
  // === FUNCIONES AUXILIARES ===
  // ============================================

  const getCategoryIconType = useCallback((categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('descuento') || name.includes('oferta')) return 'descuentos';
    if (name.includes('combo')) return 'combos';
    if (name.includes('dulce') || name.includes('chocolate')) return 'dulces';
    if (name.includes('snack') || name.includes('papa')) return 'snacks';
    if (name.includes('ramen') || name.includes('fideo')) return 'ramen';
    if (name.includes('bebida') || name.includes('bubble')) return 'bebidas';
    if (name.includes('licor') || name.includes('sake')) return 'licores';
    return 'otros';
  }, []);

  const getCategoryName = useCallback((id) => {
    if (!id) return 'Categoría';
    const category = allCategories.find(cat => cat.categoria_id.toString() === id.toString());
    return category?.nombre || 'Categoría';
  }, [allCategories]);

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

  const loadCategories = useCallback(async () => {
    try {
      const response = await getAllCategoriesFlat();
      const cats = response.data || response || [];
      setAllCategories(Array.isArray(cats) ? cats : []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setAllCategories([]);
    }
  }, []);

  const loadPriceRange = useCallback(async () => {
    try {
      const response = await getPriceRange(filters.categoria_id || null);
      if (response?.success && response.data) {
        setPriceRange({ 
          min: response.data.min || 0, 
          max: response.data.max || 1000 
        });
      }
    } catch (error) {
      console.error('Error al cargar rango de precios:', error);
    }
  }, [filters.categoria_id]);

  // ============================================
  // === 🔥 MEJORA 2: loadProducts optimizado ===
  // ============================================

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Determinar si mostrar solo descuentos
      const shouldShowOnlyDiscounts = isInDiscountCategory || filters.mostrar_descuentos;

      let response;
      let apiFilters = { ...filters };
      
      // Limpiar offset si es necesario
      if (filters.offset >= 0) {
        apiFilters.offset = filters.offset;
      }
      
      if (shouldShowOnlyDiscounts) {
        console.log('🏷️ Mostrando productos en descuento' + 
          (filters.categoria_id ? ` de categoría ${filters.categoria_id}` : ' de todas las categorías'));
        
        // Si estamos en categoría Descuentos padre, NO enviar categoria_id
        // para obtener TODOS los descuentos y poder calcular subcategorías
        if (isInDiscountCategory) {
          const selectedCategory = allCategories.find(
            cat => cat.categoria_id.toString() === filters.categoria_id.toString()
          );
          
          if (selectedCategory && !selectedCategory.padre_id) {
            // Es categoría padre de descuentos, no filtrar por categoría
            apiFilters = { ...apiFilters, categoria_id: '' };
          }
        }
        
        response = await getProductsWithDiscount(apiFilters);
      } else {
        console.log('📦 Cargando productos normalmente');
        response = await getProducts(apiFilters);
      }
      
      // Validar respuesta
      if (!response) {
        throw new Error('Respuesta vacía del servidor');
      }
      
      const productsData = response.data || [];
      const sortedProducts = [...productsData].sort((a, b) => {
        const aAvailable = a.stock > 0 ? 1 : 0;
        const bAvailable = b.stock > 0 ? 1 : 0;
        return bAvailable - aAvailable;
      });

      setProducts(sortedProducts);
      
      // Calcular paginación
      const totalItems = response.pagination?.total || sortedProducts.length;
      const currentPage = Math.floor(filters.offset / filters.limit) + 1;
      const totalPages = Math.ceil(totalItems / filters.limit);
      
      setPagination({
        total: totalItems,
        currentPage,
        totalPages,
        hasPrev: filters.offset > 0,
        hasNext: filters.offset + filters.limit < totalItems
      });
      
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProducts([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [filters, isInDiscountCategory, allCategories]);

  const isSubcategoryOfDiscounts = useCallback(() => {
    if (!filters.categoria_id) return false;
    
    const selectedCategory = allCategories.find(
      cat => cat.categoria_id.toString() === filters.categoria_id.toString()
    );
    
    if (!selectedCategory || !selectedCategory.padre_id) return false;
    
    const parentCategory = allCategories.find(
      cat => cat.categoria_id.toString() === selectedCategory.padre_id.toString()
    );
    
    return parentCategory?.nombre.toLowerCase().includes('descuento') || false;
  }, [filters.categoria_id, allCategories]);

  // ============================================
  // === MANEJO DE FILTROS ===
  // ============================================

  const updateFilter = useCallback((key, value) => {
    const newParams = new URLSearchParams(searchParams);
    
    // Resetear offset si cambia cualquier filtro excepto offset
    if (key !== 'offset') {
      newParams.delete('offset');
    }
    
    // Eliminar parámetro si el valor es vacío o false
    if (value === '' || value === false || value === null || value === undefined) {
      newParams.delete(key);
    } else {
      newParams.set(key, value.toString());
    }
    
    setSearchParams(newParams);
    
    // Actualizar estado local
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key !== 'offset' ? { offset: 0 } : {}) // Reset offset si no es cambio de página
    }));
    
  }, [searchParams, setSearchParams]);

  const clearFilters = useCallback(() => {
    setSearchParams({});
    setFilters({
      search: '',
      categoria_id: '',
      priceMin: '',
      priceMax: '',
      availability: '',
      mostrar_descuentos: false,
      orderBy: 'stock',
      order: 'DESC',
      limit: 14,
      offset: 0
    });
    setMobileFiltersOpen(false);
  }, [setSearchParams]);

  const handlePageChange = useCallback((newOffset) => {
    if (newOffset < 0) return;
    updateFilter('offset', newOffset);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateFilter]);

  const handleBannerCategorySelect = useCallback((categoryId) => {
    updateFilter('categoria_id', categoryId);
    setTimeout(() => {
      const productsSection = document.querySelector('.products-content');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, [updateFilter]);

  const handleSortChange = useCallback((e) => {
    const [orderBy, order] = e.target.value.split('-');
    updateFilter('orderBy', orderBy);
    updateFilter('order', order);
  }, [updateFilter]);

  // ============================================
  // === EFFECTS ===
  // ============================================

  // Sincronizar filtros cuando cambian los parámetros de URL
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Cargar datos iniciales
  useEffect(() => { 
    loadCategories(); 
  }, []);

  useEffect(() => { 
    loadPriceRange(); 
  }, [filters.categoria_id]);

  useEffect(() => { 
    loadProducts(); 
  }, [filters]);

  // ============================================
  // === COMPUTED VALUES ===
  // ============================================

  const hasActiveFilters = useMemo(() => {
    return !!(filters.search || filters.categoria_id || filters.priceMin || 
              filters.priceMax || filters.availability || filters.mostrar_descuentos);
  }, [filters]);

  const mainCategories = useMemo(() => {
    const parentCats = allCategories.filter(cat => !cat.padre_id);
    const descuentosCat = parentCats.find(cat => 
      cat.nombre.toLowerCase().includes('descuento')
    );
    const combosCat = parentCats.find(cat => 
      cat.nombre.toLowerCase().includes('combo')
    );
    
    const specialCategories = [];
    if (descuentosCat) {
      specialCategories.push({ 
        id: descuentosCat.categoria_id, 
        name: 'Descuentos', 
        icon: 'descuentos', 
        isSpecial: true 
      });
    }
    
    if (combosCat) {
      specialCategories.push({ 
        id: combosCat.categoria_id, 
        name: 'Combos', 
        icon: 'combos', 
        isSpecial: true 
      });
    }
    
    const regularCategories = parentCats
      .filter(cat => !cat.nombre.toLowerCase().includes('descuento') && 
                      !cat.nombre.toLowerCase().includes('combo'))
      .map(cat => ({ 
        id: cat.categoria_id, 
        name: cat.nombre, 
        icon: getCategoryIconType(cat.nombre), 
        isSpecial: false 
      }));
    
    return [
      { id: '', name: 'Todos', icon: 'todos', isSpecial: false }, 
      ...specialCategories, 
      ...regularCategories
    ];
  }, [allCategories, getCategoryIconType]);

  // ============================================
  // === 🔥 MEJORA 3: Subcategorías dinámicas para Descuentos ===
  // ============================================

  const subcategories = useMemo(() => {
    if (!filters.categoria_id || allCategories.length === 0) return [];

    const selectedCategory = allCategories.find(
      cat => cat.categoria_id.toString() === filters.categoria_id.toString()
    );
    
    if (!selectedCategory) return [];

    let subcategoriesList = [];

    // 🔥 CASO ESPECIAL: Categoría "Descuentos" (padre)
    if (isInDiscountCategory && !selectedCategory.padre_id) {
      // Obtener categorías únicas de productos con descuento
      const categoriesWithDiscounts = new Set();
      
      products.forEach(product => {
        if (product.precio_descuento !== null && product.categoria_id) {
          categoriesWithDiscounts.add(product.categoria_id.toString());
        }
      });
      
      // Mapear a categorías reales
      const uniqueCategories = allCategories.filter(cat => 
        categoriesWithDiscounts.has(cat.categoria_id.toString())
      );
      
      subcategoriesList = uniqueCategories.map(sub => ({
        id: sub.categoria_id,
        name: sub.nombre,
        icon: getCategoryIconType(sub.nombre),
        isActive: false
      }));
    }
    // 🔥 CASO: Estamos en una subcategoría de Descuentos
    else if (isSubcategoryOfDiscounts()) {
      // Obtener TODAS las subcategorías con descuentos del padre
      const categoriesWithDiscounts = new Set();
      
      products.forEach(product => {
        if (product.precio_descuento !== null && product.categoria_id) {
          categoriesWithDiscounts.add(product.categoria_id.toString());
        }
      });
      
      const uniqueCategories = allCategories.filter(cat => 
        categoriesWithDiscounts.has(cat.categoria_id.toString())
      );
      
      subcategoriesList = uniqueCategories.map(sub => ({
        id: sub.categoria_id,
        name: sub.nombre,
        icon: getCategoryIconType(sub.nombre),
        isActive: sub.categoria_id.toString() === filters.categoria_id.toString()
      }));
    }
    // 🔥 CASO NORMAL: Subcategoría seleccionada (mostrar hermanas)
    else if (selectedCategory.padre_id) {
      const siblings = allCategories
        .filter(cat => cat.padre_id?.toString() === selectedCategory.padre_id.toString())
        .map(sub => ({
          id: sub.categoria_id,
          name: sub.nombre,
          icon: getCategoryIconType(sub.nombre),
          isActive: sub.categoria_id.toString() === filters.categoria_id.toString()
        }));
      
      subcategoriesList = siblings;
    }
    // 🔥 CASO: Categoría padre normal (mostrar hijos)
    else {
      const children = allCategories
        .filter(cat => cat.padre_id?.toString() === filters.categoria_id.toString())
        .map(sub => ({
          id: sub.categoria_id,
          name: sub.nombre,
          icon: getCategoryIconType(sub.nombre),
          isActive: false
        }));
      
      subcategoriesList = children;
    }

    return subcategoriesList;
  }, [allCategories, filters.categoria_id, isInDiscountCategory, products, getCategoryIconType, isSubcategoryOfDiscounts]);

  // 🔥 MEJORA: Obtener categoría padre actual para el botón "Ver todos"
  const parentCategoryId = useMemo(() => {
    if (!filters.categoria_id) return null;
    
    const selectedCategory = allCategories.find(
      cat => cat.categoria_id.toString() === filters.categoria_id.toString()
    );
    
    return selectedCategory?.padre_id || null;
  }, [filters.categoria_id, allCategories]);

  // ============================================
  // === RENDER ===
  // ============================================

  return (
    <div className="products-page">
      <div className="container">
        <DiscountBanner onCategorySelect={handleBannerCategorySelect} />
        
        <div className="mobile-filters-header">
          <button 
            className="btn btn-gold btn-sm" 
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            aria-label={mobileFiltersOpen ? 'Cerrar filtros' : 'Abrir filtros'}
          >
            <FilterIcon /> Filtros {hasActiveFilters && <span className="filter-count-badge" />}
          </button>
          <div className="products-count-mobile">
            {pagination && (
              <span className="count-badge">
                {pagination.total} producto{pagination.total !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="products-layout">
          <aside className={`products-filters ${mobileFiltersOpen ? 'mobile-open' : ''}`}>
            <div className="filters-header">
              <h3><FilterIcon /> Filtros</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="clear-btn" aria-label="Limpiar filtros">
                  <ClearIcon /> Limpiar
                </button>
              )}
            </div>

            <div className="filter-group">
              <label><SearchIcon /> Buscar</label>
              <input 
                type="text" 
                placeholder="Buscar productos..." 
                value={filters.search} 
                onChange={(e) => updateFilter('search', e.target.value.trimStart())} 
                className="search-input" 
                aria-label="Buscar productos"
              />
            </div>

            {/* 🔥 Toggle mejorado con indicador visual profesional */}
            {!isInDiscountCategory && (
              <div className="filter-group filter-group--toggle">
                <label className="toggle-label">
                  <span className="toggle-text">
                    <DiscountTagIcon />
                    Solo descuentos
                  </span>
                  <input 
                    type="checkbox" 
                    checked={filters.mostrar_descuentos} 
                    onChange={(e) => updateFilter('mostrar_descuentos', e.target.checked)} 
                    className="toggle-input" 
                    aria-label="Mostrar solo productos con descuento"
                  />
                  <span className="toggle-slider"></span>
                  {/* Badge opcional que aparece cuando está activo */}
                  <span className="toggle-badge">ON</span>
                </label>
              </div>
            )}

            {/* 🔥 MEJORA 5: Mostrar subcategorías dinámicas */}
            {subcategories.length > 0 && (
              <div className="filter-group filter-group--subcategories">
                <label>
                  <GridIcon /> 
                  {isInDiscountCategory 
                    ? 'Categorías en descuento' 
                    : (parentCategoryId 
                        ? 'Otras opciones' 
                        : 'Subcategorías')}
                </label>
                
                {/* Botón "Ver todos" para categorías padre */}
                {parentCategoryId && !isInDiscountCategory && (
                  <button 
                    className={`subcategory-chip ${
                      !subcategories.find(s => s.isActive) ? 'active' : ''
                    }`}
                    onClick={() => updateFilter('categoria_id', parentCategoryId)}
                  >
                    <GridIcon /> Ver todos
                  </button>
                )}
                
                <div className="subcategory-chips">
                  {subcategories.map(sub => (
                    <button 
                      key={sub.id} 
                      className={`subcategory-chip ${sub.isActive ? 'active' : ''}`} 
                      onClick={() => updateFilter('categoria_id', sub.id)}
                      aria-label={`Filtrar por ${sub.name}`}
                    >
                      <CategoryChipIcon type={sub.icon} /> {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="filter-group">
              <label><PriceIcon /> Precio</label>
              <div className="price-range-display">
                <span>S/. {filters.priceMin || priceRange.min.toFixed(2)}</span>
                <span>-</span>
                <span>S/. {filters.priceMax || priceRange.max.toFixed(2)}</span>
              </div>
              <div className="price-inputs">
                <input 
                  type="number" 
                  placeholder="Mín" 
                  min={priceRange.min} 
                  max={priceRange.max} 
                  step="0.01" 
                  value={filters.priceMin} 
                  onChange={(e) => updateFilter('priceMin', e.target.value)} 
                  aria-label="Precio mínimo"
                />
                <span className="separator">-</span>
                <input 
                  type="number" 
                  placeholder="Máx" 
                  min={priceRange.min} 
                  max={priceRange.max} 
                  step="0.01" 
                  value={filters.priceMax} 
                  onChange={(e) => updateFilter('priceMax', e.target.value)} 
                  aria-label="Precio máximo"
                />
              </div>
            </div>

            <div className="filter-group">
              <label><StockIcon /> Disponibilidad</label>
              <select 
                value={filters.availability} 
                onChange={(e) => updateFilter('availability', e.target.value)}
                aria-label="Filtrar por disponibilidad"
              >
                <option value="">Todos</option>
                <option value="in_stock">En stock</option>
                <option value="low">Pocas unidades</option>
                <option value="critical">Stock crítico</option>
                <option value="out">Agotado</option>
              </select>
            </div>

            {hasActiveFilters && (
              <div className="active-filters">
                <h4>Filtros activos:</h4>
                <div className="filter-tags">
                  {filters.search && (
                    <span className="filter-tag">
                      "{filters.search}" 
                      <button 
                        onClick={() => updateFilter('search', '')}
                        aria-label="Eliminar filtro de búsqueda"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.mostrar_descuentos && !isInDiscountCategory && (
                    <span className="filter-tag filter-tag--discount">
                      <DiscountTagIcon /> Descuentos 
                      <button 
                        onClick={() => updateFilter('mostrar_descuentos', false)}
                        aria-label="Eliminar filtro de descuentos"
                      >
                      </button>
                    </span>
                  )}
                  {filters.categoria_id && (
                    <span className="filter-tag">
                      {getCategoryName(filters.categoria_id)} 
                      <button 
                        onClick={() => updateFilter('categoria_id', '')}
                        aria-label={`Eliminar filtro de categoría ${getCategoryName(filters.categoria_id)}`}
                      >
                        ×
                      </button>
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
                        aria-label="Eliminar filtro de precio"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.availability && (
                    <span className="filter-tag">
                      {getAvailabilityText(filters.availability)} 
                      <button 
                        onClick={() => updateFilter('availability', '')}
                        aria-label={`Eliminar filtro de disponibilidad ${getAvailabilityText(filters.availability)}`}
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </aside>

          <main className="products-content">
            <div className="products-header">
              <div className="products-count">
                {pagination ? (
                  <h2>
                    <span className="text-gradient">{pagination.total}</span>{' '}
                    producto{pagination.total !== 1 && 's'}
                    {(filters.search || filters.categoria_id || filters.mostrar_descuentos) && (
                      <span className="search-context">
                        {filters.search && ` con "${filters.search}"`}
                        {filters.categoria_id && ` en ${getCategoryName(filters.categoria_id)}`}
                        {filters.mostrar_descuentos && !isInDiscountCategory && ' en oferta'}
                      </span>
                    )}
                  </h2>
                ) : <h2>Productos</h2>}
              </div>
              
              <div className="products-sort">
                <label><SortIcon /> Ordenar:</label>
                <select 
                  value={`${filters.orderBy}-${filters.order}`} 
                  onChange={handleSortChange}
                  aria-label="Ordenar productos por"
                >
                  <option value="stock-DESC">Disponibilidad</option>
                  <option value="nombre-ASC">A-Z</option>
                  <option value="nombre-DESC">Z-A</option>
                  <option value="precio-ASC">Precio: menor</option>
                  <option value="precio-DESC">Precio: mayor</option>
                  <option value="ventas-DESC">Más vendidos</option>
                  <option value="creado_en-DESC">Más recientes</option>
                </select>
              </div>
            </div>

            <div className="categories-bar-content">
              <button 
                className="category-nav-btn category-nav-prev" 
                onClick={() => { 
                  const c = document.querySelector('.categories-scroll'); 
                  if (c) c.scrollBy({ left: -200, behavior: 'smooth' }); 
                }}
                aria-label="Desplazar categorías a la izquierda"
              >
                <ChevronLeftIcon />
              </button>
              <div className="categories-scroll">
                {mainCategories.map(cat => (
                  <button 
                    key={cat.id || 'todos'} 
                    className={`category-chip ${
                      filters.categoria_id === cat.id ? 'active' : ''
                    } ${cat.isSpecial ? 'category-chip--special' : ''}`} 
                    onClick={() => updateFilter('categoria_id', cat.id)}
                    aria-label={`Filtrar por ${cat.name}`}
                    aria-pressed={filters.categoria_id === cat.id}
                  >
                    <CategoryChipIcon type={cat.icon} />
                    <span className="category-name">{cat.name}</span>
                  </button>
                ))}
              </div>
              <button 
                className="category-nav-btn category-nav-next" 
                onClick={() => { 
                  const c = document.querySelector('.categories-scroll'); 
                  if (c) c.scrollBy({ left: 200, behavior: 'smooth' }); 
                }}
                aria-label="Desplazar categorías a la derecha"
              >
                <ChevronRightIcon />
              </button>
            </div>

            {loading ? (
              <div className="products-loading" aria-label="Cargando productos">
                <div className="spinner" />
                <p>Cargando...</p>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="products-grid products-grid--5x2">
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
                      onClick={() => handlePageChange(Math.max(0, filters.offset - filters.limit))} 
                      disabled={!pagination.hasPrev} 
                      className="pagination-btn"
                      aria-label="Página anterior"
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
                      aria-label="Página siguiente"
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
                  <h3>No hay productos</h3>
                  <p>Intenta ajustar los filtros</p>
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