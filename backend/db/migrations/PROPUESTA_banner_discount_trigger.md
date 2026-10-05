# Propuesta: corregir `trg_aplicar_descuento_categoria` (requiere aprobación)

> Este archivo NO se ejecuta (el runner solo aplica `*.sql`). Es una propuesta para revisar.

## Qué hace hoy (analizado)

Trigger `AFTER INSERT ON banners_descuento`:

```sql
IF NEW.activo = 1 AND NOW() BETWEEN NEW.fecha_inicio AND NEW.fecha_fin THEN
  UPDATE productos
  SET precio_descuento = precio * (1 - NEW.porcentaje_descuento / 100)
  WHERE categoria_id = NEW.categoria_id
    AND precio_descuento IS NULL;
END IF;
```

**Intención de negocio:** al crear un banner de descuento para una categoría, aplicar
ese descuento a los productos de la categoría.

## Problemas

1. **Modifica `productos.precio_descuento` de forma permanente.** El descuento queda
   escrito en el producto y no se revierte al expirar/desactivar/eliminar el banner.
2. **No hay trigger de UPDATE/DELETE** en `banners_descuento`, así que editar el
   porcentaje o desactivar el banner no cambia los precios.
3. **Solo aplica a productos con `precio_descuento IS NULL`**, por lo que no es
   determinista si ya existía otro descuento (manual o de otro banner).
4. **Se pierde el precio original**: no hay forma de restaurarlo.

## Opciones

**Opción A (recomendada): dejar de persistir el descuento y calcularlo en lectura.**
- El backend, al servir productos, calcula el precio con descuento a partir de los
  banners activos y vigentes de la categoría.
- Se elimina el trigger.
- Ventaja: correcto, reversible, soporta expiración y cambios sin migrar datos.
- Coste: cambios en `ProductService`/consultas (se hace en la Fase 6 de productos).

**Opción B (mínima, si se quiere conservar el trigger):**
- Añadir triggers `AFTER UPDATE` y `AFTER DELETE` que recalculen `precio_descuento`.
- Requiere guardar el `precio` original sin descuento (ya está en `productos.precio`),
  así que se puede recalcular: `precio_descuento = precio * (1 - pct/100)` para los
  productos de la categoría mientras el banner esté vigente; `NULL` cuando ya no haya
  banner activo.
- Ventaja: no cambia el modelo de datos.
- Coste: lógica duplicada en varios triggers; cuidado con múltiples banners por categoría.

## Decisión pendiente

Se recomienda **Opción A** durante la Fase 6 (API de productos), que es donde se
resuelve la presentación de descuentos. Hasta entonces, el trigger actual permanece
sin cambios. **No se ha modificado ningún trigger en la base de datos.**
