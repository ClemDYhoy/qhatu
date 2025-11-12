// C:\qhatu\backend\src\models\User.js
import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';

const User = sequelize.define('Usuario', {
  usuario_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Email inválido'
      }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true, // Puede ser null si es Google
  },
  auth_provider: {
    type: DataTypes.ENUM('manual', 'google'),
    defaultValue: 'manual'
  },
  google_id: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: true
  },
  foto_perfil_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  // 🔑 FOREIGN KEY al modelo Role
  rol_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4, // Cliente por defecto
    references: {
      model: 'roles',
      key: 'rol_id'
    }
  },
  // Información personal
  nombre_completo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  distrito: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  ciudad: {
    type: DataTypes.STRING(100),
    defaultValue: 'Huánuco'
  },
  pais: {
    type: DataTypes.STRING(100),
    defaultValue: 'Perú'
  },
  departamento: {
    type: DataTypes.STRING(100),
    defaultValue: 'Huánuco'
  },
  codigo_postal: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  // Documentos
  documento_tipo: {
    type: DataTypes.ENUM('DNI', 'RUC', 'CE'),
    defaultValue: 'DNI'
  },
  documento_numero: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  // Perfil
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  genero: {
    type: DataTypes.ENUM('M', 'F', 'Otro', 'Prefiero no decir'),
    allowNull: true
  },
  // Marketing y preferencias
  como_nos_conocio: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  categorias_interes: {
    type: DataTypes.JSON,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('categorias_interes');
      if (typeof rawValue === 'string') {
        try {
          return JSON.parse(rawValue);
        } catch (e) {
          return [];
        }
      }
      return rawValue || [];
    }
  },
  frecuencia_compra: {
    type: DataTypes.ENUM('primera_vez', 'mensual', 'trimestral', 'ocasional'),
    allowNull: true
  },
  rango_presupuesto: {
    type: DataTypes.ENUM('hasta_50', '50_100', '100_250', '250_500', 'mas_500'),
    allowNull: true
  },
  perfil_completado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Seguridad
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo', 'bloqueado'),
    defaultValue: 'activo'
  },
  email_verificado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  telefono_verificado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ultimo_acceso: {
    type: DataTypes.DATE,
    allowNull: true
  },
  intentos_fallidos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  bloqueado_hasta: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Timestamps
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
  tableName: 'usuarios',
  timestamps: false,
  hooks: {
    beforeCreate: async (user) => {
      // Solo hashear si es registro manual y hay password
      if (user.password && user.auth_provider === 'manual') {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
      user.creado_en = new Date();
      user.actualizado_en = new Date();
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && user.password && user.auth_provider === 'manual') {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
      user.actualizado_en = new Date();
    }
  }
});

// ====================================
// 🔧 MÉTODOS DE INSTANCIA
// ====================================

/**
 * Comparar contraseña ingresada con la hasheada
 */
User.prototype.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    throw new Error('Usuario registrado con Google, use inicio de sesión con Google');
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Serializar usuario (sin datos sensibles)
 */
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  delete values.intentos_fallidos;
  delete values.bloqueado_hasta;
  return values;
};

/**
 * Verificar si el usuario está bloqueado
 */
User.prototype.isBlocked = function() {
  if (this.estado !== 'bloqueado') return false;
  
  if (this.bloqueado_hasta && new Date() > new Date(this.bloqueado_hasta)) {
    // Auto-desbloquear si ya pasó el tiempo
    return false;
  }
  
  return true;
};

/**
 * Incrementar intentos fallidos y bloquear si es necesario
 */
User.prototype.incrementFailedAttempts = async function() {
  const nuevoIntentos = (this.intentos_fallidos || 0) + 1;
  
  if (nuevoIntentos >= 5) {
    await this.update({
      intentos_fallidos: nuevoIntentos,
      estado: 'bloqueado',
      bloqueado_hasta: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
    });
    return { blocked: true, attempts: nuevoIntentos };
  }
  
  await this.update({ intentos_fallidos: nuevoIntentos });
  return { blocked: false, attempts: nuevoIntentos, remaining: 5 - nuevoIntentos };
};

/**
 * Resetear intentos fallidos
 */
User.prototype.resetFailedAttempts = async function() {
  await this.update({
    intentos_fallidos: 0,
    estado: 'activo',
    bloqueado_hasta: null
  });
};

export default User;