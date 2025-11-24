// C:\qhatu\frontend\src\hooks\useWhatsApp.js
import { useState, useCallback } from 'react';
import { crearVentaWhatsApp } from '../services/ventasService';

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
      console.log('📱 URL WhatsApp recibida:', whatsapp_url);

      // 2️⃣ Abrir WhatsApp si hay URL
      if (whatsapp_url) {
        console.log('📲 Abriendo WhatsApp...');
        abrirWhatsApp(whatsapp_url);
      } else {
        console.warn('⚠️ No se recibió URL de WhatsApp');
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

/**
 * 📲 Abrir WhatsApp Web o App
 */
const abrirWhatsApp = (url) => {
  if (!url) {
    console.error('❌ URL de WhatsApp vacía');
    return;
  }

  // Detectar si es móvil
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  console.log(`📱 Dispositivo: ${isMobile ? 'Móvil' : 'Escritorio'}`);
  console.log(`🔗 Abriendo: ${url}`);

  if (isMobile) {
    // En móvil, redirigir directamente
    window.location.href = url;
  } else {
    // En escritorio, abrir en nueva pestaña
    const ventana = window.open(url, '_blank', 'noopener,noreferrer');
    
    if (!ventana || ventana.closed || typeof ventana.closed === 'undefined') {
      console.warn('⚠️ Popup bloqueado, intentando con location.href');
      
      // Fallback: mostrar alerta y copiar URL
      const copiar = window.confirm(
        '⚠️ El navegador bloqueó la ventana de WhatsApp.\n\n' +
        '¿Quieres abrir WhatsApp en esta pestaña?'
      );
      
      if (copiar) {
        window.location.href = url;
      }
    } else {
      console.log('✅ WhatsApp abierto en nueva pestaña');
    }
  }
};

export default useWhatsApp;