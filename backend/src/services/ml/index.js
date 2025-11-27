// backend/src/services/ml/index.js

/**
 * 📦 ÍNDICE DE SERVICIOS ML
 * 
 * Exporta todos los servicios y utilidades de Machine Learning.
 * Punto único de entrada para usar ML en la aplicación.
 * 
 * @version 1.0.0
 */

// Servicios principales
export { default as mlRecommendationService } from './mlRecommendationService.js';
export { default as mlDataService } from './mlDataService.js';
export { default as mlCacheService } from './mlCacheService.js';

// Utilidades
export { default as mlConfig } from './mlConfig.js';
export { default as mlValidators, MLValidationError } from './mlValidators.js';
export { default as mlFormatters } from './mlFormatters.js';

// Constantes
export {
  KMEANS_CONFIG,
  COSINE_CONFIG,
  REGRESSION_CONFIG,
  CACHE_CONFIG,
  WHATSAPP_CONFIG,
  PRIORITY_CONFIG,
  NORMALIZATION_CONFIG,
  FORMULAS,
  METRICS_CONFIG,
  VALIDATION_LIMITS,
  DEV_CONFIG
} from './mlConstants.js';

// Export por defecto (conveniencia)
import mlRecommendationService from './mlRecommendationService.js';
export default mlRecommendationService;