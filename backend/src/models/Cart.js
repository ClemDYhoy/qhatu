// C:\qhatu\backend\src\models\Cart.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js'; // Importación requerida para la referencia
// Importamos CartItem y Product solo para que las relaciones se definan en index.js
// y para usarlos en el repositorio.
import CartItem from './CartItem.js'; 
import Product from './Product.js'; 

const Cart = sequelize.define('Cart', {
    carrito_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: User, key: 'usuario_id' }
    },
    sesion_temporal: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    estado: {
        type: DataTypes.ENUM('activo', 'enviado', 'cancelado', 'procesando'),
        defaultValue: 'activo'
    },
    subtotal: { 
        type: DataTypes.DECIMAL(10, 2), 
        defaultValue: 0,
        allowNull: false
    },
    descuento_total: { 
        type: DataTypes.DECIMAL(10, 2), 
        defaultValue: 0,
        allowNull: false
    },
    total: { 
        type: DataTypes.DECIMAL(10, 2), 
        defaultValue: 0,
        allowNull: false
    },
    notas_cliente: DataTypes.TEXT
}, {
    tableName: 'carritos',
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: 'actualizado_en'
});

// Nota: Las asociaciones se definirán en index.js (como ya lo tienes) 
// pero se mantienen las básicas aquí por claridad si se requiere.
Cart.belongsTo(User, { foreignKey: 'usuario_id' });
User.hasOne(Cart, { foreignKey: 'usuario_id' });

export default Cart;