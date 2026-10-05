-- ============================================================
-- 002_add_missing_fks.sql
-- Añade claves foráneas faltantes para integridad referencial.
--
-- Verificado: 0 registros huérfanos en ambas columnas (2026-10-04),
-- por lo que la creación de las FK es segura.
--
-- Rollback sugerido:
--   ALTER TABLE carritos DROP FOREIGN KEY fk_carrito_venta;
--   ALTER TABLE banners_descuento DROP FOREIGN KEY fk_banner_creado_por;
-- ============================================================

-- carritos.convertido_venta_id -> ventas.venta_id
-- Si se elimina la venta, se anula la referencia (el carrito no se borra).
ALTER TABLE `carritos`
  ADD CONSTRAINT `fk_carrito_venta`
    FOREIGN KEY (`convertido_venta_id`) REFERENCES `ventas`(`venta_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- banners_descuento.creado_por -> usuarios.usuario_id
ALTER TABLE `banners_descuento`
  ADD CONSTRAINT `fk_banner_creado_por`
    FOREIGN KEY (`creado_por`) REFERENCES `usuarios`(`usuario_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;
