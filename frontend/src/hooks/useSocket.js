// C:\qhatu\frontend\src\hooks\useSocket.js
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

/**
 * 🔌 Hook para Socket.IO
 * Maneja conexión, reconexión automática y eventos en tiempo real
 */
export const useSocket = (user) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    // Solo conectar si hay usuario autenticado
    if (!user) {
      if (socketRef.current) {
        console.log('🔌 Desconectando socket (sin usuario)');
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Si ya hay socket activo, no crear uno nuevo
    if (socketRef.current && socketRef.current.connected) {
      console.log('🔌 Socket ya conectado');
      return;
    }

    console.log('🔌 Iniciando conexión Socket.IO...');

    // Crear nueva conexión
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: maxReconnectAttempts,
      timeout: 10000,
      auth: {
        token: localStorage.getItem('token')
      }
    });

    socketRef.current = newSocket;

    // Eventos de conexión
    newSocket.on('connect', () => {
      console.log('✅ Socket.IO conectado:', newSocket.id);
      setIsConnected(true);
      reconnectAttempts.current = 0;

      // Unirse a sala según rol
      if (user.rol_nombre === 'vendedor') {
        newSocket.emit('join-vendedor', {
          vendedor_id: user.usuario_id,
          nombre: user.nombre_completo
        });
      } else if (user.rol_nombre === 'super_admin') {
        newSocket.emit('join-admin', {
          admin_id: user.usuario_id,
          nombre: user.nombre_completo
        });
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket desconectado:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Error de conexión Socket.IO:', error.message);
      reconnectAttempts.current++;
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('❌ Máximo de reintentos alcanzado');
        newSocket.close();
      }
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconectado después de ${attemptNumber} intentos`);
      setIsConnected(true);
      reconnectAttempts.current = 0;
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Intento de reconexión ${attemptNumber}/${maxReconnectAttempts}`);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('❌ Error en reconexión:', error.message);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('❌ Falló la reconexión después de todos los intentos');
    });

    // Confirmación de unión a sala
    newSocket.on('joined-vendedor', (data) => {
      console.log('✅ Unido a sala de vendedor:', data);
    });

    newSocket.on('joined-admin', (data) => {
      console.log('✅ Unido a sala de admin:', data);
    });

    // Ping/Pong para mantener conexión
    const pingInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit('ping');
      }
    }, 30000); // Cada 30 segundos

    newSocket.on('pong', (data) => {
      console.log('🏓 Pong recibido:', data.timestamp);
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      clearInterval(pingInterval);
      
      if (socketRef.current) {
        console.log('🔌 Limpiando conexión Socket.IO');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  /**
   * Enviar evento
   */
  const emit = (event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('⚠️ Socket no conectado, no se puede emitir:', event);
    }
  };

  /**
   * Escuchar evento
   */
  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  /**
   * Dejar de escuchar evento
   */
  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off
  };
};

export default useSocket;