# ⚾ Baseball Manager — English Index / Índice en inglés

> Full index and overview of the project **in English**. The detailed
> Spanish document (features, quick start, architecture, testing, users,
> endpoints, FAQ) lives in the repo root: [**`../README.md`**](../README.md).

Platform to run baseball league championships — statistics & standings
(public landing), a **CRUD admin** for 18+ entities, **9 raw-SQL reports**
with PDF/CSV export, **role-based auth** and per-user favorites / notifications.

---

## Stack

| Layer | Tech |
|---|---|
| Backend | Django 5.1 · DRF 3.15 · PostgreSQL · Repository pattern + BaseViewSet |
| Frontend | React 18 (CRA) · ECharts (bar/radar) · React Router · dark/light "Diamond Plate" theme |
| Seed | Factory Boy (`populate_db.py` → `populate_db` script) |
| Tests | 96 unit (backend) + 27 integration (Postgres real, gated) + 14 component (frontend) |

---

## Quick start (short version)

See the full Spanish README for details. Summary:

```bash
# Backend
source python_enviroment/bin/activate
pip install -e .
python manage.py migrate
python populate_db.py
python manage.py runserver 127.0.0.1:8000

# Frontend (separate terminal, from Baseball_Management/)
npm install
npm start   # React :3000 (proxies /api -> :8000)
```

**Demo users** (created by the seed):
| Role | Email | Password |
|---|---|---|
| Admin | `lialopez@gmail.com` | `lia` |
| Dir. Técnico | `director@test.com` | `director` |
| General | `general@test.com` | `general` |

---

## Testing

```bash
python manage.py test db_structure                        # 96 unit tests (no DB)
INTEGRATION_TESTS=1 python manage.py test api.tests.integration   # 27 real-Postgres tests
cd Baseball_Management && npm test -- --watchAll=false    # 14 component tests
```

Integration suite is self-contained (`api/tests/integration/seed.py` seeds its own
championship via the factories) — it does **not** depend on a pre-seeded database.

---

## Key endpoints (prefix `/api`)

| Method | Path | What |
|---|---|---|
| POST | `/login/` | Token + role + team_id |
| POST | `/register/` | Public signup → "Usuario General" + token |
| GET | `/user/dashboard/` | User panel (favorites, recent games, radar) |
| POST | `/user/favorites/team/` · `/player/` | Toggle favorite (add=201, remove=200) |
| GET | `/user/favorites/` | Favorites list (teams + players) |
| GET · POST | `/notifications/` | List + badge; mark read one/all |
| GET | `/queries/reports/?report_id=N` | 9 predefined reports (0–8) |
| GET | `/queries/dynamic-filter/` | Dynamic filter on any model |
| GET | `/team-profile/<id>/` | Team profile (records, roster, champions) |
| GET | `/player-profile/<id>/` | Player profile (radar, series) |

---

## Docs

- Spanish README (detailed): [`../README.md`](../README.md)
- Agent/dev guide: [`../AGENTS.md`](../AGENTS.md)
- Design docs: [`docs/design/`](design/)
- Roadmap: [`docs/planning/ROADMAP_PROFESIONAL.md`](planning/ROADMAP_PROFESIONAL.md)

---
*MIT license — see [`../LICENSE`](../LICENSE).*
