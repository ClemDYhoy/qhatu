// C:\qhatu\backend\src\controllers\userController.js
import { User, Role } from '../models/index.js';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';

// ==================================================
// 📊 OBTENER TODOS LOS USUARIOS (Admin)
// ==================================================
const getUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      rol = '', 
      estado = '', 
      sortBy = 'creado_en', 
      sortOrder = 'DESC' 
    } = req.query;

    // Construir filtros dinámicos
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { nombre_completo: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { telefono: { [Op.like]: `%${search}%` } }
      ];
    }

    if (estado && ['activo', 'inactivo', 'bloqueado'].includes(estado)) {
      where.estado = estado;
    }

    // Filtro por rol (por nombre o ID)
    if (rol) {
      const roleRecord = await Role.findOne({ 
        where: isNaN(rol) ? { nombre: rol } : { rol_id: parseInt(rol) }
      });
      if (roleRecord) {
        where.rol_id = roleRecord.rol_id;
      }
    }

    // Paginación
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Consulta con relaciones
    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { 
        exclude: ['password'] 
      },
      include: [{
        model: Role,
        as: 'rol',
        attributes: ['rol_id', 'nombre', 'descripcion']
      }],
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
      distinct: true
    });

    // Formatear respuesta
    const formattedUsers = users.map(user => ({
      usuario_id: user.usuario_id,
      nombre_completo: user.nombre_completo,
      email: user.email,
      telefono: user.telefono,
      estado: user.estado,
      rol: user.rol ? {
        rol_id: user.rol.rol_id,
        nombre: user.rol.nombre,
        descripcion: user.rol.descripcion
      } : null,
      auth_provider: user.auth_provider,
      email_verificado: user.email_verificado,
      telefono_verificado: user.telefono_verificado,
      perfil_completado: user.perfil_completado,
      ultimo_acceso: user.ultimo_acceso,
      creado_en: user.creado_en,
      foto_perfil_url: user.foto_perfil_url
    }));

    res.json({
      success: true,
      usuarios: formattedUsers,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error en getUsers:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener usuarios',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==================================================
// 👤 OBTENER PERFIL DEL USUARIO AUTENTICADO
// ==================================================
const getProfile = async (req, res) => {
  try {
    const userId = req.user.usuario_id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Role,
        as: 'rol',
        attributes: ['rol_id', 'nombre', 'descripcion', 'permisos']
      }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      usuario: {
        usuario_id: user.usuario_id,
        nombre_completo: user.nombre_completo,
        email: user.email,
        telefono: user.telefono,
        fecha_nacimiento: user.fecha_nacimiento,
        genero: user.genero,
        documento_tipo: user.documento_tipo,
        documento_numero: user.documento_numero,
        direccion: user.direccion,
        distrito: user.distrito,
        ciudad: user.ciudad,
        departamento: user.departamento,
        codigo_postal: user.codigo_postal,
        foto_perfil_url: user.foto_perfil_url,
        auth_provider: user.auth_provider,
        estado: user.estado,
        email_verificado: user.email_verificado,
        telefono_verificado: user.telefono_verificado,
        perfil_completado: user.perfil_completado,
        ultimo_acceso: user.ultimo_acceso,
        creado_en: user.creado_en,
        actualizado_en: user.actualizado_en,
        rol_id: user.rol_id,
        rol_nombre: user.rol?.nombre,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error('❌ Error en getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==================================================
// ✏️ ACTUALIZAR PERFIL DEL USUARIO
// ==================================================
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.usuario_id;
    const {
      nombre_completo,
      telefono,
      fecha_nacimiento,
      genero,
      documento_tipo,
      documento_numero,
      direccion,
      distrito,
      ciudad,
      departamento,
      codigo_postal
    } = req.body;

    // Buscar usuario
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // ========== VALIDACIONES ==========
    
    // Validar nombre completo
    if (nombre_completo !== undefined) {
      const trimmedName = nombre_completo.trim();
      if (trimmedName.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'El nombre completo debe tener al menos 3 caracteres'
        });
      }
      if (trimmedName.length > 255) {
        return res.status(400).json({
          success: false,
          message: 'El nombre completo es demasiado largo (máximo 255 caracteres)'
        });
      }
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(trimmedName)) {
        return res.status(400).json({
          success: false,
          message: 'El nombre solo puede contener letras y espacios'
        });
      }
    }

    // Validar teléfono
    if (telefono !== undefined && telefono) {
      if (!/^9\d{8}$/.test(telefono)) {
        return res.status(400).json({
          success: false,
          message: 'El teléfono debe tener 9 dígitos y comenzar con 9'
        });
      }
      
      // Verificar si el teléfono ya está en uso por otro usuario
      const existingPhone = await User.findOne({ 
        where: { 
          telefono, 
          usuario_id: { [Op.ne]: userId } 
        } 
      });
      
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'Este número de teléfono ya está registrado'
        });
      }
    }

    // Validar fecha de nacimiento
    if (fecha_nacimiento !== undefined && fecha_nacimiento) {
      const birthDate = new Date(fecha_nacimiento);
      const today = new Date();
      const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
      
      if (age < 13) {
        return res.status(400).json({
          success: false,
          message: 'Debes tener al menos 13 años para registrarte'
        });
      }
      
      if (age > 120) {
        return res.status(400).json({
          success: false,
          message: 'Fecha de nacimiento no válida'
        });
      }
    }

    // Validar género
    if (genero !== undefined && genero) {
      const validGenders = ['M', 'F', 'Otro', 'Prefiero no decir'];
      if (!validGenders.includes(genero)) {
        return res.status(400).json({
          success: false,
          message: 'Género no válido'
        });
      }
    }

    // Validar documento
    if (documento_numero !== undefined && documento_numero) {
      const docType = documento_tipo || user.documento_tipo;
      
      if (docType === 'DNI' && !/^\d{8}$/.test(documento_numero)) {
        return res.status(400).json({
          success: false,
          message: 'El DNI debe tener 8 dígitos'
        });
      }
      
      if (docType === 'RUC' && !/^\d{11}$/.test(documento_numero)) {
        return res.status(400).json({
          success: false,
          message: 'El RUC debe tener 11 dígitos'
        });
      }
      
      if (docType === 'CE' && (documento_numero.length < 8 || documento_numero.length > 12)) {
        return res.status(400).json({
          success: false,
          message: 'El Carnet de Extranjería debe tener entre 8 y 12 caracteres'
        });
      }

      // Verificar si el documento ya está en uso
      const existingDoc = await User.findOne({
        where: {
          documento_numero,
          usuario_id: { [Op.ne]: userId }
        }
      });

      if (existingDoc) {
        return res.status(400).json({
          success: false,
          message: 'Este número de documento ya está registrado'
        });
      }
    }

    // Validar código postal
    if (codigo_postal !== undefined && codigo_postal) {
      if (!/^\d{5}$/.test(codigo_postal)) {
        return res.status(400).json({
          success: false,
          message: 'El código postal debe tener 5 dígitos'
        });
      }
    }

    // ========== CONSTRUIR OBJETO DE ACTUALIZACIÓN ==========
    const fieldsToUpdate = {};

    if (nombre_completo !== undefined) fieldsToUpdate.nombre_completo = nombre_completo.trim();
    if (telefono !== undefined) fieldsToUpdate.telefono = telefono || null;
    if (fecha_nacimiento !== undefined) fieldsToUpdate.fecha_nacimiento = fecha_nacimiento || null;
    if (genero !== undefined) fieldsToUpdate.genero = genero || null;
    if (documento_tipo !== undefined) fieldsToUpdate.documento_tipo = documento_tipo;
    if (documento_numero !== undefined) fieldsToUpdate.documento_numero = documento_numero || null;
    if (direccion !== undefined) fieldsToUpdate.direccion = direccion?.trim() || null;
    if (distrito !== undefined) fieldsToUpdate.distrito = distrito?.trim() || null;
    if (ciudad !== undefined) fieldsToUpdate.ciudad = ciudad?.trim() || 'Huánuco';
    if (departamento !== undefined) fieldsToUpdate.departamento = departamento?.trim() || 'Huánuco';
    if (codigo_postal !== undefined) fieldsToUpdate.codigo_postal = codigo_postal || null;

    // Marcar perfil como completado si tiene datos mínimos
    const hasMinimalData = 
      (fieldsToUpdate.nombre_completo || user.nombre_completo) &&
      (fieldsToUpdate.telefono || user.telefono) &&
      (fieldsToUpdate.direccion || user.direccion);
    
    if (hasMinimalData) {
      fieldsToUpdate.perfil_completado = true;
    }

    // Actualizar en la base de datos
    await user.update(fieldsToUpdate);

    // Recargar usuario con relaciones
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Role,
        as: 'rol',
        attributes: ['rol_id', 'nombre', 'descripcion']
      }]
    });

    console.log(`✅ Perfil actualizado - Usuario: ${user.email}`);

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      usuario: {
        usuario_id: updatedUser.usuario_id,
        nombre_completo: updatedUser.nombre_completo,
        email: updatedUser.email,
        telefono: updatedUser.telefono,
        fecha_nacimiento: updatedUser.fecha_nacimiento,
        genero: updatedUser.genero,
        documento_tipo: updatedUser.documento_tipo,
        documento_numero: updatedUser.documento_numero,
        direccion: updatedUser.direccion,
        distrito: updatedUser.distrito,
        ciudad: updatedUser.ciudad,
        departamento: updatedUser.departamento,
        codigo_postal: updatedUser.codigo_postal,
        foto_perfil_url: updatedUser.foto_perfil_url,
        auth_provider: updatedUser.auth_provider,
        estado: updatedUser.estado,
        email_verificado: updatedUser.email_verificado,
        telefono_verificado: updatedUser.telefono_verificado,
        perfil_completado: updatedUser.perfil_completado,
        ultimo_acceso: updatedUser.ultimo_acceso,
        creado_en: updatedUser.creado_en,
        actualizado_en: updatedUser.actualizado_en,
        rol_id: updatedUser.rol_id,
        rol_nombre: updatedUser.rol?.nombre,
        rol: updatedUser.rol
      }
    });

  } catch (error) {
    console.error('❌ Error en updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==================================================
// 👤 OBTENER USUARIO POR ID (Admin)
// ==================================================
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Role,
        as: 'rol',
        attributes: ['rol_id', 'nombre', 'descripcion']
      }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      usuario: user
    });

  } catch (error) {
    console.error('❌ Error en getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==================================================
// 🔄 ASIGNAR ROL A USUARIO (Admin)
// ==================================================
const assignRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol_id, rol_nombre } = req.body;

    if (!rol_id && !rol_nombre) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar rol_id o rol_nombre'
      });
    }

    // Buscar el rol
    const role = await Role.findOne({
      where: rol_id ? { rol_id } : { nombre: rol_nombre }
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado'
      });
    }

    // Buscar el usuario
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir cambiar el rol de un super_admin
    if (user.rol_id === 1 && req.user.rol_id !== 1) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para modificar el rol de un super_admin'
      });
    }

    // Actualizar rol
    await user.update({ rol_id: role.rol_id });

    // Recargar usuario con relaciones
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Role,
        as: 'rol',
        attributes: ['rol_id', 'nombre', 'descripcion']
      }]
    });

    console.log(`✅ Rol asignado - Usuario: ${user.email}, Rol: ${role.nombre}`);

    res.json({
      success: true,
      message: 'Rol asignado exitosamente',
      usuario: updatedUser
    });

  } catch (error) {
    console.error('❌ Error en assignRole:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar rol',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==================================================
// ✏️ ACTUALIZAR USUARIO (Admin)
// ==================================================
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, rol_id } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir modificar super_admin
    if (user.rol_id === 1 && req.user.rol_id !== 1) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para modificar un super_admin'
      });
    }

    // Validar estado
    if (estado && !['activo', 'inactivo', 'bloqueado'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido'
      });
    }

    // Validar rol
    if (rol_id) {
      const role = await Role.findByPk(rol_id);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
      }
    }

    // Construir actualización
    const updates = {};
    if (estado) updates.estado = estado;
    if (rol_id) updates.rol_id = rol_id;

    await user.update(updates);

    // Recargar con relaciones
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Role,
        as: 'rol',
        attributes: ['rol_id', 'nombre', 'descripcion']
      }]
    });

    console.log(`✅ Usuario actualizado - ID: ${id}`);

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      usuario: updatedUser
    });

  } catch (error) {
    console.error('❌ Error en updateUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==================================================
// 🗑️ ELIMINAR CUENTA (Usuario)
// ==================================================
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.usuario_id;
    const { password } = req.body;

    // Validar que sea cliente
    if (['super_admin', 'vendedor', 'almacenero'].includes(req.user.rol_nombre)) {
      return res.status(403).json({
        success: false,
        message: 'Las cuentas de staff no pueden ser eliminadas desde aquí'
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña si es usuario manual
    if (user.auth_provider === 'manual') {
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña requerida para eliminar cuenta'
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Contraseña incorrecta'
        });
      }
    }

    // Soft delete
    await user.update({ estado: 'inactivo' });

    console.log(`🗑️ Cuenta desactivada - Usuario: ${user.email}`);

    res.json({
      success: true,
      message: 'Cuenta eliminada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en deleteAccount:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cuenta',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==================================================
// 🗑️ ELIMINAR USUARIO (Admin)
// ==================================================
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir eliminar super_admin
    if (user.rol_id === 1) {
      return res.status(403).json({
        success: false,
        message: 'No se puede eliminar una cuenta de super_admin'
      });
    }

    // Soft delete
    await user.update({ estado: 'inactivo' });

    console.log(`🗑️ Usuario eliminado - ID: ${id}, Email: ${user.email}`);

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en deleteUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==================================================
// 📤 EXPORTAR CONTROLADORES
// ==================================================
export default {
  getUsers,
  getProfile,
  updateProfile,
  getUserById,
  assignRole,
  updateUser,
  deleteAccount,
  deleteUser
};