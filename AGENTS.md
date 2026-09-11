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
- `Pitcher.save()`/`refresh_from_db()` **recomputan** `No_games_won`/`No_games_lost` con `get_pitcher_wins`/`get_pitcher_losses` (asignación, no acumulación) — guardar dos veces NO duplica el conteo.
- `api/reports/queries.py` importa `db_structure.models as db`; aquel código muerto tras `return` en `get_team_players_at_a_specified_serie` fue eliminado.
- La auto-generación de notificaciones vive en `db_structure/signals.py` (signal `post_save` en `Score` → notificaciones para seguidores de ambos equipos). El app config `DbStructureConfig.ready()` la registra (`db_structure/apps.py`, `INSTALLED_APPS` usa `'db_structure.apps.DbStructureConfig'`). Los tests de signal están en `db_structure/tests/test_signals.py` (MagicMock, sin DB).
- Report queries expect specific parameter shapes (e.g., `report_id` as int, season/series names as strings).
- Frontend routing uses React Router with real URL paths (`/admin/:slug`, `/reporte/:slug`, `/consultas/:tabla`, `/equipo/:id`, `/jugador/:id`, `/comparar`). Route definitions are in `src/routes.js` (slug→option maps), path helpers in `src/path.js`, route wrappers in `src/viewRoutes.jsx`.

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
- `/reporte/:slug` — Reportes (público, sin restricción de rol)
- `/consultas/:tabla` — Consultas dinámicas (público, sin restricción de rol)
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
- `UserDashboard.jsx` tiene un warning de eslint preexistente (`teamStars` sin usar) — no relacionado con cambios recientes.

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
- **V1 (proyecto-local, obsoleta pero intacta)**: renombrada a `.opencode/agents/redesign-expert-v1.md`
  para liberar el nombre `redesign-expert` y que la global V2 tome precedencia en este y cualquier
  proyecto tras reiniciar opencode.
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
