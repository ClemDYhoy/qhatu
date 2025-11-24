// C:\qhatu\backend\src\models\Cart.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Cart = sequelize.define('Cart', {
    carrito_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    sesion_temporal: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Para usuarios no logueados'
    },
    estado: {
        type: DataTypes.ENUM(
            'activo', 
            'abandonado', 
            'procesando', 
            'enviado', 
            'completado', 
            'cancelado'
        ),
        defaultValue: 'activo'
    },
    subtotal: { 
        type: DataTypes.DECIMAL(10, 2), 
        defaultValue: 0.00,
        allowNull: false
    },
    descuento_total: { 
        type: DataTypes.DECIMAL(10, 2), 
        defaultValue: 0.00,
        allowNull: false
    },
    total: { 
        type: DataTypes.DECIMAL(10, 2), 
        defaultValue: 0.00,
        allowNull: false
    },
    notas_cliente: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    convertido_venta_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID de venta si se completó'
    }
}, {
    tableName: 'carritos',
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: 'actualizado_en',
    indexes: [
        {
            name: 'idx_usuario_estado',
            fields: ['usuario_id', 'estado']
        },
        {
            name: 'idx_sesion',
            fields: ['sesion_temporal']
        },
        {
            name: 'idx_estado',
            fields: ['estado']
        },
        {
            name: 'idx_carritos_actualizado',
            fields: ['actualizado_en']
        }
    ]
});

export default Cart;