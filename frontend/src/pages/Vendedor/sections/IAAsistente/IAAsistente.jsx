import React, { useState, useEffect } from 'react';

/**
 * 🧠 PANEL DE INTELIGENCIA ARTIFICIAL - VERSION DEBUG
 * 
 * Props requeridas:
 * - ventaId: ID de la venta (puede venir como venta_id, id, ventaId)
 * - usuarioId: ID del usuario (puede venir como usuario_id, clienteId, usuarioId)
 */

const IntelligencePanel = ({ ventaId, venta_id, usuarioId, usuario_id, clienteId, venta }) => {
  const [analisis, setAnalisis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  // 🔧 Normalizar IDs de diferentes fuentes
  const ventaIdNormalizado = ventaId || venta_id || venta?.id || venta?.venta_id;
  const usuarioIdNormalizado = usuarioId || usuario_id || clienteId || venta?.usuario_id || venta?.cliente_id;

  useEffect(() => {
    // Debug: Mostrar qué props recibimos
    const propsRecibidas = {
      ventaId,
      venta_id,
      usuarioId,
      usuario_id,
      clienteId,
      venta: venta ? 'objeto presente' : 'no presente',
      ventaIdNormalizado,
      usuarioIdNormalizado
    };
    
    console.log('🔍 Props recibidas en IntelligencePanel:', propsRecibidas);
    setDebugInfo(propsRecibidas);

    if (ventaIdNormalizado && usuarioIdNormalizado) {
      cargarAnalisis();
    }
  }, [ventaIdNormalizado, usuarioIdNormalizado]);

  const cargarAnalisis = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🎯 Cargando análisis ML para venta ${ventaIdNormalizado}, usuario ${usuarioIdNormalizado}`);
      
      // Simular llamada a API
      const mockAnalisis = {
        analisis: {
          segmentoCliente: {
            segmento: 'VIP',
            icono: '👑',
            score: 850,
            caracteristicas: {
              totalCompras: 45,
              gastoTotal: 'S/ 12,500',
              diasInactivo: 5,
              ticketPromedio: 'S/ 278'
            },
            descripcion: 'Cliente de alto valor con excelente historial de compras'
          },
          probabilidadCierre: {
            probabilidad: 85,
            confianza: 'ALTA',
            prioridad: {
              nivel: 'ALTA',
              accion: 'Contactar dentro de las próximas 2 horas'
            },
            factores: [
              { tipo: 'positivo', impacto: '+15%', descripcion: 'Cliente recurrente' },
              { tipo: 'positivo', impacto: '+10%', descripcion: 'Horario preferido' }
            ],
            historial: {
              totalVentas: 45,
              confirmadas: 40,
              tasaConfirmacion: '88.9%'
            }
          },
          recomendacionesProductos: {
            totalRecomendaciones: 3,
            recomendaciones: [
              {
                producto_nombre: 'Chocolate Sublime',
                precio: 'S/ 2.50',
                similitud: 92,
                razon: 'Frecuentemente comprado con productos similares',
                badge: { text: 'Popular', color: 'green' }
              }
            ],
            resumen: {
              totalAdicional: 'S/ 45.00',
              promedioSimilitud: '89%'
            },
            mensaje: 'Excelente oportunidad para upselling'
          }
        },
        resumen: {
          prioridad: 'ALTA',
          segmento: 'VIP',
          probabilidadPorcentaje: '85%',
          potencialUpsellMonto: 'S/ 45.00',
          accionRecomendada: 'Contactar cliente en las próximas 2 horas con ofertas personalizadas'
        },
        metadata: {
          algoritmos: ['K-Means', 'Regresión Logística', 'Similitud Coseno'],
          version: '1.0.0',
          generadoEn: new Date().toISOString()
        }
      };

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAnalisis(mockAnalisis);
      console.log('✅ Análisis ML cargado:', mockAnalisis);
      
    } catch (err) {
      console.error('❌ Error cargando análisis ML:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ====================================
  // 🎨 COMPONENTES DE VISUALIZACIÓN
  // ====================================

  const SegmentoCard = ({ segmento }) => {
    if (!segmento) return null;

    const colorClass = {
      VIP: 'bg-red-100 border-red-500 text-red-900',
      MEDIO: 'bg-yellow-100 border-yellow-500 text-yellow-900',
      NUEVO: 'bg-green-100 border-green-500 text-green-900'
    }[segmento.segmento] || 'bg-gray-100 border-gray-500 text-gray-900';

    return (
      <div className={`p-6 rounded-lg border-2 ${colorClass}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">📊 Segmento del Cliente</h3>
          <span className="text-3xl">{segmento.icono}</span>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Clasificación:</span>
            <span className="text-xl font-bold">{segmento.segmento}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-semibold">Score de Fidelidad:</span>
            <span className="text-lg font-bold">{segmento.score} pts</span>
          </div>

          <div className="mt-4 pt-4 border-t border-current border-opacity-20">
            <p className="text-sm font-medium mb-2">📈 Características:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="opacity-75">Compras:</span>
                <span className="font-bold ml-2">{segmento.caracteristicas.totalCompras}</span>
              </div>
              <div>
                <span className="opacity-75">Gasto:</span>
                <span className="font-bold ml-2">{segmento.caracteristicas.gastoTotal}</span>
              </div>
              <div>
                <span className="opacity-75">Inactivo:</span>
                <span className="font-bold ml-2">{segmento.caracteristicas.diasInactivo}d</span>
              </div>
              <div>
                <span className="opacity-75">Ticket:</span>
                <span className="font-bold ml-2">{segmento.caracteristicas.ticketPromedio}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-current border-opacity-20">
            <p className="text-xs opacity-75">{segmento.descripcion}</p>
          </div>
        </div>
      </div>
    );
  };

  const ProbabilidadCard = ({ probabilidad }) => {
    if (!probabilidad) return null;

    const getColorByProb = (prob) => {
      if (prob >= 80) return 'bg-green-500';
      if (prob >= 60) return 'bg-yellow-500';
      return 'bg-red-500';
    };

    const getPrioridadColor = (nivel) => {
      if (nivel === 'ALTA') return 'text-red-700 bg-red-100 border-red-500';
      if (nivel === 'MEDIA') return 'text-yellow-700 bg-yellow-100 border-yellow-500';
      return 'text-green-700 bg-green-100 border-green-500';
    };

    return (
      <div className="p-6 rounded-lg border-2 border-blue-500 bg-blue-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-blue-900">🎯 Probabilidad de Cierre</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getPrioridadColor(probabilidad.prioridad.nivel)}`}>
            {probabilidad.prioridad.nivel}
          </span>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-900 mb-2">
              {probabilidad.probabilidad}%
            </div>
            <p className="text-sm text-blue-700">
              Confianza: {probabilidad.confianza.replace(/_/g, ' ')}
            </p>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${getColorByProb(probabilidad.probabilidad)}`}
              style={{ width: `${probabilidad.probabilidad}%` }}
            />
          </div>

          <div className="pt-4 border-t border-blue-300">
            <p className="text-xs font-semibold text-blue-900 mb-2">🎬 Acción Recomendada:</p>
            <p className="text-sm text-blue-800">{probabilidad.prioridad.accion}</p>
          </div>

          {probabilidad.factores && probabilidad.factores.length > 0 && (
            <div className="pt-4 border-t border-blue-300">
              <p className="text-xs font-semibold text-blue-900 mb-2">📊 Factores:</p>
              <div className="space-y-2">
                {probabilidad.factores.slice(0, 3).map((factor, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded ${
                      factor.tipo === 'positivo' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    }`}>
                      {factor.impacto}
                    </span>
                    <span className="text-blue-900">{factor.descripcion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const RecomendacionesCard = ({ recomendaciones }) => {
    if (!recomendaciones?.recomendaciones?.length) {
      return (
        <div className="p-6 rounded-lg border-2 border-purple-500 bg-purple-50">
          <h3 className="text-lg font-bold text-purple-900 mb-4">✨ Recomendaciones</h3>
          <p className="text-sm text-purple-700">No hay recomendaciones disponibles</p>
        </div>
      );
    }

    return (
      <div className="p-6 rounded-lg border-2 border-purple-500 bg-purple-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-purple-900">✨ Recomendaciones de Productos</h3>
          <span className="bg-purple-200 text-purple-900 px-3 py-1 rounded-full text-xs font-bold">
            {recomendaciones.totalRecomendaciones} sugerencias
          </span>
        </div>

        <div className="space-y-3">
          {recomendaciones.recomendaciones.map((rec, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-purple-900">{rec.producto_nombre}</h4>
                  <p className="text-xs text-purple-700 mt-1">{rec.razon}</p>
                </div>
                <span className="text-lg font-bold text-purple-900 ml-4">{rec.precio}</span>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-purple-200 rounded-full h-2">
                    <div 
                      className="h-full bg-purple-600 rounded-full"
                      style={{ width: `${rec.similitud}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-purple-900">{rec.similitud}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ====================================
  // 🎨 RENDER PRINCIPAL
  // ====================================

  if (!ventaIdNormalizado || !usuarioIdNormalizado) {
    return (
      <div className="p-8 bg-yellow-50 border-2 border-yellow-500 rounded-lg">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-yellow-900 mb-2">⚠️ Faltan datos para cargar el análisis de IA</h3>
          <p className="text-sm text-yellow-700 mb-4">Verifica que estés pasando correctamente las props al componente</p>
        </div>
        
        <div className="bg-white p-4 rounded border border-yellow-300">
          <p className="text-xs font-bold text-gray-700 mb-2">🔍 Debug - Props recibidas:</p>
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
{JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-300 rounded">
          <p className="text-xs font-bold text-blue-900 mb-2">💡 Solución:</p>
          <p className="text-xs text-blue-800">
            Asegúrate de pasar las props así:<br/>
            <code className="bg-blue-100 px-2 py-1 rounded mt-1 inline-block">
              &lt;IntelligencePanel ventaId={"{venta.id}"} usuarioId={"{venta.usuario_id}"} /&gt;
            </code>
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-semibold text-gray-700">🧠 Analizando con IA...</p>
        <p className="text-sm text-gray-600 mt-2">Ejecutando 3 algoritmos de Machine Learning</p>
        <p className="text-xs text-gray-500 mt-2">Venta: {ventaIdNormalizado} | Usuario: {usuarioIdNormalizado}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border-2 border-red-500 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">⚠️</span>
          <div>
            <h3 className="text-lg font-bold text-red-900">Error al cargar análisis de IA</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
        <button
          onClick={cargarAnalisis}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          🔄 Reintentar
        </button>
      </div>
    );
  }

  if (!analisis?.analisis) {
    return (
      <div className="p-8 text-center bg-gray-100 rounded-lg">
        <p className="text-gray-600">📭 No hay datos de IA disponibles</p>
        <button
          onClick={cargarAnalisis}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Cargar Análisis
        </button>
      </div>
    );
  }

  const { segmentoCliente, probabilidadCierre, recomendacionesProductos } = analisis.analisis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🧠 Inteligencia Artificial</h2>
            <p className="text-sm opacity-90">Análisis predictivo en tiempo real</p>
          </div>
          <button
            onClick={cargarAnalisis}
            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Grid de análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SegmentoCard segmento={segmentoCliente} />
        <ProbabilidadCard probabilidad={probabilidadCierre} />
      </div>

      {/* Recomendaciones */}
      <RecomendacionesCard recomendaciones={recomendacionesProductos} />

      {/* Resumen ejecutivo */}
      {analisis.resumen && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-indigo-900 mb-4">📊 Resumen Ejecutivo</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Prioridad</p>
              <p className={`text-2xl font-bold ${
                analisis.resumen.prioridad === 'ALTA' ? 'text-red-600' :
                analisis.resumen.prioridad === 'MEDIA' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {analisis.resumen.prioridad}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Segmento</p>
              <p className="text-2xl font-bold text-indigo-900">{analisis.resumen.segmento}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Probabilidad</p>
              <p className="text-2xl font-bold text-blue-600">{analisis.resumen.probabilidadPorcentaje}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Upsell</p>
              <p className="text-2xl font-bold text-green-600">{analisis.resumen.potencialUpsellMonto}</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>💡 Acción recomendada:</strong> {analisis.resumen.accionRecomendada}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligencePanel;