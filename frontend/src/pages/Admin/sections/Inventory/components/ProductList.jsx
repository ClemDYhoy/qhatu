// sections/Inventory/components/ProductList.jsx
import React from 'react';
import DataTable from '../../../components/DataTable';
import './ProductList.css';

const ProductList = ({ products, onEdit, onDelete }) => {
  const columns = [
    { key: 'producto_id', label: 'ID', sortable: true },
    { key: 'nombre', label: 'Producto', sortable: true },
    { key: 'categoria_nombre', label: 'Categoría', sortable: true },
    { key: 'precio', label: 'Precio', sortable: true },
    { key: 'stock', label: 'Stock', sortable: true },
    { key: 'estado_stock', label: 'Estado', sortable: true }
  ];

  const renderActions = (product) => (
    <div className="product-actions">
      <button 
        className="btn-edit"
        onClick={() => onEdit(product)}
        title="Editar"
      >
        ✏️
      </button>
      <button 
        className="btn-delete"
        onClick={() => onDelete(product.producto_id)}
        title="Eliminar"
      >
        🗑️
      </button>
    </div>
  );

  // Formatear datos para la tabla
  const formattedProducts = products.map(p => ({
    ...p,
    precio: `S/ ${p.precio}`,
    stock: (
      <span className={`stock-badge ${p.stock < 10 ? 'low' : 'normal'}`}>
        {p.stock}
      </span>
    ),
    estado_stock: (
      <span className={`status-badge ${p.estado_stock === 'Habido' ? 'available' : 'out'}`}>
        {p.estado_stock}
      </span>
    )
  }));

  return (
    <div className="product-list-container">
      <DataTable
        columns={columns}
        data={formattedProducts}
        actions={renderActions}
        searchable={true}
        sortable={true}
      />
    </div>
  );
};

export default ProductList;

/* 
CSS ESPECIFICACIONES (ProductList.css):
- .product-list-container: background white, border-radius 12px, padding 20px, box-shadow 0 2px 8px rgba(0,0,0,0.1)
- .product-actions: display flex, gap 8px, justify-content flex-end
- .btn-edit, .btn-delete: padding 8px 12px, border none, border-radius 6px, cursor pointer, font-size 16px, transition all 0.3s
- .btn-edit: background #3498db, color white
- .btn-edit:hover: background #2980b9
- .btn-delete: background #e74c3c, color white
- .btn-delete:hover: background #c0392b
- .stock-badge: padding 4px 12px, border-radius 12px, font-size 13px, font-weight 600
- .stock-badge.normal: background #d5f4e6, color #27ae60
- .stock-badge.low: background #fadbd8, color #e74c3c
- .status-badge: padding 4px 12px, border-radius 12px, font-size 12px, font-weight 600
- .status-badge.available: background #d5f4e6, color #27ae60
- .status-badge.out: background #ecf0f1, color #7f8c8d
*/