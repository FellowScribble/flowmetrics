# FlowMetrics — Current status

> **Última revisión:** 2026-10-15, a partir de una inspección directa del repositorio
> `/home/andreavierahernandez/Documentos/GitHub/flowmetrics` (rama `develop`).
>
> **Cómo leer este documento:** distingue tres niveles de evidencia que **no** deben confundirse:
> - **Código inspeccionado (CI):** el archivo existe y se ha leído; describe lo que el código *dice hacer*.
> - **Pruebas ejecutadas (PE):** una prueba se ha ejecutado y hay resultado registrado (ver 4.2 y 4.4).
> - **Verificado en funcionamiento (VF):** se ha comprobado el comportamiento en runtime (ver 4.3).
>
> Nada que no aparezca como PE o VF puede afirmarse que “funciona”. El estado histórico previo
> (basado en logs pegados y conversación) se conserva en `PROJECT_HISTORY.md`.

## Punto de guardado (checkpoint 2026-10-15)

> Última sesión (OpenCode). Retomar por aquí.

- **Sesión (2026-10-15): endurecimiento pre-despliegue, PE.** Detalle en **4.22** y **D-46**.
  - **`.gitignore` raíz:** `.env` + `.env.*` + `!.env.example` (cubre `backend/` y `frontend/`);
    verificado con `git check-ignore`. **Incluido en el commit `1e8d952` "Files on-work deployment"
    (creado por el usuario entre sesiones; incluye además todo el material de despliegue de la sesión
    previa: Dockerfile, `application-prod.properties`, `vercel.json`, `docs/despliegue.md`, etc.).**
  - **Auditoría de secretos: sin hallazgos** en los archivos a versionar (solo placeholders; la
    contraseña real de `DB_PASSWORD` **persiste en commits históricos** `785bf60` y anteriores →
    riesgo pendiente 17).
  - **`POST /api/demo/cleanup` cerrado en producción (Opción C, D-46):** propiedad
    `app.demo.cleanup.endpoint.enabled` (default `true`; perfil `prod` → `false` ⇒ **404**). El
    `@Scheduled` horario no se toca. Docs: `docs/despliegue.md` y `docs/api.md` actualizados.
  - **Pruebas (PE):** `./mvnw clean verify` → **BUILD SUCCESS**, **12 unitarios + 23 IT, 0 fallos**
    (nuevas: `DemoCleanupEndpointDisabledIT` 2 y `DemoCleanupEndpointEnabledIT` 1);
    `flowmetrics_test` a **0 filas**; BD dev `flowmetrics` **sin cambios por los tests**.
  - **`frontend/vercel.json` revisado (CI):** el destino `/api` es un **placeholder**
    (`REPLACE-WITH-YOUR-RENDER-SERVICE`) — hay que sustituirlo antes de desplegar; el orden de los
    rewrites es correcto (`/api/:path*` antes que el catch-all de la SPA).
  - **`docs/despliegue.md` verificado:** distingue verificado/pendiente y no afirma despliegue.
  - **Sin commits nuevos** (los de esta sesión siguen sin commitear). **Observación:** la BD dev
    `flowmetrics` muestra ahora companies=7, demo_sessions=6, customers=75, sales=328, products=103,
    `flyway_schema_history`=2 (actividad del usuario + V3), distinto de la línea base de 4.15; los
    tests de esta sesión solo tocaron `flowmetrics_test`.

## Punto de guardado (checkpoint 2026-10-14) — sesión anterior

> Sesión previa (OpenCode), ya cerrada.

- **Última tarea (2026-10-14): preparación para despliegue (Vercel + Render + Neon), CI + PE.** Ver
  **4.21**. **No** se ha desplegado ni conectado Neon. Decisiones: **proxy Vercel `/api`→Render**,
  **Actuator** (`/actuator/health`), **CORS por env**, **perfil `prod` con Flyway sin baseline** y
  **cookie `Secure` configurable**. Nuevos: `backend/Dockerfile`, `backend/.dockerignore`,
  `backend/.env.example`, `backend/src/main/resources/application-prod.properties`,
  `frontend/vercel.json`, `frontend/.env.example`, `docs/despliegue.md`; modificados `pom.xml`,
  `application.properties`, `CorsConfig.java`, `DemoSessionController.java`, `README.md`. PE backend
  (`compile`/`test-compile` OK; Actuator 4.1.0 resuelto) y frontend (`lint` 0, `build` OK). **Sin
  commits.** Pendiente: build Docker, migración en Neon, proxy/cookie en navegador real.
- **Tarea previa (2026-10-14): internacionalización ES/EN de toda la app + ajustes del Landing, PE + VF
  parcial.** Ver **4.19** y **4.20**. Infra `src/i18n/` (contexto, provider, `useLanguage`,
  `LanguageToggle`, `translations.js`), `format.js` locale-aware + `useFormat`; traducidas layout/UI y
  las 8 páginas; `App` envuelto con `LanguageProvider`. Landing: **logo no clicable**, **header sticky
  al bajar / oculto al subir** (aviso «Proyecto Portfolio» siempre visible), **tarjeta de
  desarrolladora que sube para no tapar el footer** y **conmutador ES/EN**. `lint` 0 y `build` OK;
  módulos transformados sin error por Vite. **Sin commits.**
- **Tarea previa (2026-10-14): semilla enriquecida V3 de la demo, PE + VF.** Ver **4.18**.
  `V3__seed_demo_more.sql` (+8 clientes, +8 productos, ~60 ventas/12 meses) verificada en PG desechable
  y aplicada en `flowmetrics` (dev). **Sin commits.**
- **Tarea previa (2026-10-14): rediseño de UI (P0+P1+P2), PE + VF parcial.** Ver **4.16**.
- **Tarea previa (2026-10-14): corrección de los 5 errores de ESLint del frontend.** **Estado: cerrado.**
- **Verificado (PE):** `npm run lint` → **0 problemas**; `npm run build` → **OK** (Vite 8.3.0,
  2910 módulos, `dist/` generado; se mantiene el aviso de chunk > 500 kB).
- **Cambios (solo frontend; ningún cambio de comportamiento):**
  - `src/context/DemoSessionContext.jsx` → dividido en tres archivos: `DemoSessionContext.js`
    (el `createContext`), `DemoSessionProvider.jsx` (el componente) y `useDemoSession.js` (el hook).
    Imports actualizados en `App.jsx:2` y `components/layout/AppLayout.jsx:3` (Opción A: separar para
    satisfacer `react-refresh/only-export-components`).
  - `catch (error)` → `catch` (captura opcional) en `Categories.jsx:38`, `Customers.jsx:45` y
    `Sales.jsx:108`. Los segundos `catch`, que sí usan `error.response?.status`, quedan intactos.
  - `Landing.jsx:1`: eliminado el import `React` no usado (junto a los demás tokens, sin tocar el
    resto del rediseño sin commitear).
- **Rama Git:** `develop`. Sin commits nuevos. Sin seguimiento: `AGENTS.md`, `docs/ai-memory/` y los
  3 archivos nuevos de `src/context/`.
- **No se tocó backend, BD, migraciones ni configuración.**
- **Riesgo 8 (lint) cerrado.**
- **Fase B — revisada e implementada (2026-10-14):** informe de opciones entregado y, con autorización
  del usuario, aplicadas las tres correcciones una a una con su prueba:
  - **B1 (IDOR de ventas):** `SaleServiceImpl.create/update` verifican que el cliente y cada producto
    pertenecen a la empresa de la venta (si no, 404); `buildItemsAndDeductStock` recibe `companyId`.
  - **B2 (plantilla):** nueva `TemplateCompanyProtectedException` mapeada a **409** en
    `GlobalExceptionHandler`; `CompanyServiceImpl.update/delete` rechazan la empresa plantilla.
  - **B3 (scoping de `Company`):** `CompanyController` exige sesión válida y solo expone la empresa
    propia; retirados `POST/PUT/DELETE` de la API pública (el demo no los usa). Opción 2 elegida por el
    usuario.
- **Pruebas (PE):** nuevas clases `SaleServiceImplTest` (3), `CompanyServiceImplTest` (4) y
  `CompanyControllerTest` (4) → **11 tests, 0 fallos** (`mvn -Dtest=... test`). No usan BD (Mockito).
- **Verificado (PE):** `mvn test` completo → **12 tests, 0 fallos**, incluido
  `BackendApplicationTests.contextLoads` (el contexto Spring arranca con los cambios de B1–B3). Se
  asumió el efecto secundario de la limpieza programada sobre la BD real (ver riesgo 6).
- **Fase C — verificada en runtime (VF, 2026-10-14):** detalle en **4.5**. Aislamiento A/B/plantilla
  confirmado, IDOR y B2/B3 confirmados por HTTP, purga de sesión caducada correcta y sin huérfanos.
  El riesgo de `LazyInitializationException` en el filtro **no reproduce** (solo se llama `getId()`).
- **Wrapper de Maven reparado (2026-10-14):** `./mvnw` opera con Maven 3.9.11 (ver riesgo 9, D-25).
- **Fase D — infraestructura de pruebas y cobertura (PE, 2026-10-14):** detalle en **4.6**. BD
  `flowmetrics_test` aislada, scheduler gated en `test`, 12 unitarios + 12 IT en verde; la BD de
  desarrollo quedó **sin cambios**.
- **Riesgo 11 — fuga de traza en errores: cerrado (PE + VF, 2026-10-14):** causa raíz identificada
  (DevTools aplica `defaults.spring.web.error.include-stacktrace=always` desde
  `spring-boot-autoconfigure`) y fijados explícitamente `include-stacktrace/message/binding-errors=never`
  en `application.properties`. Detalle y evidencia en **4.7**. Solo aplica en local (DevTools); en
  producción DevTools está excluido y el default ya es `never`, pero ahora local y producción coinciden.
- **Fase E.1 — UI de edición de ventas (PE + VF, 2026-10-14):** `Sales.jsx` ahora permite **editar**
  una venta (botón «Editar» + botones «Guardar cambios»/«Cancelar edición»), usando el `updateSale`
  ya existente (`PUT /api/sales/{id}`). Patrón idéntico al de `Customers.jsx` (`editingId`). Detalle en
  **4.8**. Lint 0 problemas, build OK y flujo real create→update→delete verificado contra `:8080`.
- **Fase E.4 — documentación (2026-10-14):** poblados `docs/api.md` (rutas y DTO reales),
  `docs/arquitectura.md`, `docs/base-datos.md` (esquema real vía `pg_tables`/`\d`) y
  `docs/roadmap.md`; corregido `README.md` (decía «Next.js»; ahora React+Vite). Detalle en **4.9**.
  Hallazgo nuevo: **`GET` de clientes/categorías/productos/ventas sin sesión y sin `?companyId=`**
  devuelve **todos** los registros (`findAll()`); anotado como riesgo 16.
- **Fase E.2 — panel real de sesión en Settings (2026-10-14):** `frontend/src/pages/Settings.jsx`
  reescrito para mostrar datos verídicos de la demo (empresa, `companyId`, caducidad absoluta y
  cuenta atrás en vivo) usando `useDemoSession`; estados de carga/sin sesión. Se conserva el texto
  informativo de «versión completa». Detalle en **4.10**. Evidencia **PE**: `npm run lint` (0) y
  `npm run build` (OK, aviso de chunk preexistente) + módulo transformado por Vite dev. **No** hay
  verificación visual automatizada (sin navegador/runner e2e).
- **Fase E.3 — migraciones Flyway autoradas (2026-10-14):** creadas
  `backend/src/main/resources/db/migration/V1__create_schema.sql` (esquema real, 9 tablas) y
  `V2__seed_demo.sql` (plantilla `NovaTech Store` + catálogo/ventas, con `setval` de secuencias).
  **Flyway sigue desactivado** (decisión del usuario: autorar sin activar). Verificado (PE+VF) en BD
  desechable: esquema idéntico al real (diff `pg_dump` sin diferencias) y arranque con
  `flyway.enabled=true` aplicando V1+V2 y clonando la plantilla (empresa 2 con 4/9/5/4 hijos). Detalle
  en **4.11**. Dev DB no tocada.
- **Fase E.5 — credenciales a variables de entorno (2026-10-14):** `application.properties` ya no
  contiene secretos; usa `${DB_URL:...}`, `${DB_USERNAME:postgres}` y `${DB_PASSWORD}` (obligatoria).
  Decisión del usuario: variables obligatorias, sin `.env`; los defaults son para desarrollo y **en
  producción deben definirse las tres explícitamente**. Verificado (PE) en copia aislada:
  `./mvnw clean verify` verde con las variables y fallo al arrancar sin ellas. Detalle en **4.12**.
- **Riesgos 13/15/16 — cerrados (2026-10-14):**
  - **R13:** SQL antiguos movidos a `database/legacy/` + `README.md`; referencias actualizadas. **(CI)**
  - **R15:** `clean` obligatorio antes de `test`/`verify` documentado en `README.md`/`AGENTS.md`/
    `docs/arquitectura.md`, sin tocar `pom.xml`. **(CI)**
  - **R16:** exigida sesión demo en todas las operaciones de datos; `companyId` derivado del servidor
    (`SessionGuard` → 401/404); reescritos 6 controladores; `ProductServiceImpl` valida
    categoría↔empresa; nuevo `TenantIsolationIT` (8 casos). **(PE)** `./mvnw clean verify` en copia
    aislada → **12 unitarios + 20 IT, 0 fallos**; BD de test a 0 filas y BD dev sin cambios. Detalle en
    **4.13** y D-33/D-34/D-35.
- **Fase E.3 — estrategia de baseline de Flyway preparada (2026-10-14, PE + VF):** `baseline-version=2`
  + perfil aislado `flyway` (`application-flyway.properties`); verificado en BD desechables (nueva,
  existente y `baseline=1` que falla). La BD dev no se tocó. Detalle en **4.14** y D-36.
- **Fase E.3 — Flyway ACTIVADO en desarrollo (2026-10-14, VF):** autorizado por el usuario. Arranque de
  desarrollo con `SPRING_PROFILES_ACTIVE=flyway` contra `flowmetrics` explícito. Flyway registró el
  **baseline en versión 2**, **no ejecutó V1/V2**, datos intactos y la app respondió. Detalle en **4.15**.
  **E.3 completada** para el entorno de desarrollo. Siguiente: decidir activación en producción y otras
  bases (fuera de alcance por ahora).

## Punto de guardado (checkpoint 2026-10-13) — sesión anterior

> Sesión previa (OpenCode), ya cerrada.

- **Objetivo inmediato de la sesión:** cerrar la **Fase A** (compilar/arrancar). **Estado: cerrada.**
- **Verificado hoy:** backend arrancado y respondiendo en `:8080` (lanzado por Eclipse sobre JDK 25);
  frontend Vite en `:5173`; `mvn test` OK (`contextLoads`, PostgreSQL 18.6); `npm run build` OK.
  Único rojo: **lint del frontend, 5 errores** (ver 4.4 / riesgo 8) — **resuelto el 2026-10-14**,
  ver checkpoint 2026-10-14.
- **Rama Git:** `develop`. Sin commits nuevos. Sin commitear (preexistente): `frontend/package.json`,
  `frontend/package-lock.json`, `frontend/src/pages/Landing.jsx`. Sin seguimiento: `AGENTS.md`,
  `docs/ai-memory/`. **No se commiteó nada.**
- **No se tocó código de aplicación, ni configuración, ni migraciones.** Esta sesión solo actualizó
  esta memoria y ejecutó pruebas de lectura/verificación.
- **Decisiones pendientes (la 1 ya está hecha, ver checkpoint 2026-10-14):**
  1. ~~Corregir los 5 errores de lint~~ **Hecho 2026-10-14.**
  2. **Fase B:** revisar (sin corregir) IDOR de ventas, protección de la plantilla y scoping de
     `Company`; entregar informe de opciones.
  3. Reparar el Maven Wrapper (`backend/.mvn/wrapper/`).
- **Cuidado al retomar:** cada `mvn test` arranca el `@Scheduled` de limpieza demo y **borra datos
  reales** de `flowmetrics` como efecto secundario.
- Detalle completo del día: secciones **4.2, 4.3, 4.4**; riesgos en **5**; plan en `NEXT_STEPS.md`.

## 0. Estado de Git en el momento de la revisión

- Rama actual: `develop` (sigue a `origin/develop`). Rama por defecto del remoto: `main`.
- Último commit: `2486a9c "union front-back"` (2026-09-10). Historial: `96043b0 backfuncional`,
  `ef334c0 allcruds`, `5c68628 backend basic api`, `4aa30b2 initial PostgreSQL schema and demo seed`.
- Cambios **preexistentes** sin commitear (no producidos por esta revisión): `frontend/package.json`,
  `frontend/package-lock.json`, `frontend/src/pages/Landing.jsx` (rediseño del hero con canvas y
  `framer-motion`).
- Sin seguimiento: `docs/ai-memory/` (este paquete de memoria).
- Esta revisión **no modificó código de aplicación, configuración, base de datos ni dependencias.**
- **Nota:** este apartado es la foto de la inspección inicial. Después (misma fecha) se implementaron
  B1–B3, Fase D, riesgo 11, E.1/E.2/E.3/E.5 y R13/R15/R16; el estado vigente está en el checkpoint de
  arriba y en 4.5–4.15. Todo sigue **sin commitear**.

## 1. Stack real observado (CI)

- **Backend:** Spring Boot `4.1.0` (parent en `pom.xml`), Java fijado a `21` en el `pom.xml`,
  Maven, Spring Data JPA, `spring-boot-starter-flyway` + `flyway-database-postgresql`,
  `spring-boot-starter-validation`, `spring-boot-starter-webmvc`, driver PostgreSQL, Lombok
  (declarado; el código usa getters/setters manuales).
- **Base de datos:** PostgreSQL, JDBC `jdbc:postgresql://localhost:5432/flowmetrics`
  (`application.properties`). Hay un servidor PostgreSQL escuchando en `5432` (comprobado con
  `pg_isready`); **versión observada en runtime: `18.6`** (ver 4.2).
- **Frontend:** React `19.2.x` + Vite `8.x`, **JavaScript/JSX (NO TypeScript)**, Tailwind CSS v4
  vía `@tailwindcss/vite`, `axios`, `framer-motion`, `react-router-dom` v7, `recharts`.
- **Entorno del sistema:** Java `25.0.4` instalado (el `pom.xml` apunta a 21), Node `v24.21.0`,
  npm `11.19.0`. Ya se ha compilado, probado y arrancado (ver 4.2–4.4).

## 2. Funcionalidades: clasificación por evidencia

### 2.1 Verificadas en runtime (VF)
Tras arrancar el sistema (ver 4.3–4.4): el **backend** escucha en `8080` y responde; el **frontend**
Vite sirve en `5173`. Comprobado: `GET /api/companies` **200**, `GET /api/reports/summary` **200**,
`GET /api/demo/me` sin sesión **401**. El **aislamiento entre sesiones todavía no se ha probado**
(ver Fase C de `NEXT_STEPS.md`). Las entradas de 2.2 describen código existente.

### 2.2 Implementadas en código e inspeccionadas (CI), sin verificar en runtime
- **CRUD completo de `Company`:** `GET /api/companies`, `GET /api/companies/{id}`,
  `POST`, `PUT /{id}`, `DELETE /{id}` (`CompanyController`, `CompanyServiceImpl`).
- **CRUD de `Customer`, `Category`, `Product`:** list/get/create/update/delete, con
  `checkOwnership` frente a `DemoContext` (`*Controller.java`).
- **CRUD de `Sale`:** list/get/create/update/delete; el servicio recalcula el total, descuenta
  stock, lo devuelve en update/delete y lanza `InsufficientStockException`
  (`SaleServiceImpl`).
- **Actividad:** `GET /api/activity`; se registra una actividad al crear una venta
  (`ActivityServiceImpl`, `SaleServiceImpl.create`).
- **Reportes / KPIs:** `GET /api/reports/summary`, `/sales-by-month`, `/top-products`
  (`ReportController`, `ReportServiceImpl`).
- **Demo aislada:** `POST /api/demo/start`, `GET /api/demo/me`, `POST /api/demo/cleanup`
  (`DemoSessionController`); token `UUID`, cookie `demoSession` (`httpOnly`, `path=/`,
  `SameSite=Lax`, `maxAge=2h`); `DemoSessionFilter` + `DemoContext` (`@RequestScope`);
  clonado de empresa/categorías/productos/clientes/ventas+items (`CompanyCloningServiceImpl`);
  limpieza programada cada hora (`DemoCleanupServiceImpl`, `@Scheduled` con `@EnableScheduling`).
- **Errores:** `GlobalExceptionHandler` mapea `ResourceNotFoundException`→404,
  `DataIntegrityViolationException`→409, `InsufficientStockException`→400.
- **CORS:** `CorsConfig` permite `http://localhost:5173` en `/api/**` con credenciales.
- **Frontend:** rutas en `App.jsx` (`/`, `/demo/dashboard|sales|customers|products|categories|reports|settings`),
  `DemoSessionProvider`, `Dashboard` con `recharts` conectado a `/reports/*` y `/activity`,
  páginas de CRUD y cliente axios con `withCredentials`.
- **Landing:** conservada y funcional como diseño; el modal “Comenzar gratis” es solo visual
  (sin persistencia); “Ver demo” navega al dashboard. El placeholder
  “Aquí irá la captura del dashboard” **ya no existe** (sustituido por un collage animado).

### 2.3 Parcialmente implementadas
- ~~**UI de Ventas:** el frontend expone crear y eliminar; la API tiene `PUT /api/sales/{id}` pero
  la página `Sales.jsx` no ofrece edición.~~ **Resuelto 2026-10-14 (Fase E.1):** `Sales.jsx` ofrece
  edición con `updateSale` (`PUT /api/sales/{id}`); ver 4.8.
- ~~**Scoping de `Company`:** `CompanyController` **no** usa `DemoContext`; no está aislado por sesión.~~
  **Resuelto 2026-10-14 (Fase B3):** `CompanyController` exige sesión y solo expone la empresa propia
  (sin sesión → 404); ver riesgo 3.
- ~~**`Settings.jsx`:** página mínima (33 líneas).~~ **Resuelto 2026-10-14 (Fase E.2):** muestra datos
  reales de la sesión demo (empresa, `companyId`, caducidad y cuenta atrás); ver 4.10.
- **Provisión de esquema:** Flyway está **desactivado** (`spring.flyway.enabled=false`); los SQL de
  `database/` no son usables y se aplican de forma manual/desconocida. **Avance 2026-10-14 (E.3):** ya
  existen migraciones válidas en `backend/src/main/resources/db/migration/` (`V1__create_schema.sql`,
  `V2__seed_demo.sql`), verificadas en BD desechable; falta **activar** Flyway. Ver 4.11 y D-31.

### 2.4 Pendientes de implementar
- Despliegue (Vercel/Render/Neon solo eran ideas; no hay configuración).
- **Activar Flyway en runtime** y decidir el baseline de la BD existente (migraciones ya autoradas; ver 4.11).
- ~~Contenido de `docs/api.md`, `docs/arquitectura.md`, `docs/base-datos.md`, `docs/roadmap.md`
  (los cuatro están **vacíos**, 0 bytes), y `database/backup/flowmetrics_v1.backup.sql` (vacío).~~
  **Docs resueltos 2026-10-14 (Fase E.4).** `flowmetrics_v1.backup.sql` (vacío) quedó **archivado** en
  `database/legacy/` (R13).

### 2.5 Estado desconocido o contradictorio
- ~~**IDOR multi-tenant en creación de venta.**~~ **Corregido el 2026-10-14 (B1):** `SaleServiceImpl`
  verifica que el cliente y cada producto pertenecen a la empresa de la venta (404 si no). Prueba:
  `SaleServiceImplTest`.
- ~~**Protección de la empresa plantilla.**~~ **Corregido el 2026-10-14 (B2):** `CompanyServiceImpl`
  rechaza `update`/`delete` de la plantilla con **409**. Prueba: `CompanyServiceImplTest`.
- ~~**`Company` sin scoping por sesión.**~~ **Corregido el 2026-10-14 (B3):** `CompanyController`
  exige sesión válida y solo expone la empresa propia; escrituras públicas retiradas. Prueba:
  `CompanyControllerTest`.
- **Flyway desactivado** frente a la decisión D-09.
- ~~**Sin tests reales.**~~ **Actualizado 2026-10-14 (Fase D + riesgo 11):** hay **12 unitarios**
  (surefire) y **12 de integración** (failsafe, contra `flowmetrics_test`, incluida `ErrorResponseIT`);
  `BackendApplicationTests` se movió a `BackendApplicationIT`. Ver 4.6 y 4.7.
- **Riesgos no comprobados:** acceso `LAZY` a `Company` dentro de `DemoSessionFilter` (fuera de
  transacción) podría lanzar `LazyInitializationException`; comportamiento de `/reports/*` con
  `companyId` nulo; corrección real del clonado y de la limpieza programada y su respeto de FKs.
- ~~**README desactualizado:** dice “Next.js” (el frontend real es React+Vite).~~ **Resuelto 2026-10-14
  (E.4).**
- ~~**Credenciales versionadas:** `application.properties` contiene credenciales de PostgreSQL en
  texto plano dentro del control de versiones.~~ **Resuelto 2026-10-14 (E.5):** ahora vienen de
  variables de entorno. Ver 4.12.

## 3. Última tarea conocida

- **Histórico (docs):** “implementar `GET /api/companies/{id}` y su manejo de 404”.
  → **Ya está en el código** (CI), aunque no verificado en runtime.
- **Real más reciente:** el último commit es `union front-back` (2026-09-10). Encima hay trabajo
  **sin commitear**: rediseño de `Landing.jsx` + `framer-motion`, E.1/E.2, E.3/E.5, R13/R15/R16 y esta
  memoria. **La tarea más reciente cerrada** es R16 (aislamiento multi-tenant desde la sesión, ver 4.13).

## 4. Pruebas realmente ejecutadas

### 4.1 Revisión de inspección (2026-10-13, sin ejecutar nada)
- **En esa revisión:** ninguna. No se compiló, no se arrancó backend/frontend, no se ejecutó
  `contextLoads`, no se hicieron peticiones HTTP.
- **Evidencia en repo (entonces):** existía un único test (`BackendApplicationTests.contextLoads`) y
  **no había artefactos de ejecución**.

### 4.2 Fase A — compilación, build y tests ejecutados (2026-10-13, PE)
Ejecutado por OpenCode en la rama `develop`. Entorno: Java `25.0.4.1`, Maven `3.9.11` (sistema),
Node `v24.21.0`, npm `11.19.0`. PostgreSQL disponible en `5432`.

| Acción | Comando | Resultado real |
|---|---|---|
| Backend compilar | `mvn -q -DskipTests package` | **OK** (`EXIT=0`); genera `target/backend-0.0.1-SNAPSHOT.jar` (≈53,5 MB) con Java 25 pese a fijar 21 en `pom.xml` |
| Backend tests | `mvn test` | **OK**: `Tests run: 1, Failures: 0, Errors: 0` (`BackendApplicationTests.contextLoads`) |
| Frontend build | `npm run build` | **OK** (`EXIT=0`): Vite 8.3.0, 2908 módulos, `dist/` generado; aviso de chunk > 500 kB |
| Frontend lint | `npm run lint` | **FALLA** (`EXIT=1`): **5 errores** (entonces; **resuelto el 2026-10-14** → 0 problemas) |

Hallazgos concretos de la ejecución:
- **Wrapper de Maven roto:** `./mvnw` falla con
  `./.mvn/wrapper/maven-wrapper.properties: No existe el fichero o el directorio`. La carpeta
  `backend/.mvn/` **no existe**. Se usó el `mvn` del sistema como alternativa.
- **Arranque del contexto:** el `contextLoads` inició el contexto Spring completo y **conectó a
  PostgreSQL**: dialecto `PostgreSQLDialect`, `Database version: 18.6`, catálogo `flowmetrics/public`,
  Hibernate ORM `7.4.1.Final`, `Found 8 JPA repository interfaces`. `ddl-auto=validate` no falló →
  el esquema real es compatible con las entidades.
- **Efecto secundario en la BD real (importante):** al cargar el contexto se ejecutó el
  `@Scheduled` de `DemoCleanupServiceImpl`, que registró `[DemoCleanup] Sesiones eliminadas: 2` y
  ejecutó múltiples `DELETE` (sale_items, sales, products, customers, categories, demo_sessions,
  companies) en la base `flowmetrics`. Es la limpieza prevista de sesiones caducadas, pero
  **modificó datos reales de desarrollo como efecto colateral de `mvn test`.**
- **Versión de PostgreSQL corregida:** observada `18.6` (la memoria decía `18.3`).
- **Avisos no bloqueantes:** `sun.misc.Unsafe` (Maven/Guice), Mockito self-attaching,
  `Java agent dynamically loaded` (ByteBuddy), `open-in-view=false` ya configurado.
- **Arranque del servidor web (puerto 8080):** **no ejecutado** aún. `@SpringBootTest` por defecto
  usa `webEnvironment=MOCK`, así que **no prueba** que Tomcat escuche en `8080`. Pendiente
  `spring-boot:run` si se desea confirmar (ver 6).

Conclusión: compilación y `contextLoads` confirmados como PE. El **arranque del servidor web** sigue
sin verificar (VF pendiente).

### 4.3 Arranque real verificado en runtime (2026-10-13, VF)
Observado por OpenCode en runtime, **sin modificar el repositorio** (solo lectura de procesos/puertos):

- **Backend arrancado (VF):** proceso `com.flowmetrics.backend.BackendApplication` (PID 32619),
  escuchando en `*:8080`. Responde: `GET /api/companies` → **HTTP 200**, `GET /api/reports/summary`
  → **HTTP 200**, `GET /api/demo/me` sin sesión → **HTTP 401** (esperado). No hay `server.port` en
  `application.properties` → 8080 por defecto.
- **Corre sobre JDK 25, lanzado por Eclipse (VF):** el `java` de la app es hijo del proceso Eclipse
  (PID 26790) y usa el JRE incluido de Eclipse `25.0.4`, **no** el 21 declarado en `pom.xml` →
  el backend arranca pese a la discrepancia (responde a la pregunta abierta 1 de `NEXT_STEPS.md`).
  Eclipse sigue arrancando con `--patch-module=java.base=/app/eclipse/flatpak-dev-shim.jar`.
- **Frontend Vite (VF):** `GET http://localhost:5173/` → **HTTP 200**. Es la entrada visible del
  proyecto; el backend es API REST (`/api/**`), sin página web.

> Nota: en una observación previa de esta misma sesión el frontend no estaba levantado (el usuario
> había detenido Vite con Ctrl+C); ya está corregido por el usuario.

### 4.4 Re-ejecución de pruebas (PE, 2026-10-13)
Ejecutado por OpenCode. Confirma lo ya registrado en 4.2:

- **`mvn test` (backend):** `BUILD SUCCESS`; `Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`
  (`contextLoads`). Corrió sobre **Java 25.0.4.1**; conectó a PostgreSQL **18.6**
  (`jdbc:postgresql://localhost:5432/flowmetrics`); `Found 8 JPA repository interfaces`.
- **`npm run lint` (frontend):** **FALLA (`EXIT=1`)**, 5 errores ESLint (ver 5.8) — **resuelto el
  2026-10-14** (re-ejecutado: 0 problemas; ver checkpoint 2026-10-14).
- **`npm run build` (frontend):** **OK** (`vite v8.3.0`, 2908 módulos, `dist/` generado; aviso de
  chunk > 500 kB).

**Efecto secundario en la BD real (repetido):** al cargar el contexto, el `@Scheduled` de
`DemoCleanupServiceImpl` volvió a ejecutar la consulta de sesiones caducadas y sus `DELETE` sobre la
base `flowmetrics`. Es la limpieza prevista, pero **toca datos reales de desarrollo con cada `mvn test`**.

Conclusión: Fase A cubierta a nivel de **PE** (compila, `contextLoads` pasa, build OK) y **VF**
(arranque real en `8080`). El **lint** quedó en rojo ese día; **corregido el 2026-10-14**.

### 4.5 Fase C — verificación en runtime del aislamiento y la limpieza (2026-10-14, VF)
Ejecutado por OpenCode contra el backend arrancado en `:8080` (PostgreSQL `18.6`), con `curl` sobre
dos/tres sesiones demo y verificación directa en la BD. Se autorizó por el usuario crear datos demo y
manipular `expires_at` por SQL; los datos de prueba creados se purgaron después.

| Prueba | Resultado real |
|---|---|
| `POST /api/demo/start` | **200**; `Set-Cookie: demoSession=<uuid>; Path=/; Max-Age=7200; HttpOnly; SameSite=Lax`; cuerpo `{companyId, companyName:"NovaTech Store", expiresAt}` |
| `GET /api/demo/me` sin cookie | **401** `{"error":"No hay sesión de demo activa"}` |
| `GET /api/demo/me` con cookie | **200** (mismo `companyId`) |
| Aislamiento de lectura A(17)/B(18) | IDs distintos; A ve 5→6 clientes, B nunca ve el creado en A |
| Plantilla intacta | Un clon nuevo (C/19) trae el set de la plantilla **sin** el cliente de A |
| **IDOR** cliente ajeno (`customerId` de B con sesión A) | **404** `Cliente no encontrado` |
| **IDOR** producto ajeno (`productId` de B con sesión A) | **404** `Producto no encontrado` |
| Venta válida (propia) | **200**; stock del producto de A 25→24; stock de B intacto (25) |
| `GET /api/companies/{propia}` con sesión | **200** |
| `GET /api/companies/{ajena}` con sesión | **404** |
| `POST`/`PUT`/`DELETE /api/companies...` | **405** (endpoints retirados) |
| `GET /api/companies` sin sesión | **404** |
| `POST /api/demo/cleanup` | **200**; no toca sesiones frescas |
| Purga de sesión caducada (empresa 19) | Empresa + hijos (demo_sessions, customers, categories, products, sales, sale_items, activity) a **0**, sin `sale_items` huérfanos; otras empresas intactas |

Hallazgos:
- **`LazyInitializationException` no reproduce.** En `DemoSessionFilter.java:42` y en el controlador
  solo se llama `session.getCompany().getId()`; `getId()` sobre el proxy Hibernate devuelve el
  identificador **sin** inicializar la entidad, así que no hay acceso `LAZY` fuera de transacción.
  Riesgo 6 (parte `LAZY`) **descartado** para este camino.
- **La plantilla se llama `NovaTech Store`** (industry `Tecnología`), no `FlowMetrics Demo` como
  decía la memoria/seed histórico. El seed aplicado difiere del documentado.
- **Respuestas de error con traza:** los **405** devuelven un cuerpo con `trace` (stack trace completo)
  → fuga de información técnica en producción. Anotado como riesgo nuevo (ver 5.11).
- Sesiones/empresas preexistentes 15/16 (sesiones 13/14) no creadas por esta prueba: **no se tocaron**.

### 4.6 Fase D — infraestructura de pruebas y cobertura (2026-10-14, PE)
Ejecutado por OpenCode con autorización del usuario y sus 8 condiciones. Objetivo: que los tests
**nunca** toquen la BD de desarrollo y ampliar la cobertura. Rama `develop`.

Infraestructura creada:
- **BD de pruebas `flowmetrics_test`**: creada y cargada con el **esquema real** de `flowmetrics` vía
  `pg_dump --schema-only --no-owner --no-privileges flowmetrics | psql -d flowmetrics_test` (solo
  lectura de la BD de desarrollo). 9 tablas. `flowmetrics` **no se modificó**.
- **`src/test/resources/application-test.properties`**: sobrescribe **solo la URL**
  (`jdbc:postgresql://localhost:5432/flowmetrics_test`); usuario y contraseña se **heredan** de
  `application.properties` (no se duplican credenciales). `ddl-auto=validate` (mismo esquema que
  producción), SQL silenciado, Flyway off.
- **`config/SchedulingConfig.java`**: `@EnableScheduling` se movió aquí con `@Profile("!test")`; el
  `BackendApplication` ya no lo lleva. En perfil `test` la limpieza programada **no** se registra.
- **Separación unit/integración** (`pom.xml`): surefire ejecuta `*Test` (unitarios rápidos, sin Spring);
  se añadió **failsafe** para `*IT` (integración con PostgreSQL) en `integration-test`/`verify`.
- **`AbstractIntegrationTest`**: base con `@SpringBootTest @ActiveProfiles("test") @Transactional`
  (cada test revierte, sin datos residuales).

Cobertura nueva:
- `SaleServiceIT` (4, integración): total y descuento de stock reales, stock insuficiente, producto
  ajeno → 404, cliente ajeno → 404.
- `DemoTenancyIT` (3, integración): `startSession` clona la plantilla en otra empresa sin tocarla;
  dos sesiones aisladas entre sí y de la plantilla; `cleanup` purga la sesión caducada con sus datos
  respetando FKs y deja la plantilla intacta.
- `BackendApplicationIT` (3, integración): `contextLoads`; **guard de aislamiento** (la URL del
  datasource termina en `/flowmetrics_test` y no en `/flowmetrics`); `SchedulingConfig` ausente en test.
- `SaleServiceImplTest` unitario ampliado (4): +stock insuficiente.

Resultados reales:
| Comando | Resultado |
|---|---|
| `./mvnw clean test` | **12 tests** (surefire), 0 fallos; sin Spring ni BD |
| `./mvnw verify` | **+10 IT** (failsafe) contra `flowmetrics_test`, 0 fallos; total 22 |
| Dev `flowmetrics` antes/después | companies=3, demo_sessions=2, customers=15, sales=12 → **sin cambios** |
| `flowmetrics_test` tras `verify` | todas las tablas a **0** (rollback transaccional) |

**Incidente registrado (honestidad de evidencia):** el primer `./mvnw test` ejecutó una **clase
obsoleta** `BackendApplicationTests.class` que quedaba en `target/` (el fuente ya se había borrado).
Ese test hit la BD de **desarrollo** y su limpieza programada se activó (perfil por defecto). La BD no
cambió (las 2 sesiones de dev no estaban caducadas → nada que purgar), pero demuestra el riesgo.
**Mitigación aplicada:** `./mvnw clean test`/`clean verify`; se documenta que hay que limpiar `target/`.
La clase obsoleta desapareció tras `clean`.

Hallazgos sobre los SQL del repo:
- **`database/schema/V1_create_schema.sql` está roto**: en las líneas 1-2 crea `idx_demo_token` sobre
  `demo_sessions` **antes** de crear la tabla → falla en una BD nueva. No se corrigió (fuera de alcance).
- **`database/seeds/V1_demo_data.sql` no coincide con la realidad**: inserta la empresa `FlowMetrics
  Demo`, pero la BD real tiene `NovaTech Store`. `database/backup/flowmetrics_v1.backup.sql` está
  **vacío** (0 bytes).

### 4.7 Riesgo 11 — fuga de traza en errores: causa raíz y fix (2026-10-14, PE + VF)
Investigación por OpenCode (solo lectura de proceso/jars) y verificación en runtime.

**Síntoma (VF):** con la app arrancada en local (perfil por defecto), un `GET /api/demo/cleanup`
(405) devuelve `{"timestamp":...,"status":405,"error":"Method Not Allowed","trace":"<stack trace
completo>","message":"Method 'GET' is not supported.","path":"..."}`.

**Causa raíz (CI, no config del proyecto):** el jar `spring-boot-autoconfigure-4.1.0.jar` contiene
`META-INF/spring-devtools.properties` con:
```
defaults.spring.web.error.include-binding-errors=always
defaults.spring.web.error.include-message=always
defaults.spring.web.error.include-stacktrace=always
```
`DevToolsSettings` (`SETTINGS_RESOURCE_LOCATION=META-INF/spring-devtools.properties`) lee las claves
con prefijo `defaults.` y `DevToolsPropertyDefaultsPostProcessor` las aplica como *property source* de
**baja precedencia**, **solo cuando DevTools está activo** (app local; en tests está inactivo). El
default de las mismas propiedades, sin DevTools, es `never` (metadatos de `spring-boot-autoconfigure`
y `spring-boot-web-server`). En Boot 4 los nombres nuevos son `spring.web.error.*` (los antiguos
`server.error.*` están deprecados con reemplazo).

**Descartado durante la investigación:** config `server.error.*` en el repo (no existe), overrides por
variables de entorno/`-D` (no hay), fichero global `~/.spring-boot-devtools.properties` (no existe),
restart classloader (no es la causa: con `spring.devtools.restart.enabled=false` seguía filtrando).

**Matriz de comprobación en runtime (PE, app en `:8081` contra `flowmetrics_test`, DevTools activo):**
| Configuración | 405 con `trace`/`message` |
|---|---|
| Baseline (DevTools ON, sin override) | **Sí (fuga)** |
| `spring.devtools.add-properties=false` | No |
| `spring.devtools.restart.enabled=false` | Sí (fuga) |
| `spring.web.error.include-stacktrace=never` + `include-message=never` | **No** |
| Fix aplicado (`never` en `application.properties`), DevTools ON | **No (verificado)** |

**Fix aplicado (cambio mínimo):** en `backend/src/main/resources/application.properties` se fijan
`spring.web.error.include-stacktrace=never`, `spring.web.error.include-message=never` y
`spring.web.error.include-binding-errors=never` (para que local coincida con producción).

**Prueba de regresión automatizada (PE):** nueva `ErrorResponseIT` (`@SpringBootTest(RANDOM_PORT)`,
perfil `test`, `Accept: application/json`): `GET /api/demo/cleanup` → 405 y `GET /api/ruta-inexistente`
→ 404, en ambos casos el cuerpo **no** contiene `trace` ni `org.springframework`. Ejecutado
`./mvnw clean verify` → **12 unitarios + 12 IT, 0 fallos**; BD `flowmetrics` sin cambios
(companies=3, demo_sessions=2, customers=15, sales=12, products=27) y `flowmetrics_test` a 0.

> Nota: al ser un default de **dev** (DevTools), el riesgo en producción empaquetada era bajo (DevTools
> se excluye del jar); aun así se fija explícitamente para eliminar la inconsistencia local/producción.

### 4.8 Fase E.1 — edición de ventas en el frontend (2026-10-14, PE + VF)
- **Cambio (solo frontend):** `frontend/src/pages/Sales.jsx` — añadido `editingId`, `handleEdit(sale)`
  (rellena cliente, método/estado de pago, estado y las líneas `productId`/`quantity`), `resetForm`
  limpia `editingId`, `handleSubmit` usa `updateSale(editingId, payload)` cuando hay edición y
  `createSale` si no; botón de la fila «Editar» y botones «Guardar cambios»/«Cancelar edición». Sigue
  el patrón ya usado en `Customers.jsx`. Import ampliado con `updateSale` (ya existía en
  `api/sales.js:18`).
- **No se tocó backend** (el `PUT /api/sales/{id}` ya existía; `SaleServiceImpl.update` devuelve stock
  viejo y descuenta el nuevo).
- **Evidencia (PE):** `npm run lint` → **0 problemas**; `npm run build` → **OK** (chunk 870,56 kB, aviso
  > 500 kB preexistente).
- **Evidencia (VF, contra `:8080`, sesión demo real):** crear venta (cliente 92, producto 165, qty 1)
  → total **899,99**, stock 165 **25→24**; `PUT` a qty 2 → total **1799,98**, stock **24→23**; `DELETE`
  → stock restaurado a **25**. Sesión de prueba (company 20) purgada tras la verificación; la BD
  `flowmetrics` volvió a la línea base (companies=3, demo_sessions=2, customers=15, sales=12,
  products=27, categories=12).

### 4.9 Fase E.4 — documentación y README (2026-10-14, CI)
- **`docs/api.md`:** referencia de todos los endpoints reales (demo, companies, customers,
  categories, products, sales, activity, reports), cuerpos `Create*DTO`, DTO de respuesta y códigos
  de error. Incluye nota de scoping por sesión.
- **`docs/arquitectura.md`:** stack, capas del backend, modelo multi-tenant demo, manejo de errores,
  CORS, estructura del frontend, ejecución local y limitaciones.
- **`docs/base-datos.md`:** 9 tablas reales (incluida `reports`, **sin entidad JPA**), FKs observadas,
  provisión manual (Flyway off), problema de los SQL de `database/` y comando de `pg_dump`.
- **`docs/roadmap.md`:** fases completadas (A, B, C, D, E.1, riesgo 11), pendientes (E.2–E.5, F) y
  tabla de deuda técnica/riesgos.
- **`README.md`:** corregido (decía «Next.js»); ahora React 19 + Vite 8 + JSX + Tailwind v4,
  Spring Boot 4.1.0, PostgreSQL, con puesta en marcha y enlaces a los docs.
- **Hallazgo (riesgo 16):** `CustomerController`/`CategoryController`/`ProductController`/
  `SaleController` (y `ReportController`) permiten, **sin sesión y sin `?companyId=`**, listar con
  `findAll()` (todos los tenants). `CompanyController` sí exige sesión. El frontend siempre usa
  sesión, pero conviene decidir si la API debe exigirla.
- **Naturaleza:** documentos y comentarios; no se tocó lógica ni config. Sin verificación runtime
  (no aplica).

### 4.10 Fase E.2 — panel real de sesión en Settings (2026-10-14)
- **Qué:** `frontend/src/pages/Settings.jsx` dejó de ser texto estático; ahora consume
  `useDemoSession()` (`{ companyId, companyName, expiresAt }` de `/api/demo/me`) y muestra:
  - tarjeta **Empresa** (`companyName`), **Identificador** (`companyId`),
  - **Caduca** (fecha/hora absoluta vía `toLocaleString`),
  - **Tiempo restante** con `setInterval` de 1 s y estados `—`/«Caducada»,
  - estados de carga («Cargando configuración…») y sin sesión.
- **Contrato backend (CI):** `DemoSessionController` (`POST /api/demo/start`, `GET /api/demo/me`)
  devuelve exactamente `companyId`, `companyName`, `expiresAt` (`LocalDateTime` sin zona).
- **Evidencia (PE):** `npm run lint` → 0 problemas; `npm run build` → OK (chunk 872 kB, aviso
  preexistente); `Settings.jsx` transformado sin error por Vite dev (`:5173`). **No** hay VF visual
  automatizada (no hay navegador headless ni runner e2e en el proyecto).
- **Alcance (decisión del usuario):** opción A (panel de sesión real, solo frontend); **no** se
  reintrodujo `PUT /api/companies/{id}` (opción B).

### 4.11 Fase E.3 — migraciones Flyway autoradas, sin activar (2026-10-14, PE + VF)
- **Decisión del usuario:** autorar migraciones y verificar en una BD desechable **sin activar** Flyway
  (`spring.flyway.enabled` sigue en `false` en `application.properties` y `application-test.properties`).
- **Ficheros nuevos:** `backend/src/main/resources/db/migration/V1__create_schema.sql` (las 9 tablas,
  constraints, índices y FKs con su `ON DELETE`, reconstruido desde `pg_dump` real) y
  `V2__seed_demo.sql` (empresa plantilla `NovaTech Store`: 4 categorías, 9 productos, 5 clientes,
  4 ventas y 6 líneas; fechas de venta relativas con `now() - interval`).
- **Bug corregido respecto al seed antiguo:** `database/seeds/V1_demo_data.sql` insertaba
  `companies.id = 1` explícito sin avanzar la secuencia → el clonado de la plantilla fallaba por PK
  duplicada. `V2` hace `setval(pg_get_serial_sequence(...))` en cada tabla tras insertar ids explícitos.
- **Evidencia (PE):** en `flowmetrics_flyway_verify` (desechable) `psql -f V1 -f V2` OK; `pg_dump
  --schema-only` **idéntico** al de `flowmetrics` (diff sin diferencias); FKs con `confdeltype`
  correcto (`c`/`r`); `INSERT` de prueba devolvió id=2 (secuencia avanzada, sin colisión).
- **Evidencia (VF):** en `flowmetrics_flyway_run` (desechable, arranque con
  `SPRING_DATASOURCE_URL=.../flowmetrics_flyway_run SPRING_FLYWAY_ENABLED=true SERVER_PORT=8091`);
  Flyway aplicó **V1 y V2** (`flyway_schema_history` con `success = t`), 10 tablas (9 + historial),
  y `POST /api/demo/start` clonó la plantilla (empresa 2 con 4 categorías/9 productos/5 clientes/4
  ventas). App parada y **ambas BD desechables borradas**; BD dev `flowmetrics` no tocada (9 tablas).
- **Pendiente:** *activar* Flyway en runtime (requiere autorización y decidir estrategia de baseline
  de la BD existente). Ver D-31.

### 4.12 Fase E.5 — credenciales a variables de entorno (2026-10-14, PE)
- **Qué:** `backend/src/main/resources/application.properties` dejó de contener usuario/contraseña:
  ```properties
  spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/flowmetrics}
  spring.datasource.username=${DB_USERNAME:postgres}
  spring.datasource.password=${DB_PASSWORD}
  ```
  `DB_PASSWORD` es **obligatoria**; `DB_USERNAME` default `postgres`; `DB_URL` default local `flowmetrics`.
- **Decisión del usuario:** variables de entorno obligatorias (sin `.env` ni fichero local).
- **Efecto en tests:** `application-test.properties` hereda usuario/contraseña (solo sobrescribe la
  URL a `flowmetrics_test`), por lo que **los tests también requieren `DB_PASSWORD`**. Se actualizó el
  comentario del fichero para reflejarlo.
- **Evidencia (PE), en **copia aislada** `/tmp` para no tocar `target/` ni la app de Eclipse:**
  - Con `DB_USERNAME`/`DB_PASSWORD` (leídos de `HEAD` sin imprimirlos): `./mvnw clean verify` →
    **BUILD SUCCESS** (12 unit + 12 IT).
  - Sin `DB_PASSWORD`: el arranque **falla** (Spring deja el placeholder sin resolver y Postgres
    devuelve `SQLState 28P01`, autenticación fallida). No arranca sin la variable.
- **Nota operativa:** al arrancar de nuevo la app **hay que definir `DB_PASSWORD`** en el entorno
  (p. ej. Eclipse: Run Configurations → Environment, o terminal). La instancia que ya corría en `:8080`
  seguía viva durante la prueba; se reiniciará/firmará al recargar DevTools.
- **Cómo se evitó exponer secretos:** la sustitución se hizo con un script que no imprime valores; el
  valor real se obtuvo de `HEAD` solo para la verificación (nunca en claro). No se copió a ningún
  fichero.
- **Cierre (2026-10-14):** los defaults `postgres`/`flowmetrics` son intencionados para desarrollo;
  documentado que **producción debe configurar explícitamente** `DB_URL`, `DB_USERNAME` y `DB_PASSWORD`
  (`README.md`, `docs/base-datos.md`, D-32).

### 4.13 R16 — aislamiento multi-tenant exigido desde la sesión (2026-10-14, PE)

- **Qué se hizo (CI):** se eliminó el acceso a datos sin sesión. Nuevo `context/SessionGuard`
  (`requireCompanyId()` → 401; `requireOwnership(...)` → 404) y `exception/UnauthorizedException` (401 en
  `GlobalExceptionHandler`). Reescritos los controladores de datos (`Customer`, `Category`, `Product`,
  `Sale`, `Report`, `Activity`) para derivar el `companyId` **solo** de la sesión; se eliminó el
  `@RequestParam companyId` y el fallback `findAll()`; el `?companyId=` se ignora y el `companyId` del
  cuerpo no autoriza. `CompanyController` ya exigía sesión (B3, sin cambios). `ProductServiceImpl`
  valida la categoría↔empresa. `SaleServiceImpl` ya validaba cliente y producto. Nueva IT
  `TenantIsolationIT` (8 casos).
- **Evidencia (PE):** en **copia aislada** `/tmp/opencode/r16/backend`,
  `DB_USERNAME=… DB_PASSWORD=… ./mvnw clean verify` → **BUILD SUCCESS**, **12 unitarios + 20 IT, 0
  fallos** (SaleServiceIT 4, DemoTenancyIT 3, TenantIsolationIT 8, ErrorResponseIT 2,
  BackendApplicationIT 3). `flowmetrics_test` quedó a **0 filas** (rollback correcto) y la BD dev
  `flowmetrics` conservó su baseline (companies=3, demo_sessions=2, customers=15, sales=12).
- **Docs:** `docs/api.md` actualizado (convención de sesión obligatoria, 401 en errores, `?companyId=`
  ignorado). **Riesgo 16 cerrado.** No se tocó `pom.xml` ni la BD. Ver D-35.

### 4.14 Fase E.3 — estrategia de baseline de Flyway preparada y verificada (2026-10-14, PE + VF)

- **Objetivo:** preparar la activación de Flyway de forma segura, sin tocar la BD de desarrollo
  `flowmetrics`.
- **Estrategia (D-36):** `spring.flyway.baseline-on-migrate=true` + `baseline-version=2`, expuesta como
  **perfil aislado** `flyway` (`backend/src/main/resources/application-flyway.properties`). El arranque
  habitual sigue con `spring.flyway.enabled=false`.
- **Cambios (config, inertes):** nuevo `application-flyway.properties`; comentario en
  `application.properties` apuntando al perfil (sin cambiar `enabled=false`). Migraciones `V1`/`V2`:
  **sin cambios**.
- **Entorno aislado:** copia en `/tmp/opencode/flyway_e3/backend` (build propio, no toca el `target/` de
  Eclipse). BD desechables: `fm_e3_fresh`, `fm_e3_sim`, `fm_e3_nb`, `fm_e3_bv1`, `fm_e3_profile`
  (**todas borradas** al terminar).
- **Evidencia (VF) — instalación desde cero** (`fm_e3_fresh`, vacía, Flyway on):
  - Flyway aplicó **V1** y **V2** en orden (`flyway_schema_history` success=t; "All configured schemas
    are empty; a baseline marker will not be added"): 10 tablas (9+historial).
  - Datos: companies=1, categories=4, products=9, customers=5, sales=4, sale_items=6; plantilla
    `NovaTech Store` (id=1, is_template=t); secuencias coherentes (`setval` ⇒ próximo = max+1).
  - `POST /api/demo/start` → **200**, cookie `demoSession`; clonó la plantilla (empresa 2 con
    4/9/5/4 y 1 sesión). `GET /api/demo/me` → 200.
  - **Reinicio:** "Schema \"public\" is up to date. No migration necessary."; sin duplicados
    (companies=2, customers=10, sales=8, historial=2).
- **Evidencia (VF) — BD existente simulada** (`fm_e3_sim`/`fm_e3_nb`: V1+V2 aplicados por psql, sin
  historial): `Successfully baselined schema with version: 2` + "No migration necessary"; datos
  intactos (companies=1, customers=5, products=9, sales=4); demo clona igualmente.
- **Evidencia (VF) — casos que justifican la config:**
  - **Sin** `baseline-on-migrate` → falla: *"Found non-empty schema(s) \"public\" but no schema history
    table"* (`fm_e3_nb`, sin cambios: hist=0, companies=1).
  - **`baseline-version=1`** (por defecto) → baselina v1 e intenta V2 → falla `SQL State 23505` (PK
    duplicada del template id=1), "Changes successfully rolled back" (`fm_e3_bv1`).
- **Evidencia (VF) — perfil `flyway` preparado:** reconstruido el jar de la copia con
  `application-flyway.properties`; `SPRING_PROFILES_ACTIVE=flyway` en BD nueva aplica V1+V2; en BD
  existente baselina v2 y no migra. Confirma que el interruptor funciona tal cual.
- **Evidencia (PE) — esquema y plantilla:** `pg_dump --schema-only` de la BD creada por Flyway ==
  `flowmetrics` (**idéntico**, salvo el token `\restrict` que pg_dump 18 genera por dump). Plantilla de
  `flowmetrics` (empresa 1) == V2 **fila a fila** (categories/products/customers/sales/sale_items),
  salvo `sale_date`/timestamps.
- **BD dev `flowmetrics` sin cambios:** 9 tablas, **sin** `flyway_schema_history`, companies=3,
  demo_sessions=2, customers=15, sales=12 (igual que al inicio de la sesión). `flowmetrics_test` no se
  tocó. No quedan BD `fm_e3_*` ni procesos jar.
- **Activación:** autorizada por el usuario el 2026-10-14; ejecutada en el entorno de desarrollo. Ver
  **4.15** y D-36.

### 4.15 Fase E.3 — Flyway ACTIVADO en el entorno de desarrollo (2026-10-14, VF)

- **Autorización:** el usuario autorizó activar Flyway en desarrollo con condiciones (destino
  exclusivamente `flowmetrics`, sin tocar V1/V2 ni la versión de baseline, sin `clean verify`, sin
  recrear/borrar BDs, sin commiteos).
- **Configuración previa verificada:** perfil normal y `application-test.properties` mantienen
  `spring.flyway.enabled=false`; **solo** `application-flyway.properties` habilita Flyway, con
  `baseline-on-migrate=true` + `baseline-version=2` (idéntico a lo probado). Migraciones `V1`/`V2` sin
  cambios.
- **Destino confirmado antes de arrancar:** `spring.datasource.url` por defecto =
  `jdbc:postgresql://localhost:5432/flowmetrics`; arranque con `--DB_URL=jdbc:postgresql://localhost:5432/flowmetrics`
  explícito. **Nunca** producción ni otra base.
- **Estado inicial registrado (antes):** 9 tablas, **sin** `flyway_schema_history`; companies=3,
  categories=12, products=27, customers=15, sales=12, sale_items=18, demo_sessions=2, activity=0,
  reports=0.
- **Arranque (VF):** se detuvo el proceso de desarrollo de Eclipse (PID 14316, SIGTERM) y se arrancó
  `SPRING_PROFILES_ACTIVE=flyway ./mvnw spring-boot:run` contra `flowmetrics`. Logs:
  - `Database: jdbc:postgresql://localhost:5432/flowmetrics (PostgreSQL 18.6)`
  - `Schema history table "public"."flyway_schema_history" does not exist yet`
  - `Successfully validated 2 migrations`
  - `Creating Schema History table ... with baseline ...`
  - `Successfully baselined schema with version: 2`
  - `Schema "public" is up to date. No migration necessary.` (**sin** ejecutar V1/V2)
  - `Tomcat started on port 8080` · `Started BackendApplication`
- **Estado final verificado (después):** `flyway_schema_history` con **1 fila** (version=2, type=BASELINE,
  success=t) y **0** migraciones SQL aplicadas; tablas = 9 originales + `flyway_schema_history`; conteos
  **idénticos** a los de "antes" (datos intactos). La app respondió: `GET /api/demo/me` **401**,
  `GET /api/customers` **401**, `GET /api/sales` **401**, `GET /` **404**. `flowmetrics_test` no se tocó.
- **Resultado:** **E.3 completada para desarrollo.** El arranque habitual (perfil normal) sigue con
  Flyway desactivado; para gestionar la BD con Flyway en dev debe activarse el perfil `flyway`
  (`SPRING_PROFILES_ACTIVE=flyway`). Pendiente fuera de alcance: decidir activación en producción y en
  otras bases. Ver D-36 y `docs/base-datos.md`.
- **Parada del proceso de terminal (2026-10-14):** el `./mvnw spring-boot:run` con perfil `flyway`
  arrancado para la verificación se detuvo de forma ordenada (SIGTERM por PID; mvnw + java). No queda
  ninguna instancia en ejecución (tampoco la de Eclipse previa). La BD `flowmetrics` no se modificó en
  la parada. El usuario continuará usando **Eclipse** como entorno habitual, arrancando con
  `SPRING_PROFILES_ACTIVE=flyway` + `DB_USERNAME` + `DB_PASSWORD` en Run Configurations → Environment.
  **Confirmado por el usuario (2026-10-14): el arranque desde Eclipse funciona** con el perfil `flyway`
  (el usuario lo comprobó). Eclipse queda como entorno habitual de desarrollo.

### 4.16 Rediseño de UI: sistema de diseño, corrección de bugs y responsive (2026-10-14, PE + VF parcial)

- **Alcance aprobado por el usuario (tres bloques):** **P0** (bugs + navegación), **P1** (sistema de
  diseño + estilado) y **P2** (responsive/móvil + marca).
- **Nuevos archivos (frontend):**
  - `src/index.css`: tokens de diseño `@theme` (paleta de marca morada `--color-brand-50..950`), base
    `body` y `:focus-visible`.
  - `src/lib/format.js`: `formatCurrency` (es-ES/EUR), `formatDate`, `formatDateTime` y etiquetas de
    dominio `saleStatus`/`paymentStatus`/`paymentMethod` (traducen `COMPLETED`/`PAID`/…).
  - `src/lib/cn.js`: helper de clases; `src/lib/useAsyncData.js`: hook de carga con `loading`/`error`/
    `refresh`/`retry` (satisface las reglas del compilador de React).
  - `src/components/ui/`: `Button`, `Input`, `Select`, `Card`, `Badge`, `Spinner`, `Skeleton`,
    `EmptyState`, `ErrorState`, `PageHeader`, `Modal`, `toast/` (`ToastProvider`+`useToast`) y
    `confirm/` (`ConfirmProvider`+`useConfirm`).
  - `src/pages/NotFound.jsx` (404).
- **Cambios:** `App.jsx` (envuelve con `ToastProvider`+`ConfirmProvider`; **index** `/demo` → redirect a
  `dashboard`; **404** dentro y fuera del layout); `DemoSessionProvider.jsx` (estado `error` + `retry`);
  `AppLayout.jsx` (spinner, estado de error con reintento, header móvil con menú, aviso de marca);
  `Sidebar.jsx` (**Categorías** añadida al menú, drawer responsive); `api/client.js` (`baseURL` desde
  `VITE_API_URL` con fallback a `http://localhost:8080/api`).
- **7 páginas reescritas** (`Dashboard`, `Reports`, `Customers`, `Products`, `Categories`, `Sales`,
  `Settings`): estados de carga (skeleton) y de error con reintento, estado vacío; **toasts** en lugar de
  `alert()`; **diálogo de confirmación** en lugar de `confirm()`; enums traducidos; moneda con
  separador de miles; grids y tablas **responsivas** (scroll horizontal); gráficas con el color de marca
  y tooltips formateados en EUR.
- **Marca/metadatos:** `index.html` → `lang="es"`, título, `description` y `theme-color`; favicon de
  marca (sustituye al logo de Vite). **Eliminados** por no usarse: `src/App.css`,
  `src/assets/{hero.png,react.svg,vite.svg}` y `public/icons.svg` (recuperables vía Git). **Landing:**
  `mailto` corregido al email realmente mostrado y enlace de GitHub apuntando al repo real
  (`github.com/FellowScribble/flowmetrics`).
- **Pruebas ejecutadas (PE):** `npm run lint` → **0 problemas**; `npm run build` → **OK** (Vite 8.3.0,
  2931 módulos; persiste el aviso de chunk > 500 kB).
- **Verificado en runtime (VF parcial):** el dev server Vite `:5173` sirve `index.html` con
  `lang="es"` y el título nuevo; el backend Eclipse `:8080` responde `POST /api/demo/start` **200**,
  `GET /api/demo/me` **200** (`NovaTech Store`), `GET /api/reports/summary` **200** y
  `GET /api/customers` **200** (5 clientes).
- **No verificado / pendiente:** el **render visual** en navegador no se ha comprobado (no hay
  navegador en la sesión); el enlace de **LinkedIn** del footer se deja como está por decisión del
  usuario (`linkedin.com` genérico); la unificación estética Landing (oscura) vs. app (clara) queda fuera
  de este cambio. El smoke test creó una **sesión demo** temporal adicional.
- **Sin commits** (el usuario revisa antes de commitear). Cambios pendientes de revisión del usuario.

### 4.17 Demostración en tema oscuro (paleta del Landing) y logo enlazado (2026-10-14, PE + VF parcial)

- **Petición del usuario:** (1) que al pulsar el logo **FlowMetrics** de la demo se vuelva a la landing;
  (2) que el fondo de la **demo** sea **oscuro y legible como la landing**, con la **misma paleta**.
- **Paleta tomada del Landing:** base `bg-black`/`text-zinc-100`; superficies `bg-zinc-900`; bordes
  `zinc-800`; acentos morados `brand`/`purple-300/400` y `bg-purple-950`.
- **Cambios:**
  - `src/index.css`: `body` ahora `bg-black text-zinc-100`; `:focus-visible` con `ring-offset-black`.
  - `src/components/ui/*`: `Card`/`Input`/`Select`/`Badge`/`Skeleton`/`EmptyState`/`ErrorState`/
    `Modal`/`PageHeader`/`Button`/`Spinner` y `toast` re-estilados en oscuro (bordes `zinc-800`,
    textos `zinc-100/300/400`, tonos de badge oscuros).
  - `AppLayout`/`Sidebar`: fondo `bg-black`, superficies `bg-zinc-950`, navegación activa
    `bg-brand-950 text-brand-300`. El **logo FlowMetrics** (sidebar y cabecera móvil) es ahora un
    `<Link to="/">` que vuelve a la landing.
  - 7 páginas: clases de color migradas a la paleta oscura; encabezados de tabla `bg-zinc-950/60`;
    gráficas con color de marca `#a855f7`, grid `#27272a`, ejes `#a1a1aa` y tooltip oscuro.
- **Pruebas (PE):** `npm run lint` → **0 problemas**; `npm run build` → **OK**.
- **Verificado (VF parcial):** dev server Vite `:5173` responde **200**.
- **No verificado:** el render visual en navegador (sin navegador en la sesión). **Sin commits.**

### 4.18 V3 — semilla enriquecida de la demo (2026-10-14, PE + VF)

- **Petición del usuario:** que la demo tenga **más datos** (clientes, productos y un histórico de
  ventas de ~12 meses) para que los informes y gráficas sean realistas.
- **Nuevo archivo:** `backend/src/main/resources/db/migration/V3__seed_demo_more.sql` (bloque
  `DO $$ ... $$`). Localiza la plantilla con
  `SELECT id FROM companies WHERE is_template=true ORDER BY id LIMIT 1` (mismo criterio que
  `DemoSessionServiceImpl.findByIsTemplateTrue().get(0)`), **sin ids explícitos** (los asigna la
  secuencia) y referenciando por **nombre** dentro de la plantilla; `setval` al final. Añade
  **+8 clientes**, **+8 productos** (3 con stock bajo) y **~60 ventas** (5/mes × 12 meses, 1..3 líneas);
  totales recalculados desde las líneas. `payment_method` CARD/CASH/TRANSFER, `payment_status`
  PAID/PENDING y `status` COMPLETED/PENDING (se evita CANCELLED para no distorsionar ingresos).
- **Bug corregido durante la prueba:** ambigüedad variable/columna → renombrada `sale_id`→`v_sale_id`
  y calificado el `UPDATE sales s SET total = COALESCE((SELECT SUM(si.subtotal) FROM sale_items si
  WHERE si.sale_id = s.id),0) WHERE s.id = v_sale_id`.
- **Prueba (PE):** PostgreSQL desechable (`initdb -A trust`, puerto 55432, en `/tmp/opencode/pgtest`),
  V1+V2+V3 aplicadas sin error; backend levantado contra él, `POST /api/demo/start` clona
  13 clientes / 17 productos / 64 ventas / 126 líneas / 13 meses; `summary` coherente
  (revenueThisMonth, activeCustomers 13, lowStockProducts 3); 0 incoherencias de total; secuencias
  avanzan. Entorno desechable limpiado.
- **Verificado (VF, dev):** reinicio de Eclipse con perfil `flyway` → V3 aplicada en `flowmetrics`
  (solo V3; V1/V2 no re-ejecutadas). Sesión demo nueva: 13 clientes, 64 ventas, 13 meses,
  lowStockProducts 3. **Nota:** las sesiones demo antiguas conservan los datos previos; hay que
  **iniciar una demo nueva** para verlos.
- **Sin commits.**

### 4.19 Internacionalización (ES/EN) de toda la app (2026-10-14, PE + VF parcial)

- **Decisión del usuario (vía pregunta):** (1) header del Landing **fijo al bajar y oculto al subir**
  manteniendo el aviso «Proyecto Portfolio»; (2) traducción de **toda la app** (Landing + demo);
  (3) idioma por defecto **español**.
- **Infra nueva (`frontend/src/i18n/`):**
  - `translations.js`: diccionarios completos `es`/`en` (namespaces `common`, `aria`, `nav`, `layout`,
    `errorState`, `confirm`, `dashboard`, `customers`, `products`, `categories`, `sales`, `reports`,
    `settings`, `notFound`, `enums`, `landing`), helpers `getByPath`, `SUPPORTED_LANGUAGES`,
    `DEFAULT_LANGUAGE`; `t()` con interpolación `{{var}}`.
  - `LanguageContext.js` (`createContext`), `LanguageProvider.jsx` (estado `language` persistido en
    `localStorage` clave `flowmetrics.language`, fija `document.documentElement.lang`, expone
    `t`/`tEnum`/`toggleLanguage`/`locale`), `useLanguage.js` (hook) y `LanguageToggle.jsx`
    (conmutador ES/EN segmentado).
- **Formato localizado:** `src/lib/format.js` refactorizado a **locale-aware**
  (`formatCurrency/Date/DateTime(value, locale='es-ES')` con caché de `Intl`) + tonos de estado de
  venta/pago; nuevo `src/lib/useFormat.js` que ata `currency`/`date`/`dateTime`/`saleStatus`/
  `paymentStatus`/`paymentMethod` al idioma activo (las etiquetas de enum salen de las traducciones).
- **Integración:** `App.jsx` envuelve todo con `LanguageProvider`. Traducidos `AppLayout`, `Sidebar`
  (+ `LanguageToggle`), `ErrorState`, `ConfirmProvider` (defaults), `Modal` (aria), `ToastProvider`
  (aria) y las 8 páginas (`Dashboard`, `Customers`, `Products`, `Categories`, `Sales`, `Reports`,
  `Settings`, `NotFound`). La demo usa ES por defecto (p. ej. «Dashboard» → **«Panel»**).
- **Pruebas (PE):** `npm run lint` → **0 problemas**; `npm run build` → **OK** (Vite 8.3.0, 2937
  módulos; persiste el aviso de chunk > 500 kB).
- **Verificado (VF parcial):** el dev server Vite `:5173` transforma sin error los módulos nuevos
  (`/src/i18n/*`, `/src/lib/useFormat.js`, `/src/pages/Landing.jsx`, `/src/components/layout/AppLayout.jsx`,
  `main.jsx`); backend `:8080` responde `POST /api/demo/start` (200, `NovaTech Store`).
- **No verificado:** el **render visual** del conmutador y de los textos traducidos (sin navegador en
  la sesión). **Sin commits.**

### 4.20 Landing: logo no clicable, header sticky y tarjeta de desarrolladora (2026-10-14, PE + VF parcial)

- **Cambios en `frontend/src/pages/Landing.jsx`:**
  - **Logo FlowMetrics no clicable** (retirados `onClick`/`cursor-pointer`).
  - **Header sticky** que «sigue la vista»: se muestra al **bajar** y se **oculta al subir**
    (`y: '-100%'`), mientras el **aviso «Proyecto Portfolio» permanece siempre visible**. Se unificó
    aviso + header en un contenedor `sticky top-0`; el aviso lleva `bg-black` opaco y `z-10` para
    ocultar el header al deslizarse. Raíz con `overflow-x-clip` (en vez de `overflow-x-hidden`) para
    no romper `position: sticky`.
  - **Tarjeta de desarrolladora** (`DevCard`, extraída a componente propio): deja de fijarse a
    `bottom-6` fijo y **sube lo justo para no tapar el footer** (calcula el solape con el footer
    `#site-footer` en cada `scroll`/`resize`, de forma imperativa sobre el DOM).
  - **Todo traducido** vía `t('landing.*')` e integrado el **conmutador ES/EN** (`LanguageToggle`).
    Correcciones de rótulo: «Portfolio Showcase» → «Proyecto Portfolio», «Starter/Enterprise» →
    «Inicial/Empresa»; el **enlace de LinkedIn** se deja **como está** (slug sin tilde:
    `andrea-viera-hernandez-0449652ba`).
- **Pruebas (PE):** `npm run lint` → **0 problemas**; `npm run build` → **OK**.
- **Verificado (VF parcial):** módulo `Landing.jsx` transformado sin error por el dev server Vite.
- **No verificado:** el comportamiento visual del sticky/scroll y de la tarjeta (sin navegador). **Sin
  commits.**

### 4.21 Preparación para despliegue (Vercel + Render + Neon) (2026-10-14, CI + PE parcial)

> **Tarea:** dejar el repositorio preparado para un despliegue **manual futuro**. **No** se ha
> desplegado, **no** se ha conectado Neon, **no** se han ejecutado migraciones y **no** se han hecho
> commits. Decisiones del usuario: **proxy Vercel `/api` → Render**, **Actuator** para healthcheck, y
> aplicar **CORS por env + perfil `prod` para Flyway + cookie `Secure` configurable**.

- **Auditoría (CI):** todos los endpoints de negocio pasan por `SessionGuard` (companyId desde la
  sesión, nunca del cliente); `SaleServiceImpl` valida pertenencia de cliente/producto; plantilla
  protegida y sin endpoints de escritura. **No se encontró fuga entre empresas ni bypass de sesión.**
  Bloqueantes detectados (de configuración, no de seguridad): CORS fijo a localhost, cookie no
  cross-site, Flyway desactivado, SPA sin rewrites, sin healthcheck.
- **Cambios de backend:**
  - `pom.xml`: +`spring-boot-starter-actuator` (gestionado por el padre 4.1.0).
  - `application.properties`: expone **solo** `/actuator/health` (`management.endpoints.web.exposure.include=health`,
    `show-details=never`, `show-components=never`); `app.cors.allowed-origins` y `app.demo.cookie.secure`
    por variable de entorno (defaults locales intactos).
  - **Nuevo** `application-prod.properties`: `spring.flyway.enabled=true` **sin baseline**
    (`clean-disabled=true`), `spring.jpa.show-sql=false`, `server.port=${PORT:8080}`,
    `app.demo.cookie.secure=true`.
  - `CorsConfig.java`: orígenes desde `app.cors.allowed-origins` (default `http://localhost:5173`).
  - `DemoSessionController.java`: `@Value("${app.demo.cookie.secure:false}")` y `.secure(cookieSecure)`;
    se mantienen `HttpOnly`, `Path=/`, `SameSite=Lax`, `Max-Age=2h`. **No cambia el aislamiento.**
- **Nuevos archivos:** `backend/Dockerfile` (multi-etapa Maven+JDK21 → JRE21, sin tests),
  `backend/.dockerignore`, `backend/.env.example`, `frontend/vercel.json` (rewrite `/api/:path*` →
  Render + fallback SPA), `frontend/.env.example`, `docs/despliegue.md`. README actualizado.
- **Pruebas ejecutadas (PE):** backend `./mvnw -DskipTests compile` → **OK**; `./mvnw -DskipTests
  test-compile` → **OK**; Actuator **4.1.0** resuelto en `~/.m2`. Frontend `npm run lint` → **0
  problemas**; `npm run build` → **OK**.
- **NO verificado (pendiente):** build de la imagen **Docker** (no está instalado), arranque en
  **Render**, migración sobre **Neon**, comportamiento del **proxy** y de la **cookie** en navegador
  real, y memoria (OOM) en Render Free. Ver `docs/despliegue.md` §Comprobaciones.
- **Sin commits.** Decisión de **rama a publicar** (`develop` vs `main`) pendiente.

### 4.22 Endurecimiento pre-despliegue: `.gitignore`, auditoría de secretos y cierre de `/api/demo/cleanup` en prod (2026-10-15, PE)

> **Tarea autorizada:** preparación para despliegue **sin** publicar, commitear, desplegar, tocar BD
> ni conectarse a Neon. Detalle de decisiones: **D-46**.

- **`git status` al empezar:** el usuario había creado el commit **`1e8d952` "Files on-work
  deployment"** (incluye `.gitignore` con los patrones `.env` de esta sesión, Dockerfile,
  `application-prod.properties`, `vercel.json`, `docs/despliegue.md`, memoria, etc.). La sesión
  2026-10-14 quedó así commiteada por el usuario; **esta** sesión no ha hecho ningún commit.
- **`.gitignore` raíz (CI):** se amplió a `.env` / `.env.*` / `!.env.example` (patrones sin `/`,
  aplican a `backend/` y `frontend/` en cualquier nivel). **Verificado (PE)** con `git check-ignore`
  sobre 7 rutas: los `.env`/`.env.local`/`.env.production` de ambos directorios quedan **ignorados**
  y los dos `.env.example` **visibles**; `git ls-files` no trackea ningún `.env`.
- **Auditoría de secretos (CI/PE):** búsquedas en todo el repo de credenciales en URLs JDBC/Postgres,
  `password=`/`secret`/`api_key`/`token=` con valor literal, patrones JWT/hex largo/`sk-`. **Cero
  hallazgos reales** en los archivos a versionar: solo placeholders (`CAMBIA_ESTO_...`, `ep-xxxx...`),
  identificadores de código y un hash `integrity` de `package-lock.json`.
  - **Hallazgo nuevo (riesgo 17):** la contraseña real de `DB_PASSWORD` **persiste en el historial
    de git** (`785bf60` y anteriores; `HEAD` ya usa `${DB_PASSWORD}`). Para ejecutar los tests se
    extrajo de ese commit **sin imprimirla**. Rotar la contraseña o limpiar el historial requiere
    autorización explícita.
- **`POST /api/demo/cleanup` (CI → PE):** análisis previo: borraba solo sesiones caducadas (`isActive`
  y `expiresAt < ahora`), su empresa clonada y hijos; **sin autenticación**; el frontend **no** lo usa
  (0 llamadas); el `@Scheduled` horario cubre la limpieza. Riesgo: endpoint de estado público
  invocable por cualquiera (abuso/carga en Render Free). **Corrección mínima autorizada (Opción C):**
  nueva propiedad `app.demo.cleanup.endpoint.enabled` (default **`true`** → local y tests intactos);
  `application-prod.properties` la pone en **`false`** ⇒ el handler responde **404** (no revela su
  existencia). **El `@Scheduled` de `DemoCleanupServiceImpl` no depende de la propiedad y no se
  modificó.** No se tocó lógica de limpieza, aislamiento, migraciones ni BD.
- **Nuevas pruebas (PE):** `DemoCleanupEndpointDisabledIT` (propiedad `false` → POST **404**, cuerpo
  vacío, 2 tests) y `DemoCleanupEndpointEnabledIT` (default → POST **200** «Limpieza ejecutada»,
  1 test; BD de test sin sesiones caducadas ⇒ no-op). `ErrorResponseIT` sigue verde (GET → 405,
  mapping registrado).
- **Resultado (PE):** `./mvnw clean verify` → **BUILD SUCCESS**: **12 unitarios + 23 IT, 0 fallos**
  (frente a 20 IT previas). `flowmetrics_test` a **0 filas** (rollback correcto); BD dev `flowmetrics`
  **sin cambios por los tests** (guard de `BackendApplicationIT` en verde).
- **`frontend/vercel.json` (CI):** destino del rewrite `/api/:path*` = **placeholder**
  `https://REPLACE-WITH-YOUR-RENDER-SERVICE.onrender.com` → bloqueante para desplegar (paso 6.1 de
  `docs/despliegue.md`). Orden correcto: `/api/:path*` **antes** que `/(.*)→/index.html` ⇒ la SPA no
  intercepta `/api` (Vercel evalúa los rewrites en orden).
- **`docs/despliegue.md` (CI):** correcto — abre declarando que **nada se ha ejecutado/desplegado**,
  separa verificado/pendiente y no afirma publicación. Actualizado para documentar el cierre del
  endpoint manual; también `docs/api.md` (fila de `/demo/cleanup`).

## 5. Errores / riesgos abiertos

1. ~~IDOR multi-tenant en la creación de ventas (ver 2.5).~~ **Corregido 2026-10-14 (B1).**
2. ~~Falta de protección de la empresa plantilla frente a update/delete.~~ **Corregido 2026-10-14 (B2).**
3. ~~`Company` sin scoping por sesión demo.~~ **Corregido 2026-10-14 (B3).**
4. **Flyway desactivado** en el arranque habitual (`spring.flyway.enabled=false`); el perfil normal
   sigue sin control de versiones de esquema en runtime.
   **Avance 2026-10-14 (E.3):** migraciones `V1`/`V2` autoradas y verificadas en BD desechable (4.11);
   estrategia de baseline (`baseline-version=2`, perfil `flyway`) preparada y verificada (4.14, D-36).
   **Activado en desarrollo 2026-10-14** (4.15): `flowmetrics` baselinada en v2 sin ejecutar V1/V2 y sin
   cambios de datos. **Pendiente (fuera de alcance):** decidir activación en producción y otras bases;
   el perfil normal permanece con Flyway desactivado por diseño.
5. ~~Credenciales de BD en texto plano versionadas.~~ **Resuelto 2026-10-14 (Fase E.5):**
   `application.properties` usa `${DB_URL|DB_USERNAME|DB_PASSWORD}`; `DB_PASSWORD` obligatoria. Ver 4.12.
6. Sin cobertura de pruebas amplia.
   - 2026-10-14: aislamiento, IDOR, B2/B3 y **purga con respeto de FKs** verificados en runtime
     (Fase C, ver 4.5). La limpieza programada ya no es un riesgo abierto.
   - **`LazyInitializationException` en `DemoSessionFilter`: descartado** para este camino (solo
     `getId()` sobre el proxy). Solo queda el matiz genérico de cobertura de tests.
   - ~~`mvn test` disparando la limpieza `@Scheduled` sobre la BD real como efecto colateral.~~
     **Resuelto el 2026-10-14 (Fase D):** perfil `test` → `flowmetrics_test` y scheduler gated con
     `@Profile("!test")` (`SchedulingConfig`). Cobertura: 12 unitarios + 10 IT (ver 4.6).
7. ~~Documentación `docs/*.md` vacía y `README.md` con stack incorrecto.~~ **Resuelto 2026-10-14
   (Fase E.4):** `docs/{api,arquitectura,base-datos,roadmap}.md` poblados y `README.md` corregido
   (React+Vite). `flowmetrics_v1.backup.sql` (vacío) quedó **archivado** en `database/legacy/` (R13).
8. ~~**Lint del frontend en rojo (5 errores).**~~ **Cerrado el 2026-10-14:** `DemoSessionContext.jsx`
   se dividió en `DemoSessionContext.js` + `DemoSessionProvider.jsx` + `useDemoSession.js`
   (react-refresh); `catch (error)`→`catch` en `Categories.jsx`/`Customers.jsx`/`Sales.jsx`; y se
   quitó el import `React` no usado en `Landing.jsx`. `npm run lint` → 0 problemas (PE).
9. ~~**Maven Wrapper incompleto:** `./mvnw` inutilizable (falta `backend/.mvn/wrapper/`).~~
   **Resuelto el 2026-10-14:** el repo traía `mvnw`/`mvnw.cmd` **3.3.4** (estilo *only-script*, sin
   jar) pero sin `.mvn/wrapper/`. Se creó
   `backend/.mvn/wrapper/maven-wrapper.properties` (`distributionType=only-script`,
   `distributionUrl=.../apache-maven-3.9.11-bin.zip`). Verificado: `./mvnw -v` → Maven `3.9.11` (se
   descarga a `~/.m2/wrapper/dists/`) y `./mvnw -q -DskipTests package` → **EXIT 0**, jar ≈53,5 MB.
10. **Eclipse (Flatpak) no puede lanzar la app (2026-10-13).** `org.eclipse.Java` (Flatpak **4.41**)
    arranca sobre **JDK 25**. Su parche `--patch-module=java.base=/app/eclipse/flatpak-dev-shim.jar`
    referencia `sun.security.action.GetPropertyAction`, **eliminada en Java 25** → al lanzar
    `BackendApplication`: `NoClassDefFoundError: sun.security.action.GetPropertyAction` en
    `java.lang.ProcessBuilder$Redirect.<clinit>`. Causa: el shim de la build instalada (`35c024c`,
    2026-09-08) se compila con **openjdk17** y usa esa clase. **Arreglado upstream:** el commit
    `7e08e0ad` ("Update to Java 25", 2026-09-14) del shim cambia
    `GetPropertyAction.privilegedGetProperty("os.name")` → `System.getProperty("os.name")` y pasa a
    **openjdk25**; el manifiesto actual de Flathub ya lo usa. **Fix si reaparece:** `sudo flatpak update
    org.eclipse.Java`. No afecta al código del proyecto; el backend arranca igual por terminal
    (`mvn spring-boot:run`).
    **Estado posterior (VF, 2026-10-13): no reproduce ahora** — Eclipse lanzó `BackendApplication`
    correctamente y sigue escuchando en 8080 (ver 4.3). Se mantiene como riesgo latente hasta
    confirmar la versión de shim realmente instalada.
11. ~~**Traza (stack trace) en respuestas de error (2026-10-14, VF).**~~ **Cerrado 2026-10-14
    (PE+VF).** Causa: DevTools aplica por defecto `defaults.spring.web.error.include-stacktrace=always`
    (y `include-message`/`include-binding-errors`) desde `spring-boot-autoconfigure` cuando está activo
    en local. Fix: `spring.web.error.include-stacktrace/message/binding-errors=never` explícitos en
    `application.properties`; prueba `ErrorResponseIT`. Detalle en 4.7.
12. **Discrepancia de datos semilla/plantilla (2026-10-14, VF).** La plantilla real en la BD se llama
    `NovaTech Store` (industry `Tecnología`), no `FlowMetrics Demo` como decía la memoria histórica.
    **Actualización 2026-10-14 (E.3):** `V2__seed_demo.sql` ya reproduce la plantilla real
    (`NovaTech Store`), resolviendo la discrepancia para las nuevas migraciones.
13. ~~**Los SQL de `database/` no son fiables (2026-10-14, Fase D).**~~ **Resuelto 2026-10-14 (R13):**
    sustituidos por migraciones válidas (`V1`/`V2`, verificadas) y los tres SQL antiguos **archivados**
    en `database/legacy/` con `database/legacy/README.md` (históricos, no usables). Referencias
    actualizadas. Ver D-33.
14. **Dependencia de la BD de pruebas (2026-10-14, Fase D).** `flowmetrics_test` se provisionó a mano
    (`pg_dump`), igual que la BD de desarrollo (D-22). No está en el repo; recrearla requiere el comando
    documentado. Alternativa futura: Testcontainers (Docker no disponible hoy) o Flyway.
15. **Clases obsoletas en `target/` (2026-10-14, observado).** Un `BackendApplicationTests.class`
    borrado del fuente siguió ejecutándose con `./mvnw test` y tocó la BD de desarrollo (sin cambios,
    no había sesiones caducadas). **Mitigación:** usar `clean` antes de `test`/`verify`.
    **Actualización 2026-10-14 (R15):** riesgo **procedimental**; documentado en `README.md`,
    `AGENTS.md` y `docs/arquitectura.md` (sin tocar `pom.xml`, por decisión del usuario). Estado
    actual: `target/test-classes` solo contiene clases vigentes. **Mitigado (documentación), no
    eliminado por código.** Ver D-34.
16. **Lectura multi-tenant sin sesión (2026-10-14, CI — Fase E.4).** `GET /api/customers`,
    `/categories`, `/products`, `/sales` (y `/reports/*`) **sin cookie de sesión y sin `?companyId=`**
    devuelven **todos** los registros (`findAll()`); `CompanyController` sí exige sesión. El frontend
    siempre opera con sesión, pero la API pública no fuerza el aislamiento en las lecturas. Decidir si
    se exige sesión (o `companyId`) en esos `GET`. Ver 4.9.
    **Actualización 2026-10-14 (revisión de alcance, CI — análisis de código, sin runtime):**
    - Patrón exacto (`CustomerController.java:26-38`, idéntico en `CategoryController`, `ProductController`,
      `SaleController`): `resolvedCompanyId = demoContext.getCompanyId(); if null → companyId` (param);
      `if (resolved != null) findByCompany(...) else findAll()`.
    - `GET /reports/*` (`ReportController.java:40-42`): `resolveCompanyId` devuelve `session ?: param` →
      con **nulo**, los repositorios usan `WHERE s.company.id = :companyId` (`SaleRepository.java:17,26`)
      ⇒ **no** filtra datos de otros tenants (devuelve 0/vacío). El riesgo real en reports es el
      **`?companyId=N` explícito sin sesión** (lectura cruzada de cualquier tenant).
    - Alcance de la corrección: solo backend (~5 controladores + helper); **no** toca BD ni despliegue.
      El frontend **nunca** envía `companyId` (usa la cookie: `frontend/src/api/{customers,categories,products,sales,reports}.js`),
      así que **exigir sesión no rompe la UI**. Los IT actuales **no** usan estos `GET` sin sesión
      (grep en `backend/src/test`), por lo que haría falta un IT nuevo para verificar el 401/400.
    - **Observación adyacente (CI, fuera del alcance de 13/15/16):** los `POST/PUT` sin sesión toman
      `dto.getCompanyId()` del cuerpo y solo validan que la empresa exista
      (`CustomerServiceImpl.create` :58-59; `SaleServiceImpl.create` :81-82) → permite **escrituras**
      en cualquier tenant sin autenticación. No está registrado como riesgo de 13/15/16.

    **Resuelto 2026-10-14 (R16 — implementado y verificado, PE):**
    - Se añadió `context/SessionGuard` (`requireCompanyId()` → 401; `requireOwnership(...)` → 404) y
      `exception/UnauthorizedException` (401 en `GlobalExceptionHandler`).
    - Reescritos `CustomerController`, `CategoryController`, `ProductController`, `SaleController`,
      `ReportController` y `ActivityController`: **sin** `@RequestParam companyId` y **sin** fallback
      `findAll()`; el `companyId` procede de la sesión. `CompanyController` ya exigía sesión (B3, sin
      cambios). `ProductServiceImpl` valida que la categoría pertenezca a la empresa.
    - Cubre también la observación adyacente: las escrituras sin sesión ya no aceptan `companyId` del
      cuerpo.
    - **Evidencia (PE):** nuevo `TenantIsolationIT` (MockMvc, 8 casos) verde; `./mvnw clean verify` en
      copia aislada → **12 unitarios + 20 IT, 0 fallos**; `flowmetrics_test` a 0 filas tras rollback y
      BD dev sin cambios. Documentado en `docs/api.md`. Ver D-35.
17. **Credencial histórica en el historial de git (2026-10-15, CI).** El fichero actual
    `application.properties` usa `${DB_PASSWORD}` (placeholder), pero la **contraseña real de
    PostgreSQL aparece en texto plano en commits anteriores** (`785bf60` y anteriores). Cualquiera con
    acceso al repo (o a su copia local) puede leerla. Detectado al extraerla para ejecutar los tests
    sin imprimirla. **Requiere decisión del usuario:** rotar la contraseña de la BD local y/o limpiar
    el historial (`git filter-repo` + force-push, afecta a colaboradores/copia del historial). No se
    tocó nada. Ver 4.22.

## 6. Siguiente paso concreto

**Fase A — cerrada (2026-10-13).** Compila, `contextLoads` pasa, el frontend construye y el sistema
**arranca y responde** (backend `:8080`, frontend `:5173`). El **lint del frontend se corrigió el
2026-10-14** (0 problemas).

Pendiente (con autorización del usuario, no ejecutar sin permiso):
1. ~~Corregir los 5 errores de lint~~ **Hecho 2026-10-14** (ver checkpoint).
2. ~~**Fase B** (IDOR de ventas, protección de la plantilla, scoping de `Company`)~~ **Hecha
   2026-10-14** (B1/B2/B3 implementadas y probadas con tests unitarios, 11/11).
3. Decidir si se repara el Maven Wrapper (`backend/.mvn/wrapper/`) o se adopta `mvn` del sistema.
4. ~~**Fase C:** verificar en runtime el aislamiento entre sesiones demo y la limpieza.~~ **Hecha
   2026-10-14 (VF):** aislamiento A/B/plantilla, IDOR, B2/B3, `cleanup` y purga con respeto de FKs
   confirmados; datos de prueba purgados (ver 4.5).
5. ~~Reparar el Maven Wrapper (`backend/.mvn/wrapper/`).~~ **Hecho 2026-10-14** (ver riesgo 9):
   `./mvnw` operativo con Maven 3.9.11.
6. ~~**Fase D:** tests de integración / aislar el scheduler.~~ **Hecha 2026-10-14** (ver 4.6):
   `flowmetrics_test` + perfil `test` + failsafe; 12 unitarios + 10 IT en verde.
7. ~~**Riesgo 11 (traza en errores).**~~ **Cerrado 2026-10-14** (ver 4.7).
8. ~~**Fase E.1** (edición de ventas), **E.2** (panel de sesión en `Settings.jsx`), **E.4**
   (documentación + README).~~ **Hechas 2026-10-14** (ver 4.8, 4.10, 4.9).
9. ~~**Fase E.3 — autorar migraciones Flyway** (`V1__create_schema.sql`, `V2__seed_demo.sql`).~~
   **Hecha 2026-10-14** (ver 4.11).
10. ~~**Fase E.5 — credenciales a variables de entorno** (`DB_USERNAME`/`DB_PASSWORD`/`DB_URL`).~~
   **Hecha 2026-10-14** (ver 4.12).
11. ~~**Riesgos 13/15/16** (cerrar antes de Flyway).~~ **Hechos 2026-10-14:** R13 archivado en
   `database/legacy/` (D-33), R15 documentado (D-34) y R16 implementado y verificado (D-35, ver 4.13).
12. ~~**Fase E.3 — estrategia de baseline de Flyway** (preparar activación segura sin tocar la BD dev).~~
    **Hecha 2026-10-14 (PE + VF):** `baseline-version=2` + perfil aislado `flyway`; verificado en BD
    desechables (nueva, existente, y `baseline=1` que falla). Ver 4.14 y D-36.
13. ~~**Fase E.3 — activar Flyway en desarrollo.**~~ **Hecha 2026-10-14 (VF):** `flowmetrics` baselinada
    en v2 sin ejecutar V1/V2, datos intactos y app respondiendo. **E.3 completada para desarrollo.** Ver
    4.15. Pendiente fuera de alcance: activación en producción/otras bases (requiere autorización).
14. ~~**Rediseño de UI (P0+P1+P2).**~~ **Hecho 2026-10-14 (PE + VF parcial):** sistema de diseño,
    corrección de bugs (loading/error, toasts/confirm, enums, moneda), navegación (Categorías, index
    `/demo`, 404), responsive (drawer, grids, tablas), marca (index.html, favicon) y limpieza. Ver 4.16.
    Pendiente: revisión del usuario, enlace LinkedIn real, unificación estética Landing/app y commit.
15. ~~**Semilla enriquecida V3 de la demo.**~~ **Hecha 2026-10-14 (PE + VF):** `V3__seed_demo_more.sql`
    (+8 clientes, +8 productos, ~60 ventas/12 meses) verificada en PG desechable y aplicada en
    `flowmetrics` (dev). Ver 4.18. Pendiente: iniciar una **demo nueva** para ver los datos en pantalla.
16. ~~**Internacionalización ES/EN + ajustes del Landing.**~~ **Hecha 2026-10-14 (PE + VF parcial):**
    infra `src/i18n/`, `format.js` locale-aware, layout/UI y 8 páginas traducidas; Landing con logo no
    clicable, header sticky al bajar/oculto al subir, tarjeta dev sobre el footer y conmutador ES/EN.
    Ver 4.19 y 4.20. **Pendiente:** verificación visual por el usuario y **commit** (sin autorizar).

> No se avanzará a implementar correcciones ni a tocar la BD sin autorización explícita. La BD de
> desarrollo `flowmetrics` quedó sin cambios; se creó la BD de pruebas `flowmetrics_test` (esquema,
> sin datos) para Fase D.

## 7. Pendiente de confirmar (no inventar)

- **Resuelto:** versión real de PostgreSQL = `18.6`; el backend **sí** compila y arranca con el Java
  25 del sistema (y con el JRE de Eclipse) pese a que el `pom.xml` fija Java 21 (ver 4.2–4.3).
- **Resuelto (VF 2026-10-14):** ID 1 es la plantilla `NovaTech Store` (`is_template=true`); el
  clonado respeta el contenido de la plantilla y la limpieza respeta las FKs (empresa + hijos a 0 sin
  huérfanos). Datos demo de prueba eliminados. Quedan **preexistentes** empresas 15/16 (sesiones
  13/14) que no fueron creadas por esta sesión.
- Comportamiento de `/reports/*` con `companyId` nulo (sigue sin probar).
- Existencia de colecciones Bruno/DBeaver para reproducir pruebas.
- Si el usuario desea mantener la caducidad de demo en 2 h.
- **BD de pruebas `flowmetrics_test` (2026-10-14):** se recrea con
  `createdb flowmetrics_test` + `pg_dump -h 127.0.0.1 -U <user> --schema-only --no-owner --no-privileges flowmetrics | psql -d flowmetrics_test`.
  No está versionada; los SQL antiguos están archivados en `database/legacy/` (históricos, no usables
  — riesgo 13 resuelto). Las migraciones válidas son `V1`/`V2` en `backend/src/main/resources/db/migration/`.
