// sections/Management/components/CategoryManager.jsx
import React, { useState } from 'react';
import DataTable from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import './CategoryManager.css';

const CategoryManager = () => {
  // Datos simulados - luego vendrán de la API
  const [categories, setCategories] = useState([
    { categoria_id: 1, nombre: 'Dulces', padre_id: null, productos_count: 45 },
    { categoria_id: 2, nombre: 'Chocolates', padre_id: 1, productos_count: 18 },
    { categoria_id: 3, nombre: 'Galletas', padre_id: 1, productos_count: 12 },
    { categoria_id: 6, nombre: 'Snacks', padre_id: null, productos_count: 32 },
    { categoria_id: 7, nombre: 'Papas fritas', padre_id: 6, productos_count: 15 },
    { categoria_id: 10, nombre: 'Ramen y Fideos', padre_id: null, productos_count: 28 },
    { categoria_id: 14, nombre: 'Bebidas', padre_id: null, productos_count: 25 }
  ]);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const columns = [
    { key: 'categoria_id', label: 'ID', sortable: true },
    { key: 'nombre', label: 'Categoría', sortable: true },
    { key: 'padre_nombre', label: 'Categoría Padre', sortable: true },
    { key: 'productos_count', label: 'Productos', sortable: true }
  ];

  const renderActions = (category) => (
    <div className="category-actions">
      <button 
        className="btn-edit"
        onClick={() => handleEditCategory(category)}
        title="Editar"
      >
        ✏️
      </button>
      {category.productos_count === 0 && (
        <button 
          className="btn-delete"
          onClick={() => handleDeleteCategory(category.categoria_id)}
          title="Eliminar"
        >
          🗑️
        </button>
      )}
    </div>
  );

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('¿Eliminar esta categoría?')) {
      console.log('Eliminar categoría:', categoryId);
      // TODO: Implementar eliminación
    }
  };

  // Obtener nombre de categoría padre
  const getPadreNombre = (padreId) => {
    if (!padreId) return '-';
    const padre = categories.find(c => c.categoria_id === padreId);
    return padre ? padre.nombre : '-';
  };

  // Categorías principales (sin padre)
  const mainCategories = categories.filter(c => !c.padre_id);
  
  // Categorías con subcategorías
  const categoriesWithSubs = mainCategories.map(cat => ({
    ...cat,
    subcategorias: categories.filter(c => c.padre_id === cat.categoria_id)
  }));

  // Formatear datos para la tabla
  const formattedCategories = categories.map(c => ({
    ...c,
    padre_nombre: getPadreNombre(c.padre_id),
    productos_count: (
      <span className="products-count">
        📦 {c.productos_count}
      </span>
    )
  }));

  return (
    <div className="category-manager-container">
      <div className="manager-header">
        <h2>📂 Gestión de Categorías</h2>
        <button className="btn-create-category" onClick={handleCreateCategory}>
          ➕ Crear Categoría
        </button>
      </div>

      {/* Estadísticas */}
      <div className="categories-stats">
        <div className="stat-box">
          <span className="stat-value">{categories.length}</span>
          <span className="stat-label">Total Categorías</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{mainCategories.length}</span>
          <span className="stat-label">Principales</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">
            {categories.reduce((sum, c) => sum + c.productos_count, 0)}
          </span>
          <span className="stat-label">Total Productos</span>
        </div>
      </div>

      {/* Vista de Árbol */}
      <div className="categories-tree">
        <h3 className="tree-title">🌳 Árbol de Categorías</h3>
        <div className="tree-container">
          {categoriesWithSubs.map(mainCat => (
            <div key={mainCat.categoria_id} className="tree-branch">
              <div className="tree-main-category">
                <span className="tree-icon">📁</span>
                <span className="tree-name">{mainCat.nombre}</span>
                <span className="tree-count">({mainCat.productos_count})</span>
              </div>
              
              {mainCat.subcategorias.length > 0 && (
                <div className="tree-subcategories">
                  {mainCat.subcategorias.map(subCat => (
                    <div key={subCat.categoria_id} className="tree-subcategory">
                      <span className="tree-line">└─</span>
                      <span className="tree-icon">📄</span>
                      <span className="tree-name">{subCat.nombre}</span>
                      <span className="tree-count">({subCat.productos_count})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de Categorías */}
      <div className="categories-table-section">
        <h3 className="table-title">📋 Lista Completa</h3>
        <DataTable
          columns={columns}
          data={formattedCategories}
          actions={renderActions}
          searchable={true}
          sortable={true}
        />
      </div>

      {/* Modal de Categoría */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title={selectedCategory ? 'Editar Categoría' : 'Crear Categoría'}
        size="medium"
      >
        <div className="category-form-placeholder">
          <p>Formulario de categoría (por implementar)</p>
          {/* TODO: Implementar formulario */}
        </div>
      </Modal>
    </div>
  );
};

export default CategoryManager;

/* 
CSS ESPECIFICACIONES (CategoryManager.css):
- .category-manager-container: display flex, flex-direction column, gap 25px
- .manager-header: display flex, justify-content space-between, align-items center
- .manager-header h2: margin 0, font-size 22px, color #2c3e50
- .btn-create-category: padding 10px 20px, background #27ae60, color white, border none, border-radius 6px, cursor pointer, font-size 14px, font-weight 600
- .btn-create-category:hover: background #229954
- .categories-stats: display grid, grid-template-columns repeat(3, 1fr), gap 15px, padding 20px, background #f8f9fa, border-radius 8px
- .stat-box: text-align center
- .stat-value: display block, font-size 28px, font-weight bold, color #2c3e50, margin-bottom 5px
- .stat-label: display block, font-size 13px, color #7f8c8d
- .categories-tree: background white, border 2px solid #ecf0f1, border-radius 10px, padding 20px
- .tree-title: margin 0 0 15px 0, font-size 18px, font-weight 600, color #2c3e50
- .tree-container: display flex, flex-direction column, gap 15px
- .tree-branch: border-left 2px solid #ecf0f1, padding-left 15px
- .tree-main-category: display flex, align-items center, gap 8px, padding 10px, background #f8f9fa, border-radius 6px, font-weight 600, font-size 15px
- .tree-icon: font-size 18px
- .tree-name: color #2c3e50
- .tree-count: color #7f8c8d, font-size 13px, font-weight normal
- .tree-subcategories: margin-top 8px, display flex, flex-direction column, gap 6px
- .tree-subcategory: display flex, align-items center, gap 8px, padding 8px, padding-left 20px, font-size 14px, color #555
- .tree-line: color #bdc3c7, font-size 14px
- .categories-table-section: background white, border 2px solid #ecf0f1, border-radius 10px, padding 20px
- .table-title: margin 0 0 15px 0, font-size 18px, font-weight 600, color #2c3e50
- .category-actions: display flex, gap 8px, justify-content flex-end
- .btn-edit, .btn-delete: padding 8px 12px, border none, border-radius 6px, cursor pointer, font-size 16px
- .btn-edit: background #3498db, color white
- .btn-edit:hover: background #2980b9
- .btn-delete: background #e74c3c, color white
- .btn-delete:hover: background #c0392b
- .products-count: color #2c3e50, font-weight 600
*/