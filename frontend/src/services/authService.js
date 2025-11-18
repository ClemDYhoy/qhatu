// C:\qhatu\frontend\src\services\authService.js
import api, { setAuthToken } from './api';

const TOKEN_KEY = 'qhatu_token';
const USER_KEY = 'qhatu_user';

class AuthService {
  // ====================================
  // 💾 ALMACENAMIENTO LOCAL
  // ====================================

  setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      setAuthToken(token);
      console.log('✅ Token guardado');
    }
  }

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  setUser(user) {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      // Disparar evento para notificar cambios
      window.dispatchEvent(new Event('userDataChanged'));
      console.log('✅ Usuario guardado:', user.email);
    }
  }

  getUser() {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('❌ Error parseando usuario:', error);
      return null;
    }
  }

  clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthToken(null);
    window.dispatchEvent(new Event('userDataChanged'));
    console.log('🗑️ Sesión limpiada');
  }

  // ====================================
  // 🔐 AUTENTICACIÓN
  // ====================================

  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  /**
   * Obtener ruta de redirección según rol
   */
  getRedirectRoute(rolNombre) {
    const routes = {
      'super_admin': '/admin',
      'vendedor': '/vendedor',
      'almacenero': '/almacenero',
      'cliente': '/'
    };
    
    return routes[rolNombre] || '/';
  }

  /**
   * Login manual
   */
  async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }

      console.log('🔐 Intentando login:', email);

      const response = await api.post('/auth/login', {
        email: email.toLowerCase().trim(),
        password
      });

      const { success, token, user, message } = response.data;

      if (success && token && user) {
        this.setToken(token);
        this.setUser(user);
        
        console.log('✅ Login exitoso:', user.email);
        console.log('👤 Rol:', user.rol_nombre);
        
        return { 
          success: true, 
          user, 
          message: message || 'Login exitoso',
          redirectTo: this.getRedirectRoute(user.rol_nombre)
        };
      }

      throw new Error(message || 'Error al iniciar sesión');
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Error al iniciar sesión';
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Registro manual
   */
  async register(userData) {
    try {
      if (!userData.email || !userData.password) {
        throw new Error('Email y contraseña son requeridos');
      }

      if (userData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      console.log('📝 Registrando usuario:', userData.email);

      const response = await api.post('/auth/register', {
        email: userData.email?.toLowerCase().trim(),
        password: userData.password,
        nombre_completo: userData.nombre_completo?.trim() || null,
        telefono: userData.telefono ? userData.telefono.replace(/\s/g, '') : null
      });

      const { success, token, user, message } = response.data;

      if (success && token && user) {
        this.setToken(token);
        this.setUser(user);
        
        console.log('✅ Usuario registrado:', user.email);
        
        return { 
          success: true, 
          user, 
          message: message || 'Registro exitoso',
          redirectTo: this.getRedirectRoute(user.rol_nombre)
        };
      }

      throw new Error(message || 'Error al registrar usuario');
    } catch (error) {
      console.error('❌ Error en registro:', error);
      
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Error al registrar usuario';
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Login/Registro con Google
   */
  async googleAuth(credential) {
    try {
      if (!credential) {
        throw new Error('Credencial de Google inválida');
      }

      console.log('🔐 Autenticando con Google...');

      const response = await api.post('/auth/google', { credential });

      const { success, token, user, message, isNewUser } = response.data;

      if (success && token && user) {
        this.setToken(token);
        this.setUser(user);
        
        console.log(
          isNewUser ? '✅ Cuenta creada con Google:' : '✅ Login con Google:', 
          user.email
        );
        
        return { 
          success: true, 
          user, 
          message: message || (isNewUser ? 'Cuenta creada' : 'Login exitoso'), 
          isNewUser,
          redirectTo: this.getRedirectRoute(user.rol_nombre)
        };
      }

      throw new Error(message || 'Error con autenticación de Google');
    } catch (error) {
      console.error('❌ Error en Google Auth:', error);
      
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Error con autenticación de Google';
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Verificar token actual
   */
  async verifyToken() {
    try {
      const token = this.getToken();

      if (!token) {
        console.log('ℹ️ No hay token guardado');
        return { success: false, message: 'No hay token' };
      }

      console.log('🔍 Verificando token...');

      const response = await api.get('/auth/me');

      if (response.data?.success && response.data?.user) {
        this.setUser(response.data.user);
        console.log('✅ Token válido:', response.data.user.email);
        return { success: true, user: response.data.user };
      }

      console.warn('⚠️ Token inválido');
      this.clearAuth();
      return { success: false, message: 'Token inválido' };
    } catch (error) {
      console.error('❌ Error verificando token:', error);
      this.clearAuth();
      return { success: false, message: 'Error verificando sesión' };
    }
  }

  /**
   * Obtener usuario actual (desde localStorage)
   */
  getCurrentUser() {
    return this.getUser();
  }

  /**
   * Obtener información del usuario actual desde la API
   */
  async fetchCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      
      if (response.data?.success && response.data?.user) {
        this.setUser(response.data.user);
        return response.data.user;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo usuario actual:', error);
      return null;
    }
  }

  /**
   * Completar perfil
   */
  async completeProfile(profileData) {
    try {
      const response = await api.put('/auth/complete-profile', {
        telefono: profileData.telefono?.replace(/\s/g, ''),
        direccion: profileData.direccion,
        distrito: profileData.distrito,
        departamento: profileData.departamento || 'Huánuco',
        fecha_nacimiento: profileData.fecha_nacimiento,
        genero: profileData.genero,
        como_nos_conocio: profileData.como_nos_conocio,
        categorias_interes: profileData.categorias_interes,
        frecuencia_compra: profileData.frecuencia_compra,
        rango_presupuesto: profileData.rango_presupuesto
      });

      const { success, message } = response.data;

      if (success) {
        const currentUser = this.getUser();
        const updatedUser = { 
          ...currentUser, 
          ...profileData, 
          perfil_completado: true 
        };
        this.setUser(updatedUser);
        
        console.log('✅ Perfil completado');
        return { success: true, user: updatedUser, message };
      }

      return response.data;
    } catch (error) {
      console.error('❌ Error completando perfil:', error);
      
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Error al completar perfil';
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(currentPassword, newPassword) {
    try {
      if (!currentPassword || !newPassword) {
        throw new Error('Las contraseñas son requeridas');
      }

      if (newPassword.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
      }

      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });

      console.log('✅ Contraseña actualizada');
      return response.data;
    } catch (error) {
      console.error('❌ Error cambiando contraseña:', error);
      
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Error al cambiar contraseña';
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Verificar si email existe
   */
  async checkEmail(email) {
    try {
      if (!email) {
        return false;
      }

      const response = await api.get('/auth/check-email', {
        params: { email: email.toLowerCase().trim() }
      });

      return response.data?.exists || false;
    } catch (error) {
      console.error('❌ Error verificando email:', error);
      return false;
    }
  }

  /**
   * Logout
   */
  async logout() {
    try {
      await api.post('/auth/logout').catch(() => {
        // Ignorar errores del logout en backend
      });
      console.log('✅ Sesión cerrada en el servidor');
    } finally {
      this.clearAuth();
    }
  }

  // ====================================
  // 🛡️ UTILIDADES DE ROLES
  // ====================================

  getUserRole() {
    const user = this.getUser();
    return user?.rol_nombre || null;
  }

  hasRole(role) {
    const userRole = this.getUserRole();
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    return userRole === role;
  }

  hasAnyRole(roles) {
    const userRole = this.getUserRole();
    return roles.includes(userRole);
  }

  isAdmin() {
    return this.hasRole('super_admin');
  }

  isVendedor() {
    return this.hasRole('vendedor');
  }

  isAlmacenero() {
    return this.hasRole('almacenero');
  }

  isCliente() {
    return this.hasRole('cliente');
  }

  /**
   * Inicializar autenticación al cargar la app
   */
  initializeAuth() {
    const token = this.getToken();
    const user = this.getUser();
    
    if (token && user) {
      setAuthToken(token);
      console.log('🔐 Sesión encontrada:', user.email);
      console.log('👤 Rol:', user.rol_nombre);
      
      // Verificar token en background (no bloquear la carga)
      this.verifyToken().catch(() => {
        console.warn('⚠️ Token inválido o expirado');
      });
    } else {
      console.log('ℹ️ No hay sesión activa');
    }
  }
}

// Exportar instancia única (Singleton)
const authServiceInstance = new AuthService();

export default authServiceInstance;