# FlowMetrics — Arquitectura

> Documento basado en inspección del código (CI). No afirma comportamientos no verificados.

## Vista general

Aplicación Full Stack de **gestión de ventas multi-tenant con demo aislada**:

- **Backend:** API REST con Spring Boot `4.1.0` (Java, Maven).
- **Frontend:** SPA con React `19` + Vite `8`, JavaScript/JSX y Tailwind CSS v4.
- **Base de datos:** PostgreSQL (`jdbc:postgresql://localhost:5432/flowmetrics`).

Estructura del repositorio:

```text
flowmetrics/
├── backend/     # Spring Boot (Maven)
├── frontend/    # React + Vite
├── database/legacy/  # SQL históricos (NO usar; ver database/legacy/README.md)
└── docs/        # documentación (api, arquitectura, base-datos, roadmap, despliegue)
```

## Backend (Spring Boot)

Organización por capas bajo `com.flowmetrics.backend`:

| Paquete | Responsabilidad |
|---|---|
| `controller` | Endpoints REST (`/api/**`). |
| `service` / `service.impl` | Lógica de negocio y transacciones. |
| `repository` | Repositorios Spring Data JPA. |
| `entity` | Entidades JPA mapeadas a tablas. |
| `dto` | Objetos de entrada/salida (DTO). |
| `mapper` | Conversión entidad ↔ DTO. |
| `exception` | Excepciones de dominio y `GlobalExceptionHandler`. |
| `filter` | `DemoSessionFilter` (resolución de la sesión demo). |
| `context` | `DemoContext` (`@RequestScope`) con la empresa de la sesión + `SessionGuard` (exige sesión: 401/404). |
| `config` | `CorsConfig`, `SchedulingConfig`. |
| `util` | Utilidades. |

### Modelo multi-tenant (demo aislada)

- Cada recurso de negocio (`Customer`, `Category`, `Product`, `Sale`, `Activity`) pertenece a una
  `Company`.
- `POST /api/demo/start` **clona** la empresa plantilla (`is_template = true`) y sus datos en una
  empresa nueva, y publica una cookie de sesión `demoSession` (`HttpOnly`, `SameSite=Lax`, 2 h).
- `DemoSessionFilter` resuelve la sesión y la publica en `DemoContext` (`@RequestScope`).
- **Todas** las operaciones de datos exigen sesión y derivan el `companyId` de la sesión
  (`SessionGuard`): sin sesión → **401**; recursos de otra empresa → **404**. El `?companyId=` del
  cliente se ignora y el `companyId` del cuerpo no autoriza (riesgo 16, R16). Únicamente
  `/api/demo/*` es público.
- La empresa plantilla está protegida: `update`/`delete` responden **409**
  (`TemplateCompanyProtectedException`).
- `DemoCleanupServiceImpl` purga (con `@Scheduled`, cada hora) las sesiones caducadas y sus datos,
  respetando las claves foráneas. En el perfil `test` el scheduler está desactivado
  (`SchedulingConfig` con `@Profile("!test")`).

### Manejo de errores

- `GlobalExceptionHandler` (`@RestControllerAdvice`) mapea excepciones de dominio a estados HTTP:
  `ResourceNotFoundException` → **404**, `DataIntegrityViolationException` → **409**,
  `InsufficientStockException` → **400**, `TemplateCompanyProtectedException` → **409**.
- Los errores no gestionados usan el manejo por defecto de Spring. En `application.properties` se
  fijan `spring.web.error.include-stacktrace/message/binding-errors=never` para no filtrar detalle
  técnico.

### CORS

`CorsConfig` permite el origen `http://localhost:5173` sobre `/api/**` **con credenciales**
(necesario para la cookie de sesión).

## Frontend (React + Vite)

- `src/api/*`: cliente Axios (`client.js`, `baseURL: http://localhost:8080/api`, `withCredentials: true`)
  y funciones por recurso.
- `src/context/*`: `DemoSessionProvider` (estado de la sesión demo) + `useDemoSession`.
- `src/components/`: layout (`AppLayout`) y componentes.
- `src/pages/`: `Landing` (pública) y, bajo `/demo`, `Dashboard`, `Customers`, `Products`,
  `Categories`, `Sales`, `Reports`, `Settings`.
- Rutas definidas en `src/App.jsx`; la zona `/demo` va envuelta en `DemoSessionProvider` + `AppLayout`.

## Ejecución local

- Backend: `export DB_USERNAME=... DB_PASSWORD=...` y luego `cd backend && ./mvnw spring-boot:run`
  (puerto `8080`). La conexión se toma de variables de entorno (ver `docs/base-datos.md`).
- Frontend: `cd frontend && npm run dev` (Vite, puerto `5173`).
- Pruebas (backend): `cd backend && ./mvnw clean verify`. **`clean` es obligatorio** para no ejecutar
  clases obsoletas de `target/` (riesgo 15); los IT usan `flowmetrics_test` y requieren `DB_PASSWORD`.

## Notas y limitaciones conocidas

- **Flyway está desactivado por defecto** (`spring.flyway.enabled=false`); el esquema se provisiona de
  forma manual salvo que se active el perfil aislado `flyway`
  (`application-flyway.properties`: `baseline-on-migrate=true`, `baseline-version=2`). Activación
  **hecha en desarrollo** (baseline v2 sobre `flowmetrics` sin ejecutar V1/V2); el arranque habitual no
  la cambia.
  Ver `docs/base-datos.md` y las decisiones D-09/D-22/D-31/D-36 en la memoria del proyecto (mantenida
  fuera del repositorio).
- Los SQL antiguos están **archivados en `database/legacy/`** y **no son utilizables tal cual** (índice
  creado antes que la tabla en `V1_create_schema.sql`; la semilla no coincide con los datos reales;
  `flowmetrics_v1.backup.sql` está vacío). La fuente de verdad son las migraciones de Flyway.
- Las credenciales de PostgreSQL **ya no están en el repositorio**: `application.properties` usa
  variables de entorno (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`; contraseña obligatoria). Ver
  `docs/base-datos.md` y la decisión D-32.
