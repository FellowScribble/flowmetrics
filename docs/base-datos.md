# FlowMetrics — Base de datos

> PostgreSQL (`jdbc:postgresql://localhost:5432/flowmetrics`). Esquema descrito a partir de las
> entidades JPA y de una inspección directa de la base de datos real (`pg_tables`, `\d`).
> El esquema se provisiona de forma **manual** por defecto (Flyway desactivado en el arranque
> habitual); desde 2026-10-14 puede gestionarse con Flyway en desarrollo activando el perfil `flyway`
> (ver más abajo).

## Tablas (base de datos real)

`activity`, `categories`, `companies`, `customers`, `demo_sessions`, `products`, `reports`,
`sale_items`, `sales` (9 tablas).

> **Discrepancia:** existe la tabla **`reports`** (0 filas) que **no** tiene entidad JPA ni repositorio
> asociado. Las demás 8 tablas sí están mapeadas por entidades en
> `backend/src/main/java/com/flowmetrics/backend/entity/`.

## Modelo

- `companies` es la raíz multi-tenant. Todas las tablas de negocio referencian `company_id`.
- La empresa **plantilla** es la que tiene `is_template = true`. Al iniciar una demo se **clona** y sus
  datos generan una empresa nueva.

### companies
`id`, `name`, `industry`, `country`, `currency` (3), `is_template`, `created_at`, `updated_at`.

### customers
`id`, `company_id`→companies, `name`, `email`, `phone`, `city`, `country`, `is_active`,
`created_at`, `updated_at`.

### categories
`id`, `company_id`→companies, `name`, `description`, `created_at`, `updated_at`.

### products
`id`, `company_id`→companies, `category_id`→categories, `name`, `sale_price`, `cost_price`, `stock`,
`minimum_stock`, `is_active`, `created_at`, `updated_at`.

### sales
`id`, `company_id`→companies, `customer_id`→customers, `sale_date`, `total`, `payment_method`,
`payment_status`, `status`, `notes`, `created_at`, `updated_at`.

### sale_items
`id`, `sale_id`→sales (`ON DELETE CASCADE`), `product_id`→products (`ON DELETE RESTRICT`),
`quantity` (`CHECK > 0`), `unit_price`, `subtotal` (`CHECK >= 0`).

### activity
`id`, `company_id`→companies, `title`, `description`, `type`, `entity_type`, `entity_id`,
`created_at`, `updated_at`. Se registra una fila al crear una venta (`SALE_CREATED`).

### demo_sessions
`id`, `company_id`→companies (`ON DELETE CASCADE`), `session_token` (único), `is_active`,
`expires_at`, `created_at`, `updated_at`. Índices `idx_demo_company`, `idx_demo_token`.

### reports (sin entidad)
`id`, `company_id`→companies (`ON DELETE CASCADE`), `title`, `report_type`, `generated_at`,
`created_at`, `updated_at`. Actualmente sin uso en el código.

## Claves foráneas (observadas)

| Tabla | Referencia |
|---|---|
| `activity` | → `companies` |
| `categories` | → `companies` |
| `customers` | → `companies` |
| `demo_sessions` | → `companies` (`CASCADE`) |
| `products` | → `categories`, → `companies` |
| `reports` | → `companies` (`CASCADE`) |
| `sale_items` | → `sales` (`CASCADE`), → `products` (`RESTRICT`) |
| `sales` | → `companies`, → `customers` |

## Provisión del esquema

- **Flyway está desactivado por defecto** (`spring.flyway.enabled=false`) aunque la dependencia
  `spring-boot-starter-flyway` + `flyway-database-postgresql` está declarada. Activación opcional en
  desarrollo mediante el perfil `flyway` (ver abajo).
- **Migraciones autoradas y verificadas (2026-10-14, E.3)** en
  `backend/src/main/resources/db/migration/`:
  - `V1__create_schema.sql` — esquema completo (9 tablas), equivalente al real.
  - `V2__seed_demo.sql` — empresa plantilla `NovaTech Store` + catálogo/ventas (con `setval` de
    secuencias para no romper el clonado).
  Verificadas en una BD desechable: el esquema resultante es **idéntico** al real. **Activadas en
  desarrollo** (baseline v2 sobre `flowmetrics`, sin ejecutar V1/V2).

### Activar Flyway (perfil `flyway`) — estrategia de baseline

La activación está **activada en el entorno de desarrollo** (2026-10-14). El arranque habitual sigue
con Flyway desactivado; el interruptor es un perfil aislado,
`backend/src/main/resources/application-flyway.properties`:

```properties
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
spring.flyway.baseline-version=2
```

**Cómo activarlo:**
```bash
# desarrollo
SPRING_PROFILES_ACTIVE=flyway ./mvnw spring-boot:run
# empaquetado
java -jar backend.jar --spring.profiles.active=flyway
# Eclipse: Run Configurations -> Environment -> SPRING_PROFILES_ACTIVE=flyway
```

**Qué hace cada caso** (verificado en BD desechables, 2026-10-14):

| Estado de la BD | Comportamiento |
|---|---|
| Nueva / vacía | Aplica **V1** (esquema) y **V2** (semilla demo) desde cero. `baseline-on-migrate` **no** añade baseline a un esquema vacío. |
| Existente, sin `flyway_schema_history` (p. ej. `flowmetrics`) | Marca **baseline en la versión 2** y **no** reejecuta V1/V2: no recrea tablas ni duplica la semilla. |
| Ya gestionada por Flyway | Solo aplica migraciones nuevas (V3+). |

- **Por qué baseline = 2:** `flowmetrics` ya contiene lo que producen V1+V2 (esquema idéntico y plantilla
  idéntica fila a fila salvo `sale_date`/timestamps). Con la versión 1 por defecto, Flyway intentaría
  aplicar V2 y fallaría por PK duplicada (verificado: `SQL State 23505`).
- **Sin `baseline-on-migrate`** sobre una BD existente, Flyway falla: *"Found non-empty schema(s) but no
  schema history table"*.
- **Limitación:** `baseline-version=2` asume que cualquier BD existente ya está en V1+V2; enmascara
  cualquier deriva previa. Para `flowmetrics` se comprobó que no la hay.
- **Activación en desarrollo (2026-10-14, verificado):** se arrancó con el perfil `flyway` contra
  `jdbc:postgresql://localhost:5432/flowmetrics`. Flyway registró el **baseline en versión 2**
  (`flyway_schema_history`: 1 fila BASELINE, 0 migraciones SQL) y **no** ejecutó V1/V2; los datos
  quedaron intactos y la app respondió. `flowmetrics_test` no se tocó. **Pendiente:** decidir la
  activación en producción/otras bases (requiere autorización).
- La última vez que se verificó, el esquema se provisionaba de forma manual; desde 2026-10-14
  `flowmetrics` pasa a estar **gestionada por Flyway** cuando arranca con el perfil `flyway`.

- Los SQL antiguos están **archivados** en `database/legacy/` y **no deben usarse** (ver
  `database/legacy/README.md`):
  - `database/legacy/V1_create_schema.sql`: crea el índice `idx_demo_token` **antes** de crear la
    tabla `demo_sessions` → falla en una base de datos nueva.
  - `database/legacy/V1_demo_data.sql`: no coincide con los datos reales (la plantilla real es
    `NovaTech Store`, no `FlowMetrics Demo`) y no avanzaba las secuencias.
  - `database/legacy/flowmetrics_v1.backup.sql`: **vacío** (0 bytes).
- **Recrear una base a partir de la real** (usado para la BD de pruebas):
  ```bash
  createdb flowmetrics_test
  pg_dump -h 127.0.0.1 -U <usuario> --schema-only --no-owner --no-privileges flowmetrics \
    | psql -d flowmetrics_test
  ```
- Ver decisiones **D-09**, **D-22**, **D-26**, **D-31** y **D-36** en `docs/ai-memory/DECISIONS.md`, y el
  riesgo 13 en `docs/ai-memory/PROJECT_STATUS.md`.

## Credenciales

Desde 2026-10-14 (Fase E.5) **no hay credenciales en el repositorio**. `application.properties` usa
variables de entorno:

```properties
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/flowmetrics}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD}
```

Hay que definir `DB_PASSWORD` (obligatoria) y, si aplica, `DB_USERNAME` / `DB_URL`. Si `DB_PASSWORD`
falta, la aplicación no arranca. El perfil `test` hereda estas credenciales y apunta a
`flowmetrics_test` (ver `application-test.properties`).

**Producción:** configura **explícitamente** las tres variables (`DB_URL`, `DB_USERNAME`,
`DB_PASSWORD`). Los valores por defecto (`postgres` y la BD local `flowmetrics`) son únicamente para
desarrollo local y no deben usarse en producción.

## Flyway en producción (perfil `prod`)

La base de datos de producción (Neon) está **vacía** y se inicializa con **Flyway sin baseline**,
mediante un perfil separado `application-prod.properties` (`SPRING_PROFILES_ACTIVE=prod`):
`spring.flyway.enabled=true` (sin `baseline-on-migrate` ni `baseline-version`). Así se aplican
`V1__create_schema.sql`, `V2__seed_demo.sql` y `V3__seed_demo_more.sql` desde cero. El
`baseline-version=2` del perfil local `flyway` es **solo para la BD local existente** y **no se copia**
a producción. Ver `docs/despliegue.md` y decisiones **D-43**.
