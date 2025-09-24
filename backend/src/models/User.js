import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcrypt';

const User = sequelize.define(
'usuarios',
{
id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
},
nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
},
correo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
    isEmail: true
    }
},
contrasena: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
    notEmpty: true,
    len: [8, 255]
    }
},
rol: {
    type: DataTypes.ENUM('cliente', 'admin'),
    allowNull: false,
    defaultValue: 'cliente'
},
telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
},
fecha_registro: {
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
tableName: 'usuarios'
}
);


// 🔐 Hashear contraseña antes de crear el usuario
User.beforeCreate(async (user) => {
  console.log('Contraseña antes de hash:', user.contrasena); // <-- Agrega esta línea
  user.contrasena = await bcrypt.hash(user.contrasena, 10);
});

// 🔍 Método para comparar contraseñas
User.prototype.comparePassword = async function (password) {
return await bcrypt.compare(password, this.contrasena);
};

export default User;