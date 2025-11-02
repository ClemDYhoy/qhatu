import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'qhatu_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
    timezone: '-05:00', // Perú timezone
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: false,
      freezeTableName: true
    }
  }
);

// Función para probar la conexión
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexión a base de datos exitosa');
    return true;
  } catch (error) {
    console.error('✗ Error al conectar a la base de datos:', error.message);
    return false;
  }
};

// Función para sincronizar modelos
export const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('✓ Modelos sincronizados con la base de datos');
  } catch (error) {
    console.error('✗ Error al sincronizar modelos:', error.message);
    throw error;
  }
};

export default sequelize;