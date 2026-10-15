# FlowMetrics — Roadmap

> Estado a 2026-10-14.
> Regla de evidencia: no se declara «hecho» por compilar; cada fase se cierra con una prueba real
> registrada (HTTP, persistencia o test).

## Completado

- **Fase A — compilar y arrancar.** Backend compila y arranca (`:8080`), frontend construye (`:5173`).
  Lint del frontend corregido (0 problemas). *(PE + VF)*
- **Fase B — aislamiento multi-tenant.** IDOR de ventas, protección de la empresa plantilla y scoping
  de `Company` corregidos (B1/B2/B3). *(PE + VF)*
- **Fase C — verificación en runtime.** Aislamiento A/B/plantilla, IDOR, limpieza con respeto de FKs.
  Riesgo `LazyInitializationException` descartado. *(VF)*
- **Maven Wrapper** reparado (Maven 3.9.11). *(PE)*
- **Fase D — pruebas automatizadas.** BD `flowmetrics_test` aislada, perfil `test`, failsafe;
  12 unitarios + 20 IT. *(PE)*
- **Riesgo 11 — fuga de traza en errores.** Cerrado: `spring.web.error.*=never`. *(PE + VF)*
- **E.1 — Edición de ventas en el frontend.** `Sales.jsx` usa `updateSale` (`PUT /api/sales/{id}`).
  *(PE + VF)*
- **E.2 — `Settings.jsx`.** Panel real de sesión demo (empresa, `companyId`, caducidad y cuenta
  atrás); solo frontend. *(PE)*
- **E.4 — Documentación.** `docs/api.md`, `docs/arquitectura.md`, `docs/base-datos.md` y
  `docs/roadmap.md` poblados; `README.md` corregido (React+Vite). *(CI)*
- **E.5 — Credenciales a variables de entorno.** `${DB_URL|DB_USERNAME|DB_PASSWORD}`; sin secretos en
  el repositorio. *(PE)*
- **R13 — SQL antiguos archivados** en `database/legacy/` (históricos, no usables). *(CI)*
- **R15 — `clean` obligatorio** antes de `test`/`verify` (documentado; sin tocar `pom.xml`). *(CI)*
- **R16 — Aislamiento multi-tenant desde la sesión.** `SessionGuard` (401/404), controladores sin
  `?companyId` ni `findAll()`; `TenantIsolationIT`. *(PE)*
- **E.3 — Flyway.** Migraciones `V1__create_schema.sql` + `V2__seed_demo.sql` autoradas y verificadas;
  estrategia de baseline `baseline-on-migrate=true` + `baseline-version=2` como perfil aislado
  `application-flyway.properties`. **Activado en desarrollo (2026-10-14):** `flowmetrics` baselinada en
  v2 sin ejecutar V1/V2, datos intactos y app OK. *(PE + VF)*

## Pendiente (Fase E)

- **E.3 — Flyway en producción/otras bases.** La activación en desarrollo está hecha; falta decidir si
  se activa en el resto de entornos (requiere autorización). El arranque habitual sigue con Flyway
  desactivado. Los SQL antiguos están archivados en `database/legacy/`. **No reejecutar migraciones a
  ciegas** (D-09).

## Pendiente (Fase F — despliegue, más adelante)

Solo ideas, sin configuración existente: Frontend en Vercel, Backend en Render, PostgreSQL en Neon.
Antes: CORS, cookies `Secure`/`SameSite`, HTTPS, secretos fuera del control de versiones y verificar
aislamiento/limpieza en el entorno desplegado. **No** afirmar despliegue hasta probarlo.

## Deuda técnica / riesgos abiertos

| Ref | Descripción |
|---|---|
| 4 | Flyway desactivado por defecto; esquema sin control de versiones salvo perfil `flyway`. *(Migraciones V1/V2 autoradas; baseline activado y verificado en desarrollo 2026-10-14. Pendiente: producción/otras bases.)* |
| 5 | ~~Credenciales de BD en texto plano versionadas.~~ *(Resuelto en E.5: variables de entorno.)* |
| 7 | Documentación incompleta y `README.md` con stack incorrecto. *(Resuelto en E.4.)* |
| 10 | Eclipse (Flatpak) podría no lanzar la app si el shim queda desactualizado. |
| 12 | Discrepancia de datos semilla/plantilla (`NovaTech Store` vs seed histórico). *(Reproducido en V2.)* |
| 13 | ~~Los SQL de `database/` no son fiables.~~ *(Sustituidos por migraciones V1/V2 y archivados en `database/legacy/`.)* |
| 14 | `flowmetrics_test` no versionada (se recrea a mano). |
| 15 | Clases obsoletas en `target/`: usar `clean` antes de `test`/`verify`. *(Documentado; riesgo procedimental.)* |
| 16 | ~~`GET` de clientes/categorías/productos/ventas sin sesión devuelve **todos** los tenants.~~ *(Resuelto en R16: se exige sesión; `companyId` desde el servidor.)* |
| — | Tabla `reports` sin entidad JPA asociada. |
| — | Comportamiento de `/reports/*` con `companyId` nulo, sin probar. |
