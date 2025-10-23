import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js'; // Importar como exportación predeterminada

const User = sequelize.define('Usuario', {
    usuario_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: 'actualizado_en'
});

export default User;