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
- Frontend routing is primarily driven by `selectedOption` state, not URL paths.
