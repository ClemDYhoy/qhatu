// C:\qhatu\frontend\src\hooks\useWhatsApp.js
import { useState } from 'react';
import ventasService from '../services/ventasService';

/**
 * 📱 Hook para manejar compras por WhatsApp
 */
export const useWhatsApp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 🛒 Crear venta y abrir WhatsApp
   */
  const comprarPorWhatsApp = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📱 Iniciando compra por WhatsApp...');

      // 1️⃣ Crear venta en el backend
      const response = await ventasService.crearVentaWhatsApp();

      if (!response.success) {
        throw new Error(response.message || 'Error al crear venta');
      }

      const { numero_venta, venta_id, total, whatsapp_url } = response.data;

      console.log('✅ Venta creada:', numero_venta);

      // 2️⃣ Abrir WhatsApp
      if (whatsapp_url) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
          // En móvil, abrir directamente
          window.location.href = whatsapp_url;
        } else {
          // En escritorio, abrir en nueva pestaña
          const ventana = window.open(whatsapp_url, '_blank', 'noopener,noreferrer');
          
          if (!ventana) {
            console.warn('⚠️ Ventana bloqueada, intentando location.href');
            window.open(whatsapp_url, '_blank');
          }
        }
      } else {
        console.warn('⚠️ No se generó URL de WhatsApp');
      }

      return {
        success: true,
        data: {
          numero_venta,
          venta_id,
          total,
          whatsapp_url
        }
      };

    } catch (err) {
      console.error('❌ Error en comprarPorWhatsApp:', err);
      
      // Mensajes de error específicos
      let userMessage = 'Error al procesar la compra';
      
      if (err.message.includes('vacío') || err.message.includes('empty')) {
        userMessage = 'Tu carrito está vacío';
      } else if (err.message.includes('stock')) {
        userMessage = 'Algunos productos no tienen stock suficiente';
      } else if (err.message.includes('sesión') || err.message.includes('autenticación')) {
        userMessage = 'Tu sesión expiró. Por favor inicia sesión nuevamente';
      }
      
      setError(userMessage);
      
      return {
        success: false,
        message: userMessage,
        error: err.message
      };

    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔄 Limpiar error
   */
  const clearError = () => {
    setError(null);
  };

  return {
    comprarPorWhatsApp,
    loading,
    error,
    clearError
  };
};

export default useWhatsApp;