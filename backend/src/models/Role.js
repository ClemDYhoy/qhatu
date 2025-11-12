// C:\qhatu\backend\src\models\Role.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Role = sequelize.define('Role', {
  rol_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  permisos: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Permisos específicos del rol',
    get() {
      const rawValue = this.getDataValue('permisos');
      // Si es string JSON, parsear automáticamente
      if (typeof rawValue === 'string') {
        try {
          return JSON.parse(rawValue);
        } catch (e) {
          console.warn('⚠️ Error parseando permisos:', e);
          return {};
        }
      }
      return rawValue || {};
    }
  },
  creado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'creado_en'
  },
  actualizado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'actualizado_en'
  }
}, {
  tableName: 'roles',
  timestamps: false,
  hooks: {
    beforeUpdate: (role) => {
      role.actualizado_en = new Date();
    }
  }
});

export default Role;