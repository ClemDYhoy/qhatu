// src/config/env.js
// Validación centralizada de variables de entorno.
// Falla rápido en producción ante configuración insegura o incompleta.

import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = (process.env.NODE_ENV || 'development') === 'production';

const WEAK_PATTERNS = [
  /cambia_esto/i,
  /cambiar_en_produccion/i,
  /tu_super_secreto/i,
  /tu_google/i,
  /^tu_/i,
  /secret/i,
  /^qhatu-secret$/i
];

const isWeakSecret = (value) => {
  if (!value || value.length < 32) return true;
  return WEAK_PATTERNS.some((pattern) => pattern.test(value));
};

/**
 * Valida las variables de entorno necesarias.
 * - En producción: lanza error si falta algo obligatorio o si un secreto es débil.
 * - En desarrollo: genera secretos temporales para no bloquear el arranque y avisa.
 */
export const validateEnv = () => {
  const errors = [];
  const warnings = [];

  const requiredAlways = ['DB_HOST', 'DB_USER', 'DB_NAME', 'FRONTEND_URL'];
  const requiredInProduction = ['DB_PASSWORD', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];

  requiredAlways.forEach((key) => {
    if (!process.env[key] || !String(process.env[key]).trim()) {
      errors.push(`${key} es obligatorio`);
    }
  });

  if (isProduction) {
    requiredInProduction.forEach((key) => {
      if (!process.env[key] || !String(process.env[key]).trim()) {
        errors.push(`${key} es obligatorio en producción`);
      }
    });
  }

  ['JWT_SECRET', 'COOKIE_SECRET'].forEach((key) => {
    const value = process.env[key];

    if (!value || !value.trim()) {
      if (isProduction) {
        errors.push(`${key} es obligatorio`);
      } else {
        process.env[key] = crypto.randomBytes(48).toString('hex');
        warnings.push(
          `${key} no estaba definido; se generó uno temporal para desarrollo ` +
          `(las sesiones se invalidarán al reiniciar). Añádelo a tu .env.`
        );
      }
    } else if (isWeakSecret(value)) {
      if (isProduction) {
        errors.push(`${key} parece débil o de ejemplo; usa un valor aleatorio largo`);
      } else {
        warnings.push(`${key} parece débil o de ejemplo; cámbialo antes de producción`);
      }
    }
  });

  warnings.forEach((warning) => console.warn(`⚠️  [env] ${warning}`));

  if (errors.length > 0) {
    console.error('\n❌ Configuración de entorno inválida:\n');
    errors.forEach((error) => console.error(`   - ${error}`));
    console.error('\n💡 Revisa tu archivo .env (guíate por .env.example).\n');
    throw new Error('Configuración de entorno inválida');
  }

  return true;
};

export { isProduction };
