import dotenv from 'dotenv';
import { testConnection } from './src/config/database.js';

dotenv.config();

console.log('🔍 Probando conexión a la base de datos...');
await testConnection();