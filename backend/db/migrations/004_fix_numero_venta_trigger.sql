-- ============================================================
-- 004_fix_numero_venta_trigger.sql
-- Corrige la condición de carrera al generar numero_venta.
--
-- Problema: el trigger actual calcula MAX(SUBSTRING(...)) + 1 en cada INSERT.
-- Dos inserciones concurrentes pueden obtener el mismo número y, como
-- numero_venta es UNIQUE, una de ellas falla.
--
-- Solución: una tabla de secuencia con incremento atómico.
--
-- Funcionalidad de negocio preservada: sigue generando QH-0001, QH-0002, ...
-- Cambia únicamente el mecanismo de obtención del consecutivo.
--
-- Nota: NO se usa DELIMITER (es directiva del cliente mysql, no del servidor).
-- El runner envía el CREATE TRIGGER como una sola sentencia.
--
-- Rollback sugerido: restaurar la versión anterior del trigger.
-- ============================================================

CREATE TABLE IF NOT EXISTS `secuencia_ventas` (
  `id` TINYINT NOT NULL,
  `ultimo` INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `secuencia_ventas` (`id`, `ultimo`)
VALUES (1, (
  SELECT COALESCE(MAX(CAST(SUBSTRING(numero_venta, 4) AS UNSIGNED)), 0)
  FROM ventas
  WHERE numero_venta LIKE 'QH-%'
))
ON DUPLICATE KEY UPDATE `ultimo` = GREATEST(`ultimo`, VALUES(`ultimo`));

DROP TRIGGER IF EXISTS `before_insert_venta_qhatu`;

CREATE TRIGGER `before_insert_venta_qhatu`
BEFORE INSERT ON `ventas`
FOR EACH ROW
BEGIN
  IF NEW.numero_venta IS NULL OR NEW.numero_venta = '' THEN
    UPDATE `secuencia_ventas`
      SET `ultimo` = LAST_INSERT_ID(`ultimo` + 1)
      WHERE `id` = 1;

    SET NEW.numero_venta = CONCAT('QH-', LPAD(LAST_INSERT_ID(), 4, '0'));
  END IF;
END;
