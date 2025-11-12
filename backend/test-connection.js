// test-connection.js
import sequelize, { testConnection, verifyTables } from './src/config/database.js';
import './src/models/index.js'; // Importar modelos

const testDatabase = async () => {
  console.log('\n🧪 Iniciando prueba de conexión a base de datos...\n');

  try {
    // 1. Probar conexión
    console.log('1️⃣ Probando conexión...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    // 2. Verificar tablas
    console.log('\n2️⃣ Verificando tablas...');
    const tablesExist = await verifyTables();
    
    if (!tablesExist) {
      console.warn('⚠️  Algunas tablas faltan, pero la conexión funciona\n');
    }

    // 3. Probar queries simples
    console.log('\n3️⃣ Probando queries...');
    
    try {
      const [categories] = await sequelize.query('SELECT COUNT(*) as total FROM categorias');
      console.log(`   ✅ Categorías: ${categories[0].total}`);
    } catch (error) {
      console.log(`   ⚠️  Tabla categorias: ${error.message}`);
    }

    try {
      const [products] = await sequelize.query('SELECT COUNT(*) as total FROM productos');
      console.log(`   ✅ Productos: ${products[0].total}`);
    } catch (error) {
      console.log(`   ⚠️  Tabla productos: ${error.message}`);
    }

    try {
      const [carousels] = await sequelize.query('SELECT COUNT(*) as total FROM carruseles');
      console.log(`   ✅ Carruseles: ${carousels[0].total}`);
    } catch (error) {
      console.log(`   ⚠️  Tabla carruseles: ${error.message}`);
    }

    try {
      const [banners] = await sequelize.query('SELECT COUNT(*) as total FROM banners_descuento');
      console.log(`   ✅ Banners: ${banners[0].total}`);
    } catch (error) {
      console.log(`   ⚠️  Tabla banners_descuento: ${error.message}`);
    }

    try {
      const [users] = await sequelize.query('SELECT COUNT(*) as total FROM usuarios');
      console.log(`   ✅ Usuarios: ${users[0].total}`);
    } catch (error) {
      console.log(`   ⚠️  Tabla usuarios: ${error.message}`);
    }

    // 4. Resultado final
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  ✅ PRUEBA DE CONEXIÓN EXITOSA        ║');
    console.log('╚════════════════════════════════════════╝\n');
    
    console.log('💡 Todo listo para iniciar el servidor:');
    console.log('   npm run dev   (desarrollo con nodemon)');
    console.log('   npm start     (producción)\n');

  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:\n');
    console.error('Mensaje:', error.message);
    
    if (process.env.NODE_ENV === 'development') {
      console.error('\nStack:', error.stack);
    }
    
    process.exit(1);
    
  } finally {
    // ⚠️ IMPORTANTE: Cerrar la conexión AL FINAL
    console.log('🔌 Cerrando conexión...');
    await sequelize.close();
    console.log('👋 Conexión cerrada correctamente\n');
  }
};

// Ejecutar test
testDatabase();