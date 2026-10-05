// test-api-connection.js
// Script de diagnóstico para verificar conectividad API
// Ubicación: C:\qhatu\test-api-connection.js

const API_URL = 'http://localhost:5010/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.cyan}${'='.repeat(50)}\n${msg}\n${'='.repeat(50)}${colors.reset}`)
};

async function testEndpoint(name, url, expectedStatus = 200) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.status === expectedStatus) {
      log.success(`${name}: ${response.status} OK`);
      return { success: true, data };
    } else {
      log.warn(`${name}: ${response.status} (esperado ${expectedStatus})`);
      return { success: false, data, status: response.status };
    }
  } catch (error) {
    log.error(`${name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runDiagnostics() {
  log.header('🔍 DIAGNÓSTICO DE CONEXIÓN API - QHATU');
  
  log.info(`Base URL: ${API_URL}`);
  log.info('Fecha: ' + new Date().toLocaleString());
  
  // Test 1: Backend Health
  log.header('1️⃣  HEALTH CHECK DEL BACKEND');
  await testEndpoint('Health Check', 'http://localhost:5010/health');
  
  // Test 2: Productos
  log.header('2️⃣  ENDPOINTS DE PRODUCTOS');
  const productsTest = await testEndpoint('GET Productos', `${API_URL}/products`);
  await testEndpoint('GET Productos Destacados', `${API_URL}/products/featured`);
  await testEndpoint('GET Rango de Precios', `${API_URL}/products/price-range`);
  
  if (productsTest.success && productsTest.data.products) {
    log.info(`Total de productos encontrados: ${productsTest.data.total || productsTest.data.products.length}`);
  }
  
  // Test 3: Categorías
  log.header('3️⃣  ENDPOINTS DE CATEGORÍAS');
  const categoriesTest = await testEndpoint('GET Categorías', `${API_URL}/categories`);
  
  if (categoriesTest.success && Array.isArray(categoriesTest.data)) {
    log.info(`Total de categorías encontradas: ${categoriesTest.data.length}`);
  }
  
  // Test 4: Banners
  log.header('4️⃣  ENDPOINTS DE BANNERS');
  const bannersTest = await testEndpoint('GET Banners Activos', `${API_URL}/banners-descuento/activos`);
  
  if (bannersTest.success && Array.isArray(bannersTest.data)) {
    log.info(`Total de banners activos: ${bannersTest.data.length}`);
  }
  
  // Test 5: Carruseles
  log.header('5️⃣  ENDPOINTS DE CARRUSELES');
  await testEndpoint('GET Carruseles', `${API_URL}/carousels`);
  
  // Resumen
  log.header('📊 RESUMEN');
  log.info('Si todos los tests pasaron con ✅, la API está funcionando correctamente');
  log.warn('Si hay errores ❌, verifica:');
  console.log('   1. ¿El backend está corriendo? (node src/server.js)');
  console.log('   2. ¿La base de datos está conectada?');
  console.log('   3. ¿El puerto 5010 está libre?');
  console.log('   4. ¿Las variables de entorno están correctas?');
  
  log.header('🎯 PRÓXIMOS PASOS');
  console.log('1. Actualiza frontend/.env con: VITE_API_URL=http://localhost:5010/api');
  console.log('2. Reinicia el servidor frontend: npm run dev');
  console.log('3. Verifica la consola del navegador');
}

// Ejecutar diagnósticos
runDiagnostics().catch(console.error);