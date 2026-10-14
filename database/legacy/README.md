# `database/legacy/` — SQL históricos (NO usar)

Estos ficheros son **históricos** y se conservan solo como referencia. **No son la fuente de
verdad** y **no deben ejecutarse** para crear o poblar una base de datos.

## Contenido

- `V1_create_schema.sql` — primer intento de esquema. **Defectuoso:** crea un índice antes de crear
  la tabla a la que apunta, por lo que falla en una base de datos vacía.
- `V1_demo_data.sql` — primera semilla demo. **No coincide** con los datos reales y **no avanzaba las
  secuencias** (`bigserial`), lo que rompía el clonado de la empresa plantilla.
- `flowmetrics_v1.backup.sql` — copia de seguridad **vacía** (0 bytes).

## Fuente de verdad

El esquema y los datos oficiales viven en las migraciones de Flyway:

```text
backend/src/main/resources/db/migration/V1__create_schema.sql
backend/src/main/resources/db/migration/V2__seed_demo.sql
```

Para provisionar una base de datos, usa esas migraciones (ver `docs/base-datos.md`). Flyway está
**desactivado** por defecto; su activación es una decisión pendiente (ver `docs/ai-memory/DECISIONS.md`,
D-31).
