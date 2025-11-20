// components/DataTable.jsx
import React, { useState } from 'react';
import './DataTable.css';

const DataTable = ({ 
  columns, // [{ key: 'nombre', label: 'Nombre', sortable: true }]
  data,    // Array de objetos
  actions, // Función que retorna JSX con acciones por fila
  searchable = true,
  sortable = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Filtrado
  const filteredData = data.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Ordenamiento
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    if (!sortable) return;
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  return (
    <div className="data-table-container">
      {/* Barra de búsqueda */}
      {searchable && (
        <div className="table-search">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      )}

      {/* Tabla */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th 
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={col.sortable ? 'sortable' : ''}
                >
                  {col.label}
                  {sortConfig.key === col.key && (
                    <span className="sort-icon">
                      {sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}
                    </span>
                  )}
                </th>
              ))}
              {actions && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="empty-message">
                  No se encontraron resultados
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => (
                <tr key={index}>
                  {columns.map(col => (
                    <td key={col.key}>{item[col.key]}</td>
                  ))}
                  {actions && (
                    <td className="actions-cell">
                      {actions(item)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;

/* 
CSS ESPECIFICACIONES (DataTable.css):
- .data-table-container: background white, border-radius 8px, padding 20px, box-shadow 0 2px 8px rgba(0,0,0,0.1)
- .table-search: margin-bottom 20px
- .search-input: width 300px, padding 10px 15px, border 1px solid #ddd, border-radius 6px, font-size 14px
- .table-wrapper: overflow-x auto
- .data-table: width 100%, border-collapse collapse
- .data-table thead: background #f8f9fa
- .data-table th: padding 12px 15px, text-align left, font-weight 600, color #2c3e50, border-bottom 2px solid #ecf0f1
- .data-table th.sortable: cursor pointer, user-select none
- .data-table th.sortable:hover: background #e9ecef
- .data-table td: padding 12px 15px, border-bottom 1px solid #ecf0f1
- .data-table tbody tr:hover: background #f8f9fa
- .actions-cell: text-align right, white-space nowrap
- .empty-message: text-align center, padding 40px, color #7f8c8d, font-style italic
*/