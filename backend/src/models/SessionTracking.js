// C:\qhatu\backend\src\models\SessionTracking.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SessionTracking = sequelize.define('SessionTracking', {
  tracking_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'usuario_id'
    }
  },
  sesion_temporal: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Para usuarios no logueados'
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dispositivo: {
    type: DataTypes.ENUM('mobile', 'desktop', 'tablet'),
    allowNull: true
  },
  navegador: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  sistema_operativo: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  fuente_trafico: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'utm_source'
  },
  medio_trafico: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'utm_medium'
  },
  campania: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'utm_campaign'
  },
  referrer: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pagina_entrada: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  fecha_sesion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  duracion_sesion: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'En segundos'
  }
}, {
  tableName: 'sesiones_tracking',
  timestamps: false
});

export default SessionTracking;