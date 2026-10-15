# FlowMetrics

Aplicación Full Stack de **gestión de ventas multi-tenant con demo aislada**, desarrollada como
portfolio profesional.

## Tecnologías

- **Frontend:** React 19 + Vite 8 (JavaScript/JSX) + Tailwind CSS v4
- **Backend:** Java + Spring Boot 4.1.0 (Maven)
- **Base de datos:** PostgreSQL

## Estructura

```text
flowmetrics/
├── backend/     # API REST (Spring Boot)
├── frontend/    # SPA (React + Vite)
├── database/    # SQL históricos en legacy/ (NO usar; ver database/legacy/README.md)
└── docs/        # documentación (api, arquitectura, base-datos, roadmap)
```

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

## Documentación

- [Arquitectura](docs/arquitectura.md)
- [API REST](docs/api.md)
- [Base de datos](docs/base-datos.md)
- [Despliegue (Vercel + Render + Neon)](docs/despliegue.md)
- [Roadmap](docs/roadmap.md)

## Notas

- La app funciona con un **modelo demo**: `POST /api/demo/start` clona una empresa plantilla y abre
  una sesión aislada de 2 h.
- **Flyway está desactivado por defecto**; el esquema se aplica de forma manual salvo que se active el
  perfil aislado `flyway` (`SPRING_PROFILES_ACTIVE=flyway`, con `baseline-version=2` para BDs
  existentes). Activación **hecha en desarrollo**; el arranque habitual no la cambia (ver
  `docs/base-datos.md`).
- Las credenciales de la base de datos se toman de variables de entorno (`DB_USERNAME`, `DB_PASSWORD`,
  `DB_URL`); **no** hay secretos en el repositorio. Los tests también requieren esas variables.
- **Despliegue:** preparado para **Vercel (frontend) + Render (backend, Docker) + Neon (PostgreSQL)**.
  El backend de producción usa el perfil `prod` (`SPRING_PROFILES_ACTIVE=prod`), que activa Flyway
  **sin baseline** para inicializar una base vacía, escucha en `$PORT` y marca la cookie de demo
  como `Secure`. El frontend llama a `/api` y Vercel lo redirige a Render (mismo origen). Ver
  [docs/despliegue.md](docs/despliegue.md).
