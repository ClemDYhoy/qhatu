// src/server.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

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

// Configuración
const app = express();
const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || 'development';

// === SEGURIDAD ===
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: ENV === 'production' ? 100 : 1000, // Más permisivo en dev
  message: { error: 'Demasiadas solicitudes. Intenta más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => ENV === 'development' && req.ip === '::1' // Skip localhost en dev
});

// === MIDDLEWARES ===
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: ENV === 'production' ? undefined : false
}));

app.use(limiter);
app.use(morgan(ENV === 'development' ? 'dev' : 'combined'));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Middleware de logging mejorado
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (ENV === 'development') {
      console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// === RUTAS API ===
const apiRouter = express.Router();

// Health check interno del API
apiRouter.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Rutas principales
apiRouter.use('/products', productRoutes);
apiRouter.use('/carousels', carouselRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/banners-descuento', discountBannersRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/analytics', analyticsRoutes);

app.use('/api', apiRouter);

// === RUTAS PÚBLICAS ===
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: ENV,
    version: '2.0.0'
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Qhatu API v2.0.0',
    status: 'online',
    documentation: '/api',
    features: ['auth', 'cart', 'products', 'admin', 'analytics'],
    endpoints: {
      products: '/api/products',
      categories: '/api/categories',
      carousels: '/api/carousels',
      banners: '/api/banners-descuento/activos',
      auth: '/api/auth/login',
      users: '/api/users',
      cart: '/api/cart',
      analytics: '/api/analytics'
    }
  });
});

// === 404 ===
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method,
    suggestion: 'Verifica la documentación en GET /'
  });
});

// === ERROR GLOBAL ===
app.use((err, req, res, next) => {
  // Log detallado del error
  console.error('\n❌ ERROR NO CONTROLADO:');
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
        message: e.message
      }))
    });
  }

  // Error genérico
  res.status(err.status || 500).json({
    success: false,
    error: 'Error interno del servidor',
    message: ENV === 'development' ? err.message : 'Ocurrió un error inesperado'
  });
});

// === INICIO DEL SERVIDOR ===
const startServer = async () => {
  try {
    console.log('\n🚀 Iniciando servidor Qhatu...\n');

    // 1. Verificar conexión a base de datos
    console.log('📊 Conectando a base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL exitosa\n');

    // 2. Verificar que las tablas existen
    console.log('🔍 Verificando estructura de base de datos...');
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}'
    `);

    const tableNames = tables.map(t => t.TABLE_NAME);
    const requiredTables = [
      'productos', 'categorias', 'usuarios', 'carritos', 
      'carrito_items', 'ventas', 'roles', 'carruseles', 
      'banners_descuento'
    ];

    const missingTables = requiredTables.filter(t => !tableNames.includes(t));

    if (missingTables.length > 0) {
      console.warn('⚠️  ADVERTENCIA: Faltan tablas en la base de datos:');
      missingTables.forEach(table => console.warn(`   - ${table}`));
      console.warn('\n💡 Ejecuta el archivo SQL: db/qhatu_db(3).sql\n');
    } else {
      console.log(`✅ Todas las tablas requeridas están presentes (${tableNames.length} tablas)\n`);
    }

    // 3. Sincronización de modelos (SOLO EN DESARROLLO Y SOLO SI SE REQUIERE)
    const syncMode = process.env.DB_SYNC_MODE || 'none';
    
    if (ENV === 'development' && syncMode !== 'none') {
      console.warn(`⚠️  ADVERTENCIA: Sincronizando modelos en modo "${syncMode}"\n`);
      
      const syncOptions = {};
      
      if (syncMode === 'force') {
        console.warn('🔥 MODO FORCE: Esto eliminará y recreará todas las tablas');
        console.warn('   Cancelando en 5 segundos... (Ctrl+C para abortar)');
        await new Promise(resolve => setTimeout(resolve, 5000));
        syncOptions.force = true;
      } else if (syncMode === 'alter') {
        console.warn('🔧 MODO ALTER: Esto modificará las tablas existentes');
        syncOptions.alter = true;
      }

      try {
        await sequelize.sync(syncOptions);
        console.log(`✅ Modelos sincronizados (${syncMode})\n`);
      } catch (syncError) {
        console.error('❌ Error al sincronizar modelos:');
        console.error(syncError.message);
        
        if (syncError.original?.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
          console.error('\n💡 SOLUCIÓN:');
          console.error('   1. Cambia DB_SYNC_MODE=none en tu .env');
          console.error('   2. O ejecuta: DROP DATABASE qhatu_db; CREATE DATABASE qhatu_db;');
          console.error('   3. Luego importa: mysql -u root qhatu_db < db/qhatu_db(3).sql\n');
        }
        
        throw syncError;
      }
    } else {
      console.log('✅ Sincronización omitida (tablas deben existir previamente)\n');
    }

    // 4. Iniciar servidor Express
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('╔═══════════════════════════════════════════════╗');
      console.log('║        🎉 Qhatu Backend v2.0.0               ║');
      console.log('╠═══════════════════════════════════════════════╣');
      console.log(`║  Puerto:      ${PORT}                            ║`);
      console.log(`║  URL:         http://localhost:${PORT}          ║`);
      console.log(`║  Frontend:    ${process.env.FRONTEND_URL || 'http://localhost:5173'}  ║`);
      console.log(`║  Entorno:     ${ENV.padEnd(29)} ║`);
      console.log(`║  Base Datos:  ${process.env.DB_NAME.padEnd(29)} ║`);
      console.log('╚═══════════════════════════════════════════════╝\n');

      console.log('📍 Rutas principales:');
      console.log('   GET    /                   - Info del API');
      console.log('   GET    /health             - Estado del servidor');
      console.log('   GET    /api/health         - Estado de base de datos');
      console.log('   POST   /api/auth/login     - Login de usuarios');
      console.log('   POST   /api/auth/register  - Registro de usuarios');
      console.log('   GET    /api/products       - Listar productos');
      console.log('   GET    /api/categories     - Listar categorías');
      console.log('   GET    /api/cart           - Ver carrito');
      console.log('   POST   /api/cart/items     - Agregar al carrito');
      console.log('   GET    /api/banners-descuento/activos - Banners activos');
      console.log('   GET    /api/analytics/*    - Estadísticas (admin)\n');
    });

    // === GRACEFUL SHUTDOWN ===
    const shutdown = async (signal) => {
      console.log(`\n⚠️  ${signal} recibido. Cerrando servidor gracefully...`);
      
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

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Manejo de errores no capturados
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise);
      console.error('Reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('\n❌ FALLO CRÍTICO AL INICIAR SERVIDOR:\n');
    console.error('Mensaje:', error.message);
    
    if (error.original?.code === 'ECONNREFUSED') {
      console.error('\n💡 SOLUCIÓN:');
      console.error('   MySQL no está corriendo. Inicia XAMPP/WAMP o MySQL service');
    } else if (error.original?.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 SOLUCIÓN:');
      console.error('   Credenciales incorrectas. Verifica DB_USER y DB_PASSWORD en .env');
    } else if (error.original?.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 SOLUCIÓN:');
      console.error('   Base de datos no existe. Ejecuta:');
      console.error('   CREATE DATABASE qhatu_db;');
      console.error('   mysql -u root qhatu_db < db/qhatu_db(3).sql');
    }
    
    if (ENV === 'development') {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    console.error('\n');
    process.exit(1);
  }
};

// === EXPORTAR PARA PRUEBAS ===
export default app;

// === INICIAR SERVIDOR ===
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}