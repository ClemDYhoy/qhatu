import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Product = sequelize.define(
'productos',
{
    id_producto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
    },
    nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
    },
    descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
    },
    marca: {
    type: DataTypes.STRING(50),
    allowNull: true
    },
    precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 }
    },
    precio_descuento: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: { min: 0 }
    },
    stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 }
    },
    es_importado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
    },
    id_categoria: {
    type: DataTypes.INTEGER,
    allowNull: true
    },
    imagen_url: {
    type: DataTypes.STRING(255),
    allowNull: true
    },
    peso_volumen: {
    type: DataTypes.STRING(20),
    allowNull: true
    },
    fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    fecha_actualizacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
    }
},
{
    timestamps: false,
    tableName: 'productos'
}
);

export default Product;