// backend/src/services/ml/mlFormatters.js

/**
 * 🎨 FORMATEADORES DE RESPUESTAS ML
 * 
 * Formatea las respuestas de los algoritmos ML para el frontend.
 * Asegura consistencia en todas las respuestas de la API.
 * 
 * @version 1.0.0
 */

import { 
  KMEANS_CONFIG, 
  WHATSAPP_CONFIG, 
  PRIORITY_CONFIG 
} from './mlConstants.js';

class MLFormatters {

  // ====================================
  // 🎯 FORMATEADORES DE SEGMENTACIÓN
  // ====================================

  /**
   * Formatear resultado de K-Means
   */
  formatSegmentacion(segmento, caracteristicas = {}) {
    const config = KMEANS_CONFIG.SEGMENTOS[segmento] || KMEANS_CONFIG.SEGMENTOS.NUEVO;

    return {
      segmento: config.nombre,
      color: config.color,
      icono: config.icono,
      prioridad: config.prioridad,
      descripcion: config.descripcion,
      score: this._calculateFidelityScore(caracteristicas),
      caracteristicas: {
        totalCompras: parseInt(caracteristicas.totalCompras) || 0,
        gastoTotal: this._formatMoney(caracteristicas.gastoTotal),
        ticketPromedio: this._formatMoney(caracteristicas.ticketPromedio),
        diasInactivo: parseInt(caracteristicas.diasInactivo) || 0,
        frecuenciaCompra: parseFloat(caracteristicas.frecuenciaCompra) || 0
      },
      recomendaciones: this._getSegmentRecommendations(segmento),
      badge: {
        text: config.nombre,
        color: config.color,
        icon: config.icono
      }
    };
  }

  /**
   * Calcular score de fidelidad
   */
  _calculateFidelityScore(caracteristicas) {
    const { totalCompras = 0, gastoTotal = 0, frecuenciaCompra = 0 } = caracteristicas;
    const { WEIGHTS } = KMEANS_CONFIG;

    // Normalizar valores
    const comprasNorm = Math.min(totalCompras / 50, 1); // Max 50 compras = 100%
    const gastoNorm = Math.min(gastoTotal / 5000, 1);   // Max S/.5000 = 100%
    const frecuenciaNorm = Math.min(frecuenciaCompra / 100, 1);

    const score = (
      comprasNorm * WEIGHTS.totalCompras * 100 +
      gastoNorm * WEIGHTS.gastoTotal * 100 +
      frecuenciaNorm * WEIGHTS.frecuencia * 100
    );

    return Math.round(Math.min(score, 100));
  }

  /**
   * Obtener recomendaciones según segmento
   */
  _getSegmentRecommendations(segmento) {
    const recommendations = {
      VIP: [
        'Prioridad MÁXIMA - Contactar inmediatamente',
        'Ofrecer productos premium y exclusivos',
        'Atención personalizada y preferencial',
        'Considerar descuentos especiales VIP'
      ],
      MEDIO: [
        'Prioridad MEDIA - Seguimiento activo',
        'Sugerir productos complementarios',
        'Mantener comunicación constante',
        'Incentivar con promociones'
      ],
      NUEVO: [
        'Prioridad ESTÁNDAR - En crecimiento',
        'Enfocarse en buena experiencia',
        'Sugerir productos populares',
        'Facilitar primera compra'
      ]
    };

    return recommendations[segmento] || recommendations.NUEVO;
  }

  // ====================================
  // 📊 FORMATEADORES DE RECOMENDACIONES
  // ====================================

  /**
   * Formatear resultado de Cosine Similarity
   */
  formatRecomendaciones(ventaId, productosOriginales, recomendaciones) {
    const recsFormateadas = recomendaciones.map(rec => ({
      producto_id: parseInt(rec.producto_id),
      producto_nombre: String(rec.producto_nombre).trim(),
      precio: this._formatMoney(rec.precio),
      precioNumerico: parseFloat(rec.precio),
      similitud: Math.round(rec.similitud * 100), // Convertir a porcentaje
      similitudDecimal: parseFloat(rec.similitud).toFixed(2),
      categoria_id: parseInt(rec.categoria_id),
      categoria_nombre: rec.categoria_nombre || 'Sin categoría',
      url_imagen: rec.url_imagen || '/awaiting-image.jpeg',
      razon: this._formatRazonRecomendacion(rec.razon),
      badge: {
        text: `${Math.round(rec.similitud * 100)}% similar`,
        color: this._getSimilarityColor(rec.similitud)
      }
    }));

    // Calcular totales
    const totalAdicional = recsFormateadas.reduce(
      (sum, rec) => sum + rec.precioNumerico, 
      0
    );

    return {
      ventaId: parseInt(ventaId),
      productosOriginales: productosOriginales.map(p => String(p).trim()),
      recomendaciones: recsFormateadas,
      totalRecomendaciones: recsFormateadas.length,
      resumen: {
        totalAdicional: this._formatMoney(totalAdicional),
        totalAdicionalNumerico: totalAdicional,
        promedioSimilitud: this._calculateAverageSimilarity(recsFormateadas),
        mejorRecomendacion: recsFormateadas[0] || null
      },
      mensaje: this._generateRecommendationMessage(recsFormateadas)
    };
  }

  /**
   * Formatear razón de recomendación
   */
  _formatRazonRecomendacion(razon) {
    if (!razon) return 'Recomendado por similitud';
    
    return String(razon)
      .replace(/misma categoria/gi, 'Misma categoría')
      .replace(/precio similar/gi, 'Precio similar')
      .replace(/producto popular/gi, 'Producto popular')
      .trim();
  }

  /**
   * Obtener color según similitud
   */
  _getSimilarityColor(similitud) {
    if (similitud >= 0.85) return 'green';
    if (similitud >= 0.70) return 'blue';
    if (similitud >= 0.60) return 'yellow';
    return 'gray';
  }

  /**
   * Calcular promedio de similitud
   */
  _calculateAverageSimilarity(recomendaciones) {
    if (recomendaciones.length === 0) return 0;
    
    const sum = recomendaciones.reduce(
      (acc, rec) => acc + rec.similitud, 
      0
    );
    
    return Math.round(sum / recomendaciones.length);
  }

  /**
   * Generar mensaje de recomendación
   */
  _generateRecommendationMessage(recomendaciones) {
    if (recomendaciones.length === 0) {
      return 'No hay recomendaciones disponibles en este momento';
    }

    if (recomendaciones.length === 1) {
      return `Te recomendamos ${recomendaciones[0].producto_nombre}`;
    }

    return `Te recomendamos ${recomendaciones.length} productos que van perfecto con tu pedido`;
  }

  // ====================================
  // 📈 FORMATEADORES DE PROBABILIDAD
  // ====================================

  /**
   * Formatear resultado de Regresión Lineal
   */
  formatProbabilidad(usuarioId, probabilidad, segmento, historial, factores = []) {
    const probabilidadRedondeada = Math.round(probabilidad);
    const prioridad = this._getPriorityLevel(probabilidadRedondeada);

    return {
      usuarioId: parseInt(usuarioId),
      probabilidad: probabilidadRedondeada,
      probabilidadDecimal: (probabilidad / 100).toFixed(2),
      porcentaje: `${probabilidadRedondeada}%`,
      segmento: segmento,
      confianza: this._getConfidenceLevel(historial.totalVentas),
      prioridad: {
        nivel: prioridad.label,
        color: prioridad.color,
        accion: prioridad.action
      },
      factores: factores.map(factor => ({
        factor: String(factor.factor).trim(),
        impacto: String(factor.impacto).trim(),
        descripcion: String(factor.descripcion).trim(),
        tipo: this._getFactorType(factor.impacto)
      })),
      historial: {
        totalVentas: parseInt(historial.totalVentas) || 0,
        confirmadas: parseInt(historial.confirmadas) || 0,
        tasaConfirmacion: this._formatPercentage(historial.tasaConfirmacion),
        tiempoPromedioConfirmacion: this._formatTime(historial.tiempoPromedioConfirmacion)
      },
      recomendacion: this._generateClosureRecommendation(probabilidadRedondeada, segmento),
      badge: {
        text: `${probabilidadRedondeada}% prob.`,
        color: prioridad.color,
        icon: this._getProbabilityIcon(probabilidadRedondeada)
      }
    };
  }

  /**
   * Obtener nivel de prioridad
   */
  _getPriorityLevel(probabilidad) {
    if (probabilidad >= PRIORITY_CONFIG.ALTA.minProbability) {
      return PRIORITY_CONFIG.ALTA;
    }
    if (probabilidad >= PRIORITY_CONFIG.MEDIA.minProbability) {
      return PRIORITY_CONFIG.MEDIA;
    }
    return PRIORITY_CONFIG.BAJA;
  }

  /**
   * Obtener nivel de confianza
   */
  _getConfidenceLevel(totalVentas) {
    if (totalVentas >= 20) return 'MUY_ALTA';
    if (totalVentas >= 10) return 'ALTA';
    if (totalVentas >= 5) return 'MEDIA';
    if (totalVentas >= 2) return 'BAJA';
    return 'MUY_BAJA';
  }

  /**
   * Obtener tipo de factor
   */
  _getFactorType(impacto) {
    const impactoStr = String(impacto).toLowerCase();
    if (impactoStr.includes('+') || impactoStr.includes('positivo')) return 'positivo';
    if (impactoStr.includes('-') || impactoStr.includes('negativo')) return 'negativo';
    return 'neutral';
  }

  /**
   * Generar recomendación de cierre
   */
  _generateClosureRecommendation(probabilidad, segmento) {
    if (probabilidad >= 85) {
      return `✅ Cliente ${segmento} con probabilidad MUY ALTA - Contactar AHORA`;
    }
    if (probabilidad >= 70) {
      return `🟡 Cliente ${segmento} con buena probabilidad - Seguimiento prioritario`;
    }
    if (probabilidad >= 50) {
      return `🟠 Cliente ${segmento} con probabilidad media - Requiere atención`;
    }
    return `🔴 Cliente ${segmento} con baja probabilidad - Enfocar esfuerzos en otros`;
  }

  /**
   * Obtener icono según probabilidad
   */
  _getProbabilityIcon(probabilidad) {
    if (probabilidad >= 85) return '🎯';
    if (probabilidad >= 70) return '✅';
    if (probabilidad >= 50) return '🟡';
    return '⚠️';
  }

  // ====================================
  // 📱 FORMATEADORES DE WHATSAPP
  // ====================================

  /**
   * Formatear mensaje de WhatsApp
   */
  formatMensajeWhatsApp(cliente, segmento, recomendaciones, mensajePersonalizado = null) {
    if (mensajePersonalizado) {
      return this._replacePlaceholders(mensajePersonalizado, cliente, segmento);
    }

    const template = this._getWhatsAppTemplate(segmento);
    let mensaje = this._replacePlaceholders(template.saludo, cliente, segmento);
    mensaje += '\n\n';
    mensaje += template.intro;
    mensaje += '\n\n';

    // Agregar productos recomendados
    recomendaciones.slice(0, WHATSAPP_CONFIG.MAX_PRODUCTS_IN_MESSAGE).forEach((rec, index) => {
      const emoji = this._getCategoryEmoji(rec.categoria_nombre);
      mensaje += `${emoji} ${rec.producto_nombre}\n`;
      mensaje += `   📊 ${rec.similitud}% similar - S/.${rec.precioNumerico.toFixed(2)}\n`;
      if (rec.razon) {
        mensaje += `   💡 ${rec.razon}\n`;
      }
      mensaje += '\n';
    });

    // Calcular nuevo total
    const totalAdicional = recomendaciones
      .slice(0, WHATSAPP_CONFIG.MAX_PRODUCTS_IN_MESSAGE)
      .reduce((sum, rec) => sum + rec.precioNumerico, 0);

    mensaje += `💰 Total adicional: S/.${totalAdicional.toFixed(2)}\n\n`;
    mensaje += template.despedida;

    return mensaje;
  }

  /**
   * Obtener template de WhatsApp según segmento
   */
  _getWhatsAppTemplate(segmento) {
    const templates = WHATSAPP_CONFIG.TEMPLATES;
    return templates[`recomendacion${segmento}`] || templates.recomendacionNuevo;
  }

  /**
   * Reemplazar placeholders en template
   */
  _replacePlaceholders(template, cliente, segmento) {
    return template
      .replace(/{nombre}/g, cliente.nombre || 'Cliente')
      .replace(/{segmento}/g, segmento)
      .replace(/{total}/g, this._formatMoney(cliente.total));
  }

  /**
   * Obtener emoji de categoría
   */
  _getCategoryEmoji(categoriaNombre) {
    const emojis = WHATSAPP_CONFIG.EMOJI_CATEGORIAS;
    return emojis[categoriaNombre] || emojis.default;
  }

  /**
   * Formatear URL de WhatsApp
   */
  formatWhatsAppURL(telefono, mensaje) {
    const numeroLimpio = String(telefono).replace(/\D/g, '');
    const numero = numeroLimpio.startsWith('51') ? numeroLimpio : `51${numeroLimpio}`;
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    return `https://wa.me/${numero}?text=${mensajeCodificado}`;
  }

  // ====================================
  // 🎯 FORMATEADORES DE ANÁLISIS COMPLETO
  // ====================================

  /**
   * Formatear análisis completo
   */
  formatAnalisisCompleto(ventaId, usuarioId, segmento, probabilidad, recomendaciones) {
    const resumen = this._generateExecutiveSummary(segmento, probabilidad, recomendaciones);

    return {
      success: true,
      ventaId: parseInt(ventaId),
      usuarioId: parseInt(usuarioId),
      timestamp: new Date().toISOString(),
      analisis: {
        segmentoCliente: segmento,
        probabilidadCierre: probabilidad,
        recomendacionesProductos: recomendaciones
      },
      resumen,
      metadata: {
        algoritmos: ['K-Means', 'Regresión Lineal', 'Cosine Similarity'],
        version: '1.0.0',
        generadoEn: new Date().toISOString()
      }
    };
  }

  /**
   * Generar resumen ejecutivo
   */
  _generateExecutiveSummary(segmento, probabilidad, recomendaciones) {
    const prioridad = this._getPriorityLevel(probabilidad.probabilidad);

    return {
      prioridad: prioridad.label,
      priorizacionColor: prioridad.color,
      segmento: segmento.segmento,
      segmentoColor: segmento.color,
      probabilidad: probabilidad.probabilidad,
      probabilidadPorcentaje: `${probabilidad.probabilidad}%`,
      recomendacionesCount: recomendaciones.totalRecomendaciones,
      accionRecomendada: this._getActionRecommendation(segmento, probabilidad),
      potencialUpsell: recomendaciones.totalRecomendaciones > 0 ? 'ALTO' : 'BAJO',
      potencialUpsellMonto: recomendaciones.resumen?.totalAdicional || 'S/.0.00',
      mensaje: `Cliente ${segmento.segmento} con ${probabilidad.probabilidad}% de probabilidad de cierre. ${recomendaciones.totalRecomendaciones} recomendaciones disponibles.`,
      indicadores: {
        urgencia: probabilidad.probabilidad >= 80 ? 'ALTA' : probabilidad.probabilidad >= 60 ? 'MEDIA' : 'BAJA',
        valor: segmento.score >= 80 ? 'ALTO' : segmento.score >= 50 ? 'MEDIO' : 'BAJO',
        oportunidad: recomendaciones.totalRecomendaciones >= 3 ? 'ALTA' : recomendaciones.totalRecomendaciones >= 1 ? 'MEDIA' : 'BAJA'
      }
    };
  }

  /**
   * Obtener recomendación de acción
   */
  _getActionRecommendation(segmento, probabilidad) {
    if (probabilidad.probabilidad >= 85 && segmento.segmento === 'VIP') {
      return 'CONTACTAR INMEDIATAMENTE - Cliente VIP con probabilidad muy alta';
    }
    if (probabilidad.probabilidad >= 70) {
      return 'SEGUIMIENTO PRIORITARIO - Alta probabilidad de cierre';
    }
    if (probabilidad.probabilidad >= 50) {
      return 'SEGUIMIENTO ESTÁNDAR - Probabilidad media';
    }
    return 'SEGUIMIENTO BAJO - Enfocar en otros clientes';
  }

  // ====================================
  // 🛠️ UTILIDADES DE FORMATO
  // ====================================

  /**
   * Formatear dinero
   */
  _formatMoney(amount) {
    const num = parseFloat(amount) || 0;
    return `S/.${num.toFixed(2)}`;
  }

  /**
   * Formatear porcentaje
   */
  _formatPercentage(value) {
    const num = parseFloat(value) || 0;
    return `${(num * 100).toFixed(1)}%`;
  }

  /**
   * Formatear tiempo
   */
  _formatTime(minutes) {
    const mins = parseInt(minutes) || 0;
    
    if (mins < 60) {
      return `${mins} minutos`;
    }
    
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    
    if (remainingMins === 0) {
      return `${hours} hora${hours > 1 ? 's' : ''}`;
    }
    
    return `${hours}h ${remainingMins}m`;
  }

  /**
   * Formatear respuesta de error
   */
  formatError(error, code = 'ML_ERROR') {
    return {
      success: false,
      error: error.message || 'Error en servicio ML',
      code: error.code || code,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        details: error
      })
    };
  }

  /**
   * Formatear respuesta de éxito
   */
  formatSuccess(data, message = 'Operación exitosa') {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    };
  }
}

// ====================================
// 📤 EXPORTAR SINGLETON
// ====================================

const mlFormatters = new MLFormatters();
export default mlFormatters;