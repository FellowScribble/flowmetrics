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
| D-05 aislamiento por sesión | **Incumplida (parcial)** | Implementado, pero con huecos IDOR y sin proteger la plantilla |
| D-06 monorepo | Vigente (ampliada) | Además de `frontend/` y `backend/` hay `database/`, `assets/`, `docs/` |
| D-07 stack backend | Vigente | Coincide con `pom.xml` (Boot 4.1.0, Java 21 declarado) |
| D-08 stack frontend | **Sustituida** | No es Next.js/TS; es React+Vite+JSX (ver detalle) |
| D-09 Flyway | **Incumplida** | Flyway desactivado; SQL aplicado fuera de Flyway (ver detalle) |
| D-10 `company_id` | Vigente (aplicación incompleta) | Diseño presente; enforcement con huecos (ligado a D-05) |
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
→ 11 tests, 0 fallos (Mockito, sin BD). **Vigente.** Pendiente de verificación en runtime (Fase C).
