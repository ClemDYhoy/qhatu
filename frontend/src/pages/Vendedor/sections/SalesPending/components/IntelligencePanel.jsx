// frontend/src/pages/Vendedor/sections/SalesPending/components/IntelligencePanel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import mlService from '../../../../../services/mlService';


/**
 * 🧠 PANEL DE INTELIGENCIA ARTIFICIAL
 * 
 * Panel completo de análisis ML para ventas pendientes:
 * - Segmentación de clientes (K-Means)
 * - Probabilidad de cierre (Regresión Logística)
 * - Recomendaciones de productos (Similitud Coseno)
 * 
 * @param {number} ventaId - ID de la venta pendiente
 * @param {number} usuarioId - ID del usuario/cliente
 * @version 2.0.0 - PRODUCCIÓN
 */

const IntelligencePanel = ({ ventaId, venta_id, usuarioId, usuario_id, clienteId, venta }) => {
  // ====================================
  // 📊 ESTADOS
  // ====================================
  const [analisis, setAnalisis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);

  // 🔧 Normalizar IDs de múltiples fuentes posibles
  const ventaIdFinal = ventaId || venta_id || venta?.id || venta?.venta_id;
  const usuarioIdFinal = usuarioId || usuario_id || clienteId || venta?.usuario_id || venta?.cliente_id;

  // ====================================
  // 🎯 CARGAR ANÁLISIS ML
  // ====================================
  const cargarAnalisis = useCallback(async (forceRefresh = false) => {
    // Validación de IDs
    if (!ventaIdFinal || !usuarioIdFinal) {
      console.warn('⚠️ IntelligencePanel: Faltan IDs necesarios', {
        ventaIdFinal,
        usuarioIdFinal
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`🎯 Cargando análisis ML para venta ${ventaIdFinal}, usuario ${usuarioIdFinal}`);
      
      const resultado = await mlService.obtenerAnalisisCompleto(
        ventaIdFinal, 
        usuarioIdFinal, 
        !forceRefresh // useCache
      );

      if (resultado.success && resultado.data) {
        setAnalisis(resultado.data);
        setLastUpdate(new Date());
        setRetryCount(0);
        
        console.log('✅ Análisis ML cargado exitosamente:', {
          segmento: resultado.data.analisis?.segmentoCliente?.segmento,
          probabilidad: resultado.data.analisis?.probabilidadCierre?.probabilidad,
          recomendaciones: resultado.data.analisis?.recomendacionesProductos?.totalRecomendaciones
        });
      } else {
        throw new Error(resultado.error || 'No se pudo cargar el análisis');
      }
    } catch (err) {
      console.error('❌ Error cargando análisis ML:', err);
      setError(err.message || 'Error al cargar análisis de IA');
      
      // Auto-retry con backoff exponencial (máximo 3 intentos)
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`🔄 Reintentando en ${delay/1000}s... (intento ${retryCount + 1}/3)`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          cargarAnalisis(forceRefresh);
        }, delay);
      }
    } finally {
      setLoading(false);
    }
  }, [ventaIdFinal, usuarioIdFinal, retryCount]);

  // ====================================
  // 🔄 EFECTOS
  // ====================================
  useEffect(() => {
    if (ventaIdFinal && usuarioIdFinal) {
      cargarAnalisis();
    }
  }, [ventaIdFinal, usuarioIdFinal]);

  // ====================================
  // 🎨 COMPONENTES DE VISUALIZACIÓN
  // ====================================

  /**
   * Tarjeta de Segmento del Cliente (K-Means)
   */
  const SegmentoCard = ({ segmento }) => {
    if (!segmento) return null;

    const colorClasses = {
      VIP: 'segmento-vip',
      MEDIO: 'segmento-medio',
      NUEVO: 'segmento-nuevo'
    };

    return (
      <div className={`ia-card segmento-card ${colorClasses[segmento.segmento] || 'segmento-default'}`}>
        <div className="ia-card-header">
          <h3 className="ia-card-title">
            <span className="ia-icon">📊</span>
            Segmento del Cliente
          </h3>
          <span className="segmento-icon-large">{segmento.icono}</span>
        </div>
        
        <div className="ia-card-body">
          <div className="segmento-main">
            <div className="segmento-label">Clasificación</div>
            <div className="segmento-value">{segmento.segmento}</div>
          </div>
          
          <div className="segmento-score">
            <div className="score-label">Score de Fidelidad</div>
            <div className="score-value">{segmento.score} pts</div>
          </div>

          {segmento.caracteristicas && (
            <div className="segmento-caracteristicas">
              <div className="caracteristica-titulo">📈 Características</div>
              <div className="caracteristicas-grid">
                <div className="caracteristica-item">
                  <span className="caracteristica-label">Compras</span>
                  <span className="caracteristica-valor">{segmento.caracteristicas.totalCompras}</span>
                </div>
                <div className="caracteristica-item">
                  <span className="caracteristica-label">Gasto</span>
                  <span className="caracteristica-valor">{segmento.caracteristicas.gastoTotal}</span>
                </div>
                <div className="caracteristica-item">
                  <span className="caracteristica-label">Inactivo</span>
                  <span className="caracteristica-valor">{segmento.caracteristicas.diasInactivo}d</span>
                </div>
                <div className="caracteristica-item">
                  <span className="caracteristica-label">Ticket</span>
                  <span className="caracteristica-valor">{segmento.caracteristicas.ticketPromedio}</span>
                </div>
              </div>
            </div>
          )}

          {segmento.descripcion && (
            <div className="segmento-descripcion">
              {segmento.descripcion}
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Tarjeta de Probabilidad de Cierre (Regresión)
   */
  const ProbabilidadCard = ({ probabilidad }) => {
    if (!probabilidad) return null;

    const getColorClass = (prob) => {
      if (prob >= 80) return 'prob-alta';
      if (prob >= 60) return 'prob-media';
      return 'prob-baja';
    };

    const getPrioridadClass = (nivel) => {
      const classes = {
        'ALTA': 'prioridad-alta',
        'MEDIA': 'prioridad-media',
        'BAJA': 'prioridad-baja'
      };
      return classes[nivel] || 'prioridad-baja';
    };

    return (
      <div className="ia-card probabilidad-card">
        <div className="ia-card-header">
          <h3 className="ia-card-title">
            <span className="ia-icon">🎯</span>
            Probabilidad de Cierre
          </h3>
          <span className={`prioridad-badge ${getPrioridadClass(probabilidad.prioridad?.nivel)}`}>
            {probabilidad.prioridad?.nivel || 'N/A'}
          </span>
        </div>

        <div className="ia-card-body">
          <div className="probabilidad-main">
            <div className={`probabilidad-value ${getColorClass(probabilidad.probabilidad)}`}>
              {probabilidad.probabilidad}%
            </div>
            <div className="probabilidad-confianza">
              Confianza: {probabilidad.confianza?.replace(/_/g, ' ') || 'N/A'}
            </div>
          </div>

          <div className="probabilidad-barra">
            <div 
              className={`probabilidad-fill ${getColorClass(probabilidad.probabilidad)}`}
              style={{ width: `${probabilidad.probabilidad}%` }}
            >
              <span className="probabilidad-fill-text">{probabilidad.probabilidad}%</span>
            </div>
          </div>

          {probabilidad.prioridad?.accion && (
            <div className="probabilidad-accion">
              <div className="accion-titulo">🎬 Acción Recomendada</div>
              <div className="accion-texto">{probabilidad.prioridad.accion}</div>
            </div>
          )}

          {probabilidad.factores && probabilidad.factores.length > 0 && (
            <div className="probabilidad-factores">
              <div className="factores-titulo">📊 Factores de Influencia</div>
              <div className="factores-lista">
                {probabilidad.factores.slice(0, 3).map((factor, i) => (
                  <div key={i} className="factor-item">
                    <span className={`factor-badge factor-${factor.tipo}`}>
                      {factor.impacto}
                    </span>
                    <span className="factor-descripcion">{factor.descripcion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {probabilidad.historial && (
            <div className="probabilidad-historial">
              <div className="historial-titulo">📋 Historial</div>
              <div className="historial-datos">
                <div className="historial-item">
                  <span className="historial-label">Ventas:</span>
                  <span className="historial-valor">{probabilidad.historial.totalVentas}</span>
                </div>
                <div className="historial-item">
                  <span className="historial-label">Confirmadas:</span>
                  <span className="historial-valor">{probabilidad.historial.confirmadas}</span>
                </div>
                <div className="historial-item">
                  <span className="historial-label">Tasa:</span>
                  <span className="historial-valor">{probabilidad.historial.tasaConfirmacion}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Tarjeta de Recomendaciones (Cosine Similarity)
   */
  const RecomendacionesCard = ({ recomendaciones }) => {
    if (!recomendaciones?.recomendaciones?.length) {
      return (
        <div className="ia-card recomendaciones-card">
          <div className="ia-card-header">
            <h3 className="ia-card-title">
              <span className="ia-icon">✨</span>
              Recomendaciones de Productos
            </h3>
          </div>
          <div className="ia-card-body">
            <div className="recomendaciones-empty">
              <span className="empty-icon">📭</span>
              <p className="empty-text">No hay recomendaciones disponibles</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="ia-card recomendaciones-card">
        <div className="ia-card-header">
          <h3 className="ia-card-title">
            <span className="ia-icon">✨</span>
            Recomendaciones de Productos
          </h3>
          <span className="recomendaciones-count">
            {recomendaciones.totalRecomendaciones} sugerencias
          </span>
        </div>

        <div className="ia-card-body">
          <div className="recomendaciones-lista">
            {recomendaciones.recomendaciones.slice(0, 5).map((rec, index) => (
              <div key={index} className="recomendacion-item">
                <div className="recomendacion-contenido">
                  <div className="recomendacion-header">
                    <h4 className="recomendacion-nombre">{rec.producto_nombre}</h4>
                    <span className="recomendacion-precio">{rec.precio}</span>
                  </div>
                  <p className="recomendacion-razon">{rec.razon}</p>
                  
                  <div className="recomendacion-footer">
                    <div className="similitud-barra-wrapper">
                      <div className="similitud-barra">
                        <div 
                          className="similitud-fill"
                          style={{ width: `${rec.similitud}%` }}
                        />
                      </div>
                      <span className="similitud-valor">{rec.similitud}%</span>
                    </div>
                    
                    {rec.badge && (
                      <span className={`recomendacion-badge badge-${rec.badge.color}`}>
                        {rec.badge.text}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {recomendaciones.resumen && (
            <div className="recomendaciones-resumen">
              <div className="resumen-titulo">💰 Potencial de Upsell</div>
              <div className="resumen-contenido">
                <div className="resumen-item">
                  <span className="resumen-label">Total Adicional:</span>
                  <span className="resumen-valor-grande">{recomendaciones.resumen.totalAdicional}</span>
                </div>
                <div className="resumen-item">
                  <span className="resumen-label">Similitud Promedio:</span>
                  <span className="resumen-valor">{recomendaciones.resumen.promedioSimilitud}%</span>
                </div>
              </div>
            </div>
          )}

          {recomendaciones.mensaje && (
            <div className="recomendaciones-mensaje">
              💡 {recomendaciones.mensaje}
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Resumen Ejecutivo
   */
  const ResumenEjecutivo = ({ resumen }) => {
    if (!resumen) return null;

    const getPrioridadColor = (prioridad) => {
      const colores = {
        'ALTA': '#ef4444',
        'MEDIA': '#f59e0b',
        'BAJA': '#10b981'
      };
      return colores[prioridad] || '#6b7280';
    };

    return (
      <div className="ia-card resumen-ejecutivo">
        <div className="ia-card-header">
          <h3 className="ia-card-title">
            <span className="ia-icon">📊</span>
            Resumen Ejecutivo
          </h3>
        </div>

        <div className="ia-card-body">
          <div className="resumen-grid">
            <div className="resumen-metric">
              <div className="metric-label">Prioridad</div>
              <div 
                className="metric-value"
                style={{ color: getPrioridadColor(resumen.prioridad) }}
              >
                {resumen.prioridad}
              </div>
            </div>
            
            <div className="resumen-metric">
              <div className="metric-label">Segmento</div>
              <div className="metric-value">{resumen.segmento}</div>
            </div>
            
            <div className="resumen-metric">
              <div className="metric-label">Probabilidad</div>
              <div className="metric-value">{resumen.probabilidadPorcentaje}</div>
            </div>
            
            <div className="resumen-metric">
              <div className="metric-label">Potencial Upsell</div>
              <div className="metric-value">{resumen.potencialUpsellMonto}</div>
            </div>
          </div>

          {resumen.accionRecomendada && (
            <div className="resumen-accion">
              <strong>💡 Acción recomendada:</strong> {resumen.accionRecomendada}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ====================================
  // 🎨 RENDERS CONDICIONALES
  // ====================================

  // Estado: Sin IDs
  if (!ventaIdFinal || !usuarioIdFinal) {
    return (
      <div className="ia-panel-error">
        <div className="error-icon">⚠️</div>
        <h3 className="error-titulo">Faltan datos para cargar el análisis de IA</h3>
        <p className="error-descripcion">
          Asegúrate de pasar correctamente <code>ventaId</code> y <code>usuarioId</code>
        </p>
        <div className="error-debug">
          <strong>Debug:</strong> ventaId={String(ventaIdFinal)}, usuarioId={String(usuarioIdFinal)}
        </div>
      </div>
    );
  }

  // Estado: Cargando
  if (loading && !analisis) {
    return (
      <div className="ia-panel-loading">
        <div className="loading-spinner" />
        <h3 className="loading-titulo">🧠 Analizando con IA...</h3>
        <p className="loading-descripcion">
          Ejecutando 3 algoritmos de Machine Learning
        </p>
        <div className="loading-details">
          <div className="loading-step">✓ K-Means Clustering</div>
          <div className="loading-step">✓ Regresión Logística</div>
          <div className="loading-step active">⟳ Similitud Coseno</div>
        </div>
      </div>
    );
  }

  // Estado: Error
  if (error && !analisis) {
    return (
      <div className="ia-panel-error">
        <div className="error-icon">❌</div>
        <h3 className="error-titulo">Error al cargar análisis de IA</h3>
        <p className="error-descripcion">{error}</p>
        {retryCount < 3 && (
          <p className="error-retry">Reintentando automáticamente... ({retryCount + 1}/3)</p>
        )}
        <button
          onClick={() => {
            setRetryCount(0);
            cargarAnalisis(true);
          }}
          className="btn-retry"
        >
          🔄 Reintentar ahora
        </button>
      </div>
    );
  }

  // Estado: Sin datos
  if (!analisis?.analisis) {
    return (
      <div className="ia-panel-empty">
        <div className="empty-icon">📭</div>
        <h3 className="empty-titulo">No hay datos de IA disponibles</h3>
        <button
          onClick={() => cargarAnalisis(true)}
          className="btn-cargar"
        >
          🔄 Cargar Análisis
        </button>
      </div>
    );
  }

  const { segmentoCliente, probabilidadCierre, recomendacionesProductos } = analisis.analisis;

  // ====================================
  // 🎨 RENDER PRINCIPAL
  // ====================================
  return (
    <div className="intelligence-panel">
      {/* Header */}
      <div className="ia-panel-header">
        <div className="header-contenido">
          <h2 className="header-titulo">
            <span className="header-icon">🧠</span>
            Inteligencia Artificial
          </h2>
          <p className="header-subtitulo">Análisis predictivo en tiempo real</p>
        </div>
        
        <div className="header-acciones">
          {lastUpdate && (
            <span className="last-update">
              Actualizado: {lastUpdate.toLocaleTimeString('es-PE')}
            </span>
          )}
          <button
            onClick={() => cargarAnalisis(true)}
            className="btn-actualizar"
            disabled={loading}
            title="Actualizar análisis"
          >
            <span className={`refresh-icon ${loading ? 'spinning' : ''}`}>🔄</span>
            Actualizar
          </button>
        </div>
      </div>

      {/* Grid de Análisis */}
      <div className="ia-panel-grid">
        <div className="ia-grid-columna">
          <SegmentoCard segmento={segmentoCliente} />
        </div>
        <div className="ia-grid-columna">
          <ProbabilidadCard probabilidad={probabilidadCierre} />
        </div>
      </div>

      {/* Recomendaciones (ancho completo) */}
      <RecomendacionesCard recomendaciones={recomendacionesProductos} />

      {/* Resumen Ejecutivo */}
      {analisis.resumen && <ResumenEjecutivo resumen={analisis.resumen} />}

      {/* Metadata */}
      {analisis.metadata && (
        <div className="ia-panel-metadata">
          <div className="metadata-item">
            Algoritmos: {analisis.metadata.algoritmos?.join(' • ')}
          </div>
          <div className="metadata-item">
            Versión {analisis.metadata.version} • {new Date(analisis.metadata.generadoEn).toLocaleString('es-PE')}
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligencePanel;