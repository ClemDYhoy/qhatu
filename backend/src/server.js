// C:\qhatu\backend\src\server.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createServer } from 'http';
import chalk from 'chalk';

// ====================================
// 🔧 CONFIGURACIÓN INICIAL
// ====================================

dotenv.config();

// Base de datos
import sequelize from './config/database.js';

// Importar modelos (establece relaciones automáticamente)
import './models/index.js';

// Servicios
import whatsappService from './services/whatsappService.js';

// Rutas
import productRoutes from './routes/products.js';
import carouselRoutes from './routes/carousel.js';
import categoryRoutes from './routes/categories.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import discountBannersRoutes from './routes/discountBanners.js';
import cartRoutes from './routes/cart.js';
import analyticsRoutes from './routes/analytics.js';
import ventasRoutes from './routes/ventas.js';
import analyticsVentasRoutes from './routes/analytics-ventas.js';
import mlRoutes from './routes/ml.js';

// Validación de entorno (falla rápido si falta configuración crítica)
import { validateEnv } from './config/env.js';

// ====================================
// 📊 VARIABLES DE ENTORNO
// ====================================

validateEnv();

const app = express();
const server = createServer(app);
const PORT = parseInt(process.env.PORT) || 5000;
const ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const DB_NAME = process.env.DB_NAME || 'qhatu_db';

// ====================================
// 🔌 SOCKET.IO CONFIGURACIÓN
// ====================================

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 10000,
  maxHttpBufferSize: 1e6 // 1MB
});

// ====================================
// 🔌 EVENTOS SOCKET.IO
// ====================================

let connectedUsers = new Map(); // Almacenar usuarios conectados

io.on('connection', (socket) => {
  const clientIp = socket.handshake.address;
  console.log(chalk.green(`🔌 Cliente conectado: ${socket.id} (${clientIp})`));

  // Unirse a sala de vendedor
  socket.on('join-vendedor', (data) => {
    const { vendedor_id, nombre } = data;
    const room = `vendedor-${vendedor_id}`;
    
    socket.join(room);
    connectedUsers.set(socket.id, { vendedor_id, nombre, room });
    
    console.log(chalk.blue(`👤 Vendedor ${nombre} (ID: ${vendedor_id}) unido a sala ${room}`));
    
    // Confirmar al cliente
    socket.emit('joined-vendedor', {
      success: true,
      room,
      message: `Conectado como vendedor ${nombre}`
    });
  });

  // Unirse a sala de administrador
  socket.on('join-admin', (data) => {
    const { admin_id, nombre } = data;
    const room = 'admin-dashboard';
    
    socket.join(room);
    connectedUsers.set(socket.id, { admin_id, nombre, room });
    
    console.log(chalk.magenta(`👑 Admin ${nombre} unido a sala ${room}`));
    
    socket.emit('joined-admin', {
      success: true,
      room,
      message: `Conectado como administrador ${nombre}`
    });
  });

  // Ping/Pong para mantener conexión
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });

  // Desconexión
  socket.on('disconnect', (reason) => {
    const user = connectedUsers.get(socket.id);
    
    if (user) {
      console.log(chalk.yellow(`🔌 ${user.nombre || 'Usuario'} desconectado: ${reason}`));
      connectedUsers.delete(socket.id);
    } else {
      console.log(chalk.yellow(`🔌 Cliente ${socket.id} desconectado: ${reason}`));
    }
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(chalk.red(`❌ Socket error (${socket.id}):`, error.message));
  });
});

// Middleware para inyectar io en req
app.use((req, res, next) => {
  req.io = io;
  req.connectedUsers = connectedUsers;
  next();
});

// ====================================
// 🛡️ SEGURIDAD - RATE LIMITING
// ====================================

// Rate limiter general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: ENV === 'production' ? 100 : 1000,
  message: { 
    success: false,
    error: 'Demasiadas solicitudes. Intenta más tarde.',
    retry_after: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => ENV === 'development' && (req.ip === '::1' || req.ip === '127.0.0.1')
});

// Rate limiter estricto para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: { 
    success: false,
    error: 'Demasiados intentos de inicio de sesión. Intenta en 15 minutos.',
    code: 'TOO_MANY_AUTH_ATTEMPTS'
  }
});

// ====================================
// 🔐 MIDDLEWARES DE SEGURIDAD
// ====================================

// Helmet para headers de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  } : false,
  hsts: ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false
}));

// Rate limiting
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Logging
if (ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : [FRONTEND_URL];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(chalk.yellow(`⚠️  Origen bloqueado por CORS: ${origin}`));
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 horas
}));

// ====================================
// 📦 MIDDLEWARES DE PARSEO
// ====================================

app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        error: 'JSON inválido',
        message: e.message
      });
      throw new Error('JSON inválido');
    }
  }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// ====================================
// 📝 LOGGING PERSONALIZADO (DEV)
// ====================================

if (ENV === 'development') {
  app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;
      
      let statusColor;
      if (statusCode >= 500) statusColor = chalk.red;
      else if (statusCode >= 400) statusColor = chalk.yellow;
      else if (statusCode >= 300) statusColor = chalk.cyan;
      else statusColor = chalk.green;
      
      const method = chalk.bold(req.method.padEnd(6));
      const path = req.path;
      const status = statusColor(statusCode);
      const time = chalk.gray(`${duration}ms`);
      
      console.log(`${method} ${path} - ${status} ${time}`);
    });
    
    next();
  });
}

// Request ID para tracking
app.use((req, res, next) => {
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
});

// ====================================
// 🏥 HEALTH CHECKS
// ====================================

app.get('/health', (req, res) => {
  const uptime = process.uptime();
  const uptimeFormatted = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;
  
  res.status(200).json({
    status: 'ok',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: uptimeFormatted,
    environment: ENV,
    version: '2.2.0',
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
    },
    socketio: {
      connected: io.engine.clientsCount,
      status: io.engine.clientsCount > 0 ? 'active' : 'waiting'
    }
  });
});

app.get('/api/health', async (req, res) => {
  try {
    // Test de conexión a BD
    await sequelize.authenticate();
    
    // Verificar tabla crítica
    const [tableCheck] = await sequelize.query(
      `SELECT COUNT(*) as count FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'ventas'`,
      { replacements: [DB_NAME] }
    );
    
    const whatsappConfig = whatsappService.verificarConfiguracion();
    
    res.json({
      success: true,
      status: 'healthy',
      checks: {
        database: {
          status: 'connected',
          name: DB_NAME,
          tables_ok: tableCheck[0].count > 0
        },
        socketio: {
          status: 'enabled',
          connections: io.engine.clientsCount,
          users: connectedUsers.size
        },
        whatsapp: {
          configured: whatsappConfig.configurado,
          numero: whatsappConfig.numero
        }
      },
      timestamp: new Date().toISOString(),
      version: '2.2.0'
    });
  } catch (error) {
    console.error(chalk.red('❌ Error en /api/health:'), error.message);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: 'Servicio de base de datos no disponible',
      timestamp: new Date().toISOString()
    });
  }
});

// ====================================
// 📚 DOCUMENTACIÓN API
// ====================================

app.get('/', (req, res) => {
  const whatsappConfig = whatsappService.verificarConfiguracion();
  
  res.status(200).json({
    message: '🛍️ Qhatu E-commerce API',
    version: '2.2.0',
    status: 'online',
    environment: ENV,
    documentation: 'https://github.com/qhatu/api-docs',
    
    features: [
      '✅ Autenticación JWT',
      '✅ Carrito de compras',
      '✅ Sistema de ventas WhatsApp',
      '✅ Notificaciones en tiempo real (Socket.IO)',
      '✅ Panel de administración',
      '✅ Analytics y reportes',
      '✅ Gestión de inventario',
      '✅ Sistema de roles y permisos'
    ],
    
    endpoints: {
      public: {
        health: 'GET /health',
        api_health: 'GET /api/health',
        products: 'GET /api/products',
        categories: 'GET /api/categories',
        carousels: 'GET /api/carousels',
        banners: 'GET /api/banners-descuento/activos'
      },
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        logout: 'POST /api/auth/logout',
        refresh: 'POST /api/auth/refresh'
      },
      cart: {
        get: 'GET /api/cart',
        add_item: 'POST /api/cart/items',
        update_item: 'PUT /api/cart/items/:id',
        remove_item: 'DELETE /api/cart/items/:id',
        clear: 'DELETE /api/cart/clear'
      },
      ventas: {
        crear: 'POST /api/ventas/crear-whatsapp',
        pendientes: 'GET /api/ventas/pendientes',
        detalle: 'GET /api/ventas/:id',
        confirmar: 'POST /api/ventas/:id/confirmar',
        estadisticas: 'GET /api/ventas/estadisticas/vendedor'
      },
      admin: {
        analytics: 'GET /api/analytics/*',
        users: 'GET /api/users/*',
        products: 'POST /api/products',
        categories: 'POST /api/categories'
      },
      analytics: {
        kpis: 'GET /api/analytics-ventas/kpis',
        rendimiento_vendedores: 'GET /api/analytics-ventas/vendedores/rendimiento',
        mi_rendimiento: 'GET /api/analytics-ventas/vendedores/mi-rendimiento',
        clientes_vip: 'GET /api/analytics-ventas/clientes/vip',
        productos_mas_vendidos: 'GET /api/analytics-ventas/productos/mas-vendidos',
        dashboard_admin: 'GET /api/analytics-ventas/dashboard-admin',
        dashboard_vendedor: 'GET /api/analytics-ventas/dashboard-vendedor'
      }
    },
    
    socketio: {
      enabled: true,
      url: `ws://localhost:${PORT}`,
      events: {
        client_to_server: ['join-vendedor', 'join-admin', 'ping'],
        server_to_client: ['nueva-venta-pendiente', 'venta-confirmada', 'stock-actualizado', 'pong']
      },
      connected_users: connectedUsers.size
    },
    
    whatsapp: {
      configured: whatsappConfig.configurado,
      numero: whatsappConfig.configurado ? whatsappConfig.numero : 'No configurado',
      status: whatsappConfig.configurado ? 'active' : 'pending_configuration'
    }
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
app.use('/api/ventas', ventasRoutes);
app.use('/api/analytics-ventas', analyticsVentasRoutes);
app.use('/api/ml', mlRoutes);
// ====================================
// ❌ MANEJO DE ERRORES
// ====================================

// 404 - Ruta no encontrada
app.use('*', (req, res) => {
  console.warn(chalk.yellow(`⚠️  Ruta no encontrada: ${req.method} ${req.originalUrl}`));
  
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    suggestion: 'Verifica la documentación en GET /',
    request_id: req.id
  });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  
  console.error(chalk.red('\n❌ ERROR NO CONTROLADO:'));
  console.error(chalk.gray('Timestamp:'), timestamp);
  console.error(chalk.gray('Request ID:'), req.id);
  console.error(chalk.gray('Mensaje:'), err.message);
  console.error(chalk.gray('Ruta:'), req.originalUrl);
  console.error(chalk.gray('Método:'), req.method);
  console.error(chalk.gray('IP:'), req.ip);
  
  if (ENV === 'development') {
    console.error(chalk.gray('Stack:'), err.stack);
  }

  // Errores de Sequelize
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      success: false,
      error: 'Error de base de datos',
      message: ENV === 'development' ? err.original.message : 'Error al procesar la solicitud',
      request_id: req.id,
      timestamp
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
      })),
      request_id: req.id,
      timestamp
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      error: 'Conflicto de datos únicos',
      message: 'El registro ya existe',
      field: err.errors[0]?.path,
      request_id: req.id,
      timestamp
    });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Token inválido',
      message: 'Por favor inicia sesión nuevamente',
      code: 'INVALID_TOKEN',
      request_id: req.id,
      timestamp
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expirado',
      message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente',
      code: 'TOKEN_EXPIRED',
      request_id: req.id,
      timestamp
    });
  }

  // Error de CORS
  if (err.message === 'No permitido por CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS bloqueado',
      message: 'Origen no permitido',
      request_id: req.id,
      timestamp
    });
  }

  // Error genérico
  res.status(err.status || 500).json({
    success: false,
    error: 'Error interno del servidor',
    message: ENV === 'development' ? err.message : 'Ocurrió un error inesperado',
    request_id: req.id,
    timestamp
  });
});

// ====================================
// 🚀 INICIO DEL SERVIDOR
// ====================================

const startServer = async () => {
  try {
    console.log(chalk.cyan('\n╔════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║') + chalk.bold.white('   🚀 Iniciando Qhatu Backend v2.2.0       ') + chalk.cyan('║'));
    console.log(chalk.cyan('║') + chalk.white('   WhatsApp + Socket.IO + Analytics        ') + chalk.cyan('║'));
    console.log(chalk.cyan('╚════════════════════════════════════════════╝\n'));

    // 1. Conexión a base de datos
    console.log(chalk.blue('📊 [1/5] Conectando a base de datos...'));
    await sequelize.authenticate();
    console.log(chalk.green('✅ Conexión a MySQL exitosa'));
    
    const [result] = await sequelize.query('SELECT VERSION() as version');
    console.log(chalk.gray(`   📌 MySQL v${result[0].version}\n`));

    // 2. Verificar tablas críticas
    console.log(chalk.blue('🔍 [2/5] Verificando estructura de base de datos...'));
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, {
      replacements: [DB_NAME]
    });

    const tableNames = tables.map(t => t.TABLE_NAME);
    const requiredTables = [
      'productos', 'categorias', 'usuarios', 'carritos', 
      'carrito_items', 'ventas', 'venta_items', 'roles', 
      'carruseles', 'banners_descuento'
    ];

    const missingTables = requiredTables.filter(t => !tableNames.includes(t));

    if (missingTables.length > 0) {
      console.warn(chalk.yellow('⚠️  Faltan tablas:'));
      missingTables.forEach(table => console.warn(chalk.yellow(`   - ${table}`)));
      console.warn(chalk.yellow('\n💡 Ejecuta el script SQL de la base de datos\n'));
    } else {
      console.log(chalk.green(`✅ Todas las tablas presentes (${tableNames.length})\n`));
    }

    // 3. Verificar trigger de ventas
    console.log(chalk.blue('🔍 [3/5] Verificando sistema de ventas...'));
    try {
      const [triggers] = await sequelize.query(`
        SHOW TRIGGERS WHERE \`Table\` = 'ventas'
      `);
      
      if (triggers.length > 0) {
        console.log(chalk.green('✅ Sistema de ventas configurado'));
        console.log(chalk.gray(`   📌 Trigger: ${triggers[0].Trigger}`));
        console.log(chalk.gray('   📌 Genera: QH-0001, QH-0002, etc.\n'));
      } else {
        console.warn(chalk.yellow('⚠️  Trigger de ventas NO encontrado'));
        console.warn(chalk.yellow('   Ejecuta el SQL de modificaciones\n'));
      }
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  No se pudo verificar trigger: ${error.message}\n`));
    }

    // 4. Verificar WhatsApp
    console.log(chalk.blue('📱 [4/5] Verificando WhatsApp...'));
    const whatsappConfig = whatsappService.verificarConfiguracion();
    
    if (whatsappConfig.configurado) {
      console.log(chalk.green(`✅ WhatsApp configurado: ${whatsappConfig.numero}`));
      console.log(chalk.gray(`   📌 Tienda: ${whatsappConfig.tienda}\n`));
    } else {
      console.warn(chalk.yellow('⚠️  WhatsApp NO configurado'));
      console.warn(chalk.yellow('   Edita .env y agrega WHATSAPP_NUMERO_TIENDA\n'));
    }

    // 5. Iniciar servidor
    console.log(chalk.blue('🌐 [5/5] Iniciando servidor HTTP + WebSocket...'));
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(chalk.green('\n╔═══════════════════════════════════════════════╗'));
      console.log(chalk.green('║') + chalk.bold.white('       ✨ SERVIDOR INICIADO EXITOSAMENTE      ') + chalk.green('║'));
      console.log(chalk.green('╠═══════════════════════════════════════════════╣'));
      console.log(chalk.green('║') + chalk.white(`  🌐 Local:        http://localhost:${PORT}        `) + chalk.green('║'));
      console.log(chalk.green('║') + chalk.white(`  🔗 Frontend:     ${FRONTEND_URL.padEnd(26)}`) + chalk.green('║'));
      console.log(chalk.green('║') + chalk.white(`  🔌 Socket.IO:    Habilitado                  `) + chalk.green('║'));
      console.log(chalk.green('║') + chalk.white(`  📱 WhatsApp:     ${(whatsappConfig.configurado ? whatsappConfig.numero : 'No config').padEnd(26)}`) + chalk.green('║'));
      console.log(chalk.green('║') + chalk.white(`  📦 Entorno:      ${ENV.padEnd(26)}`) + chalk.green('║'));
      console.log(chalk.green('╚═══════════════════════════════════════════════╝\n'));

      console.log(chalk.white('📍 Endpoints principales:'));
      console.log(chalk.gray(`   GET    http://localhost:${PORT}/`));
      console.log(chalk.gray(`   GET    http://localhost:${PORT}/api/health`));
      console.log(chalk.gray(`   POST   http://localhost:${PORT}/api/auth/login`));
      console.log(chalk.gray(`   GET    http://localhost:${PORT}/api/products`));
      console.log(chalk.gray(`   GET    http://localhost:${PORT}/api/cart\n`));
      
      console.log(chalk.white('🆕 Sistema de Ventas WhatsApp:'));
      console.log(chalk.gray(`   POST   http://localhost:${PORT}/api/ventas/crear-whatsapp`));
      console.log(chalk.gray(`   GET    http://localhost:${PORT}/api/ventas/pendientes`));
      console.log(chalk.gray(`   POST   http://localhost:${PORT}/api/ventas/:id/confirmar\n`));
      
      console.log(chalk.white('💡 Tips:'));
      console.log(chalk.gray('   • Ctrl+C para detener'));
      console.log(chalk.gray('   • Logs en tiempo real activos'));
      console.log(chalk.gray('   • Socket.IO conectado y esperando clientes\n'));
    });

    // ====================================
    // 🛑 GRACEFUL SHUTDOWN
    // ====================================

    const shutdown = async (signal) => {
      console.log(chalk.yellow(`\n⚠️  Señal ${signal} recibida. Cerrando servidor...`));
      
      // Cerrar Socket.IO
      io.close(() => {
        console.log(chalk.gray('🔌 Socket.IO cerrado'));
      });

      // Cerrar servidor HTTP
      server.close(async () => {
        console.log(chalk.gray('🔌 Servidor HTTP cerrado'));
        
        try {
          await sequelize.close();
          console.log(chalk.gray('🔌 Conexión a base de datos cerrada'));
          console.log(chalk.green('👋 Servidor cerrado correctamente\n'));
          process.exit(0);
        } catch (error) {
          console.error(chalk.red('❌ Error al cerrar conexión DB:'), error.message);
          process.exit(1);
        }
      });

      // Forzar cierre después de 10 segundos
      setTimeout(() => {
        console.error(chalk.red('❌ Forzando cierre por timeout...'));
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Manejo de promesas rechazadas
    process.on('unhandledRejection', (reason, promise) => {
      console.error(chalk.red('\n❌ Promesa rechazada no manejada:'));
      console.error(chalk.gray('Promesa:'), promise);
      console.error(chalk.gray('Razón:'), reason);
    });

    // Manejo de excepciones no capturadas
    process.on('uncaughtException', (error) => {
      console.error(chalk.red('\n❌ Excepción no capturada:'), error);
      console.error(chalk.red('El servidor se cerrará por seguridad...'));
      process.exit(1);
    });

  } catch (error) {
    console.error(chalk.red('\n╔════════════════════════════════════════╗'));
    console.error(chalk.red('║') + chalk.bold.white('   ❌ FALLO CRÍTICO AL INICIAR        ') + chalk.red('║'));
    console.error(chalk.red('╚════════════════════════════════════════╝\n'));
    console.error(chalk.white('Mensaje:'), chalk.red(error.message));
    
    // Diagnóstico específico
    if (error.original?.code === 'ECONNREFUSED') {
      console.error(chalk.yellow('\n💡 SOLUCIÓN: MySQL no está corriendo'));
      console.error(chalk.gray('   1. Abre XAMPP Control Panel'));
      console.error(chalk.gray('   2. Start MySQL'));
      console.error(chalk.gray('   3. Reinicia: npm start\n'));
    } else if (error.original?.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error(chalk.yellow('\n💡 SOLUCIÓN: Credenciales incorrectas'));
      console.error(chalk.gray('   Verifica tu archivo .env'));
      console.error(chalk.gray('   DB_USER y DB_PASSWORD deben ser correctos\n'));
    } else if (error.original?.code === 'ER_BAD_DB_ERROR') {
      console.error(chalk.yellow('\n💡 SOLUCIÓN: Base de datos no existe'));
      console.error(chalk.gray('   1. Abre phpMyAdmin'));
      console.error(chalk.gray('   2. Importa el archivo SQL'));
      console.error(chalk.gray('   3. Reinicia: npm start\n'));
    } else if (error.code === 'EADDRINUSE') {
      console.error(chalk.yellow(`\n💡 SOLUCIÓN: Puerto ${PORT} ya está en uso`));
      console.error(chalk.gray('   1. Cambia el puerto en .env'));
      console.error(chalk.gray('   2. O cierra el proceso: npx kill-port 5000\n'));
    }
    
    if (ENV === 'development') {
      console.error(chalk.gray('\nStack trace:'));
      console.error(chalk.red(error.stack));
    }
    
    console.error('');
    process.exit(1);
  }
};

// ====================================
// 📤 EXPORTACIONES
// ====================================

export { io, server, connectedUsers };
export default app;

// ====================================
// ⚡ AUTO-INICIO
// ====================================

startServer();