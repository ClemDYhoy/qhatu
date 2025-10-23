import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Carousel = sequelize.define('Carousel', {
  carrusel_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  url_imagen: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  altura: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ancho: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  creado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  actualizado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'carruseles',
  timestamps: false
});

export default Carousel;