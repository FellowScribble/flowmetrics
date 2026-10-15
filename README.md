# FlowMetrics

Aplicación **Full Stack de gestión de ventas multi-tenant con demo aislada**, desarrollada como
proyecto de portfolio profesional.

FlowMetrics combina una **landing page** de producto con una **demo funcional respaldada por base de
datos real**: cada visitante que entra en la demo recibe una copia aislada de una empresa plantilla
(clientes, categorías, productos, ventas y actividad) y puede operar sobre ella sin afectar a otros
visitantes. El objetivo es mostrar un producto SaaS creíble y navegable, no una maqueta estática.

## Funcionalidades

- **Landing pública** con información del producto e inicio de la demo.
- **Sesión de demo aislada por visitante:** `POST /api/demo/start` clona la empresa plantilla en una
  empresa nueva y abre una sesión de 2 h mediante cookie `demoSession` (`HttpOnly`, `SameSite=Lax`).
  La empresa plantilla nunca es el tenant de escritura compartido.
- **Panel (dashboard)** con KPIs y gráficas conectadas a la API (`recharts`): resumen, ventas por mes
  y productos más vendidos.
- **CRUD** de **ventas** (con edición y cálculo de total y descuento de stock), **clientes**,
  **productos** (control de stock y stock bajo) y **categorías**.
- **Informes** (`/api/reports/*`) y **actividad reciente**.
- **Internacionalización ES/EN** propia (contexto + `localStorage`) con formato de moneda/fecha según
  idioma.
- **UI responsive** (Tailwind CSS v4) con estados de carga/error, notificaciones y diálogos de
  confirmación.
- **Aislamiento multi-tenant**: todas las operaciones de datos exigen sesión demo y derivan la empresa
  del servidor (ver «Seguridad»).

## Tecnologías

### Backend (`backend/`)

- **Java** (Java 21 fijado en `pom.xml`), **Spring Boot `4.1.0`**, **Maven**.
- **Spring Web MVC** (API REST) y **Bean Validation**.
- **Spring Data JPA / Hibernate** (`ddl-auto=validate`).
- **Flyway** (`flyway-database-postgresql`) para migraciones versionadas.
- **PostgreSQL** (driver JDBC).
- **Spring Boot Actuator** (solo `/actuator/health`, para el healthcheck de despliegue).
- **Docker** (imagen multi-etapa Maven → JRE para el despliegue).
- **JUnit 5 + Mockito + AssertJ**; **surefire** (unitarios) y **failsafe** (integración).

### Frontend (`frontend/`)

- **React `19`** + **Vite `8`** en **JavaScript/JSX** (sin TypeScript).
- **Tailwind CSS v4** (vía `@tailwindcss/vite`).
- **axios** (cliente HTTP con `withCredentials`), **react-router-dom v7**.
- **recharts** (gráficas) y **framer-motion** (animaciones).
- **i18n propia** en `src/i18n/` (sin dependencias externas).

## Arquitectura

Monorepo con frontend y backend separados:

```text
flowmetrics/
├── backend/     # API REST (Spring Boot, Maven)
├── frontend/    # SPA (React + Vite)
├── database/    # SQL históricos en legacy/ (NO usar; ver database/legacy/README.md)
└── docs/        # documentación (api, arquitectura, base-datos, roadmap, despliegue)
```

- **Backend por capas** bajo `com.flowmetrics.backend`: `controller` → `service` → `repository` →
  `entity`, con `dto`/`mapper`, `exception` (`GlobalExceptionHandler`), `filter`/`context`
  (resolución de la sesión demo) y `config` (CORS, scheduling).
- **Modelo multi-tenant:** cada recurso de negocio pertenece a una `Company`. La sesión demo resuelve
  la empresa desde la cookie y las operaciones se limitan a ella.
- **Limpieza automática:** un `@Scheduled` horario purga las sesiones caducadas y sus datos
  respetando las claves foráneas (desactivado en el perfil `test`).

Detalle completo en [Arquitectura](docs/arquitectura.md) y [API REST](docs/api.md).

## Seguridad

- **Sesión obligatoria y `companyId` del servidor:** `SessionGuard` exige sesión demo (sin ella →
  **401**) y los identificadores ajenos responden **404**; el `?companyId=` del cliente se ignora y el
  `companyId` del cuerpo no autoriza.
- **Sin IDOR:** al crear/editar ventas se verifica que el cliente y cada producto pertenecen a la
  empresa de la sesión.
- **Empresa plantilla protegida:** `update`/`delete` de la plantilla → **409**.
- **Errores sin fuga de traza:** `spring.web.error.include-stacktrace/message/binding-errors=never`.
- **Sin secretos en el repositorio:** la conexión a PostgreSQL se toma de variables de entorno.
- **Endpoint de limpieza manual cerrado en producción** (`POST /api/demo/cleanup` → 404 con el perfil
  `prod`); la limpieza la realiza el `@Scheduled`.

## Pruebas realizadas

Niveles de evidencia usados en la documentación: **CI** (código inspeccionado), **PE** (prueba
ejecutada con resultado registrado) y **VF** (comportamiento verificado en runtime).

- **Backend — `./mvnw clean verify`** (requiere `DB_PASSWORD`; usa la BD de pruebas
  `flowmetrics_test`, **no** la de desarrollo):
  - **12 tests unitarios** (surefire, sin Spring ni BD, con Mockito):
    `SaleServiceImplTest` (4), `CompanyServiceImplTest` (4), `CompanyControllerTest` (4).
  - **23 tests de integración** (failsafe, contra PostgreSQL):
    `TenantIsolationIT` (8), `SaleServiceIT` (4), `BackendApplicationIT` (3), `DemoTenancyIT` (3),
    `ErrorResponseIT` (2), `DemoCleanupEndpointDisabledIT` (2), `DemoCleanupEndpointEnabledIT` (1).
  - Resultado registrado: **BUILD SUCCESS, 0 fallos**; `flowmetrics_test` queda a 0 filas tras el
    rollback transaccional y la BD de desarrollo no se modifica.
- **Frontend:** `npm run lint` → **0 problemas**; `npm run build` → **OK** (Vite).
- **Verificado en runtime (VF):** arranque real (backend `:8080`, frontend `:5173`), aislamiento de
  sesiones demo A/B/plantilla, IDOR → 404, protección de la plantilla, limpieza con respeto de FKs,
  flujo de ventas crear → editar → borrar y validación del panel de sesión.

Pendiente de verificar (no afirmado como hecho): build de la imagen Docker y despliegue real
(ver [Despliegue](docs/despliegue.md)).

## Metodología

- **Desarrollo incremental por fases** (A–F): compilación/arranque → aislamiento multi-tenant →
  verificación en runtime → pruebas automatizadas → trabajo funcional → despliegue. Cada fase se
  cierra con una prueba real; no se avanza por el mero hecho de compilar.
- **Disciplina de evidencia:** se distingue siempre entre código inspeccionado (CI), pruebas
  ejecutadas (PE) y funcionalidad verificada en runtime (VF). Nada se declara «funcionando» sin
  resultado registrado.
- **Revisión de seguridad por riesgo:** los hallazgos (IDOR, scoping de tenant, protección de la
  plantilla, fuga de traza en errores, secretos) se registran y se cierran con corrección + prueba.
- **Calidad automatizada:** separación unitarios/integración, BD de pruebas aislada, lint de frontend
  y build de producción.
- **Documentación viva** de arquitectura, API, base de datos, roadmap y despliegue basada en
  inspección real del código.

## Puesta en marcha

### Backend

El backend lee la conexión a PostgreSQL de **variables de entorno** (no hay credenciales en el
repositorio):

```bash
export DB_USERNAME=postgres
export DB_PASSWORD=tu_password
export DB_URL=jdbc:postgresql://localhost:5432/flowmetrics   # opcional (este es el valor por defecto)

cd backend
./mvnw spring-boot:run      # http://localhost:8080
```

`DB_PASSWORD` es **obligatoria**; si falta, la aplicación no arranca (falla al conectar). `DB_USERNAME`
tiene por defecto `postgres` y `DB_URL` apunta a `flowmetrics` en local. **En producción** define
explícitamente `DB_URL`, `DB_USERNAME` y `DB_PASSWORD`: los valores por defecto son solo para
desarrollo local.

### Pruebas (backend)

```bash
cd backend
./mvnw clean verify    # unitarios (surefire) + integración (failsafe)
```

Usa siempre `clean` antes de `test`/`verify`: sin él pueden quedar **clases obsoletas en `target/`**
(p. ej. tests borrados del fuente) y ejecutarse código ya eliminado. Los tests de integración usan la
base de datos `flowmetrics_test` (no la de desarrollo) y **también requieren `DB_PASSWORD`**.

### Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

## Despliegue

Preparado para **Vercel (frontend) + Render (backend, Docker) + Neon (PostgreSQL)**. El backend de
producción usa el perfil `prod` (`SPRING_PROFILES_ACTIVE=prod`), que activa Flyway **sin baseline**
para inicializar una base vacía, escucha en `$PORT` y marca la cookie de demo como `Secure`. El
frontend llama a `/api` y **Vercel** lo redirige a Render (mismo origen, sin CORS ni cookies de
terceros).

> **Estado:** la configuración está preparada pero **el despliegue no se ha ejecutado ni verificado**.
> Ver el procedimiento y las comprobaciones en [docs/despliegue.md](docs/despliegue.md).

## Documentación

- [Arquitectura](docs/arquitectura.md)
- [API REST](docs/api.md)
- [Base de datos](docs/base-datos.md)
- [Despliegue (Vercel + Render + Neon)](docs/despliegue.md)
- [Roadmap](docs/roadmap.md)

## Notas

- La app funciona con un **modelo demo**: `POST /api/demo/start` clona una empresa plantilla y abre
  una sesión aislada de 2 h.
- **Flyway está desactivado por defecto** en el arranque habitual; el esquema se aplica de forma
  manual salvo que se active el perfil aislado `flyway` (`SPRING_PROFILES_ACTIVE=flyway`, con
  `baseline-version=2` para BDs existentes). La activación está **hecha en desarrollo** (ver
  `docs/base-datos.md`).
- Las credenciales de la base de datos se toman de variables de entorno (`DB_USERNAME`, `DB_PASSWORD`,
  `DB_URL`); **no** hay secretos en el repositorio. Los tests también requieren esas variables.
