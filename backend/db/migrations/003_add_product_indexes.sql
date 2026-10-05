-- ============================================================
-- 003_add_product_indexes.sql
-- Índices para las consultas reales de productos.
--
-- Las consultas de listado/búsqueda filtran por categoria_id, stock,
-- destacado y ordenan por ventas / creado_en / stock.
--
-- Rollback sugerido:
--   ALTER TABLE productos DROP INDEX idx_productos_stock, ... etc.
-- ============================================================

ALTER TABLE `productos`
  ADD INDEX `idx_productos_stock` (`stock`),
  ADD INDEX `idx_productos_ventas` (`ventas`),
  ADD INDEX `idx_productos_creado_en` (`creado_en`),
  ADD INDEX `idx_productos_categoria_stock` (`categoria_id`, `stock`);
