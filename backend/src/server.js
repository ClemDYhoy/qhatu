// src/server.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// ====================================
// 🔧 CONFIGURACIÓN INICIAL
// ====================================

// Cargar variables de entorno PRIMERO
dotenv.config();

// Base de datos
import sequelize from './config/database.js';

// Importar modelos (esto establece las relaciones)
import './models/index.js';

// Rutas
import productRoutes from './routes/products.js';
import carouselRoutes from './routes/carousel.js';
import categoryRoutes from './routes/categories.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import discountBannersRoutes from './routes/discountBanners.js';
import cartRoutes from './routes/cart.js';
import analyticsRoutes from './routes/analytics.js';

// ====================================
// 📊 VARIABLES DE ENTORNO
// ====================================

const app = express();
const PORT = parseInt(process.env.PORT) || 5000;
const ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

console.log(`\n🔧 Configuración:`);
console.log(`   Entorno: ${ENV}`);
console.log(`   Puerto: ${PORT}`);
console.log(`   Frontend: ${FRONTEND_URL}\n`);

// ====================================
// 🛡️ SEGURIDAD - RATE LIMITING
// ====================================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: ENV === 'production' ? 100 : 1000, // Más permisivo en dev
  message: { 
    success: false,
    error: 'Demasiadas solicitudes. Intenta más tarde.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => ENV === 'development' && req.ip === '::1' // Skip localhost en dev
});

// ====================================
// 🔐 MIDDLEWARES DE SEGURIDAD
// ====================================

// Helmet - Headers de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: ENV === 'production' ? undefined : false
}));

// Rate limiter
app.use('/api/', limiter);

// Morgan - Logging de requests
app.use(morgan(ENV === 'development' ? 'dev' : 'combined'));

// CORS - Permitir requests del frontend
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ====================================
// 📦 MIDDLEWARES DE PARSEO
// ====================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ====================================
// 📝 MIDDLEWARE DE LOGGING PERSONALIZADO
// ====================================

if (ENV === 'development') {
  app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
      const resetColor = '\x1b[0m';
      
      console.log(
        `${statusColor}${req.method}${resetColor} ${req.path} - ${statusColor}${res.statusCode}${resetColor} (${duration}ms)`
      );
    });
    
    next();
  });
}

// ====================================
// 🏥 HEALTH CHECKS
// ====================================

// Health check público (sin DB)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: ENV,
    version: '2.0.0'
  });
});

// Health check del API (con DB)
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    
    res.json({
      success: true,
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      version: '2.0.0'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ====================================
// 📚 RUTA RAÍZ - DOCUMENTACIÓN
// ====================================

app.get('/', (req, res) => {
  res.status(200).json({
    message: '🛍️ Qhatu E-commerce API',
    version: '2.0.0',
    status: 'online',
    environment: ENV,
    documentation: 'https://github.com/tu-repo/qhatu-api',
    endpoints: {
      public: {
        health: '/health',
        api_health: '/api/health',
        products: '/api/products',
        categories: '/api/categories',
        carousels: '/api/carousels',
        banners: '/api/banners-descuento/activos'
      },
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        logout: 'POST /api/auth/logout'
      },
      cart: {
        get: 'GET /api/cart',
        add_item: 'POST /api/cart/items',
        update_item: 'PUT /api/cart/items/:id',
        remove_item: 'DELETE /api/cart/items/:id'
      },
      admin: {
        analytics: '/api/analytics/*',
        users: '/api/users/*'
      }
    },
    features: ['auth', 'cart', 'products', 'admin', 'analytics']
  });
});

// ====================================
// 🛣️ RUTAS DEL API
// ====================================

app.use('/api/products', productRoutes);
app.use('/api/carousels', carouselRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/banners-descuento', discountBannersRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/analytics', analyticsRoutes);

// ====================================
// ❌ MANEJO DE ERRORES
// ====================================

// 404 - Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method,
    suggestion: 'Verifica la documentación en GET /',
    available_routes: {
      products: '/api/products',
      categories: '/api/categories',
      auth: '/api/auth/login'
    }
  });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('\n❌ ERROR NO CONTROLADO:');
  console.error('Timestamp:', new Date().toISOString());
  console.error('Mensaje:', err.message);
  console.error('Ruta:', req.originalUrl);
  console.error('Método:', req.method);
  console.error('IP:', req.ip);
  
  if (ENV === 'development') {
    console.error('Stack:', err.stack);
  }

  // Errores específicos de Sequelize
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      success: false,
      error: 'Error de base de datos',
      message: ENV === 'development' ? err.original.message : 'Error al procesar la solicitud'
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }))
    });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Token inválido',
      message: 'Por favor inicia sesión nuevamente'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expirado',
      message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente'
    });
  }

  // Error genérico
  res.status(err.status || 500).json({
    success: false,
    error: 'Error interno del servidor',
    message: ENV === 'development' ? err.message : 'Ocurrió un error inesperado',
    timestamp: new Date().toISOString()
  });
});

// ====================================
// 🚀 FUNCIÓN DE INICIO DEL SERVIDOR
// ====================================

const startServer = async () => {
  try {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   🚀 Iniciando Qhatu Backend v2.0.0   ║');
    console.log('╚════════════════════════════════════════╝\n');

    // 1. Verificar conexión a base de datos
    console.log('📊 Paso 1/4: Conectando a base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL exitosa');
    
    // Obtener versión de MySQL
    const [result] = await sequelize.query('SELECT VERSION() as version');
    console.log(`   Versión MySQL: ${result[0].version}\n`);

    // 2. Verificar que las tablas existen
    console.log('🔍 Paso 2/4: Verificando estructura de base de datos...');
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, {
      replacements: [process.env.DB_NAME || 'qhatu_db']
    });

    const tableNames = tables.map(t => t.TABLE_NAME);
    const requiredTables = [
      'productos', 'categorias', 'usuarios', 'carritos', 
      'carrito_items', 'ventas', 'venta_items', 'roles', 
      'carruseles', 'banners_descuento', 'sesiones_usuario'
    ];

    const missingTables = requiredTables.filter(t => !tableNames.includes(t));

    if (missingTables.length > 0) {
      console.warn('⚠️  ADVERTENCIA: Faltan tablas en la base de datos:');
      missingTables.forEach(table => console.warn(`   - ${table}`));
      console.warn('\n💡 Ejecuta: mysql -u root qhatu_db < db/qhatu_db(3).sql\n');
    } else {
      console.log(`✅ Todas las tablas presentes (${tableNames.length} tablas)\n`);
    }

    // 3. Sincronización de modelos (opcional)
    console.log('🔄 Paso 3/4: Verificando sincronización de modelos...');
    const syncMode = process.env.DB_SYNC_MODE || 'none';
    
    if (ENV === 'development' && syncMode !== 'none') {
      console.warn(`⚠️  Sincronizando en modo "${syncMode}"...`);
      
      const syncOptions = {};
      
      if (syncMode === 'force') {
        console.warn('🔥 MODO FORCE: Recreará todas las tablas');
        console.warn('   Cancelando en 3 segundos... (Ctrl+C para abortar)');
        await new Promise(resolve => setTimeout(resolve, 3000));
        syncOptions.force = true;
      } else if (syncMode === 'alter') {
        console.warn('🔧 MODO ALTER: Modificará tablas existentes');
        syncOptions.alter = true;
      }

      await sequelize.sync(syncOptions);
      console.log(`✅ Modelos sincronizados (${syncMode})\n`);
    } else {
      console.log('✅ Sincronización omitida (DB_SYNC_MODE=none)\n');
    }

    // 4. Iniciar servidor Express
    console.log('🌐 Paso 4/4: Iniciando servidor HTTP...');
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('\n╔═══════════════════════════════════════════════╗');
      console.log('║         ✨ SERVIDOR INICIADO EXITOSAMENTE    ║');
      console.log('╠═══════════════════════════════════════════════╣');
      console.log(`║  🌐 URL Local:    http://localhost:${PORT}         ║`);
      console.log(`║  🔗 Frontend:     ${FRONTEND_URL.padEnd(26)}║`);
      console.log(`║  📦 Entorno:      ${ENV.padEnd(26)}║`);
      console.log(`║  🗄️  Base Datos:   ${(process.env.DB_NAME || 'qhatu_db').padEnd(26)}║`);
      console.log('╚═══════════════════════════════════════════════╝\n');

      console.log('📍 Endpoints principales:');
      console.log(`   GET    http://localhost:${PORT}/`);
      console.log(`   GET    http://localhost:${PORT}/health`);
      console.log(`   GET    http://localhost:${PORT}/api/health`);
      console.log(`   GET    http://localhost:${PORT}/api/products`);
      console.log(`   GET    http://localhost:${PORT}/api/categories`);
      console.log(`   POST   http://localhost:${PORT}/api/auth/login`);
      console.log(`   GET    http://localhost:${PORT}/api/banners-descuento/activos\n`);
      
      console.log('💡 Tips:');
      console.log('   - Presiona Ctrl+C para detener el servidor');
      console.log('   - Usa nodemon para recargas automáticas');
      console.log('   - Revisa los logs en tiempo real\n');
    });

    // ====================================
    // 🛑 GRACEFUL SHUTDOWN
    // ====================================

    const shutdown = async (signal) => {
      console.log(`\n⚠️  Señal ${signal} recibida. Cerrando servidor gracefully...`);
      
      server.close(async () => {
        console.log('🔌 Servidor HTTP cerrado');
        
        try {
          await sequelize.close();
          console.log('🔌 Conexión a base de datos cerrada');
          console.log('👋 Servidor cerrado correctamente. ¡Hasta luego!\n');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error al cerrar conexión DB:', error.message);
          process.exit(1);
        }
      });

      // Forzar cierre después de 10 segundos
      setTimeout(() => {
        console.error('❌ Forzando cierre después de 10 segundos...');
        process.exit(1);
      }, 10000);
    };

    // Listeners para señales de terminación
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Manejo de errores no capturados
    process.on('unhandledRejection', (reason, promise) => {
      console.error('\n❌ Promesa rechazada no manejada:');
      console.error('Promesa:', promise);
      console.error('Razón:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('\n❌ Excepción no capturada:', error);
      console.error('El servidor se cerrará...');
      process.exit(1);
    });

  } catch (error) {
    console.error('\n╔════════════════════════════════════════╗');
    console.error('║   ❌ FALLO CRÍTICO AL INICIAR        ║');
    console.error('╚════════════════════════════════════════╝\n');
    console.error('Mensaje:', error.message);
    
    // Mensajes de ayuda específicos
    if (error.original?.code === 'ECONNREFUSED') {
      console.error('\n💡 SOLUCIÓN:');
      console.error('   MySQL no está corriendo.');
      console.error('   1. Abre XAMPP Control Panel');
      console.error('   2. Haz clic en "Start" junto a MySQL');
      console.error('   3. Espera a que diga "Running"');
      console.error('   4. Vuelve a ejecutar: npm run dev\n');
    } else if (error.original?.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 SOLUCIÓN:');
      console.error('   Credenciales incorrectas.');
      console.error('   Verifica en tu archivo .env:');
      console.error('   - DB_USER=root');
      console.error('   - DB_PASSWORD=(vacío si usas XAMPP)\n');
    } else if (error.original?.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 SOLUCIÓN:');
      console.error('   La base de datos no existe.');
      console.error('   Ejecuta estos comandos:');
      console.error('   1. CREATE DATABASE qhatu_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
      console.error('   2. mysql -u root qhatu_db < db/qhatu_db(3).sql\n');
    }
    
    if (ENV === 'development') {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    console.error('');
    process.exit(1);
  }
};

// ====================================
// 📤 EXPORTACIONES
// ====================================

export default app;

// ====================================
// ⚡ AUTO-INICIO DEL SERVIDOR
// ====================================

// Iniciar servidor automáticamente
startServer();