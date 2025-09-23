import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Asegura que BASE_URL sea correcto
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});