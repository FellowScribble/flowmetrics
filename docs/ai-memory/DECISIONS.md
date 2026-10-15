# FlowMetrics — Decisions register

This document records decisions and intentions from the available project history. “Chosen” means the conversation context records the choice; it does not prove that every detail is implemented in code.

## D-01 — Keep the existing landing page

**Decision:** preserve the existing landing and build functionality around it.

**Reason:** the user liked the current visual result and wants to turn it into a working demo rather than redesign it.

**Consequences:**
- Inspect existing components before changing them.
- Do not replace the landing with a new template or redesign without explicit request.
- Wire existing “Comenzar gratis” and “Ver demo” buttons to the intended behavior.

## D-02 — Make FlowMetrics a functional portfolio SaaS demo

**Decision:** it should not remain a static marketing page.

**Intended features:** dashboard, real data-backed KPIs/charts, sales, customers, products/categories, stock, reports, recent activity.

**Consequence:** the backend and database are part of the actual demo, not just a mock API. Frontend charts should ultimately reflect API/database results.

## D-03 — “Comenzar gratis” is fake UI, not authentication

**Decision:** the access/signup-style popup is a visual sample only.

**Explicit constraints:**
- No actual user account.
- No real authentication.
- No persistence of submitted data.
- Display a message based on the interaction.

**Alternative not wanted:** implementing a real registration/login system at this stage.

## D-04 — “Ver demo” must use a database-backed demo

**Decision:** visitors should be able to explore actual records and try creating records, including sales.

**Consequence:** API endpoints and persistence are needed; static frontend-only charts do not satisfy the goal.

## D-05 — Isolate demo data per visitor/session

**Decision:** each public demo visitor gets an isolated data copy/session. The template company must never be the shared writable tenant.

**Proposed mechanics from earlier planning:**
- Endpoint `POST /api/demo/start`.
- Copy template company and relevant related data to a newly created demo company.
- Create a session token.
- Store it in a cookie named `demoSession`.
- Initial intended lifetime: two hours.
- Expire and clean up session/company records.

**Important status:** these mechanics are design intent, not confirmed implementation.

**Security consequences:**
- Scope reads/writes to the company resolved from a valid demo session.
- Do not trust arbitrary `company_id` values from the browser.
- Validate that selected customer/product IDs belong to the session company.
- Generate unguessable tokens.
- Ensure expired sessions cannot keep writing.
- Make cleanup consistent with FK constraints and cascade rules.

## D-06 — Use a monorepo

**Decision:** project structure:
```text
flowmetrics/
├── frontend/
└── backend/
```

**Consequence:** keep the frontend and backend together, while retaining their separate build/runtime configurations.

## D-07 — Backend stack

**Chosen/observed stack:**
- Spring Boot `4.1.0`.
- Java 21.
- Maven.
- Spring Data JPA / Hibernate.
- Flyway migrations.
- Bean Validation.
- Spring Web MVC.
- PostgreSQL driver.
- PostgreSQL local DB `flowmetrics`, version observed as `18.3`.

**Reason:** conventional Java REST backend with relational persistence and versioned schema.

**Alternative status:** no later change is recorded. Do not migrate frameworks or database without a concrete reason.

## D-08 — Frontend stack recorded as intended, verify actual repository

The prior context associates the frontend with Next.js, TypeScript, Tailwind, and mentions Lucide React/Framer Motion. Exact versions and installed dependencies are unknown.

**Consequence:** treat as the working assumption, not as verified fact. Inspect `package.json` and lockfiles before running package-manager commands or changing dependencies.

## D-09 — Use Flyway for schema migrations

**Decision:** SQL migration files are used, including known names `V1__create_schema.sql` and `V1__demo_data.sql`.

**Consequence:** once migrations have run in a shared/local database, do not casually edit an already-applied migration. Inspect Flyway history and create a new migration when a schema change is required. Verify whether the two `V1__...` files are actually named/ordered as described and whether Flyway recognizes both; their exact current state has not been inspected.

## D-10 — Keep tenant ownership explicit with `company_id`

**Decision:** business tables such as customers, categories, products, sales, activity, and reports are associated with a company.

**Consequence:** services/repositories should enforce company scoping. Foreign-key existence alone is insufficient to guarantee the related record belongs to the same company.

## D-11 — Use Bruno and DBeaver during development

**Decision/tools:** Bruno for HTTP endpoint tests; DBeaver for PostgreSQL inspection.

**Consequence:** after each API change, run a precise request and record the actual status/body. When persistence is in question, verify the database record instead of assuming success from UI state alone.

## D-12 — Keep Java packages under the base package

**Decision:** base package is `com.flowmetrics.backend`; packages are subpackages such as `entity`, `controller`, etc.

**Reason/history:** there was an Eclipse package presentation/structure confusion; it was resolved.

**Consequence:** ensure source files live under the actual Java package path so component/repository scanning works.

## D-13 — Fix company timestamps in the entity lifecycle

**Problem:** Hibernate sent explicit NULL values for `created_at` and `updated_at`; PostgreSQL defaults did not apply.

**Chosen fix:** `@PrePersist` sets both timestamps and defaults `isTemplate` to false if null.

**Verified consequence:** subsequent POST `/api/companies` was reported as `200 OK`, saving company ID 4.

**Alternative:** relying only on DB defaults was not sufficient in the previous mapping because Hibernate included the columns in the insert. Any future replacement must be tested.

## D-14 — Use actual entity accessor names

**Problem:** mapper code attempted `setTemplate(boolean)`, which did not exist.

**Decision/fix:** align with the entity setter `setIsTemplate(Boolean isTemplate)`.

**Consequence:** when changing mappings, inspect the current entity/DTO method names rather than assuming JavaBean naming.

## D-15 — Do not change port casually

**History:** OS-level Tomcat occupied port 8080. User stopped/disabled it; Spring Boot subsequently used 8080.

**Decision:** retain `localhost:8080` as the known local API URL unless the current machine proves it unavailable.

**Alternative not to default to:** switching to 8081 just to bypass an uninvestigated process.

## D-16 — Work incrementally and avoid scope creep

**User preference:**
- Spanish.
- One fixed step at a time.
- Exact file path.
- Complete copy/paste-ready code where practical.
- Explain briefly what/why.
- Give precise test instructions.
- Wait for confirmation before advancing.
- Avoid repeatedly presenting alternative architectures or changing the plan.

**Consequence for the AI:** do not implement Company CRUD, demo isolation, all entities, frontend integration, and charts in one giant patch. Verify each step.

## D-17 — Work on a non-main Git branch

The user asked to create/use a new branch rather than `main`. The branch name is not preserved here.

**Consequence:** before modifying code, run `git branch --show-current` and `git status --short`. Do not commit to `main` without explicit instruction.

## D-18 — Deployment targets are only ideas, not completed setup

Potential targets recorded:
- Frontend: Vercel.
- Backend: Render.
- PostgreSQL: Neon.

No deployment was verified. Do not tell the user the app is deployed or those services are configured.

## D-19 — Avoid unrelated system configuration changes

FlowMetrics work does not require changing shell config, KDE/Plasma, or general operating-system settings. The user has a strong preference for cautious changes to their development/system environment. Keep tasks scoped to the repository unless an actual blocker demands otherwise.

---

# Revisión de vigencia de las decisiones (2026-10-13)

> Revisión hecha tras inspeccionar el repositorio real (rama `develop`). **No se elimina ni reescribe
> el texto original de ninguna decisión.** Esta sección solo añade estado y evidencia.
>
> Categorías:
> - **Vigente:** sigue siendo el objetivo y no contradice el código actual.
> - **Sustituida:** su premisa de hecho cambió; el enfoque nuevo la reemplaza (la intención original
>   puede seguir siendo válida como principio).
> - **Incumplida:** el objetivo sigue siendo válido pero el código **no** lo satisface hoy.
> - **Cumplida:** el objetivo se alcanzó.

## Resumen

| Decisión | Estado | Nota breve |
|---|---|---|
| D-01 landing | Vigente | Landing conservada; hay rediseño de hero sin commitear, misma intención |
| D-02 SaaS funcional | Vigente | Ampliamente materializada en código (CI) |
| D-03 “Comenzar gratis” falso | Vigente | El modal sigue siendo solo visual |
| D-04 demo con BD real | Vigente | Implementado en código (CI) |
| D-05 aislamiento por sesión | **Vigente y cumplida** | IDOR (B1), plantilla (B2), `Company` (B3) y huecos de lectura/escritura multi-tenant (R16, 2026-10-14) corregidos |
| D-06 monorepo | Vigente (ampliada) | Además de `frontend/` y `backend/` hay `database/`, `assets/`, `docs/` |
| D-07 stack backend | Vigente | Coincide con `pom.xml` (Boot 4.1.0, Java 21 declarado) |
| D-08 stack frontend | **Sustituida** | No es Next.js/TS; es React+Vite+JSX (ver detalle) |
| D-09 Flyway | **Incumplida** | Flyway desactivado; SQL aplicado fuera de Flyway (ver detalle) |
| D-10 `company_id` | Vigente y cumplida | Enforcement multi-tenant desde la sesión; sin huecos (R16, 2026-10-14) |
| D-11 Bruno/DBeaver | Vigente | Preferencia de trabajo; no hay colecciones en el repo |
| D-12 paquetes bajo base | Vigente | Se añaden `context`, `filter`, `exception`, `util` |
| D-13 `@PrePersist` timestamps | Vigente y cumplida | Presente en `Company.java` |
| D-14 accessors reales | Vigente y cumplida | Mappers alineados con `setIsTemplate` |
| D-15 no cambiar puerto | Vigente | `8080` sigue siendo la URL local conocida |
| D-16 trabajo incremental | Vigente | — |
| D-17 rama no-main | **Vigente y cumplida** | La rama real es `develop` (ver detalle) |
| D-18 despliegue | Vigente (no iniciado) | Sin cambios; nada desplegado |
| D-19 evitar config del sistema | Vigente | — |

## Detalle de los casos sensibles

### D-08 — Frontend (Sustituida)
- **Qué decía:** el frontend se asociaba a Next.js + TypeScript (con Lucide/Framer Motion como
  posibles), tratándose como suposición a verificar.
- **Qué cambió / evidencia:** `frontend/package.json` declara React `19.2.x`, Vite `8.x`,
  `@vitejs/plugin-react`, `@tailwindcss/vite`, `axios`, `framer-motion`, `react-router-dom` v7 y
  `recharts`; `frontend/vite.config.js` usa el plugin de React; los archivos son `.jsx`. **No hay
  Next.js, ni TypeScript, ni `next.config`.** También `README.md` dice “Next.js” y está desactualizado.
- **¿Sigue válida como objetivo futuro?** El principio de D-08 (“inspeccionar el repo antes de
  asumir el stack”) sigue siendo válido y debe conservarse. La suposición concreta de Next.js/TS
  queda **sustituida**: el stack real y actual es React + Vite + JSX.
- **Estado del trabajo abierto:** `Landing.jsx` tiene cambios sin commitear que añaden
  `framer-motion`, coherentes con el stack real.

### D-09 — Flyway (Incumplida)
- **Qué decía:** usar Flyway con `V1__create_schema.sql` y `V1__demo_data.sql` sobre migraciones ya
  aplicadas sin editarlas.
- **Qué cambió / evidencia:** `application.properties` tiene `spring.flyway.enabled=false`. Las
  dependencias de Flyway están en `pom.xml`, pero los SQL reales son
  `database/schema/V1_create_schema.sql` y `database/seeds/V1_demo_data.sql` (un solo guion, con
  nombres distintos a los recordados) y **no** están en `backend/src/main/resources/db/migration/`.
  Por tanto, Flyway no gestiona el esquema en runtime.
- **¿Sigue válida como objetivo futuro?** **Sí.** Migraciones versionadas siguen siendo deseables;
  D-09 es un objetivo **incumplido**, no una decisión descartada. Antes de activar Flyway hay que
  reconciliar el historial con el esquema realmente aplicado (sin reejecutar migraciones a ciegas).

### D-17 — Rama no-main (Vigente y cumplida)
- **Qué decía:** trabajar en una rama distinta de `main`; el nombre no estaba registrado.
- **Qué se aclaró:** la rama de trabajo real es `develop`, en seguimiento de `origin/develop`;
  `main` es la rama por defecto. Evidencia: `git branch --show-current` = `develop`,
  `git status` = “Tu rama está actualizada con origin/develop”.
- **¿Sigue válida?** Sí, y además está **cumplida**. Se mantiene la regla de no commitear a `main`
  sin autorización.

### D-05 / D-10 — Aislamiento multi-tenant (Incumplida parcialmente)
- **Qué se implementó:** filtro de sesión + `DemoContext` request-scoped, clonado de datos y
  `checkOwnership` en las lecturas/escrituras por id de ventas, clientes, productos y categorías.
- **Huecos detectados (no corregidos):** (a) `SaleServiceImpl.create()` no verifica que
  `customerId`/`productId` pertenezcan a la empresa de la sesión → posible IDOR; (b)
  `CompanyController` no aplica scoping y permite modificar/borrar la empresa plantilla.
- **Estado:** objetivo vigente, aplicación **incumplida** en esos dos puntos. Pendiente de revisión
  y corrección con autorización.

## Nuevas decisiones documentadas (observadas en el código, 2026-10-13)

### D-20 — Aislamiento de demo vía cookie + filtro + contexto request-scoped
**Observado:** `POST /api/demo/start` genera un token `UUID`, responde con cookie `demoSession`
(`httpOnly`, `path=/`, `SameSite=Lax`, `maxAge=2h`); `DemoSessionFilter` resuelve la sesión y
publica la empresa en `DemoContext` (`@RequestScope`). **Vigente.**

### D-21 — Limpieza automática programada de sesiones caducadas
**Observado:** `DemoCleanupServiceImpl` con `@Scheduled(fixedRate=3600000)` (cada hora) purga
datos de la empresa demo y borra sesión/empresa; `@EnableScheduling` activo. Sustituye al plan
previo de “confirmar 2h y construir la limpieza después”: la limpieza ya existe (sin verificar en
runtime). **Vigente, sin verificar.**

### D-22 — Esquema provisionado manualmente (hecho observado, no deseado)
**Observado:** con Flyway desactivado y los SQL fuera del classpath, la provisión del esquema
depende de una aplicación manual. Se documenta como hecho; se remite a D-09 como objetivo de mejora.

### D-23 — Cierre de los huecos de aislamiento multi-tenant (desarrolla D-05/D-10)
**Decidido con el usuario (2026-10-14):**
- **B1:** en `SaleServiceImpl`, el cliente y cada producto de una venta deben pertenecer a la empresa
  de la venta; si no, `ResourceNotFoundException` (404).
- **B2:** `update`/`delete` de la empresa plantilla se rechazan con **409**
  (`TemplateCompanyProtectedException`, mapeada en `GlobalExceptionHandler`).
- **B3:** `Company` sale de la superficie pública. `GET /api/companies` y `GET /api/companies/{id}`
  exigen sesión válida y solo devuelven la empresa propia; `POST`/`PUT`/`DELETE` se retiran de la API
  pública (el demo no los usa; verificado: el frontend no llama a `/api/companies`).
**Evidencia:** `SaleServiceImplTest` (3), `CompanyServiceImplTest` (4) y `CompanyControllerTest` (4)
→ 11 tests, 0 fallos (Mockito, sin BD) y `mvn test` completo 12/12 con `contextLoads`. **Verificado
en runtime el 2026-10-14 (VF):** IDOR ajeno → 404, empresa ajena → 404, escrituras públicas → 405,
sin sesión → 404 (`PROJECT_STATUS.md` 4.5). **Vigente.**

### D-24 — Fase C verificada en runtime y descarte del riesgo `LAZY` en el filtro
**Verificado con el usuario (2026-10-14):** contra el backend en `:8080` con PostgreSQL `18.6`, se
confirmó por HTTP y por consulta directa a la BD que (a) las sesiones demo están aisladas entre sí y
de la plantilla; (b) `POST /api/demo/cleanup` purga una sesión caducada eliminando empresa e hijos sin
dejar huérfanos y sin afectar a otras empresas; (c) `LazyInitializationException` **no** reproduce en
`DemoSessionFilter` porque solo se llama `getId()` sobre el proxy Hibernate (identificador disponible
sin inicializar). **Evidencia:** `PROJECT_STATUS.md` 4.5. Consecuencia: el riesgo 6 (parte `LAZY`) se
cierra; la limpieza deja de ser un riesgo abierto. Se autorizó creación y borrado de datos demo de
prueba, ya purgados.

### D-25 — Reparar el Maven Wrapper con el archivo de propiedades faltante
**Decidido con el usuario (2026-10-14):** el repo incluye `backend/mvnw`/`mvnw.cmd` versión **3.3.4**
(estilo *only-script*, no requiere `maven-wrapper.jar`) pero **no** incluía
`.mvn/wrapper/maven-wrapper.properties`. Se creó ese único archivo con
`distributionType=only-script` y `distributionUrl` a `apache-maven-3.9.11-bin.zip` (3.9.11 = versión
del `mvn` del sistema; proyectos Spring Boot 4.x son compatibles con 3.9.x). **Evidencia (PE/VF):**
`./mvnw -v` → Maven `3.9.11`; `./mvnw -q -DskipTests package` → **EXIT 0**, jar ≈53,5 MB. No se añadió
el jar del wrapper (el script 3.3.4 no lo usa). **Vigente.** No afecta a datos ni a la app.

### D-26 — Estrategia de pruebas: BD `flowmetrics_test`, perfil `test` y separación unit/IT
**Decidido con el usuario (2026-10-14), con 8 condiciones explícitas:** (1) los tests no tocan la BD de
desarrollo; (2) el perfil `test` apunta solo a `flowmetrics_test`; (3) scheduler de limpieza
desactivado en pruebas; (4) esquema de pruebas coherente con las entidades, sin mezclar autogeneración
y carga SQL sin justificar; (5) ampliar cobertura (ventas, stock, recursos ajenos, aislamiento A/B,
clonado, limpieza); (6) unitarios rápidos separados de integración con PostgreSQL; (7) registrar
resultados reales; (8) no modificar la BD de desarrollo para facilitar las pruebas.

**Implementación:**
- BD **`flowmetrics_test`** creada con el **esquema real** obtenido por
  `pg_dump --schema-only --no-owner --no-privileges flowmetrics` (solo lectura de dev). `ddl-auto=validate`.
- `src/test/resources/application-test.properties` sobrescribe **solo la URL**; usuario/clave se
  heredan de `application.properties` (no se duplican credenciales).
- `config/SchedulingConfig` concentra `@EnableScheduling` con `@Profile("!test")`.
- `pom.xml`: surefire para `*Test` (unitarios), **failsafe** para `*IT` (integración).
- `AbstractIntegrationTest`: `@SpringBootTest @ActiveProfiles("test") @Transactional` (rollback).

**Evidencia (PE):** `./mvnw clean test` → 12 unitarios; `./mvnw verify` → +10 IT, total 22, 0 fallos.
`BackendApplicationIT` registra `jdbc:postgresql://localhost:5432/flowmetrics_test`. BD `flowmetrics`
antes/después sin cambios (companies=3, demo_sessions=2, customers=15, sales=12); `flowmetrics_test`
en 0 tras el run. **Vigente.**
**Limitaciones:** `flowmetrics_test` no está versionada (se recrea con el comando documentado);
Testcontainers descartado (Docker no disponible); hay que `clean` antes de `test`/`verify` por posible
clase obsoleta en `target/` (riesgo 15).
**Actualización 2026-10-14:** con `ErrorResponseIT` (riesgo 11) la cobertura de integración pasa a
**12 IT** (total 24: 12 unitarios + 12 IT). El resto de la decisión sigue vigente.

### D-27 — Riesgo 11: fijar `spring.web.error.*=never` para no filtrar detalle técnico
**Decidido con el usuario (2026-10-14):** corregir la fuga de `trace`/`message` en respuestas de error.
**Causa raíz (CI):** DevTools, cuando está activo (app local), aplica como *property source* de baja
precedencia los defaults de `META-INF/spring-devtools.properties` de `spring-boot-autoconfigure-4.1.0.jar`:
`defaults.spring.web.error.include-stacktrace=always` (+`include-message` y `include-binding-errors`).
`DevToolsSettings` lee las claves `defaults.*`; el proceso es inactivo en tests y en producción
(DevTools excluido), donde esos defaults ya son `never`. Se descartó cualquier config del proyecto,
override por env/`-D`, fichero global de devtools y el restart classloader.
**Fix (mínimo):** en `backend/src/main/resources/application.properties`:
`spring.web.error.include-stacktrace=never`, `spring.web.error.include-message=never`,
`spring.web.error.include-binding-errors=never` (nombres nuevos de Boot 4; los `server.error.*` están
deprecados). **Evidencia (PE+VF):** matriz de runtime en 8081 (baseline fuga; `add-properties=false` no;
`restart.enabled=false` sí fuga; `never` explícito no; fix con DevTools ON no) y prueba de regresión
`ErrorResponseIT` (405/404 sin `trace`); `./mvnw clean verify` → 12 unitarios + 12 IT, 0 fallos; BD de
desarrollo sin cambios. Detalle en `PROJECT_STATUS.md` 4.7. **Vigente.**

### D-28 — Fase E.1: edición de ventas en el frontend
**Decidido con el usuario (2026-10-14):** habilitar la edición de ventas en el frontend reutilizando el
`PUT /api/sales/{id}` ya existente (no se toca el backend). **Implementación:** en
`frontend/src/pages/Sales.jsx` se añade `editingId` + `handleEdit`/`resetForm` y `handleSubmit` alterna
`updateSale`/`createSale`, con botones «Editar» (fila), «Guardar cambios» y «Cancelar edición»; mismo
patrón que `Customers.jsx`. **Evidencia (PE+VF):** `npm run lint` 0 problemas; `npm run build` OK; flujo
real contra `:8080` (crear 899,99/stock 24 → editar 1799,98/stock 23 → borrar restaura 25). Datos de
prueba purgados (company 20); BD dev en línea base. Detalle en `PROJECT_STATUS.md` 4.8. **Vigente.**

### D-29 — Fase E.4: poblar la documentación y corregir el README
**Decidido con el usuario (2026-10-14):** completar la documentación del repositorio basándose en
inspección real (no inventar). **Contenido:** `docs/api.md` (endpoints/DTO/códigos reales, con nota de
scoping por sesión), `docs/arquitectura.md` (stack, capas, modelo demo, errores, CORS, frontend),
`docs/base-datos.md` (9 tablas reales incl. `reports` sin entidad, FKs, provisión manual) y
`docs/roadmap.md` (fases, pendientes, deuda técnica). `README.md` corregido (React+Vite; antes
«Next.js»). **Evidencia (CI):** ficheros con contenido real (antes 0 bytes). **Hallazgo añadido:** los
`GET` de clientes/categorías/productos/ventas sin sesión devuelven todos los registros (`findAll()`) →
**riesgo 16**. **Vigente.**

### D-30 — Fase E.2: Settings como panel real de sesión (opción A)
**Decidido con el usuario (2026-10-14):** `Settings.jsx` deja de ser texto estático y muestra datos
verídicos de la demo (empresa, `companyId`, caducidad absoluta y cuenta atrás en vivo) usando
`useDemoSession` (`/api/demo/me`). **Se descarta** la opción B (reintroducir `PUT /api/companies/{id}`
y editar la empresa) por revertir parte de B3 y ampliar alcance/riesgo. Solo frontend, sin cambios de
backend. **Evidencia (PE):** `npm run lint` (0) y `npm run build` (OK). No hay VF visual automatizada
(sin navegador/runner e2e). Detalle en `PROJECT_STATUS.md` 4.10. **Vigente.**

### D-31 — Fase E.3: autorar migraciones Flyway sin activarlas
**Decidido con el usuario (2026-10-14):** escribir las migraciones **sin activar** Flyway
(`spring.flyway.enabled` sigue en `false`). **Motivo:** no tocar la BD de desarrollo ni ejecutar
migraciones sin autorización (regla de AGENTS). **Contenido:** `V1__create_schema.sql` (las 9 tablas,
constraints, índices y FKs con su `ON DELETE`, reconstruido desde `pg_dump` real) y
`V2__seed_demo.sql` (plantilla `NovaTech Store` + catálogo/ventas, con `setval` de secuencias para que
el clonado no colisione; corrige el bug del seed antiguo en `database/seeds/`). **Evidencia (PE+VF):**
en BD desechable el esquema resultante es **idéntico** al real (diff `pg_dump` sin diferencias) y el
arranque con `spring.flyway.enabled=true` aplicó V1+V2 y clonó la plantilla correctamente; las BD
desechables se borraron y la BD dev no se tocó. **Pendiente:** activación en runtime + decisión de
baseline de la BD existente (`spring.flyway.baseline-on-migrate` / `baseline-version`). **Vigente.**
**Actualización 2026-10-14:** la estrategia de baseline quedó definida y verificada en **D-36**
(`baseline-version=2`, perfil aislado `flyway`). Sigue **pendiente** activar Flyway en el entorno
habitual (requiere autorización).

### D-32 — Fase E.5: credenciales a variables de entorno obligatorias
**Decidido con el usuario (2026-10-14):** las credenciales de PostgreSQL salen de
`application.properties` (que deja de tener secretos) y pasan a variables de entorno:
`spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/flowmetrics}`,
`spring.datasource.username=${DB_USERNAME:postgres}` y `spring.datasource.password=${DB_PASSWORD}`
(**obligatoria**). **Se descarta** la opción de `.env` con `spring.config.import`; el usuario prefiere
variables de entorno. **Efecto:** tanto la app como los tests (el perfil `test` hereda las
credenciales) requieren `DB_PASSWORD` en el entorno; sin ella no arrancan. **Evidencia (PE):** en
copia aislada, `./mvnw clean verify` verde con las variables y fallo de arranque sin ellas. Los
valores reales nunca se imprimieron ni se copiaron a ningún fichero. Detalle en `PROJECT_STATUS.md`
4.12. **Vigente.**

**Aclaración (2026-10-14):** los valores por defecto `DB_USERNAME=postgres` y
`DB_URL=...localhost:5432/flowmetrics` son **intencionados** (solo para desarrollo local); la única
variable estrictamente obligatoria es `DB_PASSWORD`. **En producción deben definirse explícitamente las
tres** (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`). Documentado en `README.md` y `docs/base-datos.md`.

### D-33 — R13: archivar los SQL antiguos en `database/legacy/`
**Decidido con el usuario (2026-10-14):** mover los tres SQL históricos de `database/` a
`database/legacy/` conservando nombre y contenido, y añadir `database/legacy/README.md` indicando que
son históricos, que **no** son la fuente de verdad y que **no** deben ejecutarse para crear una BD
nueva. **Evidencia (CI):** `git mv` (historial conservado) y `sha256sum` idéntico antes/después. Se
actualizaron las referencias en `README.md`, `AGENTS.md`, `docs/base-datos.md`, `docs/roadmap.md`,
`docs/arquitectura.md` y `NEXT_STEPS.md`. No se tocaron las migraciones de Flyway. **Cierra el riesgo
13. Vigente.**

### D-34 — R15: `clean` obligatorio antes de `test`/`verify` (solo documentación)
**Decidido con el usuario (2026-10-14):** documentar el uso de `clean` para evitar clases obsoletas en
`target/` (riesgo 15), **sin** modificar `pom.xml`. **Evidencia (CI):** nota añadida a `README.md`,
`AGENTS.md` y `docs/arquitectura.md`. El riesgo es procedimental; queda mitigado por documentación (no
eliminado por código). **Mitigado.**

### D-35 — R16: exigir sesión demo y derivar el `companyId` del servidor
**Decidido con el usuario (2026-10-14):** exigir una sesión demo válida en **todas** las operaciones de
datos (clientes, categorías, productos, ventas, actividad e informes) y obtener el `companyId`
autorizado **solo** de la sesión ({@code SessionGuard} → `UnauthorizedException` → **401**); el
`?companyId=` del cliente se ignora y el `companyId` del cuerpo no autoriza. **Implementación:**
`SessionGuard` (`context/`), `UnauthorizedException` + handler 401, reescritura de
`CustomerController`, `CategoryController`, `ProductController`, `SaleController`, `ReportController`
y `ActivityController` (se eliminó el fallback `findAll()`); `CompanyController` ya exigía sesión
(B3, sin cambios). Relaciones: `ProductServiceImpl` valida que la categoría sea de la empresa;
`SaleServiceImpl` ya validaba cliente y producto. **Evidencia (PE):** `TenantIsolationIT` (MockMvc, 8
casos: sin sesión → 401 en lecturas y escrituras; con sesión A solo ve A; `{id}` y `?companyId=` de B
→ 404/ignorado; escritura con `companyId` de B se crea en A; categoría de B → 404). `./mvnw clean
verify` en copia aislada → **12 unitarios + 20 IT, 0 fallos**; `flowmetrics_test` quedó a 0 filas y la
BD dev sin cambios. **Cierra el riesgo 16. Vigente.**

### D-36 — Fase E.3: estrategia de baseline de Flyway (preparada; activada en desarrollo)
**Decidido con el usuario (2026-10-14):** adoptar Flyway en las bases **existentes** mediante
`spring.flyway.baseline-on-migrate=true` + `spring.flyway.baseline-version=2`, dejando la activación
como un interruptor **explícito y aislado** (perfil `flyway` en
`backend/src/main/resources/application-flyway.properties`: `SPRING_PROFILES_ACTIVE=flyway`). El
arranque habitual sigue con `spring.flyway.enabled=false`; la BD dev no se toca.

**Por qué esta configuración:**
- Base **nueva/vacía** → Flyway aplica **V1 (esquema) + V2 (semilla demo)** desde cero. Verificado: con
  un esquema vacío, `baseline-on-migrate=true` **no** añade baseline; migra normalmente.
- Base **existente** (no vacía, sin `flyway_schema_history`) → se marca con **baseline en la versión 2**
  y **no** reejecuta V1/V2 ⇒ no recrea tablas ni duplica la semilla.
- Base **ya gestionada** por Flyway → solo aplica migraciones nuevas (V3+).
- Una **única** configuración sirve para instalación nueva y existente; no hace falta distinguirla a
  mano ni usar `baseline()` manual.

**Por qué baseline = 2 (y no 1):** la BD `flowmetrics` ya contiene lo que producen V1+V2. Se contrastó
que la plantilla real (empresa 1) coincide **fila a fila** con V2 (categorías, productos, clientes,
ventas y líneas; solo difieren `sale_date`/timestamps) y que el esquema es idéntico. Con
`baseline-version=1` Flyway baselinaría en 1 e intentaría aplicar V2 → **fallo por PK duplicada**
(empresa plantilla id=1), verificado.

**V1/V2:** no se modifican; siguen siendo la fuente de verdad. Para una instalación nueva se ejecutan
en orden; en una existente quedan por debajo del baseline y no se ejecutan. **No** conviene fusionarlas
ni separarlas más: V1 = esquema y V2 = datos ya están separadas (permitiría, si algún día se quiere un
entorno sin semilla, usar `spring.flyway.target=1` solo-esquema).

**Evidencia (PE + VF)** en BD desechables `fm_e3_*` (todas **borradas** al terminar; la BD dev
`flowmetrics` no se tocó):
- Esquema vacío → V1+V2 aplicados en orden; 10 tablas (9 + historial); plantilla `NovaTech Store`;
  secuencias coherentes (`setval` ⇒ próximo = max+1); `POST /api/demo/start` clona la plantilla
  (empresa 2 con 4/9/5/4 hijos); reinicio → "Schema is up to date. No migration necessary", sin
  duplicados (companies=2, customers=10, sales=8, historial=2).
- Esquema existente sin historial → `Successfully baselined schema with version: 2`, "No migration
  necessary", datos intactos (companies=1, customers=5, products=9, sales=4); demo clona igualmente.
- **Sin** `baseline-on-migrate` → falla: "Found non-empty schema(s) \"public\" but no schema history
  table".
- `baseline-version=1` (por defecto) → baselina v1 e intenta V2 → falla con `SQL State 23505`
  (violación única, PK del template), "Changes successfully rolled back".
- `pg_dump --schema-only` de la BD creada por Flyway == `flowmetrics` (**idéntico**, salvo el token
  aleatorio `\restrict`/`\unrestrict` que pg_dump 18 genera por dump).

**Limitación:** `baseline-version=2` **asume** que cualquier BD existente ya está en el estado V1+V2.
Si una BD preexistente difiere (esquema o semilla), el baseline **enmascara** esa deriva. Para
`flowmetrics` se verificó que no hay deriva. En un futuro, si se adopta una BD que no coincida, habría
que revisar la versión de baseline o corregirla con una migración V3+.

**Actualización 2026-10-14 (activación autorizada):** el usuario autorizó activar Flyway en el entorno
de **desarrollo**, con estas condiciones: destino exclusivamente `flowmetrics`, sin tocar V1/V2 ni la
versión de baseline, sin `clean verify`, sin recrear/borrar BDs, sin producción y sin commits.
Ejecutado y verificado: arranque con `SPRING_PROFILES_ACTIVE=flyway` contra
`jdbc:postgresql://localhost:5432/flowmetrics` → `Successfully baselined schema with version: 2`,
`Schema "public" is up to date. No migration necessary.` (V1/V2 **no** ejecutados), `flyway_schema_history`
con 1 fila (BASELINE, version=2) y **0** migraciones SQL, datos intactos
(companies=3, categories=12, products=27, customers=15, sales=12, sale_items=18, demo_sessions=2) y app
respondiendo (401/404 esperados). `flowmetrics_test` intacta. El arranque habitual sigue con
`spring.flyway.enabled=false`. Detalle en `PROJECT_STATUS.md` 4.15.
**Vigente y activada en desarrollo (producción/otras bases: pendiente de decisión).**

### D-37 — V3: semilla enriquecida de la plantilla demo (Vigente)

**Decisión:** añadir `V3__seed_demo_more.sql` que enriquece la **plantilla** (`is_template=true`) con
+8 clientes, +8 productos (3 con stock bajo) y ~60 ventas repartidas en 12 meses, sin ids explícitos y
referenciando por nombre. Se apoya en que una **sesión demo nueva** clona la plantilla
(`DemoSessionServiceImpl.findByIsTemplateTrue().get(0)`).

**Motivo:** los informes y gráficas con pocos datos no lucían realistas.

**No modifica V1/V2.** Al estar `flowmetrics` baselinada en v2 (D-36), solo se ejecuta V3 en el arranque
con perfil `flyway`. **Verificado (PE + VF):** PG desechable y dev (`flowmetrics`) con 13 clientes,
17 productos, 64 ventas, 13 meses y `lowStockProducts=3`. Las sesiones demo existentes conservan datos
antiguos (hay que iniciar una nueva).

### D-38 — i18n propia (ES/EN) sin librería externa (Vigente)

**Decisión:** implementar la internacionalización con un **contexto propio** en `src/i18n/`
(`translations.js` + `LanguageProvider` + `useLanguage` + `LanguageToggle`), sin añadir
`react-i18next` ni dependencias nuevas. Idioma por defecto **es**; persistencia en
`localStorage['flowmetrics.language']`; formato de moneda/fecha vía `Intl` ligado al idioma
(`useFormat`). Las etiquetas de enum pasan a las traducciones (`tEnum`).

**Motivo:** la app no usaba ninguna librería i18n y el alcance (2 idiomas) no justifica una dependencia;
se mantiene el estilo del proyecto (contextos propios como `toast`/`confirm`).

**Alcance aprobado por el usuario:** **toda** la app (Landing + demo), no solo el Landing.

### D-39 — Landing: header que se muestra al bajar y se oculta al subir (Vigente)

**Decisión (elección del usuario):** el header del Landing queda **sticky** y se muestra al hacer scroll
**hacia abajo**, ocultándose al hacer scroll **hacia arriba** (`y: '-100%'`), manteniendo el aviso
«Proyecto Portfolio» **siempre visible** (`bg-black` opaco + `z-10`). El **logo deja de ser clicable**.
La raíz pasa de `overflow-x-hidden` a `overflow-x-clip` para no romper `position: sticky`.

**Motivo:** petición explícita del usuario ("debe seguir la vista; sticky al bajar, solo al bajar").

### D-40 — Landing: la tarjeta de desarrolladora no debe tapar el footer (Vigente)

**Decisión:** la tarjeta flotante de la desarrolladora calcula su `bottom` en cada `scroll`/`resize`
según el solape con el footer (`#site-footer`), subiendo lo justo para no cubrirlo, en vez de fijarse a
`bottom-6`. Se extrajo a un componente `DevCard` para aislar su estado.

### D-41 — Proxy de Vercel `/api` → Render para la comunicación frontend↔backend (Vigente)

**Decisión:** el frontend llama a su **propio origen** (`VITE_API_URL=/api`) y Vercel reescribe
`/api/:path*` hacia el servicio de Render (`frontend/vercel.json`). No se usa acceso directo
cross-origin.

**Motivo:** con dominios distintos, una cookie `SameSite=Lax` **no se envía** en peticiones cruzadas, y
`SameSite=None` depende de cookies de terceros que Safari/ITP bloquea. Con el proxy, frontend y API son
**mismo origen**: la cookie `HttpOnly; Secure; SameSite=Lax` funciona sin debilitar la seguridad, y CORS
ni se ejerce. Se descartó la opción cross-origin directo.

### D-42 — Healthcheck con Spring Boot Actuator, solo `/actuator/health` (Vigente)

**Decisión:** añadir `spring-boot-starter-actuator` y exponer **únicamente** el endpoint de salud
(`management.endpoints.web.exposure.include=health`, `show-details=never`, `show-components=never`).
Render usará `/actuator/health`.

**Motivo:** Render necesita una comprobación de salud fiable; reutilizar Actuator es el mecanismo
estándar. El proyecto **no tenía** Spring Security, así que el endpoint queda público por diseño (lo
que Render necesita) sin exponer métricas/config/entorno ni datos sensibles. Se verificó la
compatibilidad: Actuator **4.1.0** (gestionado por el padre Spring Boot 4.1.0).

### D-43 — Perfil `prod` con Flyway SIN baseline para la base vacía de Neon (Vigente)

**Decisión:** nuevo `application-prod.properties` con `spring.flyway.enabled=true`,
`clean-disabled=true`, **sin** `baseline-on-migrate` ni `baseline-version`, `spring.jpa.show-sql=false`
y `server.port=${PORT:8080}`. Se activa con `SPRING_PROFILES_ACTIVE=prod`.

**Motivo:** la BD de producción (Neon) está **vacía**: Flyway debe aplicar V1/V2/V3 desde cero. El
`baseline-version=2` del perfil local `flyway` (D-36) está pensado para la BD local existente y **no
debe copiarse** a producción. No se modificaron migraciones ni la configuración local/test.

### D-44 — Cookie de demo: `Secure` configurable, `SameSite=Lax` sin cambios (Vigente)

**Decisión:** `DemoSessionController` marca la cookie como `secure` según
`app.demo.cookie.secure` (default `false`; perfil `prod` la pone `true`). Se mantienen `HttpOnly`,
`Path=/` y `SameSite=Lax`.

**Motivo:** en local (HTTP) `Secure` rompería el envío; en producción (HTTPS, same-origin por el proxy)
es correcta. No se altera la extracción, validación ni el aislamiento de la sesión.

### D-45 — Backend en Docker para Render; configuración solo por variables de entorno (Vigente)

**Decisión:** `backend/Dockerfile` multi-etapa (Maven + JDK 21 → JRE 21, `-DskipTests`,
`-XX:MaxRAMPercentage=75.0`) y `backend/.dockerignore`. Render: *Root Directory* `backend`,
*Dockerfile Path* `Dockerfile`, *Health Check Path* `/actuator/health`. Ningún secreto en la imagen.

**Motivo:** Render ejecuta el backend con Java 21 vía Docker. La conexión a Neon y demás secretos se
inyectan como variables de entorno en el panel de Render (ver `docs/despliegue.md`).
