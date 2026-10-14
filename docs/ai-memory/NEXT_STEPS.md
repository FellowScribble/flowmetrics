# FlowMetrics — Prioritized continuation plan

> **Revisado:** 2026-10-14 tras cerrar el riesgo 11, las Fases E.1/E.4, E.5 (credenciales), E.3
> (Flyway **activado en desarrollo**), y los riesgos 13/15/16 (R13/R15/R16), rama `develop`.

> **Posición actual (2026-10-14):** Fase A **cerrada**, Fase B **implementada**, Fase C **verificada en
> runtime**, **Maven Wrapper reparado**, Fase D **hecha** (BD `flowmetrics_test` aislada, perfil
> `test`, scheduler off; **12 unitarios + 20 IT** en verde tras R16), **riesgo 11 cerrado**
> (`spring.web.error.*=never`), **E.1/E.2/E.4/E.5 hechas**, **E.3 completada en desarrollo**
> (Flyway baselinó `flowmetrics` en v2 sin ejecutar V1/V2; perfil aislado `flyway`) y **riesgos
> 13/15/16 cerrados** (R13 archivo en `database/legacy/`, R15 documentado, R16 aislamiento exigido
> desde la sesión). Ver `PROJECT_STATUS.md` 4.5–4.15 y D-24–D-36. **Siguiente:** decidir activación de
> Flyway en **producción/otras bases** (requiere autorización; el arranque habitual sigue con Flyway
> desactivado). Recuerda: la app/tests requieren `DB_PASSWORD` en el entorno desde E.5.
>
> **Nota sobre el plan anterior:** el plan histórico (Phase 0 realidad → Phase 1 Company → Phase 2
> resto de recursos → Phase 3 demo → Phase 4 dashboard → Phase 5 frontend → Phase 6 despliegue) se
> ha quedado obsoleto en su mayor parte: el CRUD de Company, los recursos, la demo con sesión y los
> reportes **ya existen en el código** (ver `PROJECT_STATUS.md`). Las fases antiguas se conservan en
> `PROJECT_HISTORY.md`. Este documento reordena el trabajo **según dependencias técnicas reales**.
>
> **Regla de evidencia:** no declarar algo “hecho” por compilar ni “probado” sin resultado registrado.
> Distinguir siempre código inspeccionado (CI), pruebas ejecutadas (PE) y verificado en runtime (VF).

## Reglas operativas

1. Antes de trabajar, leer `PROJECT_STATUS.md` y `DECISIONS.md`.
2. Verificar rama y árbol de trabajo: `git branch --show-current` y `git status --short`.
3. Preservar los cambios sin commitear de `frontend/` (rediseño de Landing + `framer-motion`).
4. No tocar `main` sin autorización. No ejecutar migraciones ni operaciones destructivas.
5. Un cambio pequeño y reversible a la vez; explicar objetivo, archivo exacto y prueba.
6. Esperar confirmación antes de avanzar de fase.
7. No mostrar ni copiar credenciales.

---

## Fase A — Comprobar compilación y arranque (primera acción)

> **Estado 2026-10-14: CERRADA.** Compila, `contextLoads` pasa, `npm run build` OK y **arranque real
> verificado** (backend `:8080`, frontend `:5173`). Lint del frontend **corregido el 2026-10-14**
> (0 problemas, PE). Resultados en `PROJECT_STATUS.md` 4.2–4.4 y checkpoint 2026-10-14.

**Objetivo:** saber si el proyecto compila y arranca antes de tocar nada más.

Backend (desde `backend/`):
- `./mvnw -q -DskipTests package` (compilación).
- `./mvnw test` (ejecuta `BackendApplicationTests.contextLoads`; requiere BD disponible).
- Alternativa de arranque: `./mvnw spring-boot:run`.

Frontend (desde `frontend/`):
- `npm run build` (compilación de producción).
- `npm run lint`.
- `npm run dev` (Vite, puerto 5173).

Registrar en `PROJECT_STATUS.md`:
- salida real (éxito/fallo) y mensajes de error;
- si el backend arranca pese a que el `pom.xml` fija Java 21 y el sistema tiene Java 25;
- si `contextLoads` pasa.

**Criterio de salida:** resultado real de compilación y arranque documentado, sin afirmaciones sin evidencia.

## Fase B — Riesgos de aislamiento multi-tenant

> **Estado 2026-10-14: IMPLEMENTADA.** Informe entregado y, con autorización, corregidos los tres
> puntos: **B1** pertenencia de cliente/producto en `SaleServiceImpl` (404 si no coinciden);
> **B2** empresa plantilla protegida con 409 (`TemplateCompanyProtectedException`); **B3**
> `CompanyController` solo lectura con sesión y limitado a la empresa propia (escrituras públicas
> retiradas). Pruebas unitarias (Mockito, sin BD): `SaleServiceImplTest` (3), `CompanyServiceImplTest`
> (4). `mvn test` completo: **12 tests, 0 fallos** (incluye `contextLoads`, PE 2026-10-14); se asumió
> el efecto secundario de la limpieza programada sobre la BD real.

Depende de A (no tiene sentido corregir sin saber que compila/arranca).

1. **IDOR en creación de venta.** Revisar `SaleServiceImpl.create()`: valida existencia de
   `customerId`/`productId` con `findById`, pero no que pertenezcan a la empresa de la sesión.
   Decidir el enfoque mínimo (comprobar `company_id` de cliente y producto contra `DemoContext`).
2. **Protección de la empresa plantilla.** Revisar `CompanyController`/`CompanyServiceImpl`:
   permiten `PUT`/`DELETE` sobre cualquier empresa, incluida la plantilla (`is_template = true`).
   Decidir regla de protección (p. ej. impedir borrado/edición de plantilla).
3. **Scoping de `Company`.** `CompanyController` no usa `DemoContext`; decidir si debe aplicar
   aislamiento o quedar fuera del ámbito público.

Entregable de esta fase: informe corto de opciones y propuesta **sin implementar**. Esperar autorización.

## Fase C — Verificar en runtime el aislamiento y la limpieza demo

> **Estado 2026-10-14: VERIFICADA EN RUNTIME (VF).** Detalle en `PROJECT_STATUS.md` 4.5.

- ~~`POST /api/demo/start` y comprobar cookie/token y empresa clonada.~~ Hecho: **200**, cookie
  `HttpOnly`/`SameSite=Lax`, `Max-Age=7200`, clon de la plantilla.
- ~~`GET /api/demo/me` con y sin cookie válida (esperado 401 sin sesión).~~ Hecho: **401** sin cookie,
  **200** con cookie.
- ~~Confirmar que escribir en una sesión no altera la plantilla ni otra sesión.~~ Hecho: aislamiento
  A/B/plantilla confirmado; IDOR cliente/producto ajeno → **404**.
- ~~`POST /api/demo/cleanup` y/o esperar el `@Scheduled`; verificar purga respetando las FKs.~~ Hecho:
  **200**; purga de sesión caducada deja empresa + hijos a 0, sin huérfanos; otras empresas intactas.
- ~~Revisar el riesgo de `LazyInitializationException` en `DemoSessionFilter`.~~ **Descartado** para
  este camino: solo se llama `getId()` sobre el proxy.
- Hallazgo: los **405** devolvían traza (`trace`) en el cuerpo → riesgo 11. **Cerrado el 2026-10-14**
  (causa: defaults de DevTools `spring.web.error.*=always`; fix: `never` explícito; ver 4.7 y D-27).

## Fase D — Pruebas automatizadas

> **Estado 2026-10-14: HECHA (PE).** Detalle en `PROJECT_STATUS.md` 4.6 y decisión **D-26**.
> Estrategia elegida por el usuario: PostgreSQL de pruebas separado `flowmetrics_test`.
> Actualización: con `ErrorResponseIT` (riesgo 11) y `TenantIsolationIT` (riesgo 16) la cobertura de
> integración pasa a **20 IT** (total 32: 12 unitarios + 20 IT).

- ~~Definir estrategia de BD sin tocar la de desarrollo.~~ Hecho: **`flowmetrics_test`** (esquema real
  vía `pg_dump --schema-only` de `flowmetrics`, solo lectura) + `application-test.properties` que
  sobrescribe solo la URL.
- ~~Ampliar cobertura~~ Hecho: `SaleServiceIT` (ventas/stock/400/404 ajenos), `DemoTenancyIT`
  (clonado, aislamiento A/B, limpieza de caducadas), `BackendApplicationIT` (contexto + guard de
  aislamiento + scheduler off), y unitario `SaleServiceImplTest` ampliado.
- Separación: `*Test` unitarios rápidos (surefire) y `*IT` integración (failsafe). Scheduler
  desactivado en `test` (`SchedulingConfig` con `@Profile("!test")`).
- Resultado: `./mvnw clean test` = 12 unitarios; `./mvnw verify` = +20 IT (32 total, incluye
  `TenantIsolationIT` de R16), 0 fallos; BD de desarrollo sin cambios.
- Pendiente relacionado: los SQL de `database/` están archivados en `database/legacy/` (no usables, riesgo
  13 resuelto); hay que `clean` antes de `test`/`verify` (riesgo 15, documentado).

## Fase E — Trabajo funcional restante

> **Estado 2026-10-14: EN CURSO.** El usuario pidió cerrar antes el **riesgo 11** (hecho). **E.1–E.5
> hechas** (E.3 completada en desarrollo: Flyway baselinó `flowmetrics` en v2 sin ejecutar V1/V2) y
> **riesgos 13/15/16 cerrados** (R13 archivo, R15 documentado, R16 aislamiento desde la sesión; ver
> `PROJECT_STATUS.md` 4.13–4.15). Pendiente: decidir activación de Flyway en producción/otras bases
> (requiere autorización). Esperar elección del usuario.

Depende de que A–C estén verificados.

1. **UI de Ventas:** la API ya tiene `PUT /api/sales/{id}`; la página `Sales.jsx` no ofrecía edición.
   **HECHO 2026-10-14 (E.1):** edición implementada con `updateSale`; verificado (lint/build + flujo
   create→update→delete en runtime). Detalle en `PROJECT_STATUS.md` 4.8.
2. **`Settings.jsx`:** página mínima (33 líneas). **HECHO 2026-10-14 (E.2):** convertida en panel de
   sesión real (empresa, `companyId`, caducidad y cuenta atrás) usando `useDemoSession`; sin cambios
   de backend. Verificado con lint/build. Detalle en `PROJECT_STATUS.md` 4.10.
3. **Flyway:** decidir si se activa (`spring.flyway.enabled=true`). No reejecutar migraciones a ciegas
   (ver D-09). **PARCIAL 2026-10-14 (E.3):** migraciones `V1__create_schema.sql` + `V2__seed_demo.sql`
   creadas en `backend/src/main/resources/db/migration/` y verificadas en BD desechable (esquema
   idéntico; clonado OK). **Estrategia de baseline preparada y verificada (E.3, 2026-10-14):**
   `baseline-on-migrate=true` + `baseline-version=2`, expuesta como perfil aislado
   `application-flyway.properties` (`SPRING_PROFILES_ACTIVE=flyway`). Verificado en BD desechables:
   nueva → V1+V2; existente sin historial → baseline v2 sin migrar; `baseline-version=1` → falla por PK
   duplicada. **ACTIVADO EN DESARROLLO 2026-10-14 (E.3 completada):** arranque con el perfil `flyway`
   contra `flowmetrics` → baseline v2, sin ejecutar V1/V2, datos intactos, app OK (`PROJECT_STATUS.md`
   4.15). El **arranque habitual** sigue con Flyway desactivado. Pendiente (fuera de alcance): decidir
   activación en producción/otras bases. Ver D-36 y `docs/base-datos.md`. Los SQL antiguos ya están
   **archivados** en `database/legacy/` (riesgo 13).
4. **Documentación:** poblar `docs/api.md`, `docs/arquitectura.md`, `docs/base-datos.md`,
   `docs/roadmap.md` y corregir el `README.md` (decía “Next.js”). **HECHO 2026-10-14 (E.4).** Detalle
   en `PROJECT_STATUS.md` 4.9.
5. **Seguridad de configuración:** mover las credenciales de `application.properties` a variables
   de entorno (no reproducir los valores actuales). **HECHO 2026-10-14 (E.5):** `application.properties`
   usa `${DB_URL:...}`, `${DB_USERNAME:postgres}` y `${DB_PASSWORD}` (obligatoria); hay que exportarlas
   para la app y los tests. Detalle en `PROJECT_STATUS.md` 4.12.

## Fase F — Despliegue (más adelante)

Depende de E y de que el aislamiento demo esté verificado.

- Objetivos solo mencionados: Frontend Vercel, Backend Render, PostgreSQL Neon (D-18).
- Antes: CORS, cookies `Secure`/`SameSite`, HTTPS, secretos fuera del control de versiones, y
  verificar aislamiento/limpieza en el entorno desplegado.
- No afirmar despliegue hasta probarlo.

---

## Preguntas abiertas (resolver inspeccionando/ejecutando)

1. ¿Compila y arranca el backend con Java 25 habiendo fijado Java 21 en el `pom.xml`?
2. ¿Pasa `contextLoads`? ¿Estado real de la BD (ID 1 `FlowMetrics Demo`, empresas de prueba)?
3. ¿El clonado demo y la limpieza programada funcionan y respetan las FKs?
4. ¿Qué comportamiento tienen `/reports/*` con `companyId` nulo?
5. ¿Se mantiene la caducidad de demo en 2 h?
6. ¿Se decide aplicar aislamiento a `Company` o dejarlo fuera del dashboard público?
7. ¿Estrategia de pruebas con BD (Testcontainers/perfil) sin tocar la BD de desarrollo?

## Regla de finalización

No avanzar de fase por el mero hecho de que compile. Cada fase se cierra con una prueba real
registrada (petición HTTP con estado/cuerpo, o verificación de persistencia/aislamiento).
