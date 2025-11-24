// C:\qhatu\frontend\src\hooks\useWhatsApp.js
import { useState, useCallback } from 'react';
import { crearVentaWhatsApp } from '../services/ventasService';

/**
 * 📲 Abrir WhatsApp Web o App
 */
const abrirWhatsApp = (url) => {
  if (!url) {
    console.error('❌ URL de WhatsApp vacía');
    return false;
  }

  // Detectar si es móvil
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  console.log(`📱 Dispositivo: ${isMobile ? 'Móvil' : 'Escritorio'}`);
  console.log(`🔗 Abriendo WhatsApp: ${url.substring(0, 80)}...`);

  try {
    if (isMobile) {
      // En móvil, redirigir directamente
      console.log('📱 Abriendo app de WhatsApp...');
      window.location.href = url;
      return true;
    } else {
      // En escritorio, abrir en nueva pestaña
      console.log('💻 Abriendo WhatsApp Web en nueva pestaña...');
      
      const ventana = window.open(url, '_blank', 'noopener,noreferrer');
      
      // Verificar si el popup fue bloqueado
      if (!ventana || ventana.closed || typeof ventana.closed === 'undefined') {
        console.warn('⚠️ Popup bloqueado por el navegador');
        
        // Fallback: preguntar al usuario
        const abrirEnMismaVentana = window.confirm(
          '⚠️ Tu navegador bloqueó la ventana de WhatsApp.\n\n' +
          '¿Quieres abrir WhatsApp en esta pestaña?\n\n' +
          '(Recomendamos permitir ventanas emergentes para una mejor experiencia)'
        );
        
        if (abrirEnMismaVentana) {
          console.log('📱 Abriendo en la misma pestaña...');
          window.location.href = url;
          return true;
        } else {
          console.log('❌ Usuario canceló apertura de WhatsApp');
          return false;
        }
      }
      
      console.log('✅ WhatsApp Web abierto exitosamente');
      return true;
    }
  } catch (error) {
    console.error('❌ Error al abrir WhatsApp:', error);
    
    // Último intento: copiar URL al portapapeles
    const copiarURL = window.confirm(
      '❌ No se pudo abrir WhatsApp automáticamente.\n\n' +
      '¿Quieres copiar el enlace para abrirlo manualmente?'
    );
    
    if (copiarURL) {
      try {
        navigator.clipboard.writeText(url);
        alert('✅ Enlace copiado al portapapeles. Pégalo en tu navegador para abrir WhatsApp.');
      } catch (clipError) {
        alert(`No se pudo copiar. Copia este enlace manualmente:\n\n${url}`);
      }
    }
    
    return false;
  }
};

/**
 * 🎣 Hook para manejar compras por WhatsApp
 */
export const useWhatsApp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const comprarPorWhatsApp = useCallback(async (datosAdicionales = {}) => {
    setLoading(true);
    setError(null);

    try {
      console.log('📱 Iniciando compra por WhatsApp...');
      
      // 1️⃣ Crear venta en el backend
      const result = await crearVentaWhatsApp(datosAdicionales);

      if (!result.success) {
        throw new Error(result.message || 'Error al crear venta');
      }

      const { whatsapp_url, numero_venta, total } = result.data;
      
      console.log('✅ Venta creada:', numero_venta);
      console.log('📱 URL WhatsApp recibida:', whatsapp_url ? 'Sí' : 'No');

      // 2️⃣ Abrir WhatsApp si hay URL
      if (whatsapp_url) {
        console.log('📲 Intentando abrir WhatsApp...');
        const abierto = abrirWhatsApp(whatsapp_url);
        
        if (!abierto) {
          console.warn('⚠️ WhatsApp no se abrió automáticamente');
        }
      } else {
        console.error('❌ No se recibió URL de WhatsApp del backend');
        throw new Error('No se generó el enlace de WhatsApp');
      }
      
      return {
        success: true,
        data: result.data,
        message: `Pedido ${numero_venta} creado por S/.${parseFloat(total).toFixed(2)}`
      };

    } catch (err) {
      console.error('❌ Error en comprarPorWhatsApp:', err);
      
      const errorMessage = err.message || 'Error al procesar la compra';
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage,
        error: err
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    comprarPorWhatsApp,
    loading,
    error,
    resetError
  };
};

export default useWhatsApp;
