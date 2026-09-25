# AGENTS.md

## Project Overview

Baseball championship management system. Django REST backend + React 18 (CRA) frontend, PostgreSQL database.

## Repository Structure

```
/                          # Django project root (manage.py lives here)
├── backend/      # Django project settings, urls, wsgi
├── db_structure/          # Core Django app: all domain models, serializers, views, repositories
│   ├── generic_classes/   # BaseViewSet and BaseRepository (pattern used by all CRUD)
│   └── tests/             # Unit tests for views, repositories, serializers, models
├── api/                   # Second Django app: auth, custom endpoints, reports
│   └── reports/           # Reports subsystem: queries (raw SQL), filters, exports (PDF/CSV plugin system)
├── frontend/   # React frontend (CRA)
│   └── src/components/    # React components including FormulariosCRUD/ (auto-generated CRUD forms)
├── Documentacion/         # Project documentation (PDFs, design docs)
├── populate_db.py         # Factory-based DB seeder (creates teams, players, simulated championships)
└── pyproject.toml         # Python dependencies
```

## Running the App

**Start both frontend and backend (recommended):**
```bash
cd frontend && npm start
```
This runs `concurrently` — React on port 3000, Django on port 8000.

**Start only Django:**
```bash
python manage.py runserver 127.0.0.1:8000
```

**Start only React:**
```bash
cd frontend && npm run start:react
```

**Virtual environment:**
```bash
source python_enviroment/bin/activate
```

## Database

- PostgreSQL (driver: `psycopg2-binary`)
- DB config in root `.env` (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`)
- React API URL in `frontend/.env` (`REACT_APP_API_URL=http://localhost:8000`)
- **Migrations are gitignored** — you must run `makemigrations` yourself after model changes.

```bash
python manage.py makemigrations
python manage.py migrate
```

**Seed test data:**
```bash
python populate_db.py
```

## Despliegue en producción (Render free + Neon)

- Blueprint `render.yaml`: `baseball-manager-frontend` (Static Site) +
  `baseball-manager-api` (Web Service con `Dockerfile.backend`). `render.yaml` NO
  provisiona Postgres interno (expira a los 90 días):
  la BD es **Neon serverless free** (sin caducidad), conectada por las variables `DB_*`.
- **Fallback SPA en Render = regla de Rewrite en el Dashboard** (Source `/*` →
  `/index.html`, Action Rewrite). Render **NO lee** `public/_redirects` (eso es Netlify):
  sin la regla las rutas de React Router dan 404 al recargar. `_redirects` queda solo
  como compatibilidad Netlify (cabecera comentada lo explica).
- `settings.py` lee `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` y `DB_SSLMODE` desde env
  (comas separadas). `DEBUG=false` en producción.
- `Dockerfile.backend` entrypoint de producción: espera BD → `makemigrations --noinput`
  (las migrations están gitignoreadas y Render compila desde git) → `migrate` →
  **arranca gunicorn en background PRIMERO** (el scanner de puertos de Render da
  "Timed Out" si el seed tarda sin puerto abierto) → `python manage.py seed_demo`
  (comando idempotente y auto-reparable: BD vacía → seed completo; equipos SIN scores
  → `flush` + reseed para recuperar un seed parcial; completa → skip) → `wait`.
  `--workers 1` (instancia free 512 MB) + `--access-logfile -`.
- El Web Service free de Render **se duerme a los 15 min**. La demo lo mantiene despierto con
  un monitor HTTP de **UptimeRobot** cada 5 min contra `/teams/` (endpoint raíz del router DRF;
  ver README § Despliegue).
- `REACT_APP_API_URL` se inyecta a build-time en el Static Site; CORS debe incluir el origen
  real del frontend. Tras el primer deploy hay que confirmar las URLs `*.onrender.com` (Render
  añade sufijo si el nombre está tomado) y ajustar la API si cambian.

## Key Architectural Patterns

### Repository + BaseViewSet (CRUD)
All entity CRUD follows: `Model` → `Repository(BaseRepository)` → `Serializer` → `ViewSet(BaseViewSet)`. To add a new entity, create all four layers following existing examples in `db_structure/`.

### Custom User Model
`api.models.CustomUser` maps to `db_structure.User` table via `managed = False`. Las contraseñas se guardan **hasheadas (PBKDF2)**: `save()` cifra en claro automáticamente y `check_password` usa `django.contrib.auth.hashers`. `check_password` conserva un **fallback transicional**: si el valor almacenado no tiene `$` (fila legacy en claro), compara directo hasta que `python manage.py rehash_passwords` la cifre (idempotente; integrado en `seed_demo`, que corre en cada deploy).

### Role-Based Access
Three roles defined in `api/roles.py`: `Admin` (full access), `Director Técnico` (team-scoped), `Usuario General` (read-only stats). The DRF default permission is `AllowAny` — auth is enforced per-view via custom permission classes in `api/permissions.py`.

### Seguridad: endurecimiento (sept-2026)
- **CRUD cerrado**: `BaseViewSet.get_permissions()` → lectura pública (`AllowAny`) + escritura (`create`/`update`/`destroy`) solo `IsAdmin`. Los helpers `api/permissions.py` usan `_role_name()` (robusto ante usuarios anónimos; antes `IsAdmin`/`IsUsuarioGeneral` reventaban con `AttributeError`).
- **Login unificado**: email no registrado y contraseña incorrecta devuelven ambos **401 `Credenciales inválidas.`** (sin enumeración). Test de integración actualizado: `test_login_unregistered_email` espera 401 + mensaje genérico.
- **Throttling** de login/registro: `ScopedRateThrottle` scope `login` → **8/min en producción**, 500/min en dev (los falsos 429 rompen el runner de integración, que comparte IP).
- **Endpoints DT**: `PlayerSwapByDTView` y `PlayerSwapsForTeamView` con `IsAdminOrDirectorTecnico`; el POST de swap y el DELETE validan que el DT opere sobre **su propio equipo** (403). Los GETs públicos de lineup/bullpen se mantienen de lectura.
- **Errores**: los `except Exception` ya NO devuelven `str(e)` (log + mensaje genérico); `api_404` sin `str(exception)`; en `DynamicFilterView` los `ValueError` de validación de entrada → **400**.
- **Django `/admin/` eliminado** (urls + `INSTALLED_APPS`); la gestión es el CRUD React en `/admin/:slug`. `BrowsableAPIRenderer` solo con `DEBUG=True`.
- **Campos sensibles**: `api/reports/filters.py` (`SENSITIVE_FIELDS = {'CI','password'}`) los excluye de `table-structure` y `dinamic-filter`.
- **Headers de transporte** solo con `DEBUG=False` y fuera del modo test (`_TESTING = 'test' in sys.argv`): `SECURE_PROXY_SSL_HEADER`, `SECURE_SSL_REDIRECT`, `SESSION/CSRF_COOKIE_SECURE`, HSTS. El guard evita que `SECURE_SSL_REDIRECT` devuelva 301 en el runner de integración cuando CI corre `manage.py test` con `DEBUG=False` (el test client no envía `X-Forwarded-Proto`).
- `UserSerializer` deja `password` **write_only** y cifra en `create`/`update` (el CRUD de admin también hashea). `ScriptPasswordHasher` eliminado de `PASSWORD_HASHERS`.
- Los usuarios de prueba (`lia`/`director`/`general`) se **mantienen** a propósito para que el reclutador pruebe todo (en producción real se eliminarían).

### Reports System
- 9 predefined reports at `GET /api/queries/reports/?report_id=N`
- Many queries use **raw SQL** (not ORM) — see `api/reports/queries.py`
- Export system at `POST /api/queries/export/` uses a plugin architecture (`api/reports/exports/kernel.py`) — add exporters by creating `*_exporter.py` files extending `BaseExporter`

### Dynamic Filter
`POST /api/queries/dinamic-filter/` accepts arbitrary model + field filters. Excludes `User` and `Rol` models.

## Testing

```bash
# Suite unitaria (MagicMock, sin BD)
python manage.py test db_structure

# Suite de integración (Postgres REAL, autocontenida). SOLO corre con el flag:
INTEGRATION_TESTS=1 python manage.py test api.tests.integration

# Frontend (componentes + App)
cd frontend && npm test -- --watchAll=false
```

Tests unitarios: `unittest` + `MagicMock`, en `db_structure/tests/` (96).

Tests de integración: `api/tests/integration/` (27). **Autocontenidos**: `seed.py`
expone `seed_test_championship()` que reusa las factories de `populate_db` para
sembrar roles/seasons/equipos/DT/jugadores/campeonato/notificaciones necesarios que
login, registro público y reportes exigen — el runner crea una BD de test vacía y el
CI NO corre `populate_db.py`, así que sin seed propio la suite vería listas vacías.
Detalles de alineación con la implementación real:

- Los clientes DRF (`APIClient`) exponen `.data`, NO `.json()` (Django devuelve
  responses con `.json()`, DRF no).
- `toggle_favorite_*` devuelve **201** al crear (add) y **200** al eliminar (remove).
- `DashboardView` emite `favorite_team`/`recent_games`/`favorite_players`/
  `unread_notifications`; en dashboard/notis los tests usan claves reales.
- `ReportSerializer` valida `report_id` ∈ 0–8; un id inválido → 400 con
  `{'report_id': [...]}` (field errors), no `{'error': ...}`.
- Los 3 casos de `test_serializers.py` que validan PKs (Rol/Team/Player) se
  auto-siembran con las factories (`RolFactory`/`TeamFactory`/`PersonFactory`)
  y NO requieren BD sembrada previa. `test_models.py` restaura los managers
  que parchea en `tearDown` (`objects.__dict__.pop("create")`) — sin eso, los
  mocks quedan vivos y rompen cualquier test posterior que cree filas reales.

Frontend: 14 tests (`.test.jsx` junto a cada componente). Prefijo de grupo `(WP5)`.
RadarChart mockea `echarts-for-react` (jsdom sin canvas); FavoriteButton/NotificationBell/
UserDashboard mockean `src/api`.

## Conventions

- **Language**: UI strings and error messages are in Spanish. Code comments mix Spanish and English.
- **Date format**: `%d/%m/%Y` (day/month/year) — configured in settings.
- **No CSRF on API**: CORS configured for `localhost:3000`. API uses token auth.
- **Factory Boy**: Used in `populate_db.py` for seeding. Dependencies: `factory-boy`, `faker`.

## Gotchas

- `db_structure.User` has a DB constraint: rol_id=2 (Director Técnico) requires non-null `TD_id`.
- `Pitcher.save()`/`refresh_from_db()` **recomputan** `No_games_won`/`No_games_lost` con `get_pitcher_wins`/`get_pitcher_losses` (asignación, no acumulación) — guardar dos veces NO duplica el conteo.
- `api/reports/queries.py` importa `db_structure.models as db`; aquel código muerto tras `return` en `get_team_players_at_a_specified_serie` fue eliminado.
- La auto-generación de notificaciones vive en `db_structure/signals.py` (signal `post_save` en `Score` → notificaciones para seguidores de ambos equipos). El app config `DbStructureConfig.ready()` la registra (`db_structure/apps.py`, `INSTALLED_APPS` usa `'db_structure.apps.DbStructureConfig'`). Los tests de signal están en `db_structure/tests/test_signals.py` (MagicMock, sin DB).
- Report queries expect specific parameter shapes (e.g., `report_id` as int, season/series names as strings).
- Frontend routing uses React Router with real URL paths (`/admin/:slug`, `/reporte/:slug`, `/consultas/:tabla`, `/equipo/:id`, `/jugador/:id`, `/comparar`). Route definitions are in `src/routes.js` (slug→option maps), path helpers in `src/path.js`, route wrappers in `src/viewRoutes.jsx`.
- **Campos nuevos en landing (migración 0004)**: `BaseballPlayer` suma `home_runs`, `rbi`, `obp`, `slg`, `war`; `Pitcher` suma `strikeouts`, `innings_pitched`, `saves`, `whip`; `PlayerInPosition` suma `fielding_pct`, `double_plays`, `bases_stolen`, `assists_of`. Los serializers usan `fields='__all__'` y los incluyen automáticamente. `populate_db.py` los popula; si la BD ya estaba sembrada, hay que **backfill manual** (los nuevos campos quedan a 0).
- **FKs de landing en frontend**: `PlayerInPosition.BP_id` == `BaseballPlayer.id`, `BPParticipation.BP_id` == `BaseballPlayer.P_id` (por la persona, `to_field='P_id'`), y `Pitcher.P_id` == `BaseballPlayer.P_id`. `BaseballPlayer.pitcher` suele ser `None` aunque exista el registro en `Pitcher` → unir pitcheo por `P_id` de la persona, no por el campo FK.
- **Formato decimal en frontend**: se usa `.toFixed(3).replace(/^0/, '')` para `.313` (NO `.replace(/^0/, '.')` que duplicaría el punto: `0.979` → `..979`).
- `docs/planning/PLAN_SECCIONES_LANDING.md` documenta las 4 secciones nuevas de la landing (bento, tabla, podio, estrellas) y su pipeline de datos.

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
- `/admin/:slug` — Panel administrativo CRUD **standalone** (protegido, rol "Admin"); `/admin` redirige a `/admin/personas`
- `/reporte/:slug` — Reportes (público, sin restricción de rol)
- `/consultas/:tabla` — Consultas dinámicas (público, sin restricción de rol)
- `/dt/cambios` — Panel de cambios DT **standalone** (protegido, rol "Director Técnico")
- `/dt/listar-cambios` — Historial de cambios DT **standalone** (protegido, rol "Director Técnico")
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
- Reporte 0: campeones por temporada (Equipo, Director Técnico, Temporada, Serie) — **el campeón de cada serie es el equipo con más victorias puntuadas** (no el ganador del último juego)
- Reporte 1: jugadores estrella por serie (Nombre, Apellido, Posición, **Rendimiento**)
- Reporte 5: top promedio de bateo (Nombre, Apellido, Average)
- Reporte 6: estadísticas por equipo (**Equipo, Partidos Jugados, Victorias, Derrotas, Puntos Anotados, Puntos Recibidos** — una fila por equipo, ganados+perdidos)
- Reporte 8 (team_name param): jugadores de un equipo con series
- `/teams/`, `/persons/`, `/baseball-players/`, `/players-in-position/`, `/positions/` — datos base

### Dependencias de charts
- `echarts` + `echarts-for-react` — ECharts para React (SVG renderer)

## Frontend/Backend: Fase C — Usuario General funcional

### Auth y token
- El backend usa `DEFAULT_AUTHENTICATION_CLASSES = api.authentication.FlexibleTokenAuthentication` (en `settings.py`).
  `CustomUser.is_active = None` hace que el `TokenAuthentication` estándar rechace a todos; `FlexibleTokenAuthentication`
  (en `api/authentication.py`) omite el chequeo de `is_active`.
- Login: `POST /api/login/` (devuelve `token`, `team_id`, `role_name`, `user.permissions`).
- Registro público: `POST /api/register/` con `{name, lastname, email, password}` → crea `Person` + `User`
  (rol "Usuario General") automáticamente y devuelve un token (auto-login). Requiere `Rol.objects.get(type='Usuario General')`.
- **Gotcha**: `RegisterView` debe crear con `api.models.CustomUser` (el `Token` FK exige el modelo AUTH, no `db_structure.User`).

### Endpoints de usuario general (todos con token `Authorization: Token <token>`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/user/dashboard/` | Resumen personalizado: favorito, últimos juegos, posición, jugador estrella |
| POST | `/api/user/favorites/team/` `{team_id}` | Toggle favorito de equipo (devuelve `favorited`) |
| POST | `/api/user/favorites/player/` `{player_id}` | Toggle favorito de jugador |
| GET | `/api/user/favorites/` | Lista de favoritos (`teams` + `players`) |
| GET | `/api/notifications/` | Notificaciones + `unread_count` |
| POST | `/api/notifications/read-all/` | Marcar todas leídas |
| POST | `/api/notifications/<id>/read/` | Marcar una leída |

Los FKs de `FavoriteTeam`/`FavoritePlayer`/`Notification` apuntan a `db_structure.User`; `request.user` es `CustomUser`,
así que **todos los filtros usan `user_id`** (nunca `request.user` directo en lookups que lo usen como FK).

### Export restringido
- `ExportView` (`api/reports/views.py`) tiene `permission_classes = [IsAuthenticated]` → los invitados reciben 401.
  El frontend (`report.jsx`) oculta el botón "Exportar" si no hay token y muestra un tooltip con candado.

### Componentes de Fase C (frontend)
- `Register.jsx` + `register.css` — registro público, ruta `/registro`
- `FavoritesPanel.jsx` + `favorites.css` — `useFavorites`, `FavoriteButton`, `FavoritesPanel`
- `UserDashboard.jsx` + `userDashboard.css` — panel "Tu panel" (posición, últimos juegos, radar compacto)
- `NotificationBell.jsx` + `notifications.css` — campana con badge + dropdown + polling 20s
- Logout: `handleLogout` en `App.js` (limpia localStorage y recarga) conectado al botón del sidebar y del modal de cuenta

### Usuarios de prueba (seed en `populate_db.py`)
| Email | Password | Rol |
|---|---|---|
| `lialopez@gmail.com` | `lia` | Admin |
| `director@test.com` | `director` | Director Técnico |
| `general@test.com` | `general` | Usuario General |

### Gotchas de Fase C
- `DashboardView` usa `Game`/`TeamOnTheField` para últimos juegos (el modelo `Score` **no** tiene campo `game`).
- `db_structure.User` limita a `db_structure.models.User`; el `Token` requiere `CustomUser`. No mezclar.
- La auto-generación de notificaciones al registrar un resultado ya está implementada vía signal `post_save` de
  `Score` (ver `db_structure/signals.py`) — crea una `Notification` por cada seguidor de los equipos winner/loser.
- "Comparar jugadores" (`/comparar`) está en `PlayerCompare.jsx` + `playerCompare.css`; se accede desde el
  sidebar ("Comparar jugadores") y usa datos de `/baseball-players/`, `/persons/`, `/players-in-position/` y `/positions/`.
  **Solo usuarios con cuenta** (roles Admin, Director Técnico o Usuario General): la ruta usa
  `<ProtectedRoute roles={['Admin','Director Técnico','Usuario General']}>` y el item del sidebar se oculta para invitados.
- `FavoriteButton` (corazones) y `FavoritesPanel` no se renderizan para invitados (`token` ausente) — los favoritos
  requieren cuenta. `UserDashboard` ("Tu panel") también se condiciona a `localStorage.getItem('token')`.

### Bloque 3 — auth con modal, notificaciones y "Tu panel" (re-enganche)

Tras la limpieza del shell y la landing standalone (commits `805fed6`/`35147a0`) se re-engancharon
las funciones de Usuario General que habían quedado huérfanas:

- **Modal de acceso como única puerta**: `src/authModal.js` (`AuthModalContext`, `useAuthModal`,
  `REDIRECT_AFTER_LOGIN_KEY='redirectAfterLogin'`). `ProtectedRoute` de invitado guarda el destino,
  abre el modal y navega a `/`; `App.handleModalOpen/handleRegisterOpen` **solo abren si `!isLogged`**.
  `login.jsx` cierra el modal al entrar (`onClose`); el panel "Sesión Activa" del modal se eliminó
  (redundante con el dropdown de cuenta) y con él la rama legacy de logout (`onButtonClick`/`handleClick`).
- **Rol insuficiente = `AccessDenied`** (`components/AccessDenied.jsx` + css, tokens `--lnd-*`), no redirect.
- **`/registro`**: abre el modal de registro y vuelve a `/`; con sesión activa **no** lo abre
  (`RegisterRedirect isLogged`). Los enlaces "Términos"/"Privacidad" del registro apuntan a `/terminos`
  y `/privacidad` (antes `href="#"` muertos) y cierran el modal (`e.stopPropagation()` evita togglear el checkbox).
- **Callout DT/Admin** (`Landing.CalloutAction`): invitado → login; rol correcto → link; rol insuficiente →
  botón bloqueado con `aria-disabled` (focusable, `:focus-visible`) y `aria-label`/`title` explicativos.
- **Logout**: `src/session.js` (`SESSION_KEYS`, `clearSession()`) limpia token/rol/team/userName/isLogged
  pero **preserva `theme`**; se usa en el dropdown de `LandingHeader`.
- **`UserDashboard` ("Tu panel")** re-integrado y refactorizado (`.udb__*`, tokens `--lnd-*`): posición, últimos
  juegos, estrella del equipo y radar del jugador favorito. `.udb__link` en tema claro usa `#0369a1` (5.93:1)
  porque el acento `--lnd-lights` claro (#0284c7) solo da 4.10:1 en texto normal.
- **`NotificationBell`**: marca leída por ítem (`POST /api/notifications/<id>/read/`), polling cada 30 s y
  refresco al recuperar foco; la campana vive solo en `LandingHeader` (Admin/DT la heredan).
- **`DashboardView`** filtra `Game` a `score__isnull=False` → "Últimos juegos" muestra resultados reales
  (los juegos futuros sin score salían como `— – —`).
- **Seed**: `populate_db.seed_favorites_and_notifications()` (idempotente) crea `FavoriteTeam`/`FavoritePlayer`
  y notificaciones de ejemplo reutilizando `create_result_notifications()` con un `Score` **sin guardar**
  (antes persistía un `Score` sintético que contaminaba el Reporte 6). Se invoca al final de
  `simulate_full_championship()`.
- Verificación: build `CI=false npx react-scripts build` (0 warnings), `npm test` (2), `python manage.py test db_structure` (96),
  smoke Playwright por rol (invitado/General/DT/Admin) y contraste AA medido por computed styles en `.udb__link`.

## Frontend/Backend: Perfil de equipo LNB Pro (referencias stitch 17/18)

### Rutas y views
- `GET /api/team-profile/<team_id>/` (`TeamProfileView`, `api/views.py`, `AllowAny` + `authentication_classes=[]`):
  agrega franquicia (migración 0007: `founded_year`, `stadium`, `capacity`, `division`, `slogan`), DT real
  (`team.directionteam.technicaldirector.W_id.P_id`), récord ganados/perdidos con split local/visitante,
  KPIs colectivos (AVG/ERA/FLD% redondeados a 3, HR, RBI, DIF), rankings de liga (por PCT y por AVG),
  campeonatos reales por serie (campeón = equipo con más victorias puntuadas), roster enriquecido, grupos
  posicionales (Lanzadores/Receptores/Cuadro/Jardineros/Otros), próximos juegos y desglose de temporada.
- `GET /api/team-profile/<team_id>/pdf/` (`TeamFichaView` → `api/reports/team_ficha.py`): roster oficial PDF
  reportlab con la misma identidad que la ficha de jugador (`player_ficha._cell/_make_table/_section_title`
  reutilizados; `theme.NumberedCanvas` da el pie WBSC con paginación). Rutas en `api/urls.py`.

### Frontend
- `/equipo/:id` es **standalone** (rama en `App.js` igual que `/jugador`: `LandingHeader` con login/account,
  SIN Sidebar de la app ni "módulo estadístico" lateral de las referencias). Crumb → `/consultas/Team`.
- `TeamProfile` en `profilePages.jsx` reutiliza las primitivas `prf__*` (crumb, hero, blobs, KPIs, cards,
  table) y añade `tmt__*` (escudo/crest circular con aro `--p-team`, chips de estatus DT coloreados, distribución
  del plantel, calendario inmediato, grid de temporada) en `profilePages.css`.
- El bloque legacy `.profile__*` fue **eliminado** (CSS y template); el escudo usa `--prf-text` para sus iniciales
  (no el color del equipo, que podría ser claro y romper AA en tema claro; el color del equipo queda en el aro/glow).

### Gotchas de este perfil
- **Joins**: `PlayerInPosition.BP_id` == `BaseballPlayer.id`; `BPParticipation.BP_id` == `BaseballPlayer.P_id`
  (persona); `Pitcher.P_id` == `BaseballPlayer.P_id`. Unir pitcheo por persona, no por el FK `BaseballPlayer.pitcher`
  (suele ser `None`). `StarPlayer.BP_id` == `BaseballPlayer.id`.
- `Pitcher.running_average` es `PositiveIntegerField` → la ERA sale entera (1.5 por promedio de varios enteros).
- El backend envía `bats/throws` como **display** ('Diestro'/'Zurdo'); el frontend los reduci a D/Z ("Z"/"D").
- `start time` de upcoming es `HH:MM` local; `rival_color` puede ser light (así en el seed) → el dot del calendario
  se renderiza con ese color, es decorativo.
- Verificación: `CI=false npx react-scripts build`, `python manage.py test db_structure` (96), smoke Playwright en
  `/equipo/1` dark y light (contraste de textos principales ≥4.5 en light; en dark los acentos clay en texto pequeño
  quedan ~3.4 como en el perfil de jugador — large text OK >3:1). Migración 0007 aplicada + reseed (`flush` +
  `populate_db.py`; el `TeamFactory` ya llena la marca; `backfill_team_brand()` cubre BDs viejas).

## Frontend: Fase 0 — Fundamentos "Diamond Plate" (paleta de estadio)

### Tokens CSS (`src/index.css`)
- Paleta "night/turf/chalk/lights/clay/hairline". Los **nombres de variable NO cambian** (API estable), solo sus valores
  (`--bg-*`, `--text-*`, `--border-*`, `--accent*`, sombras, radios) + tokens nuevos: `--night`, `--turf`, `--turf-2`,
  `--chalk`, `--chalk-dim`, `--lights`, `--clay`, `--hairline`, `--overlay`, `--shadow-card`, `--font-display`.
- Dark: `--night #0b1712`, `--turf #142c22`, `--turf-2 #1c3a2c`, `--chalk #f3efe3`, `--chalk-dim #b9c2b7`,
  `--lights #f2a93b`, `--clay #b5502f`, `--hairline rgba(243,239,227,.12)`, `--radius-lg 18px`.
- Light: crema con `--turf #ffffff`, `--chalk #16211c`, y **`--lights #9a5b10`** (oscurecido para alcanzar AA 4.5:1 sobre blanco).
- Tipografía vía `@import` de Google Fonts: **Fraunces** (titulares, `h1–h4` global), **Instrument Sans** (body),
  **JetBrains Mono** (números: `.num` y `.stat-card__value`).

### Gotchas de Fase 0
- `src/components/dashboard.css` está **huérfano** (no se importa en ningún componente activo). Los `StatCard` de la
  landing quedaban SIN estilo; los `.stat-card*` viven ahora en `src/components/landing.css` (turf/hairline/radios, valor
  JetBrains Mono ámbar). No "arreglar" estilos en dashboard.css: no llegan al DOM.
- El **ítem activo del sidebar** (y la "costura" de clay) se computa con `useLocation` en `src/components/sidebar.jsx`;
  los grupos Consultas/Estadísticas/Formularios se auto-abren al navegar directo a una ruta (`/reporte/...`,
  `/consultas/...`, `/admin/...`, `/dt/...`).
- Radar del perfil de jugador: el título es un `h3.radar-chart__title` (Fraunces) FUERA del chart ECharts (evita el
  solapamiento del viejo `title` de ECharts). Tiene 4 ejes: Bateo, **Juegos** (conteo de `/bp-participations/` donde
  `BP_id` == jugador), Experiencia, Edad.
- Efectividad **redondeada a 3 decimales en backend** (decisión del plan): `api/reports/queries.py`
  (`ROUND(::numeric,3)` en SQL crudo, `round(...,3)` en ORM con guard a `None`) y `PlayerInPositionSerializer`.
  Tests de redondeo en `db_structure/tests/test_serializers.py`.
- `BarChart` lee `--accent` vía `getComputedStyle` (fallback `#f59e0b`); eje X sin rotate con nombre truncado y la barra
  líder lleva glow. `RadarChart` igual (fallback `#f59e0b`).
- Overlay de modales (`.modal-overlay`): `--overlay` + `blur(4px)` + `z-index:1100`; el banner NO debe sangrar sobre el modal.
- Verificación: `CI=false npx react-scripts build` + `python manage.py test db_structure` (96 tests) + smoke Playwright
  (login, sidebar activo, radar 4 ejes, guards invitado/admin, decimales en reportes).

## Gotchas de reportes estadísticos (sept-2026)

- **Reporte 1 JOIN corregido**: el SQL original comparaba `bp."P_id_id"` (persona) con `pip."BP_id_id"` (baseballplayer) → cruzaba nombres de un jugador con la efectividad de otro. Fix: `sp."BP_id_id" = bp."id"`. La columna se renombró a `Rendimiento`.
- **Reporte 4 typo corregido**: `P_id__P_id__lastnam__startswith` → `P_id__P_id__lastname__startswith`. Sin este fix, el filtro con nombre+apellido lanzaba FieldError 500.
- **Reporte 6 reescrito**: agrupaba SOLO por `winner` → mostraba solo partidos ganados y etiquetas engañosas. Versión actual usa `winner_id OR loser_id` con COUNT condicional → datos completos (partidos, victorias, derrotas, puntos anotados, puntos recibidos) por equipo.
- **Reporte 0 determina campeón por victorias**: el SQL original tomaba el ganador del último juego por fecha (fragil: si ese juego no tenía score, la serie desaparecía). Versión actual usa CTE de victorias por equipo en la serie → campeón = equipo con más victorias.
- **Seed `batting_average`** rango realista `0.150–0.400` (`populate_db.py`). Versiones anteriores usaban `max_value=1` → promedios ~0.97 (imatematicamente imposibles como AVG real de béisbol).
- **`player_ficha.py`** aún usa la etiqueta `Efectividad` para la ficha PDF de perfil de jugador (fuera del scope de reportes).

## Herramienta: agente `redesign-expert` (global) + 7 skills

- **Para qué**: produce la especificación/dirección de rediseño visual (diseño + CRO + psicología) en
  `docs/design/REDESENO_*.md`, SIN tocar código. Es GLOBAL (cualquier proyecto), generalizado con 9
  etapas y **adjudicación de sugerencias del usuario** (ADOPT/ADAPT/REJECT). Definido en
  `~/.config/opencode/agents/redesign-expert.md` (subagent, `model: google/gemini-3.6-flash`,
  `bash: deny`, `task: deny`, `skill: allow`, temperatura 0.4). Escrito en inglés (skills en inglés);
  el idioma del deliverable lo fija `brief.language.deliverable`, no el prompt del agente.
- **7 skills globales** en `~/.config/opencode/skills/<name>/SKILL.md` (auto-descubiertas, sin registro):
  `design-brief`, `visual-audit`, `design-principles`, `design-tokens`, `cro-microcopy`,
  `designlab-prototype`, `blueprint-template`. El agente las carga por etapa (`skill tool`).
  Lista codificada en `docs/planning/PLAN_AGENTE_REDISENO.md` §5/§11.
  Checklist/anti-slop enriquecidos con ideas de **Design Auditor** (Ashutos1997), **TasteCheck**
  (KyaniteLabs, MIT) y **ui-audit** (tommygeoco/UxTools); `visual-audit/references/` alberga
  Nielsen 10 heurísticas + capa cognitive-a11y. Atribución detallada al pie de `blueprint-template`.
- **V1 (proyecto-local) eliminada en la limpieza del repo**: la V2 global (definida en
  `~/.config/opencode/agents/redesign-expert.md`) toma precedencia en este y cualquier
  proyecto; en el repo no queda ningún agente local que la duplique.
- **Provider google global**: añadido a `~/.config/opencode/opencode.jsonc`
  (`options.apiKey: "{file:~/.secrets/google-gemini.key}"`) para que el agente global corra en
  cualquier proyecto.
- **Gotcha "Requests ending with a model turn" (sept-2026)**: el subagente V2 (google/gemini-3.6-flash)
  fallaba con `AI_APICallError` cuando su flujo **cerraba con un tool call de `write`** (read + texto
  final sí pasaba). Google rechaza requests cuyo último contenido es un turno `model`. Fix como **plugin
  global** en `~/.config/opencode/plugins/gemini-synthetic-user-turn.ts`: hook
  `experimental.chat.messages.transform` (mutación in-place con `push`, condicionado a providerID
  `google` y último mensaje role != user) anexa un turno de usuario sintético ("Continue.") antes de la
  request. El fix upstream no está publicado (issue anomalyco/opencode#45359 abierto). Si el plugin no
  está activo tras update/cambio de config: reiniciar opencode (los plugins globales se autodescubren en
  `~/.config/opencode/plugins/` con extensión `.ts`/`.js`).
- **Modelo con visión (gratis)**: `google/gemini-3.6-flash` vía proveedor `google` en `opencode.json`
  con `options.apiKey: "{file:~/.secrets/google-gemini.key}"` (key fuera del repo; duplicada en `.env`
  gitignored para scripts). Plan/alternativas y gotchas de instalación en
  `docs/planning/PLAN_AGENTE_REDISENO.md`.
- **Gotchas de la key free (verificadas)**:
  - El formato `AQ....` de AI Studio funciona solo con `?key=` en `generativelanguage.googleapis.com`;
    **no** con `Authorization: Bearer` (401 `API_KEY_SERVICE_BLOCKED`).
  - `gemini-2.5-flash` **no está disponible para usuarios nuevos** (404); usar `gemini-3.6-flash`.
  - En opencode la key va en **`provider.google.options.apiKey`** (la vía `api_key` a nivel provider NO surte efecto).
  - `{env:VAR}` no resuelve si opencode no carga `.env` → se usa `{file:...}`.
  - Cambios de agentes/proveedores en config requieren **reiniciar opencode**; `opencode run` es la vía
    headless para probar sin reiniciar la TUI (los subagentes NO pueden usarse como agente primario de `run`).
- **Cómo "ve" la UI**: MCP Playwright captura PNGs (dentro del workspace, p. ej. `.playwright-mcp/`) →
  el subagente los lee con `read` (OpenCode dimensiona las imágenes automáticamente). Para validar
  propuestas: prototipos estáticos desechables en `/tmp/opencode/designlab/` → captura → crítica →
  iteración; cruzando siempre con medición objetiva (contraste AA, computed styles). Smoke test de la
  Landing verificó que el modelo ve y describe los componentes con precisión.

### Auditor local UXRay (`uxray`, Ollama + Gemma vision)

- **Instalado**: Ollama v0.32.14 vía `sudo snap install ollama` (daemon en `127.0.0.1:11434`).
  Modelo vision **`gemma4:12b`** (Vision+Thinking; `ollama pull gemma4:12b`, ~7.4GB, Q4_K_M)
  — encaja en la RTX 4070 8GB. Alternativas `gemma4:e4b` (ligero) / `gemma4:31b` (pesado).
- **Script global** `~/.local/bin/uxray` (Python stdlib, sin dependencias):
  `uxray <captura.png> [...] [--lang es|en] [--model ...] [--out reporte.md] [--json|--raw]`.
  Produce reporte estructurado: score 0-100, carga cognitiva, friction points (Nielsen/Gestalt/WCAG),
  flags a11y, recomendaciones priorizadas. Env vars: `OLLAMA_HOST`, `UXRAY_MODEL`, `UXRAY_LANG`.
- **Gotchas verificados**:
  - `gemma4:12b` trae `thinking` activado por defecto → responde ~8x más lento y con `response`
    vacío en `/api/generate`. Usar `"think": false` (el script lo hace; ~10s vs ~95s por llamada).
  - `ollama show gemma4:12b` confirma capabilities `vision` (requiere Ollama ≥0.30.5).
  - El modelo no distingue bien light/dark según el nombre del archivo; pasa como contexto las
    capturas Light y Dark cuando el brief lo requiera.

## Frontend: Panel administrativo CRUD (standalone, refs stitch 27/28)

- **Rutas**: `/admin/:slug` en rama propia de `App.js` (`pathname.startsWith('/admin')`). Si el slug no
  existe en `CRUD_ROUTES`, `AdminLayout` redirige a `/admin/personas`; la rama `/admin` también. Protegido
  con `<ProtectedRoute roles={['Admin']}>` (muestra `AdminLayout`, no el CRUDRoute directo como antes).
- **Componentes** (`src/components/admin/`): `AdminLayout.jsx` (header LandingHeader + shell + crumb +
  chips de estado; `data-theme={theme}` propio vía `getInitialTheme/applyTheme`), `AdminSidebar.jsx`
  (nav "Formularios & CRUD" con `ADMIN_NAV`, ítem activo por `pathname`, logout), `adminPanel.css`
  (tokens `.apn`, doble tema), `adminNav.js` = `ADMIN_NAV` (20 ítems option→label) + heading.
- **Resolución**: `useParams().slug` → `CRUD_ROUTES[slug]` (=option) → `CRUDRoute` en `viewRoutes.jsx`
  mapa `CRUD_COMPONENTS` (option→componente `.jsx` de `FormulariosCRUD/`). Tabla de las 20 URLs en
  `src/routes.js` (`CRUD_ROUTES`); ayuda opción→path en `path.js` (`toCRUDPath`) y `CRUD_OPTION_TO_SLUG`.
- **CRUD genérico**: `FormulariosCRUD/BaseCRUD.jsx` (+ `BaseCRUD/` con `CRUDForm`, `DataTable`,
  `ItemActions`, `useCRUD`; `BaseCRUD.css`) y `kpiDefs.js` definen el comportamiento común; cada entidad
  tiene un `*CRUD.jsx` delgado que pasa columnas/KPIs. El panel administrativo viejo (`components/admin.jsx`,
  antes `components/AdminPanel.jsx`) fue **borrado**; el sidebar viejo solo conserva el ítem "Panel
  Administrativo" que navega fuera (el shell viejo dejó de alojar el CRUD).
- **Gotchas**: los `*CRUD.jsx` usan `fields`/columnas explícitas (no `'__all__'`) para el render del
  cliente; `kpiDefs.js` centraliza los KPIs por entidad. El borrado de registros CRUD usa `apiDelete`.
  `ApiError` y el flujo de error por entidad viven en `BaseCRUD.jsx`. Verificación previa: build + smoke
  login Admin → crumb con slug, sidebar activo, CRUD listando datos.

## Frontend: Panel de cambios DT (refactor LNB Pro, refs stitch 29/30)

- **Páginas standalone**: `/dt/cambios` (`DtPanel.jsx`) y `/dt/listar-cambios` (`DtHistorial.jsx`)
  viven en `src/components/dt/` con `dtPanel.css` (tokens `.dt`, doble tema). Salen del shell viejo:
  rama propia en `App.js` (`pathname.startsWith('/dt')` → `<ProtectedRoute roles={['Director Técnico']}>`),
  `path="*"` de la rama shell ahora navega a `/` (Landing standalone de `/equipo` y `/jugador`). El
  grupo "Alineaciones" del sidebar fue eliminado. Los viejos `PlayerSwapForm/Table.jsx|css` y
  `TeamManagement.jsx` fueron borrados.
- **DtPanel** = broadcast por refs 29/30: banner WBSC Regla 5.10, crumb "Panel de Cambios", card
  Equipo/DT (abreviatura + dueño), selector de juego (carga `GET /api/player-swap/<team_id>/` con
  `game_data`), mini-diamante "Previa del encuentro" (estado neutro SIN lineup cargado), Lineup Titular
  WBSC (efectividad media), campo SVG con 9 chips posicionales (`POS_COORDS`/`POS_SHORT` mapean
  Pitcher→P … RF), toggles Táctico/Métricas, tira de 4 métricas (Efectividad Media, Posiciones en Fila,
  Jugadores en Reserva, Cambios Registrados), drawer "Ejecutar Sustitución" (Sale del Juego / Entra al
  Juego / Causa decorativa) + "Bullpen & Reserva Activa" (filtro por posición vía
  `GET /api/player-swap/available/<team>/<position>/<series>/<lineup>/`), registro reciente (8 filas de
  `GET /api/player-swaps/team/<team>/`) con link "Historial Completo".
- **DtHistorial** = tabla broadcast completa: orden por columnas, paginación 10/página, "Nuevo Cambio"
  → `/dt/cambios`, eliminar con `DELETE /api/player-swaps/delete/<id>/`.
- **`api.js`**: `apiPost` solo hace POST; el borrado usa el nuevo helper `apiDelete(path)` (token Auth).
- **Solo juegos pendientes (backend)**: `GET /api/player-swap/<team_id>/` filtra `game_data` a
  `Game.date >= now` (comparado contra `timezone.now()`, `USE_TZ=False`) y los ordena por fecha
  ascendente; el dropdown del panel solo ofrece partidos futuros. `POST /api/player-swap/` valida que
  el `Game` del `game_team` (TeamOnTheField, como `local` o `rival`) sea futuro → `400` "No es posible
  registrar cambios para un juego ya disputado." si ya pasó (evita bypass por API; usa la fecha real
  del `Game`, no el string `date` del payload). En el front, si `games.length===0` se muestra
  "Sin juegos pendientes" y el campo queda en "Previa del encuentro".
- **Seed de próximos partidos**: `populate_db.schedule_upcoming_games(rounds=5, days_between=6)`
  crea la serie fija **"Calendario Futuro LNB"** (name tipo guaranteed), clona las participaciones de
  la serie más reciente (para que el bullpen del panel siga funcionando) y genera un round-robin de
  juegos sin score con fechas futuras espaciadas. **Idempotente**: si la serie ya existe no hace nada;
  re-ejecutable más adelante cuando esas fechas caduquen.
- **Flujo swap verificado (smoke)**: seleccionar juego → 9 chips con AVG reales → clic chip →
  bullpen por posición → Confirmar → `POST /api/player-swap/` 201 + fila nueva "Aprobado WBSC" →
  el historial la lista y `DELETE` la elimina (200). Invitado redirige a `/`; `/dt/*` desconocida →
  `/`. Sin errores de consola; build (`CI=false npx react-scripts build`) y `python manage.py test
  db_structure` (96) en verde.

## Frontend: módulo de estadísticas — boletín, impresión y filtros default

- **Bloque regulatorio WBSC como footer**: el panel "Criterio Regulatorio WBSC (Estatuto Técnico
  Art. 84)" ya NO es un banner del reporte (`report.jsx`); vive en el footer de
  `EstadisticasLayout.jsx` (clases `est-reg*`) con botón **Descargar Boletín Técnico (PDF)**.
  El botón descarga el PDF con marca del reporte actual vía `BoletínContext`
  (`src/reportBoletinContext.js`): el `ReportComponent` registra un objeto mutado por render
  (`boletínRef.current`) que la layout consume SIN re-render; invitados ven candado + botón
  deshabilitado (`disabled={!isLogged || !boletín}`).
- **Filtro default precargado**: `ParamsSelector` en `report.jsx` preselecciona la primera opción
  UNA vez por reporte (ref guard `defaultsApplied`): 0/2→primera temporada, 1→primera serie,
  8→primer equipo. El reporte 8 (equipo) sin filtro devuelve 0 filas; con default nunca queda
  vacío. `ParamsSelector` se monta con `key={report_id}` para resetear el default al cambiar de reporte.
- **Imprimir Boleta imprime el corte completo**: `handlePrint` usa `flushSync(()=>setPrintAll(true))`
  + `window.print()` (todos los registros, `viewRows = printAll ? enabledRows : pageRows`) y
  listeners `beforeprint/afterprint`; el `@media print` de `report.css` + `EstadisticasLayout.css`
  oculta sidebar/header/filtros/KPIs/auditoría/paginación y fuerza colores de imprenta claros
  (cabecera nocturna `#0b1712`, filas alternadas, `print-color-adjust: exact`).
- **PDF export con marca LNB**: `api/reports/exports/pdf_exporter.py` reescrito con reportlab
  (banda nocturna + marca ámbar, título real, tabla crimson/clay con filas alternadas, pie
  "Afiliado Oficial WBSC · Criterio Regulatorio (Estatuto Técnico Art. 84)" + nº página y fecha).
  `ExportView` pasa `filename=` al exporter; **CSV** ahora acepta `**kwargs`. Logo con ruta
  absoluta (`Path(__file__).parent/'logo.jpg'`).
- **Gotchas**: `window.print()` en headless NO dispara `beforeprint/afterprint` (solo Chrome real);
  `page.pdf()` de Playwright tampoco → la boleta imprimida via test sale con la página actual (10
  filas), pero en navegador real sí imprime todo. `fetchReport` tiene guard de carrera
  (`fetchSeq.current`) para descartar respuestas fuera de orden entre el fetch inicial y el del default.
  El footer stats se ancla al viewport (`footerBottom == innerHeight`, `docScroll: 0`) incluso con el
  bloque regulador añadido.
