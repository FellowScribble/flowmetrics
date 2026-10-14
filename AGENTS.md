# AGENTS.md — Instrucciones permanentes para OpenCode

## Mandato principal

Antes de tocar cualquier archivo de este repositorio, **lee la memoria del proyecto**:

1. `docs/ai-memory/PROJECT_STATUS.md` — estado actual, pruebas y siguiente paso.
2. `docs/ai-memory/DECISIONS.md` — decisiones vigentes, sustituidas e incumplidas.
3. `docs/ai-memory/NEXT_STEPS.md` — prioridades y dependencias.
4. `docs/ai-memory/PROJECT_HISTORY.md` — antecedentes históricos (documento de archivo, no estado actual).

## Reglas de trabajo

- **No inventes resultados.** Nunca marques algo como “funciona” o “probado” si no se ha ejecutado y registrado la prueba. Distingue siempre entre: código inspeccionado, pruebas ejecutadas y funcionalidad verificada en runtime.
- **Verifica el estado de Git** antes de cambiar nada: `git branch --show-current` y `git status --short`. No hagas commit a `main` sin autorización explícita.
- **No borres decisiones históricas** porque estén desactualizadas. Añade el estado nuevo (vigente / sustituida / incumplida) explicando qué cambió y la evidencia.
- **No muestres ni copies credenciales** de variables de entorno (`DB_PASSWORD`, etc.) ni de ningún archivo de configuración.
- **No ejecutes migraciones, operaciones destructivas ni cambios de base de datos** salvo autorización explícita.
- **Un cambio pequeño y verificable a la vez.** Espera confirmación antes de avanzar.
- Cuando termines una tarea importante, **actualiza `PROJECT_STATUS.md`** (y `NEXT_STEPS.md`/`DECISIONS.md` si corresponde) para que la siguiente sesión parta del estado real.

## Estructura esencial

```text
flowmetrics/
├── AGENTS.md                 # este archivo
├── README.md
├── backend/                  # Spring Boot 4.1.0 (Maven, Java 21 en pom)
│   ├── pom.xml
│   └── src/main/java/com/flowmetrics/backend/
│       ├── config/ context/ controller/ dto/ entity/
│       ├── exception/ filter/ mapper/ repository/
│       ├── service/ service/impl/ util/
│       └── ...resources/application.properties
├── frontend/                 # React 19 + Vite 8 + JSX + Tailwind v4
│   └── src/{api,components,context,pages}
├── database/legacy/          # SQL históricos (NO usar; ver database/legacy/README.md)
│   ├── V1_create_schema.sql
│   ├── V1_demo_data.sql
│   └── flowmetrics_v1.backup.sql
└── docs/
    ├── ai-memory/            # memoria persistente del proyecto
    └── *.md                  # api, arquitectura, base-datos, roadmap
```

## Comandos del proyecto

Estado: **disponibilidad comprobada, ejecución de build/arranque pendiente de verificar en esta
sesión**. No afirmes que compilan/arrancan hasta haberlos ejecutado.

- Backend (desde `backend/`): `./mvnw package` · `./mvnw spring-boot:run`. **Requiere `DB_PASSWORD`
  en el entorno** (y opcionalmente `DB_USERNAME`/`DB_URL`); sin ella no arranca (E.5, D-32).
- Tests backend: `./mvnw clean verify` (también requieren `DB_PASSWORD`; usan `flowmetrics_test`).
  **`clean` es obligatorio** antes de `test`/`verify`: sin él pueden ejecutarse clases obsoletas de
  `target/` (riesgo 15).
- Frontend (desde `frontend/`): `npm run dev` (Vite, puerto 5173) · `npm run build` · `npm run lint`
- Git: `git branch --show-current` · `git status --short` · `git log --oneline -10`

**Flyway** está desactivado por defecto. Su activación en desarrollo está **hecha** vía perfil aislado
`flyway` (`SPRING_PROFILES_ACTIVE=flyway`, con `baseline-on-migrate=true`/`baseline-version=2`); el
arranque habitual sigue con `enabled=false`. No activar ni ejecutar migraciones contra bases
**existentes** (ni producción) sin autorización explícita (ver `docs/base-datos.md`, D-36).

No modifiques configuración del sistema ni del shell para tareas de FlowMetrics.
