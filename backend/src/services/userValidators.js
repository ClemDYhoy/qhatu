// C:\qhatu\backend\src\services\userValidators.js
const { User } = require('../models');
const { Op } = require('sequelize');

/**
 * ===================================================
 * 🛡️ VALIDADORES DE DATOS DE USUARIO
 * ===================================================
 * Funciones reutilizables para validar datos de usuarios
 */

class UserValidators {
  
  /**
   * Validar nombre completo
   * @param {string} nombre - Nombre a validar
   * @returns {Object} {valid: boolean, message: string}
   */
  static validateNombreCompleto(nombre) {
    if (!nombre) {
      return { valid: false, message: 'El nombre completo es requerido' };
    }

    const trimmedName = nombre.trim();

    if (trimmedName.length < 3) {
      return { valid: false, message: 'El nombre debe tener al menos 3 caracteres' };
    }

    if (trimmedName.length > 255) {
      return { valid: false, message: 'El nombre es demasiado largo (máximo 255 caracteres)' };
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(trimmedName)) {
      return { valid: false, message: 'El nombre solo puede contener letras y espacios' };
    }

    return { valid: true, value: trimmedName };
  }

  /**
   * Validar email
   * @param {string} email - Email a validar
   * @returns {Object} {valid: boolean, message: string}
   */
  static validateEmail(email) {
    if (!email) {
      return { valid: false, message: 'El email es requerido' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Email no válido' };
    }

    if (email.length > 255) {
      return { valid: false, message: 'Email demasiado largo' };
    }

    return { valid: true, value: email.toLowerCase().trim() };
  }

  /**
   * Validar que email no esté duplicado
   * @param {string} email - Email a verificar
   * @param {number} excludeUserId - ID de usuario a excluir (para updates)
   * @returns {Promise<Object>} {available: boolean, message: string}
   */
  static async checkEmailAvailability(email, excludeUserId = null) {
    const where = { email: email.toLowerCase().trim() };
    
    if (excludeUserId) {
      where.usuario_id = { [Op.ne]: excludeUserId };
    }

    const existingUser = await User.findOne({ where });

    if (existingUser) {
      return { available: false, message: 'Este email ya está registrado' };
    }

    return { available: true };
  }

  /**
   * Validar teléfono peruano
   * @param {string} telefono - Teléfono a validar
   * @returns {Object} {valid: boolean, message: string}
   */
  static validateTelefono(telefono) {
    if (!telefono) {
      return { valid: true, value: null }; // Teléfono es opcional
    }

    // Validar formato peruano: 9 dígitos comenzando con 9
    if (!/^9\d{8}$/.test(telefono)) {
      return { 
        valid: false, 
        message: 'El teléfono debe tener 9 dígitos y comenzar con 9' 
      };
    }

    return { valid: true, value: telefono };
  }

  /**
   * Validar que teléfono no esté duplicado
   * @param {string} telefono - Teléfono a verificar
   * @param {number} excludeUserId - ID de usuario a excluir
   * @returns {Promise<Object>} {available: boolean, message: string}
   */
  static async checkTelefonoAvailability(telefono, excludeUserId = null) {
    if (!telefono) return { available: true };

    const where = { telefono };
    
    if (excludeUserId) {
      where.usuario_id = { [Op.ne]: excludeUserId };
    }

    const existingUser = await User.findOne({ where });

    if (existingUser) {
      return { available: false, message: 'Este teléfono ya está registrado' };
    }

    return { available: true };
  }

  /**
   * Validar fecha de nacimiento
   * @param {string|Date} fecha - Fecha a validar
   * @returns {Object} {valid: boolean, message: string, age: number}
   */
  static validateFechaNacimiento(fecha) {
    if (!fecha) {
      return { valid: true, value: null }; // Fecha es opcional
    }

    const birthDate = new Date(fecha);
    const today = new Date();

    if (birthDate > today) {
      return { valid: false, message: 'La fecha de nacimiento no puede ser futura' };
    }

    const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));

    if (age < 13) {
      return { valid: false, message: 'Debes tener al menos 13 años' };
    }

    if (age > 120) {
      return { valid: false, message: 'Fecha de nacimiento no válida' };
    }

    return { valid: true, value: fecha, age };
  }

  /**
   * Validar género
   * @param {string} genero - Género a validar
   * @returns {Object} {valid: boolean, message: string}
   */
  static validateGenero(genero) {
    if (!genero) {
      return { valid: true, value: null }; // Género es opcional
    }

    const validGenders = ['M', 'F', 'Otro', 'Prefiero no decir'];

    if (!validGenders.includes(genero)) {
      return { 
        valid: false, 
        message: `Género no válido. Opciones: ${validGenders.join(', ')}` 
      };
    }

    return { valid: true, value: genero };
  }

  /**
   * Validar documento de identidad
   * @param {string} documento_numero - Número de documento
   * @param {string} documento_tipo - Tipo de documento (DNI, RUC, CE)
   * @returns {Object} {valid: boolean, message: string}
   */
  static validateDocumento(documento_numero, documento_tipo = 'DNI') {
    if (!documento_numero) {
      return { valid: true, value: null }; // Documento es opcional
    }

    switch (documento_tipo) {
      case 'DNI':
        if (!/^\d{8}$/.test(documento_numero)) {
          return { valid: false, message: 'El DNI debe tener 8 dígitos' };
        }
        break;

      case 'RUC':
        if (!/^\d{11}$/.test(documento_numero)) {
          return { valid: false, message: 'El RUC debe tener 11 dígitos' };
        }
        break;

      case 'CE':
        if (documento_numero.length < 8 || documento_numero.length > 12) {
          return { 
            valid: false, 
            message: 'El Carnet de Extranjería debe tener entre 8 y 12 caracteres' 
          };
        }
        break;

      default:
        return { valid: false, message: 'Tipo de documento no válido' };
    }

    return { valid: true, value: documento_numero };
  }

  /**
   * Validar que documento no esté duplicado
   * @param {string} documento_numero - Número de documento
   * @param {number} excludeUserId - ID de usuario a excluir
   * @returns {Promise<Object>} {available: boolean, message: string}
   */
  static async checkDocumentoAvailability(documento_numero, excludeUserId = null) {
    if (!documento_numero) return { available: true };

    const where = { documento_numero };
    
    if (excludeUserId) {
      where.usuario_id = { [Op.ne]: excludeUserId };
    }

    const existingUser = await User.findOne({ where });

    if (existingUser) {
      return { available: false, message: 'Este documento ya está registrado' };
    }

    return { available: true };
  }

  /**
   * Validar dirección
   * @param {string} direccion - Dirección a validar
   * @returns {Object} {valid: boolean, message: string}
   */
  static validateDireccion(direccion) {
    if (!direccion) {
      return { valid: true, value: null }; // Dirección es opcional
    }

    const trimmed = direccion.trim();

    if (trimmed.length < 10) {
      return { valid: false, message: 'La dirección es demasiado corta (mínimo 10 caracteres)' };
    }

    if (trimmed.length > 500) {
      return { valid: false, message: 'La dirección es demasiado larga (máximo 500 caracteres)' };
    }

    return { valid: true, value: trimmed };
  }

  /**
   * Validar código postal
   * @param {string} codigo_postal - Código postal a validar
   * @returns {Object} {valid: boolean, message: string}
   */
  static validateCodigoPostal(codigo_postal) {
    if (!codigo_postal) {
      return { valid: true, value: null }; // Código postal es opcional
    }

    if (!/^\d{5}$/.test(codigo_postal)) {
      return { valid: false, message: 'El código postal debe tener 5 dígitos' };
    }

    return { valid: true, value: codigo_postal };
  }

  /**
   * Validar perfil completo
   * Verifica si el usuario tiene los datos mínimos requeridos
   * @param {Object} userData - Datos del usuario
   * @returns {Object} {complete: boolean, missing: Array}
   */
  static checkPerfilCompletado(userData) {
    const requiredFields = {
      nombre_completo: 'Nombre completo',
      telefono: 'Teléfono',
      direccion: 'Dirección'
    };

    const missing = [];

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!userData[field] || userData[field].trim() === '') {
        missing.push(label);
      }
    }

    return {
      complete: missing.length === 0,
      missing,
      percentage: Math.round(((3 - missing.length) / 3) * 100)
    };
  }

  /**
   * Validar contraseña
   * @param {string} password - Contraseña a validar
   * @returns {Object} {valid: boolean, message: string, strength: string}
   */
  static validatePassword(password) {
    if (!password) {
      return { valid: false, message: 'La contraseña es requerida' };
    }

    if (password.length < 8) {
      return { 
        valid: false, 
        message: 'La contraseña debe tener al menos 8 caracteres' 
      };
    }

    if (password.length > 100) {
      return { valid: false, message: 'La contraseña es demasiado larga' };
    }

    // Verificar complejidad
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let strength = 'débil';
    let strengthScore = 0;

    if (hasUpperCase) strengthScore++;
    if (hasLowerCase) strengthScore++;
    if (hasNumbers) strengthScore++;
    if (hasSpecialChar) strengthScore++;

    if (strengthScore >= 3) strength = 'fuerte';
    else if (strengthScore >= 2) strength = 'media';

    if (strengthScore < 2) {
      return {
        valid: false,
        message: 'La contraseña debe contener mayúsculas, minúsculas y números',
        strength
      };
    }

    return { valid: true, strength };
  }

  /**
   * Sanitizar datos de usuario
   * Limpia y formatea los datos antes de guardar
   * @param {Object} data - Datos a sanitizar
   * @returns {Object} Datos sanitizados
   */
  static sanitizeUserData(data) {
    const sanitized = {};

    if (data.nombre_completo) {
      sanitized.nombre_completo = data.nombre_completo.trim();
    }

    if (data.email) {
      sanitized.email = data.email.toLowerCase().trim();
    }

    if (data.telefono) {
      sanitized.telefono = data.telefono.replace(/\D/g, ''); // Solo números
    }

    if (data.direccion) {
      sanitized.direccion = data.direccion.trim();
    }

    if (data.distrito) {
      sanitized.distrito = data.distrito.trim();
    }

    if (data.ciudad) {
      sanitized.ciudad = data.ciudad.trim();
    }

    if (data.departamento) {
      sanitized.departamento = data.departamento.trim();
    }

    if (data.codigo_postal) {
      sanitized.codigo_postal = data.codigo_postal.replace(/\D/g, '');
    }

    if (data.documento_numero) {
      sanitized.documento_numero = data.documento_numero.replace(/\D/g, '');
    }

    return sanitized;
  }
}

module.exports = UserValidators;