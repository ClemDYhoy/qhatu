// frontend/src/hooks/useMachineLearning.js
import { useState, useEffect, useCallback } from 'react';
import mlService from '../services/mlService';

/**
 * 🧠 HOOK PERSONALIZADO PARA MACHINE LEARNING
 * 
 * Facilita el uso de IA en componentes React.
 * Maneja estados de carga, errores y caché automáticamente.
 * 
 * @version 1.0.0
 */

export const useMachineLearning = () => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [healthStatus, setHealthStatus] = useState(null);

  // ====================================
  // 🔍 VERIFICAR DISPONIBILIDAD
  // ====================================

  const checkAvailability = useCallback(async () => {
    try {
      const health = await mlService.healthCheck();
      setIsAvailable(health.success && health.status === 'healthy');
      setHealthStatus(health);
      return health;
    } catch (error) {
      setIsAvailable(false);
      setHealthStatus({ status: 'unhealthy', error: error.message });
      return null;
    }
  }, []);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  return {
    isAvailable,
    healthStatus,
    checkAvailability,
    
    // ====================================
    // 🎯 FUNCIONES PRINCIPALES
    // ====================================

    /**
     * Obtener segmento del cliente (K-Means)
     */
    useSegmento: (usuarioId) => {
      const [segmento, setSegmento] = useState(null);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);

      const fetchSegmento = useCallback(async (useCache = true) => {
        if (!usuarioId) return;

        setLoading(true);
        setError(null);

        try {
          const result = await mlService.obtenerSegmentoCliente(usuarioId, useCache);
          
          if (result.success) {
            setSegmento(result.data);
          } else {
            throw new Error(result.error);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }, [usuarioId]);

      useEffect(() => {
        fetchSegmento();
      }, [fetchSegmento]);

      return { segmento, loading, error, refetch: fetchSegmento };
    },

    /**
     * Obtener probabilidad de cierre (Regresión)
     */
    useProbabilidad: (usuarioId) => {
      const [probabilidad, setProbabilidad] = useState(null);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);

      const fetchProbabilidad = useCallback(async (useCache = true) => {
        if (!usuarioId) return;

        setLoading(true);
        setError(null);

        try {
          const result = await mlService.obtenerProbabilidadCierre(usuarioId, useCache);
          
          if (result.success) {
            setProbabilidad(result.data);
          } else {
            throw new Error(result.error);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }, [usuarioId]);

      useEffect(() => {
        fetchProbabilidad();
      }, [fetchProbabilidad]);

      return { probabilidad, loading, error, refetch: fetchProbabilidad };
    },

    /**
     * Obtener recomendaciones (Cosine Similarity)
     */
    useRecomendaciones: (ventaId) => {
      const [recomendaciones, setRecomendaciones] = useState(null);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);

      const fetchRecomendaciones = useCallback(async (useCache = true) => {
        if (!ventaId) return;

        setLoading(true);
        setError(null);

        try {
          const result = await mlService.obtenerRecomendacionesProductos(ventaId, useCache);
          
          if (result.success) {
            setRecomendaciones(result.data);
          } else {
            throw new Error(result.error);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }, [ventaId]);

      useEffect(() => {
        fetchRecomendaciones();
      }, [fetchRecomendaciones]);

      return { recomendaciones, loading, error, refetch: fetchRecomendaciones };
    },

    /**
     * Obtener análisis completo (3 algoritmos)
     * ⭐ MÉTODO PRINCIPAL - USA ESTE
     */
    useAnalisisCompleto: (ventaId, usuarioId) => {
      const [analisis, setAnalisis] = useState(null);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);

      const fetchAnalisis = useCallback(async (useCache = true) => {
        if (!ventaId || !usuarioId) return;

        setLoading(true);
        setError(null);

        try {
          const result = await mlService.obtenerAnalisisCompleto(ventaId, usuarioId, useCache);
          
          if (result.success) {
            setAnalisis(result.data);
          } else {
            throw new Error(result.error);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }, [ventaId, usuarioId]);

      useEffect(() => {
        fetchAnalisis();
      }, [fetchAnalisis]);

      return { analisis, loading, error, refetch: fetchAnalisis };
    },

    // ====================================
    // 🛠️ UTILIDADES
    // ====================================

    limpiarCache: () => {
      return mlService.limpiarCache();
    },

    invalidarUsuario: (usuarioId) => {
      return mlService.invalidarCacheUsuario(usuarioId);
    },

    invalidarVenta: (ventaId) => {
      return mlService.invalidarCacheVenta(ventaId);
    },

    obtenerEstadisticasCache: () => {
      return mlService.obtenerEstadisticasCache();
    }
  };
};

export default useMachineLearning;