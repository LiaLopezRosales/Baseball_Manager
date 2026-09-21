# ⚾ Baseball Manager — Gestión de Campeonatos de Béisbol LNB Pro

Plataforma full-stack para administrar campeonatos de béisbol: **reportes estadísticos con exportación PDF/CSV**, **CRUD completo (18 entidades)**, **autenticación por roles** (Admin, Director Técnico, Usuario General), dashboard de usuario con **radar de stats** y landing pública con `<strong>standings</strong>`, líderes y podium (Sanoscuro/light).

- **Backend**: Django 5.1 + Django REST Framework 3.15 + PostgreSQL (psycopg2)
- **Frontend**: React 18 (CRA) + ECharts (radar/bar charts) + React Router
- **Arquitectura**: Repository + BaseViewSet + Factory Boy (seed) — ver [AGENTS.md](AGENTS.md)

---

## ✨ Funcionalidades

| Área | Descripción |
|---|---|
| 🏟️ **Landing pública** | Hero atomista, stats, standings (BarChart), líderes de bateo, jugadores destacados (radar), campeones + podium P1 |
| 📊 **Reportes** | 9 reportes predefinidos (0–8) con filtros dinámicos (report_id + dinamic-filter), shape validated, export PDF/CSV pluggable |
| 🔐 **Auth por roles** | Admin / Director Técnico / Usuario General — login con token, registro público (`/api/register/`) crea rol "Usuario General", dashboard condicionado a sesión |
| ⭐ **Favoritos** | Toggle equipo/equipo y jugador (`/api/user/favorites/team|player/`), panel aislado por usuario, FavoritesPanel con enlaces |
| 🔔 **Notificaciones** | Campana con badge de no leídas (`/api/notifications/`), marcar una (`/read/<id>/`) o todas (`/read-all/`) |
| 🖥️ **CRUD** | 20+ modelos con `BaseRepository` + `BaseViewSet` + `DataTable` frontend |
| 🧾 **Reportes PDF** | Export con branding (reportlab, cabecera dark + marca, página WBSC), CSV |

---

## 🚀 Arranque rápido

### Backend (Django + Postgres)

```bash
# 1. Entorno + dependencias
source python_enviroment/bin/activate   # o tu venv
pip install -e .

# 2. Variables (de .env; si no, usa los defaults de Baseball_Manager/settings.py)
cp .env.example .env  # y rellena DB_NAME, DB_USER, DB_PASSWORD...

# 3. BD (Postgres local o docker)
createdb campeonatos   # si no existe
# o con docker:
# docker run -d --name bp-pg -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
#   -e POSTGRES_DB=campeonatos -p 5432:5432 postgres:16

# 4. Migraciones + seed + servidor
python manage.py makemigrations db_structure api   # solo si cambiaste modelos
python manage.py migrate
python populate_db.py     # sembrar campeonato demo (factories)
python manage.py runserver 127.0.0.1:8000
```

### Frontend (React)

```bash
cd Baseball_Management
npm install
npm start   # servidor en http://localhost:3000 (API proxied a :8000)
```

### Usuarios demo (seed)

| Rol | Email | Password |
|---|---|---|
| Admin | `lialopez@gmail.com` | `lia` |
| Director Técnico | `director@test.com` | `director` |
| Usuario General | `general@test.com` | `general` |

---

## 🔬 Testing

### Backend

```bash
# Suite unitaria (sin BD) — db_structure y api
python manage.py test db_structure
python manage.py test api

# Suite de integración real (Postgres) — solo cuando INTEGRATION_TESTS=1 (CI/flagged)
INTEGRATION_TESTS=1 python manage.py test api.tests.integration
```

La suite de integración (`api/tests/integration/`) es **autocontenida**: se siembra a sí misma
vía `seed_test_championship()` (factories reales de `populate_db`) contra la BD de test de Django,
por lo que no depende del `populate_db.py` de mano. Endpoints validados: auth (3 roles),
reportes 0/5/6/8 + dinamic-filter (Postgres real), favoritos toggle team/player (add=201/remove=200),
notificaciones (badge, marcar 1, marcar todas).

> ℹ️ `test_serializers.py` (db_structure) usa `MagicMock` sin BD: los casos que validan PKs de
> equipo/rol/jugador dependen de que exista seed. Contra una BD de test vacía, 3 de esos casos
> fallan (documentado en el commit `69b3422`; se validan en CI con `populate_db.py`).

### Frontend

```bash
cd Baseball_Management
npm test -- --watchAll=false    # 12 tests (FavoriteButton, NotificationBell, UserDashboard, RadarChart)
```

Los tests de `FavoriteButton`/`NotificationBell`/`UserDashboard` mockean `src/api` y usan
`await apiGet(...)` (no `.json()` → DRF expone `.data` en los clientes).

---

## 🗂️ Estructura del repo

```
Baseball_Manager/
├── Baseball_Manager/            # settings Django, urls, wsgi
├── db_structure/                # modelos + repos + serializers + views (CRUD)
├── api/                         # auth, favoritos, notificaciones, dashboard, reportes
│   ├── reports/                 # queries (SQL raw), serializers, exports (PDF/CSV plugin)
│   └── tests/integration/       # suite de integración Postgres real
├── Baseball_Management/         # React (CRA) — componentes, FormulariosCRUD, ui/RadarChart
├── populate_db.py               # seed con factories
├── manage.py
└── docs/
```

---

## 🖼️ Capturas

| Landing dark | Landing light | Admin CRUD |
|---|---|---|
| ![landing dark](docs/screenshots/landing-dark-full.jpg) | ![landing light](docs/screenshots/landing-light-full.jpg) | ![admin](docs/screenshots/admin-personas-light.jpg) |

| Podium landing (QA) |
|---|
| ![podium QA](docs/screenshots/qa-landing-podium-v2-light.jpg) |

---

## 🔑 Arquitectura clave (de un vistazo)

- **Repository pattern**: `BaseRepository` (db_structure/generic_classes) + `BaseViewSet` — todo CRUD hereda de 2 clases.
- **Auth**: `FlexibleTokenAuthentication` (`api/authentication.py`) — `CustomUser.is_active=None` hace que el `TokenAuthentication` estándar rechace todo; el flexible omite el chequeo. Login en `api/views.py`.
- **Favoritos/notificaciones**: FK a `db_structure.User` (`user_id`), `request.user` es el user model de auth. **No mezclar** `CustomUser` de auth con `db_structure.User`.
- **Reportes**: SQL raw (CTE) en `api/reports/queries.py`; filtros dinámicos `api/reports/serializers.py`; exporter pluggable `api/reports/exports/kernel.py`.

---

## 📄 Licencia

MIT — ver [LICENSE](LICENSE).

---

## 📖 Más documentación

- [AGENTS.md](AGENTS.md) — guía de desarrollo, gotchas y convenciones.
- [docs/README_EN.md](docs/README_EN.md) — índice/overview en inglés.
- [docs/design/ROADMAP_PROFESIONAL.md](docs/design/ROADMAP_PROFESIONAL.md) — roadmap.
