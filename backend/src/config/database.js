import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a MySQL exitosa.');
  } catch (error) {
    console.error('Error al conectar a MySQL:', error.message);
    process.exit(1);
  }
}

export { sequelize };