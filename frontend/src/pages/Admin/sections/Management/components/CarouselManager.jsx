// sections/Management/components/CarouselManager.jsx
import React, { useState } from 'react';
import './CarouselManager.css';

const CarouselManager = () => {
  // Datos simulados - luego vendrán de la API
  const [carousels, setCarousels] = useState([
    {
      carrusel_id: 1,
      titulo: 'Destacados de Dulces',
      descripcion: 'Promoción de dulces importados',
      url_imagen: 'https://i.pinimg.com/1200x/76/a3/c8/76a3c806f18b72096ef2895d5d53fa21.jpg',
      activo: true,
      tipo: 'manual'
    },
    {
      carrusel_id: 2,
      titulo: 'Ofertas de Bebidas',
      descripcion: 'Bebidas refrescantes en oferta',
      url_imagen: 'https://i.pinimg.com/736x/f0/4e/2c/f04e2ce844798047e94def80052df4ad.jpg',
      activo: true,
      tipo: 'manual'
    },
    {
      carrusel_id: 3,
      titulo: 'Chocolates Trending',
      descripcion: 'Generado automáticamente por IA',
      url_imagen: 'https://i.pinimg.com/736x/a9/2d/33/a92d33cf101c771ce94a118ae5ce0a81.jpg',
      activo: false,
      tipo: 'ia'
    }
  ]);

  const handleToggleActive = (id, currentStatus) => {
    console.log(`Toggle carrusel ${id} a ${!currentStatus}`);
    // TODO: Implementar toggle
  };

  const handleEditCarousel = (carousel) => {
    console.log('Editar carrusel:', carousel);
    // TODO: Abrir modal de edición
  };

  const handleDeleteCarousel = (id) => {
    if (window.confirm('¿Eliminar este carrusel?')) {
      console.log('Eliminar carrusel:', id);
      // TODO: Implementar eliminación
    }
  };

  const handleCreateCarousel = () => {
    console.log('Crear nuevo carrusel');
    // TODO: Abrir modal de creación
  };

  return (
    <div className="carousel-manager-container">
      <div className="manager-header">
        <h2>🎨 Gestión de Carruseles</h2>
        <button className="btn-create-carousel" onClick={handleCreateCarousel}>
          ➕ Crear Carrusel
        </button>
      </div>

      <div className="carousels-stats">
        <div className="stat-box">
          <span className="stat-value">{carousels.length}</span>
          <span className="stat-label">Total Carruseles</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{carousels.filter(c => c.activo).length}</span>
          <span className="stat-label">Activos</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{carousels.filter(c => c.tipo === 'ia').length}</span>
          <span className="stat-label">Generados por IA</span>
        </div>
      </div>

      <div className="carousels-grid">
        {carousels.map(carousel => (
          <div key={carousel.carrusel_id} className={`carousel-card ${carousel.activo ? 'active' : 'inactive'}`}>
            {/* Vista Previa de Imagen */}
            <div className="carousel-preview">
              <img 
                src={carousel.url_imagen} 
                alt={carousel.titulo}
                className="carousel-image"
              />
              <div className="carousel-overlay">
                <h3 className="carousel-title">{carousel.titulo}</h3>
                <p className="carousel-desc">{carousel.descripcion}</p>
              </div>
              
              {/* Badges */}
              <div className="carousel-badges">
                <span className={`type-badge ${carousel.tipo}`}>
                  {carousel.tipo === 'ia' ? '🤖 IA' : '✏️ Manual'}
                </span>
                <span className={`status-badge ${carousel.activo ? 'active' : 'inactive'}`}>
                  {carousel.activo ? '✅ Activo' : '⏸️ Inactivo'}
                </span>
              </div>
            </div>

            {/* Acciones */}
            <div className="carousel-actions">
              <button 
                className={`btn-toggle ${carousel.activo ? 'deactivate' : 'activate'}`}
                onClick={() => handleToggleActive(carousel.carrusel_id, carousel.activo)}
              >
                {carousel.activo ? '⏸️ Desactivar' : '▶️ Activar'}
              </button>
              <button 
                className="btn-edit"
                onClick={() => handleEditCarousel(carousel)}
              >
                ✏️ Editar
              </button>
              <button 
                className="btn-delete"
                onClick={() => handleDeleteCarousel(carousel.carrusel_id)}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Información sobre Carruseles de IA */}
      <div className="carousel-info">
        <span className="info-icon">🤖</span>
        <div className="info-content">
          <h4 className="info-title">Carruseles Generados por IA</h4>
          <p className="info-text">
            La IA genera automáticamente sugerencias de carruseles basadas en tendencias y análisis de inventario. 
            Puedes aprobar, editar o rechazar estas sugerencias desde la sección de <strong>Reportes IA</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CarouselManager;

/* 
CSS ESPECIFICACIONES (CarouselManager.css):
- .carousel-manager-container: display flex, flex-direction column, gap 25px
- .manager-header: display flex, justify-content space-between, align-items center
- .manager-header h2: margin 0, font-size 22px, color #2c3e50
- .btn-create-carousel: padding 10px 20px, background #27ae60, color white, border none, border-radius 6px, cursor pointer, font-size 14px, font-weight 600
- .btn-create-carousel:hover: background #229954
- .carousels-stats: display grid, grid-template-columns repeat(3, 1fr), gap 15px, padding 20px, background #f8f9fa, border-radius 8px
- .stat-box: text-align center
- .stat-value: display block, font-size 28px, font-weight bold, color #2c3e50, margin-bottom 5px
- .stat-label: display block, font-size 13px, color #7f8c8d
- .carousels-grid: display grid, grid-template-columns repeat(auto-fill, minmax(320px, 1fr)), gap 20px
- .carousel-card: background white, border 2px solid #ecf0f1, border-radius 10px, overflow hidden, transition all 0.3s
- .carousel-card.active: border-color #27ae60
- .carousel-card.inactive: opacity 0.7
- .carousel-card:hover: transform translateY(-4px), box-shadow 0 6px 20px rgba(0,0,0,0.1)
- .carousel-preview: position relative, height 200px, overflow hidden
- .carousel-image: width 100%, height 100%, object-fit cover
- .carousel-overlay: position absolute, bottom 0, left 0, right 0, background linear-gradient(to top, rgba(0,0,0,0.8), transparent), padding 20px, color white
- .carousel-title: margin 0 0 5px 0, font-size 18px, font-weight 600
- .carousel-desc: margin 0, font-size 13px, opacity 0.9
- .carousel-badges: position absolute, top 10px, right 10px, display flex, flex-direction column, gap 5px
- .type-badge, .status-badge: padding 4px 12px, border-radius 12px, font-size 11px, font-weight 600, backdrop-filter blur(10px)
- .type-badge.ia: background rgba(155, 89, 182, 0.9), color white
- .type-badge.manual: background rgba(52, 152, 219, 0.9), color white
- .status-badge.active: background rgba(39, 174, 96, 0.9), color white
- .status-badge.inactive: background rgba(149, 165, 166, 0.9), color white
- .carousel-actions: display flex, gap 8px, padding 15px
- .btn-toggle, .btn-edit, .btn-delete: flex 1, padding 10px, border none, border-radius 6px, cursor pointer, font-size 13px, font-weight 600
- .btn-toggle.activate: background #27ae60, color white
- .btn-toggle.activate:hover: background #229954
- .btn-toggle.deactivate: background #f39c12, color white
- .btn-toggle.deactivate:hover: background #e67e22
- .btn-edit: background #3498db, color white
- .btn-edit:hover: background #2980b9
- .btn-delete: background #e74c3c, color white, flex 0 0 auto, padding 10px 15px
- .btn-delete:hover: background #c0392b
- .carousel-info: background #e8f4f8, border-left 4px solid #3498db, padding 20px, border-radius 8px, display flex, gap 15px, align-items flex-start
- .info-icon: font-size 32px
- .info-content: flex-grow 1
- .info-title: margin 0 0 8px 0, font-size 16px, font-weight 600, color #2c3e50
- .info-text: margin 0, font-size 13px, color #555, line-height 1.6
*/