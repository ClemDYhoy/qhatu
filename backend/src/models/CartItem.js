// C:\qhatu\backend\src\models\CartItem.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CartItem = sequelize.define('CartItem', {
    item_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    carrito_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { 
            min: {
                args: [1],
                msg: 'La cantidad debe ser al menos 1'
            }
        }
    },
    precio_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: {
                args: [0],
                msg: 'El precio no puede ser negativo'
            }
        }
    },
    precio_descuento: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: {
                args: [0],
                msg: 'El precio con descuento no puede ser negativo'
            }
        }
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    }
}, {
    tableName: 'carrito_items',
    timestamps: true,
    createdAt: 'agregado_en',
    updatedAt: false,
    indexes: [
        {
            name: 'idx_carrito',
            fields: ['carrito_id']
        },
        {
            name: 'idx_producto',
            fields: ['producto_id']
        }
    ],
    hooks: {
        beforeSave: (item) => {
            // Calcular subtotal automáticamente
            const precio = item.precio_descuento || item.precio_unitario;
            item.subtotal = (precio * item.cantidad).toFixed(2);
        }
    }
});

export default CartItem;