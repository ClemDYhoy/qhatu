import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Carousel = sequelize.define(
'carrusel_descuentos',
{
    id_carrusel: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
    },
    id_producto: {
    type: DataTypes.INTEGER,
    allowNull: true
    },
    imagen_url: {
    type: DataTypes.STRING(255),
    allowNull: false
    },
    titulo: {
    type: DataTypes.STRING(100),
    allowNull: false
    },
    descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
    },
    descuento_porcentaje: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
        min: 0,
        max: 100
    }
    },
    fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: false
    },
    fecha_fin: {
    type: DataTypes.DATE,
    allowNull: false
    },
    activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
    },
    prioridad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
    }
},
{
    timestamps: false,
    tableName: 'carrusel_descuentos'
}
);

export default Carousel;