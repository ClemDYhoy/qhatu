import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://qhatu:jhonn-2345@star.pujfrmm.mongodb.net/qhatu-marca?retryWrites=true&w=majority&appName=Star";

async function testConnection() {
const client = new MongoClient(uri);

try {
    console.log('🔄 Conectando a MongoDB Atlas...');
    await client.connect();
    console.log('✅ ¡Conexión exitosa!');
    
    // Verificar las bases de datos
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();
    
    console.log('📊 Bases de datos encontradas:');
    databases.databases.forEach(db => {
    console.log(`   → ${db.name}`);
    });
    
    // Verificar si nuestra base de datos existe
    const ourDbExists = databases.databases.some(db => db.name === 'qhatu-marca');
    if (ourDbExists) {
    console.log('🎯 Base de datos "qhatu-marca" encontrada');
    } else {
    console.log('ℹ️ La base de datos "qhatu-marca" se creará automáticamente');
    }
    
} catch (error) {
    console.error('❌ Error de conexión:');
    console.error(error.message);
    
    // Mensajes de error comunes
    if (error.message.includes('Authentication failed')) {
    console.log('🔐 Revisa: Usuario y contraseña correctos?');
    } else if (error.message.includes('getaddrinfo')) {
    console.log('🌐 Revisa: Tu conexión a internet');
    }
} finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
}
}

testConnection();