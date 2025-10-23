import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Category = sequelize.define('Category', {
  categoria_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  padre_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categorias',
      key: 'categoria_id'
    }
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
  tableName: 'categorias',
  timestamps: false
});

// Relaciones jerárquicas
Category.belongsTo(Category, {
  foreignKey: 'padre_id',
  as: 'parent'
});

Category.hasMany(Category, {
  foreignKey: 'padre_id',
  as: 'subcategorias'
});

export default Category;