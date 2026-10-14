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
- **No muestres ni copies credenciales** de `application.properties` ni de ningún archivo de configuración.
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
├── database/                 # esquema y seed SQL (aplicación manual)
│   ├── schema/V1_create_schema.sql
│   ├── seeds/V1_demo_data.sql
│   └── backup/
└── docs/
    ├── ai-memory/            # memoria persistente del proyecto
    └── *.md                  # (vacíos actualmente)
```

## Comandos del proyecto

Estado: **disponibilidad comprobada, ejecución de build/arranque pendiente de verificar en esta
sesión**. No afirmes que compilan/arrancan hasta haberlos ejecutado.

- Backend (desde `backend/`): `./mvnw package` · `./mvnw spring-boot:run`
- Frontend (desde `frontend/`): `npm run dev` (Vite, puerto 5173) · `npm run build` · `npm run lint`
- Git: `git branch --show-current` · `git status --short` · `git log --oneline -10`

No modifiques configuración del sistema ni del shell para tareas de FlowMetrics.
