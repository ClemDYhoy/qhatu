# Migraciones de base de datos

Los cambios de esquema se gestionan con migraciones SQL versionadas, aplicadas por
`backend/src/scripts/migrate.js`.

## Convención

- Un archivo por cambio, numerado y descriptivo: `001_clean_duplicate_indexes.sql`.
- Se aplican en orden alfabético; el nombre con prefijo numérico garantiza el orden.
- Cada migración aplicada se registra en la tabla `schema_migrations` (no se reejecuta).
- No edites una migración ya aplicada: crea una nueva.

## Comandos

```bash
npm run migrate            # aplica las pendientes
npm run migrate:status     # muestra el estado
node src/scripts/migrate.js --dry-run   # muestra qué se aplicaría sin ejecutar
```

## Reglas de seguridad

1. **Backup antes de migrar:** exporta la base de datos (phpMyAdmin o `mysqldump`) antes
   de aplicar cambios de esquema.
2. **Sin cambios destructivos automáticos:** eliminar columnas, tablas, triggers o
   constraints requiere revisión y aprobación explícita.
3. **DDL en MySQL hace auto-commit:** las sentencias `ALTER TABLE`, `DROP`, etc. no se
   pueden revertir con una transacción. Por eso cada migración debe ser revisable.
4. Cuando sea posible, incluye en el propio archivo un bloque de comentarios con el
   "rollback" sugerido.
