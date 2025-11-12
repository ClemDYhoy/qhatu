// C:\qhatu\backend\src\controllers\authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Role from '../models/Role.js';
import SessionTracking from '../models/SessionTracking.js';
import { verifyGoogleToken } from '../config/google.js';
import { UAParser } from 'ua-parser-js';

// ====================================
// 🔧 UTILIDADES
// ====================================

/**
 * Generar JWT
 */
const generateToken = (userId) => {
  return jwt.sign(
    { usuario_id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Extraer información del dispositivo
 */
const extractDeviceInfo = (userAgent) => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  return {
    dispositivo: result.device.type || 'desktop',
    navegador: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
    sistema_operativo: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim()
  };
};

/**
 * Crear sesión de tracking
 */
const createTrackingSession = async (req, userId = null) => {
  const deviceInfo = extractDeviceInfo(req.headers['user-agent'] || '');
  
  try {
    const tracking = await SessionTracking.create({
      usuario_id: userId,
      sesion_temporal: userId ? null : `temp_${Date.now()}`,
      ip_address: req.ip || req.connection?.remoteAddress || null,
      user_agent: req.headers['user-agent'] || null,
      ...deviceInfo,
      fuente_trafico: req.query.utm_source || null,
      medio_trafico: req.query.utm_medium || null,
      campania: req.query.utm_campaign || null,
      referrer: req.headers.referer || req.headers.referrer || null,
      pagina_entrada: req.originalUrl
    });
    
    return tracking.tracking_id;
  } catch (error) {
    console.error('⚠️ Error creando tracking:', error.message);
    return null;
  }
};

/**
 * Formatear datos de usuario para respuesta
 */
const formatUserResponse = (user, includeRole = true) => {
  const userData = {
    usuario_id: user.usuario_id,
    email: user.email,
    nombre_completo: user.nombre_completo,
    telefono: user.telefono,
    foto_perfil_url: user.foto_perfil_url,
    rol_id: user.rol_id,
    estado: user.estado
  };

  if (includeRole && user.rol) {
    userData.rol_nombre = user.rol.nombre;
    userData.permisos = user.rol.permisos || {};
  }

  return userData;
};

// ====================================
// 📝 CONTROLADORES
// ====================================

/**
 * @route   POST /api/auth/register
 * @desc    Registro manual de usuario
 * @access  Público
 */
const register = async (req, res) => {
  try {
    const { email, password, nombre_completo, telefono } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si existe
    const existingUser = await User.findOne({ 
      where: { email: email.toLowerCase() } 
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear usuario
    const user = await User.create({
      email: email.toLowerCase().trim(),
      password,
      nombre_completo: nombre_completo?.trim() || null,
      telefono: telefono ? telefono.replace(/\s/g, '') : null,
      auth_provider: 'manual',
      rol_id: 4, // Cliente
      estado: 'activo',
      email_verificado: false
    });

    // Recargar con rol
    await user.reload({
      include: [{
        model: Role,
        as: 'rol',
        attributes: ['nombre', 'permisos']
      }]
    });

    // Tracking
    await createTrackingSession(req, user.usuario_id);

    // Token
    const token = generateToken(user.usuario_id);

    // Actualizar último acceso
    await user.update({ ultimo_acceso: new Date() });

    console.log(`✅ Usuario registrado: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: formatUserResponse(user)
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login manual
 * @access  Público
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Intento de login:', email);

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // 🔍 Buscar usuario con rol incluido
    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() },
      attributes: [
        'usuario_id',
        'email', 
        'password',
        'auth_provider',
        'nombre_completo',
        'telefono',
        'foto_perfil_url',
        'rol_id',
        'estado',
        'intentos_fallidos',
        'bloqueado_hasta',
        'ultimo_acceso'
      ],
      include: [{
        model: Role,
        as: 'rol',
        attributes: ['nombre', 'permisos']
      }]
    });

    // Usuario no encontrado
    if (!user) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // ✅ Verificar estado de la cuenta
    // Verificar si está bloqueado temporalmente
    if (user.estado === 'bloqueado') {
      if (user.bloqueado_hasta && new Date() < new Date(user.bloqueado_hasta)) {
        const tiempoRestante = Math.ceil((new Date(user.bloqueado_hasta) - new Date()) / 60000);
        return res.status(403).json({
          success: false,
          message: `Cuenta bloqueada. Intenta en ${tiempoRestante} minutos.`
        });
      } else {
        // Desbloquear automáticamente
        await user.resetFailedAttempts();
      }
    }

    // Verificar si está inactiva
    if (user.estado === 'inactivo') {
      return res.status(403).json({
        success: false,
        message: 'Tu cuenta está inactiva. Contacta al administrador.'
      });
    }

    // 🔑 Verificar proveedor de autenticación
    if (user.auth_provider === 'google') {
      return res.status(400).json({
        success: false,
        message: 'Esta cuenta fue creada con Google. Usa "Iniciar sesión con Google"'
      });
    }

    // Verificar que tenga contraseña
    if (!user.password) {
      console.log('❌ Usuario sin contraseña:', email);
      return res.status(400).json({
        success: false,
        message: 'Esta cuenta no tiene contraseña configurada'
      });
    }

    // 🔒 Verificar contraseña
    console.log('🔐 Verificando contraseña...');
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      console.log('❌ Contraseña incorrecta');
      
      // Incrementar intentos fallidos
      const result = await user.incrementFailedAttempts();
      
      if (result.blocked) {
        return res.status(401).json({
          success: false,
          message: 'Cuenta bloqueada por múltiples intentos fallidos. Intenta en 30 minutos.'
        });
      }

      return res.status(401).json({
        success: false,
        message: `Credenciales inválidas. ${result.remaining} intentos restantes.`
      });
    }

    // ✅ LOGIN EXITOSO
    console.log(`✅ Login exitoso: ${user.email} (${user.rol?.nombre || 'sin rol'})`);

    // Resetear intentos fallidos y actualizar último acceso
    await user.update({
      intentos_fallidos: 0,
      estado: 'activo',
      bloqueado_hasta: null,
      ultimo_acceso: new Date()
    });

    // Tracking
    await createTrackingSession(req, user.usuario_id);

    // Token
    const token = generateToken(user.usuario_id);

    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: formatUserResponse(user)
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   POST /api/auth/google
 * @desc    Login/Registro con Google
 * @access  Público
 */
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Token de Google requerido'
      });
    }

    // Verificar token
    const googleData = await verifyGoogleToken(credential);

    // Buscar usuario existente
    let user = await User.findOne({
      where: { email: googleData.email },
      include: [{
        model: Role,
        as: 'rol',
        attributes: ['nombre', 'permisos']
      }]
    });

    let isNewUser = false;

    if (user) {
      // Usuario existente - actualizar datos de Google
      await user.update({
        google_id: googleData.google_id,
        auth_provider: 'google',
        foto_perfil_url: googleData.foto_perfil_url,
        email_verificado: true,
        ultimo_acceso: new Date()
      });

      await user.reload({
        include: [{
          model: Role,
          as: 'rol',
          attributes: ['nombre', 'permisos']
        }]
      });
    } else {
      // Crear nuevo usuario
      user = await User.create({
        email: googleData.email,
        google_id: googleData.google_id,
        nombre_completo: googleData.nombre_completo,
        foto_perfil_url: googleData.foto_perfil_url,
        auth_provider: 'google',
        rol_id: 4, // Cliente
        estado: 'activo',
        email_verificado: true
      });

      // Recargar con relaciones
      await user.reload({
        include: [{
          model: Role,
          as: 'rol',
          attributes: ['nombre', 'permisos']
        }]
      });

      isNewUser = true;
    }

    console.log(`✅ ${isNewUser ? 'Registro' : 'Login'} con Google: ${user.email}`);

    // Tracking
    await createTrackingSession(req, user.usuario_id);

    // Token
    const token = generateToken(user.usuario_id);

    res.json({
      success: true,
      message: isNewUser ? 'Cuenta creada con Google' : 'Login exitoso',
      token,
      user: formatUserResponse(user),
      isNewUser
    });

  } catch (error) {
    console.error('❌ Error en Google Auth:', error);
    res.status(500).json({
      success: false,
      message: 'Error al autenticar con Google',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Obtener usuario autenticado
 * @access  Privado
 */
const me = async (req, res) => {
  try {
    // req.user ya viene del middleware con el rol incluido
    res.json({
      success: true,
      user: formatUserResponse(req.user)
    });
  } catch (error) {
    console.error('❌ Error en /me:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos del usuario'
    });
  }
};

/**
 * @route   PUT /api/auth/complete-profile
 * @desc    Completar perfil (al comprar)
 * @access  Privado
 */
const completeProfile = async (req, res) => {
  try {
    const userId = req.user.usuario_id;
    const {
      telefono,
      direccion,
      distrito,
      departamento,
      fecha_nacimiento,
      genero,
      como_nos_conocio,
      categorias_interes,
      frecuencia_compra,
      rango_presupuesto
    } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    await user.update({
      telefono: telefono?.replace(/\s/g, ''),
      direccion,
      distrito,
      departamento,
      fecha_nacimiento,
      genero,
      como_nos_conocio,
      categorias_interes: JSON.stringify(categorias_interes),
      frecuencia_compra,
      rango_presupuesto,
      perfil_completado: true
    });

    console.log(`✅ Perfil completado: ${user.email}`);

    res.json({
      success: true,
      message: 'Perfil completado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error completando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al completar perfil',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   GET /api/auth/check-email
 * @desc    Verificar si email existe
 * @access  Público
 */
const checkEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requerido'
      });
    }

    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      attributes: ['usuario_id']
    });

    res.json({
      success: true,
      exists: !!user
    });

  } catch (error) {
    console.error('❌ Error verificando email:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar email'
    });
  }
};

/**
 * @route   PUT /api/auth/change-password
 * @desc    Cambiar contraseña
 * @access  Privado
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user.usuario_id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseñas requeridas'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    const user = await User.findByPk(userId, {
      attributes: ['usuario_id', 'email', 'password', 'auth_provider']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (user.auth_provider === 'google') {
      return res.status(400).json({
        success: false,
        message: 'No puedes cambiar la contraseña de una cuenta de Google'
      });
    }

    const isValid = await user.comparePassword(currentPassword);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    await user.update({ password: newPassword });

    console.log(`✅ Contraseña actualizada: ${user.email}`);

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error cambiando contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ====================================
// 📤 EXPORTACIONES
// ====================================

export default {
  register,
  login,
  googleAuth,
  me,
  completeProfile,
  checkEmail,
  changePassword
};