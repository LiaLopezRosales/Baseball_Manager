# AGENTS.md

## Project Overview

Baseball championship management system. Django REST backend + React 18 (CRA) frontend, PostgreSQL database.

## Repository Structure

```
/                          # Django project root (manage.py lives here)
├── Baseball_Manager/      # Django project settings, urls, wsgi
├── db_structure/          # Core Django app: all domain models, serializers, views, repositories
│   ├── generic_classes/   # BaseViewSet and BaseRepository (pattern used by all CRUD)
│   └── tests/             # Unit tests for views, repositories, serializers, models
├── api/                   # Second Django app: auth, custom endpoints, reports
│   └── reports/           # Reports subsystem: queries (raw SQL), filters, exports (PDF/CSV plugin system)
├── Baseball_Management/   # React frontend (CRA)
│   └── src/components/    # React components including FormulariosCRUD/ (auto-generated CRUD forms)
├── Documentacion/         # Project documentation (PDFs, design docs)
├── populate_db.py         # Factory-based DB seeder (creates teams, players, simulated championships)
└── pyproject.toml         # Python dependencies
```

## Running the App

**Start both frontend and backend (recommended):**
```bash
cd Baseball_Management && npm start
```
This runs `concurrently` — React on port 3000, Django on port 8000.

**Start only Django:**
```bash
python manage.py runserver 127.0.0.1:8000
```

**Start only React:**
```bash
cd Baseball_Management && npm run start:react
```

**Virtual environment:**
```bash
source python_enviroment/bin/activate
```

## Database

- PostgreSQL (driver: `psycopg2-binary`)
- DB config in root `.env` (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`)
- React API URL in `Baseball_Management/.env` (`REACT_APP_API_URL=http://localhost:8000`)
- **Migrations are gitignored** — you must run `makemigrations` yourself after model changes.

```bash
python manage.py makemigrations
python manage.py migrate
```

**Seed test data:**
```bash
python populate_db.py
```

## Key Architectural Patterns

### Repository + BaseViewSet (CRUD)
All entity CRUD follows: `Model` → `Repository(BaseRepository)` → `Serializer` → `ViewSet(BaseViewSet)`. To add a new entity, create all four layers following existing examples in `db_structure/`.

### Custom User Model
`api.models.CustomUser` maps to `db_structure.User` table via `managed = False`. It overrides `check_password` with **direct string comparison** (not hashed). This is intentional for the current stage.

### Role-Based Access
Three roles defined in `api/roles.py`: `Admin` (full access), `Director Técnico` (team-scoped), `Usuario General` (read-only stats). The DRF default permission is `AllowAny` — auth is enforced per-view via custom permission classes in `api/permissions.py`.

### Reports System
- 9 predefined reports at `GET /api/queries/reports/?report_id=N`
- Many queries use **raw SQL** (not ORM) — see `api/reports/queries.py`
- Export system at `POST /api/queries/export/` uses a plugin architecture (`api/reports/exports/kernel.py`) — add exporters by creating `*_exporter.py` files extending `BaseExporter`

### Dynamic Filter
`POST /api/queries/dinamic-filter/` accepts arbitrary model + field filters. Excludes `User` and `Rol` models.

## Testing

```bash
python manage.py test db_structure
```
Tests use `unittest` with `MagicMock` (no DB required). Located in `db_structure/tests/`.

## Conventions

- **Language**: UI strings and error messages are in Spanish. Code comments mix Spanish and English.
- **Date format**: `%d/%m/%Y` (day/month/year) — configured in settings.
- **No CSRF on API**: CORS configured for `localhost:3000`. API uses token auth.
- **Factory Boy**: Used in `populate_db.py` for seeding. Dependencies: `factory-boy`, `faker`.

## Gotchas

- `db_structure.User` has a DB constraint: rol_id=2 (Director Técnico) requires non-null `TD_id`.
- `Pitcher.save()` calls `get_pitcher_wins`/`get_pitcher_losses` and **accumulates** values — saving twice doubles the count.
- `get_team_players_at_a_specified_serie` in `queries.py` has dead code after a `return` statement (ORM version unreachable).
- Report queries expect specific parameter shapes (e.g., `report_id` as int, season/series names as strings).
- Frontend routing uses React Router with real URL paths (`/admin/:slug`, `/reporte/:slug`, `/consultas/:tabla`, `/equipo/:id`, `/jugador/:id`). Route definitions are in `src/routes.js` (slug→option maps), path helpers in `src/path.js`, route wrappers in `src/viewRoutes.jsx`.

## Frontend: cómo centrar iconos dentro de inputs (login, etc.)

**Síntoma:** los iconos (email, candado, ojo) se ven "más altos que el texto" aunque
matemáticamente la caja del SVG esté centrada en el input (`top:50%; translateY(-50%)`).

**Causas reales (medidas en el login):**
1. El texto dentro de un `<input>` se dibuja ~4px **por debajo** del centro geométrico
   de la caja (no está centrado en la práctica). Con `height` fija + `line-height:1` +
   `padding` vertical `0`, el texto queda centrado.
2. Los glifos de los iconos de lucide-react **no ocupan la caja completa**: cada icono
   dibuja su forma desplazada verticalmente dentro de su viewBox 24x24 (p. ej. el `Mail`
   queda 1.5px alto y el `Lock` 4.1px alto). `getBBox()` NO predice bien la percepción.

**Fix aplicado en `login.css` (validado visualmente):** dar al input `height:46px`,
`line-height:1`, `padding: 0 12px 0 42px` y desplazar cada icono verticalmente con
`top: calc(50% + 4px)` (un desplazamiento uniforme por debajo del centro para alinear
con el texto real). No se alinea respecto al centro de la caja, sino respecto a dónde
cae el texto.

**Verificación objetiva sin necesidad de visión:** capturar screenshot del modal y
analizar los píxeles con un script (Python + Pillow) o mapas ASCII de las filas del
glifo vs. el texto para calibrar el offset exacto (ruta de ejemplo:
`/tmp/opencode/login/ascii.py`). NOTA para el ciclo de UI-review: la alineación óptica
se resuelve por píxeles, no por coordenadas del elemento.

## Frontend: Fase B — Landing pública y perfiles

### Arquitectura de rutas (URL-based)
- `/` — Landing pública (hero, stat cards, standings, líderes de bateo, estrellas, campeones)
- `/admin/:slug` — CRUD Admin (protegido, rol "Admin")
- `/reporte/:slug` — Reportes (protegido, rol "Admin")
- `/consultas/:tabla` — Consultas dinámicas (protegido, rol "Admin")
- `/dt/cambios` — Definir cambios DT (protegido, rol "Director Técnico")
- `/dt/listar-cambios` — Listar cambios DT (protegido, rol "Director Técnico")
- `/equipo/:id` — Perfil de equipo (público, con lista de jugadores enlazados)
- `/jugador/:id` — Perfil de jugador (público, con stats + radar chart ECharts)

### Componentes clave
- `Landing.jsx` — Landing principal, carga 9 endpoints (teams, players, persons, games, seasons, scores + reportes 0,1,5,6)
- `profilePages.jsx` — TeamProfile y PlayerProfile (useParams, profiles)
- `ProtectedRoute.jsx` — Guard que verifica rol en localStorage y redirige a "/"
- `routes.js` — Mapa slug→option para CRUD_ROUTES, REPORT_ROUTES, QUERY_TABLES
- `path.js` — Helpers option→path (toCRUDPath, toReportPath, etc.)
- `viewRoutes.jsx` — CRUDRoute, ReportRoute, QueryRoute (wrappers con useParams)
- `ui/BarChart.jsx` — Chart de barras ECharts (standings en landing)
- `ui/RadarChart.jsx` — Radar chart ECharts (perfil de jugador)

### Datos de la landing
- Reporte 0 (sin params): campeones por temporada (Equipo, Director Técnico, Temporada, Serie)
- Reporte 1 (sin params): jugadores estrella por serie (Nombre, Apellido, Posición, Efectividad)
- Reporte 5 (sin params): top promedio de bateo (Nombre, Apellido, Average)
- Reporte 6 (sin params): estadísticas por equipo (Total de juegos, puntos ganados/perdidos)
- Reporte 8 (team_name param): jugadores de un equipo con series
- `/teams/`, `/persons/`, `/baseball-players/`, `/players-in-position/`, `/positions/` — datos base

### Dependencias de charts
- `echarts` + `echarts-for-react` — ECharts para React (SVG renderer)
