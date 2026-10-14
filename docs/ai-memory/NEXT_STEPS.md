# FlowMetrics — Prioritized continuation plan

> **Revisado:** 2026-10-14 tras corregir el lint del frontend (rama `develop`).

> **Posición actual (2026-10-14):** Fase A **cerrada** (lint corregido) y Fase B **implementada**
> (B1 IDOR de ventas, B2 protección de plantilla con 409, B3 scoping de `Company`; 11 tests unitarios
> OK). Siguiente paso activo: **Fase C** (verificar aislamiento demo en runtime).
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

> **Siguiente paso activo (2026-10-14).** Depende de A y B (ambas cerradas/implementadas).

- `POST /api/demo/start` y comprobar cookie/token y empresa clonada.
- `GET /api/demo/me` con y sin cookie válida (esperado 401 sin sesión).
- Confirmar que escribir en una sesión no altera la plantilla ni otra sesión.
- `POST /api/demo/cleanup` y/o esperar el `@Scheduled`; verificar purga respetando las FKs.
- Revisar el riesgo de `LazyInitializationException` en `DemoSessionFilter` (acceso `LAZY` a
  `Company` fuera de transacción).

## Fase D — Pruebas automatizadas

Depende de A (estructura mínima) y de decisiones de B/C.

- Hoy solo existe `BackendApplicationTests.contextLoads`. Añadir pruebas de servicio/controlador
  para: creación de venta (cálculo de total, stock, error 400), 404 de recursos, y scoping demo.
- Definir una estrategia de BD para tests (contenedor/Testcontainers o perfil de test) sin tocar la
  BD de desarrollo. **Pendiente de decisión del usuario.**

## Fase E — Trabajo funcional restante

Depende de que A–C estén verificados.

1. **UI de Ventas:** la API ya tiene `PUT /api/sales/{id}`; la página `Sales.jsx` no ofrece edición.
2. **`Settings.jsx`:** página mínima (33 líneas); decidir alcance.
3. **Flyway:** reconciliar `database/schema` + `database/seeds` con el historial de Flyway y decidir
   si se activa (`spring.flyway.enabled=true`). No reejecutar migraciones a ciegas (ver D-09).
4. **Documentación:** poblar `docs/api.md`, `docs/arquitectura.md`, `docs/base-datos.md`,
   `docs/roadmap.md` (hoy vacíos) y corregir el `README.md` (dice “Next.js”).
5. **Seguridad de configuración:** mover las credenciales de `application.properties` a variables
   de entorno (no reproducir los valores actuales).

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
