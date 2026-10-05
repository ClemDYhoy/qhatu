// C:\qhatu\frontend\src\main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import authService from './services/authService';
import './styles/global.css';

console.log('🚀 Iniciando Qhatu Frontend...');

// ============================================
// Diagnóstico: captura global de errores
// Todo error aparecerá en consola con el prefijo [QHATU ERROR].
// Abre DevTools (F12) → pestaña "Console" para verlos.
// ============================================
window.addEventListener('error', (event) => {
  const target = event.target;

  // Errores de carga de recursos (imagen, script, iframe): se avisa con la URL.
  if (target && target !== window && ['IMG', 'SCRIPT', 'LINK', 'IFRAME'].includes(target.tagName)) {
    const url = target.src || target.href || '';
    // El bloqueo de Google Maps suele ser un adblock; se informa como aviso.
    console.warn(`[QHATU] No se pudo cargar ${target.tagName}: ${url}`);
    return;
  }

  // Eventos sin mensaje (ruido) se ignoran.
  if (!event.message) return;

  const where = event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : '';
  console.error('[QHATU ERROR]', event.message, where, event.error || '');
}, true);

window.addEventListener('unhandledrejection', (event) => {
  console.error('[QHATU ERROR] Promesa rechazada:', event.reason);
});

// Google Client ID desde .env
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

if (!GOOGLE_CLIENT_ID) {
  console.warn('⚠️ VITE_GOOGLE_CLIENT_ID no configurado en .env');
}

// Inicializar autenticación (configurar headers con token si existe)
authService.initializeAuth();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

console.log('✅ App renderizada correctamente');