-- ============================================================
-- 001_clean_duplicate_indexes.sql
-- Limpia índices/constraints duplicados o redundantes.
-- NO elimina datos. Solo elimina índices repetidos.
--
-- Verificado con information_schema el 2026-10-04:
--   categorias: 7 UNIQUE idénticos sobre (nombre) + 1 índice no único redundante
--   usuarios:   2 FKs idénticas sobre (rol_id)
--   productos:  2 índices idénticos sobre (categoria_id)
--   ventas:     idx_fecha es prefijo de idx_ventas_fecha_estado
--   ventas_realizadas: idx_fecha_venta e idx_cliente_analytics son prefijos redundantes
--   ventas_realizadas_items: idx_producto es prefijo de idx_producto_analytics
--   banners_descuento: idx_activo_fechas es prefijo de idx_banner_activo_vigente
--
-- Rollback sugerido (si fuera necesario recrear):
--   ALTER TABLE categorias ADD UNIQUE INDEX nombre_2 (nombre); ... etc.
-- ============================================================

-- categorias: conservar 'nombre' y 'idx_padre_id'; eliminar las 6 UNIQUE duplicadas
-- y el índice no único redundante sobre la misma columna.
ALTER TABLE `categorias`
  DROP INDEX `nombre_2`,
  DROP INDEX `nombre_3`,
  DROP INDEX `nombre_4`,
  DROP INDEX `nombre_5`,
  DROP INDEX `nombre_6`,
  DROP INDEX `nombre_7`,
  DROP INDEX `idx_nombre_categoria`;

-- usuarios: conservar 'fk_usuario_rol', eliminar la FK duplicada.
-- (idx_usuarios_rol (rol_id, estado) sigue soportando la FK restante)
ALTER TABLE `usuarios`
  DROP FOREIGN KEY `usuarios_ibfk_1`;

-- productos: conservar 'idx_productos_categoria', eliminar el índice idéntico.
ALTER TABLE `productos`
  DROP INDEX `idx_categoria_id`;

-- ventas: eliminar el índice redundante (prefijo de idx_ventas_fecha_estado).
ALTER TABLE `ventas`
  DROP INDEX `idx_fecha`;

-- ventas_realizadas: eliminar índices redundantes por prefijo.
ALTER TABLE `ventas_realizadas`
  DROP INDEX `idx_fecha_venta`,
  DROP INDEX `idx_cliente_analytics`;

-- ventas_realizadas_items: eliminar el índice prefijo redundante.
ALTER TABLE `ventas_realizadas_items`
  DROP INDEX `idx_producto`;

-- banners_descuento: eliminar el índice prefijo redundante.
ALTER TABLE `banners_descuento`
  DROP INDEX `idx_activo_fechas`;
