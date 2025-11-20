// C:\qhatu\backend\test-system.js
import chalk from 'chalk';
import sequelize from './src/config/database.js';
import whatsappService from './src/services/whatsappService.js';

/**
 * 🧪 Script de Prueba del Sistema
 * Verifica que todas las partes críticas estén funcionando
 */

const runTests = async () => {
  console.log(chalk.cyan('\n╔═══════════════════════════════════════════╗'));
  console.log(chalk.cyan('║') + chalk.bold.white('   🧪 PRUEBA DEL SISTEMA QHATU           ') + chalk.cyan('║'));
  console.log(chalk.cyan('╚═══════════════════════════════════════════╝\n'));

  let passedTests = 0;
  let failedTests = 0;

  // ====================================
  // TEST 1: Conexión a Base de Datos
  // ====================================
  console.log(chalk.blue('📊 [1/6] Probando conexión a base de datos...'));
  try {
    await sequelize.authenticate();
    const [result] = await sequelize.query('SELECT VERSION() as version');
    console.log(chalk.green('✅ Base de datos conectada'));
    console.log(chalk.gray(`   MySQL v${result[0].version}`));
    passedTests++;
  } catch (error) {
    console.error(chalk.red('❌ Error en base de datos:'), error.message);
    failedTests++;
  }
  console.log('');

  // ====================================
  // TEST 2: Verificar Tablas
  // ====================================
  console.log(chalk.blue('🗄️  [2/6] Verificando tablas...'));
  try {
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
      'carrito_items', 'ventas', 'venta_items', 'roles'
    ];

    const missingTables = requiredTables.filter(t => !tableNames.includes(t));

    if (missingTables.length === 0) {
      console.log(chalk.green(`✅ Todas las tablas presentes (${tableNames.length})`));
      passedTests++;
    } else {
      console.error(chalk.red('❌ Faltan tablas:'), missingTables.join(', '));
      failedTests++;
    }
  } catch (error) {
    console.error(chalk.red('❌ Error al verificar tablas:'), error.message);
    failedTests++;
  }
  console.log('');

  // ====================================
  // TEST 3: Verificar Trigger de Ventas
  // ====================================
  console.log(chalk.blue('🔧 [3/6] Verificando trigger de ventas...'));
  try {
    const [triggers] = await sequelize.query(`
      SHOW TRIGGERS WHERE \`Table\` = 'ventas'
    `);

    if (triggers.length > 0) {
      console.log(chalk.green('✅ Trigger de ventas configurado'));
      console.log(chalk.gray(`   Trigger: ${triggers[0].Trigger}`));
      passedTests++;
    } else {
      console.error(chalk.red('❌ Trigger de ventas NO encontrado'));
      console.log(chalk.yellow('   Ejecuta el SQL para crear el trigger'));
      failedTests++;
    }
  } catch (error) {
    console.error(chalk.red('❌ Error al verificar trigger:'), error.message);
    failedTests++;
  }
  console.log('');

  // ====================================
  // TEST 4: WhatsApp Service
  // ====================================
  console.log(chalk.blue('📱 [4/6] Probando servicio de WhatsApp...'));
  try {
    const config = whatsappService.verificarConfiguracion();
    
    if (config.configurado) {
      console.log(chalk.green('✅ WhatsApp configurado'));
      console.log(chalk.gray(`   Número: ${config.numero}`));
      console.log(chalk.gray(`   Tienda: ${config.tienda}`));
      
      // Test de generación de mensaje
      const mensajePrueba = whatsappService.formatearMensajePedido({
        numero_venta: 'QH-TEST',
        cliente_nombre: 'Cliente Prueba',
        cliente_telefono: '987654321',
        cliente_direccion: 'Dirección de prueba',
        total: 100.50,
        items: [
          {
            nombre: 'Producto Test',
            cantidad: 2,
            precio_unitario: 50.25,
            subtotal: 100.50
          }
        ]
      });
      
      if (mensajePrueba.includes('QH-TEST')) {
        console.log(chalk.green('✅ Formato de mensaje correcto'));
        passedTests++;
      } else {
        throw new Error('Formato de mensaje incorrecto');
      }
    } else {
      console.warn(chalk.yellow('⚠️  WhatsApp NO configurado'));
      console.log(chalk.gray('   Agrega WHATSAPP_NUMERO_TIENDA en .env'));
      failedTests++;
    }
  } catch (error) {
    console.error(chalk.red('❌ Error en WhatsApp service:'), error.message);
    failedTests++;
  }
  console.log('');

  // ====================================
  // TEST 5: Verificar Productos
  // ====================================
  console.log(chalk.blue('📦 [5/6] Verificando productos...'));
  try {
    const [productos] = await sequelize.query(`
      SELECT COUNT(*) as total FROM productos
    `);

    const totalProductos = productos[0].total;

    if (totalProductos > 0) {
      console.log(chalk.green(`✅ Productos encontrados: ${totalProductos}`));
      passedTests++;
    } else {
      console.warn(chalk.yellow('⚠️  No hay productos en la base de datos'));
      console.log(chalk.gray('   Ejecuta: npm run seed'));
      failedTests++;
    }
  } catch (error) {
    console.error(chalk.red('❌ Error al verificar productos:'), error.message);
    failedTests++;
  }
  console.log('');

  // ====================================
  // TEST 6: Verificar Usuarios
  // ====================================
  console.log(chalk.blue('👥 [6/6] Verificando usuarios...'));
  try {
    const [usuarios] = await sequelize.query(`
      SELECT u.email, r.nombre as rol 
      FROM usuarios u 
      LEFT JOIN roles r ON u.rol_id = r.rol_id 
      LIMIT 5
    `);

    if (usuarios.length > 0) {
      console.log(chalk.green(`✅ Usuarios encontrados: ${usuarios.length}`));
      usuarios.forEach(u => {
        console.log(chalk.gray(`   - ${u.email} (${u.rol || 'sin rol'})`));
      });
      passedTests++;
    } else {
      console.warn(chalk.yellow('⚠️  No hay usuarios en la base de datos'));
      console.log(chalk.gray('   Ejecuta: npm run seed:admin'));
      failedTests++;
    }
  } catch (error) {
    console.error(chalk.red('❌ Error al verificar usuarios:'), error.message);
    failedTests++;
  }
  console.log('');

  // ====================================
  // RESUMEN
  // ====================================
  console.log(chalk.cyan('╔═══════════════════════════════════════════╗'));
  console.log(chalk.cyan('║') + chalk.bold.white('          📊 RESUMEN DE PRUEBAS           ') + chalk.cyan('║'));
  console.log(chalk.cyan('╠═══════════════════════════════════════════╣'));
  console.log(chalk.cyan('║') + chalk.green(`  ✅ Pruebas exitosas: ${passedTests}/6              `) + chalk.cyan('║'));
  console.log(chalk.cyan('║') + chalk.red(`  ❌ Pruebas fallidas: ${failedTests}/6              `) + chalk.cyan('║'));
  console.log(chalk.cyan('╚═══════════════════════════════════════════╝\n'));

  if (failedTests === 0) {
    console.log(chalk.green.bold('🎉 ¡TODO ESTÁ FUNCIONANDO PERFECTAMENTE!\n'));
    console.log(chalk.white('Puedes iniciar el servidor con:'));
    console.log(chalk.gray('   npm start\n'));
  } else {
    console.log(chalk.yellow.bold('⚠️  Algunas pruebas fallaron\n'));
    console.log(chalk.white('Revisa los errores arriba y corrígelos antes de iniciar el servidor.\n'));
  }

  // Cerrar conexión
  await sequelize.close();
  process.exit(failedTests === 0 ? 0 : 1);
};

// Ejecutar pruebas
runTests().catch(error => {
  console.error(chalk.red('\n❌ Error crítico en las pruebas:'), error);
  process.exit(1);
});