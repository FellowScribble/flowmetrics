# FlowMetrics — Current status

> **Última revisión:** 2026-10-14, a partir de una inspección directa del repositorio
> `/home/andreavierahernandez/Documentos/GitHub/flowmetrics` (rama `develop`).
>
> **Cómo leer este documento:** distingue tres niveles de evidencia que **no** deben confundirse:
> - **Código inspeccionado (CI):** el archivo existe y se ha leído; describe lo que el código *dice hacer*.
> - **Pruebas ejecutadas (PE):** una prueba se ha ejecutado y hay resultado registrado (ver 4.2 y 4.4).
> - **Verificado en funcionamiento (VF):** se ha comprobado el comportamiento en runtime (ver 4.3).
>
> Nada que no aparezca como PE o VF puede afirmarse que “funciona”. El estado histórico previo
> (basado en logs pegados y conversación) se conserva en `PROJECT_HISTORY.md`.

## Punto de guardado (checkpoint 2026-10-14)

> Última sesión (OpenCode). Retomar por aquí.

- **Objetivo de la sesión:** corregir los 5 errores de ESLint del frontend. **Estado: cerrado.**
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
- Siguiente: **Fase C** (verificar aislamiento demo en runtime) o reparar el Maven Wrapper.

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
- **UI de Ventas:** el frontend expone crear y eliminar; la API tiene `PUT /api/sales/{id}` pero
  la página `Sales.jsx` no ofrece edición.
- **Scoping de `Company`:** `CompanyController` **no** usa `DemoContext`; no está aislado por sesión.
- **`Settings.jsx`:** página mínima (33 líneas).
- **Provisión de esquema:** Flyway está **desactivado** (`spring.flyway.enabled=false`); los SQL
  viven en `database/` y se aplican de forma manual/desconocida. Ver D-09.

### 2.4 Pendientes de implementar
- Despliegue (Vercel/Render/Neon solo eran ideas; no hay configuración).
- Flyway operativo en runtime.
- Contenido de `docs/api.md`, `docs/arquitectura.md`, `docs/base-datos.md`, `docs/roadmap.md`
  (los cuatro están **vacíos**, 0 bytes), y `database/backup/flowmetrics_v1.backup.sql` (vacío).

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
- **Sin tests reales:** solo existe `BackendApplicationTests.contextLoads` (`@SpringBootTest`).
  No hay reportes `surefire`; **no se ejecutó**.
- **Riesgos no comprobados:** acceso `LAZY` a `Company` dentro de `DemoSessionFilter` (fuera de
  transacción) podría lanzar `LazyInitializationException`; comportamiento de `/reports/*` con
  `companyId` nulo; corrección real del clonado y de la limpieza programada y su respeto de FKs.
- **README desactualizado:** dice “Next.js” (el frontend real es React+Vite).
- **Credenciales versionadas:** `application.properties` contiene credenciales de PostgreSQL en
  texto plano dentro del control de versiones (no se reproducen aquí).

## 3. Última tarea conocida

- **Histórico (docs):** “implementar `GET /api/companies/{id}` y su manejo de 404”.
  → **Ya está en el código** (CI), aunque no verificado en runtime.
- **Real más reciente:** el último commit es `union front-back` (2026-09-10) y encima hay trabajo
  **sin commitear** consistente en el rediseño animado de `Landing.jsx` y la dependencia
  `framer-motion`. Esa es la línea de trabajo abierta actualmente.

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

## 5. Errores / riesgos abiertos

1. ~~IDOR multi-tenant en la creación de ventas (ver 2.5).~~ **Corregido 2026-10-14 (B1).**
2. ~~Falta de protección de la empresa plantilla frente a update/delete.~~ **Corregido 2026-10-14 (B2).**
3. ~~`Company` sin scoping por sesión demo.~~ **Corregido 2026-10-14 (B3).**
4. Flyway desactivado; esquema sin control de versiones en runtime.
5. Credenciales de BD en texto plano versionadas.
6. Sin cobertura de pruebas; riesgos de `LAZY`/transacción y de limpieza no comprobados.
   (Matiz 2026-10-13: `contextLoads` pasó y la limpieza `@Scheduled` **sí se observó ejecutándose**
   y purgando 2 sesiones; sigue sin verificar aislamiento entre sesiones ni respeto de FKs en todos
   los casos.)
7. Documentación `docs/*.md` vacía y `README.md` con stack incorrecto.
8. ~~**Lint del frontend en rojo (5 errores).**~~ **Cerrado el 2026-10-14:** `DemoSessionContext.jsx`
   se dividió en `DemoSessionContext.js` + `DemoSessionProvider.jsx` + `useDemoSession.js`
   (react-refresh); `catch (error)`→`catch` en `Categories.jsx`/`Customers.jsx`/`Sales.jsx`; y se
   quitó el import `React` no usado en `Landing.jsx`. `npm run lint` → 0 problemas (PE).
9. **Maven Wrapper incompleto:** `./mvnw` inutilizable (falta `backend/.mvn/wrapper/`); hay que usar
   el `mvn` del sistema o reparar el wrapper.
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

## 6. Siguiente paso concreto

**Fase A — cerrada (2026-10-13).** Compila, `contextLoads` pasa, el frontend construye y el sistema
**arranca y responde** (backend `:8080`, frontend `:5173`). El **lint del frontend se corrigió el
2026-10-14** (0 problemas).

Pendiente (con autorización del usuario, no ejecutar sin permiso):
1. ~~Corregir los 5 errores de lint~~ **Hecho 2026-10-14** (ver checkpoint).
2. ~~**Fase B** (IDOR de ventas, protección de la plantilla, scoping de `Company`)~~ **Hecha
   2026-10-14** (B1/B2/B3 implementadas y probadas con tests unitarios, 11/11).
3. Decidir si se repara el Maven Wrapper (`backend/.mvn/wrapper/`) o se adopta `mvn` del sistema.
4. **Fase C:** verificar en runtime el aislamiento entre sesiones demo y la limpieza (con autorización;
   ojo al efecto secundario de la limpieza programada). `contextLoads` con los cambios de B1–B3 ya
   confirmado: `mvn test` completo → 12/12 OK (PE, 2026-10-14).

> No se avanzará a implementar correcciones ni a tocar la BD sin autorización explícita.

## 7. Pendiente de confirmar (no inventar)

- **Resuelto:** versión real de PostgreSQL = `18.6`; el backend **sí** compila y arranca con el Java
  25 del sistema (y con el JRE de Eclipse) pese a que el `pom.xml` fija Java 21 (ver 4.2–4.3).
- Estado de la BD en vivo (si el ID 1 es `FlowMetrics Demo` y si persisten empresas/ventas de pruebas).
- Si el clonado demo y la limpieza programada respetan las FKs en todos los casos (la limpieza **sí**
  se observó ejecutándose y purgando sesiones; el aislamiento entre sesiones sigue sin probar).
- Comportamiento de `/reports/*` con `companyId` nulo.
- Existencia de colecciones Bruno/DBeaver para reproducir pruebas.
- Si el usuario desea mantener la caducidad de demo en 2 h.
