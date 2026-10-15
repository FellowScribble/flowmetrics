# Despliegue — FlowMetrics (Vercel + Render + Neon)

> **Estado:** documento de **procedimiento futuro**. Nada de esto se ha ejecutado
> todavía: no hay servicios creados, no se ha conectado Neon y **no se ha verificado
> el despliegue**. Los pasos marcados como «verificar» son comprobaciones que deben
> ejecutarse antes de anunciar la demo públicamente.

## Arquitectura objetivo

| Componente | Proveedor | Plan | Notas |
|---|---|---|---|
| Frontend (React + Vite) | **Vercel** | Hobby | Sirve la SPA y hace de **proxy** `/api/*` → Render. |
| Backend (Spring Boot, Docker) | **Render** | Free (Docker) | Puede dormir por inactividad (~1 min al despertar). |
| Base de datos (PostgreSQL) | **Neon** | Free | **Independiente** de la BD local; se inicializa vacía con Flyway. |

**Repositorio:** monorepo existente (`backend/`, `frontend/`, `docs/`). No se separa.

## Decisión de comunicación frontend ↔ backend

Se usa un **proxy de Vercel**: el frontend llama a **su propio origen** (`/api/...`) y
Vercel reescribe esas peticiones hacia Render (`vercel.json`). Consecuencias:

- El navegador solo conoce el dominio de Vercel → la cookie de sesión es **same-origin**
  y funciona con `HttpOnly; Secure; SameSite=Lax`.
- No se depende de cookies de terceros (evita el bloqueo de Safari/ITP).
- CORS no se ejerce en producción (el origen es único); se mantiene configurable por si
  se necesita acceso directo al backend.

## Variables de entorno

### Backend (Render)

| Variable | Obligatoria | Descripción | Ejemplo (ficticio) |
|---|---|---|---|
| `DB_URL` | **Sí** | JDBC a Neon con SSL. | `jdbc:postgresql://ep-xxx.neon.tech/flowmetrics?sslmode=require` |
| `DB_USERNAME` | **Sí** | Usuario de Neon. | `flowmetrics_owner` |
| `DB_PASSWORD` | **Sí** | Contraseña de Neon. | `********` |
| `SPRING_PROFILES_ACTIVE` | **Sí** | Debe ser `prod` (activa Flyway sin baseline, `PORT` y cookie `Secure`). | `prod` |
| `CORS_ALLOWED_ORIGINS` | No | Solo si se permite acceso directo al backend. Lista separada por comas. | `https://flowmetrics.vercel.app` |
| `DEMO_COOKIE_SECURE` | No | El perfil `prod` ya la marca `true`. | `true` |

> `PORT` la inyecta Render automáticamente; el perfil `prod` la usa (`server.port=${PORT:8080}`).

### Frontend (Vercel)

| Variable | Obligatoria | Descripción | Valor |
|---|---|---|---|
| `VITE_API_URL` | **Sí** | Base de la API en el bundle. | `/api` |

> Las variables `VITE_*` son **públicas** (van incrustadas en el bundle). Nunca poner
> secretos ahí.

## Procedimiento

### 0. Requisitos previos
- Cuenta en Neon, Render y Vercel.
- Repositorio en GitHub con la rama a desplegar (hoy: `develop`; decidir cuál se publica).
- **Verificado en local:** `npm run build` y `npm run lint` del frontend; compilación del
  backend. **No verificado:** build de la imagen Docker (Docker no está instalado en la
  máquina de desarrollo).

### 1. Crear la base de datos en Neon
1. Crear un **proyecto** en Neon (región cercana a Render).
2. Crear una **base de datos vacía** (p. ej. `flowmetrics`). No crear tablas a mano.
3. Copiar la **cadena de conexión** (host, base, usuario, contraseña). Neon requiere SSL:
   la `DB_URL` debe incluir `?sslmode=require`.
4. Guardar las credenciales para el paso 4. **No** versionarlas.

### 2. Crear el servicio de backend en Render
1. **New → Web Service** → conectar el repositorio.
2. **Root Directory:** `backend`.
3. **Runtime:** `Docker`. **Dockerfile Path:** `Dockerfile`.
4. **Instance Type:** Free.
5. **Health Check Path:** `/actuator/health`.

### 3. Migraciones de producción (Flyway)
- El perfil `prod` activa Flyway con `spring.flyway.enabled=true` y **sin baseline**.
- Al arrancar por primera vez contra la BD **vacía** de Neon, Flyway aplica en orden:
  - `V1__create_schema.sql` (esquema),
  - `V2__seed_demo.sql` (empresa plantilla «NovaTech Store» + catálogo),
  - `V3__seed_demo_more.sql` (datos de demo ampliados).
- **No** se copia `baseline-on-migrate` / `baseline-version` del perfil local `flyway`.
- **Verificar tras el primer arranque** (ver «Comprobaciones»). Si Flyway detecta un
  esquema no vacío sin historial, **fallará a propósito** (no marca baseline en silencio).

### 4. Configurar variables de entorno del backend
En Render → Service → **Environment**: añadir `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
y `SPRING_PROFILES_ACTIVE=prod`. Guardar (provoca redespliegue).

### 5. Publicar el frontend en Vercel
1. **Add New → Project** → importar el repositorio.
2. **Root Directory:** `frontend`.
3. **Framework Preset:** Vite. **Build Command:** `npm run build`. **Output Directory:** `dist`.
4. **Environment Variables:** `VITE_API_URL=/api`.
5. Desplegar.

### 6. Configurar el proxy y los orígenes
1. En `frontend/vercel.json`, sustituir el placeholder del rewrite
   `https://REPLACE-WITH-YOUR-RENDER-SERVICE.onrender.com` por la URL real del servicio
   de Render, y volver a desplegar.
2. (Opcional) Si se quiere permitir acceso directo al backend desde otro origen,
   definir `CORS_ALLOWED_ORIGINS` en Render con la URL de Vercel. Con el proxy **no es
   necesario**.

### 7. Comprobar sesiones, aislamiento y protección de plantilla
- Abrir el frontend → entrar a `/demo` → debe crear sesión (cookie) y mostrar KPIs.
- Recargar: la sesión persiste (cookie reenviada vía proxy).
- Ver «Comprobaciones antes de publicar».

### 8. Comportamiento del primer acceso tras el reposo
- Render Free duerme por inactividad; el primer acceso puede tardar ~1 min.
- El frontend muestra un estado de carga y, si falla, un botón de reintento
  (`AppLayout`). Es el comportamiento esperado; **no** se añaden servicios de pago para
  evitarlo.

### 9. Diagnóstico de errores
- **Vercel:** pestaña *Deployments* → *Build Logs* (errores de build) y *Functions/Runtime
  Logs* para los rewrites.
- **Render:** pestaña *Logs* del servicio. Buscar `Migrating schema`, `Successfully applied`,
  `Started BackendApplication`, errores de conexión JDBC/SSL.
- **Neon:** pestaña *Monitoring* / *SQL Editor* para inspeccionar tablas y
  `flyway_schema_history`.
- Errores comunes:
  - `28P01` → `DB_PASSWORD` incorrecta o ausente.
  - `SSL required`/errores TLS → falta `?sslmode=require` en `DB_URL`.
  - `Flyway found non-empty schema ... without schema history` → se apuntó a una BD no vacía.
  - Cookie no persiste → revisar que el rewrite `/api` esté aplicado y que el perfil `prod`
    esté activo (cookie `Secure` requiere HTTPS).

## Comprobaciones antes de publicar públicamente

| # | Comprobación | Cómo |
|---|---|---|
| 1 | Esquema y semilla creados en Neon | `flyway_schema_history` con V1/V2/V3 `success`; tablas presentes. |
| 2 | Una sola empresa plantilla (`is_template=true`) | SQL en Neon. |
| 3 | `POST /api/demo/start` crea sesión y cookie | DevTools → Application → Cookies. Debe ser `HttpOnly`, `Secure`, `SameSite=Lax`. |
| 4 | Persistencia de sesión tras recargar | Recargar `/demo`. |
| 5 | Aislamiento A/B | Dos navegadores → datos independientes; acceder a id de otra empresa → 404. |
| 6 | Plantilla inmutable vía API | No hay endpoints de escritura de empresa; si existieran, 409. |
| 7 | Endpoints sin sesión → 401/404 | `GET /api/sales` sin cookie → 401. |
| 8 | Venta con cliente/producto de otra empresa → 404 | Probar con ids ajenos. |
| 9 | `/actuator/health` público y sin detalles | `GET /actuator/health` → `{"status":"UP"}` sin info interna. |
| 10 | Otros endpoints de Actuator no expuestos | `GET /actuator/env` → 404. |
| 11 | Limpieza de sesiones caducadas | Tras expirar (2 h), la empresa clonada se purga (scheduler horario). |
| 12 | Primer acceso tras reposo | Dejar dormir el servicio y medir arranque en frío. |

## Riesgos y pendientes
- **No verificado en runtime:** build de Docker, arranque en Render, migración sobre Neon,
  comportamiento del proxy y de la cookie en navegador real.
- **Memoria de Render Free (512 MB):** no medida; el `Dockerfile` fija
  `-XX:MaxRAMPercentage=75.0`. Confirmar que arranca sin OOM.
- **`/api/demo/cleanup` es público** (dispara la limpieza de sesiones caducadas). No filtra
  datos, pero podría endurecerse. Riesgo bajo.
- **Neon Free** puede suspender la cómputo; el primer acceso también puede tardar.
- **Rama a publicar:** decidir si se despliega `develop` o se promueve a `main`.
