# Roadmap de Elevación a Nivel Profesional — Baseball Manager

Documento completo: estado actual, benchmarking, stack visual, fases, y especificaciones.

---

## 0. Estado de progreso (actualizado automáticamente por el agente)

> Registro de avance de ejecución. Cada fase se marca según su estado real en el código.

### Fase 0 — Cimientos (P0) ✅ Completada

| Todo | Estado |
|---|---|
| 0.x Fundamentos (levantar demo, fix tests, untrack `.env`, commits) | ✅ Hecho |

### Fase 1 — Rediseño visual premium (P1) ✅ Completada

| # | Todo | Estado |
|---|---|---|
| 5.1 | Theme system: variables CSS Diamond Plate + fuentes + dark baseline | ✅ Hecho |
| 5.2 | Sidebar rediseñada: collapsible 60/240px, iconos, logo, footer avatar | ✅ Hecho |
| 5.3 | Login premium: card centrada, glass, inputs con glow, fondo particles | ✅ Hecho |
| 5.4 | Dashboard (main-page): bento grid + métricas + hero + particles | ✅ Hecho |
| 5.5 | CRUD tables: DataTable reutilizable dark, paginación, búsqueda, loading, empty | ✅ Hecho |
| 5.6 | Reports: dark table, custom select, toolbar export, error boundary | ✅ Hecho |
| 5.7 | Responsive: breakpoints 768/1024, sidebar overlay | ✅ Hecho |
| 5.8 | Dark/Light toggle con persistencia localStorage | ✅ Hecho |
| 5.9 | Micro-interacciones: framer-motion hover, countup, transitions | ✅ Hecho |
| — | liquid-glass en panels destacados (stat cards accent) | ✅ Hecho |

**Fix tras revisión visual** (mantener dentro de Fase 1):
- Texto del hero ya no se corta: `TextGenerateEffect` pasa a animar palabra por palabra y permite wrap de líneas.
- Sidebar colapsada: los botones de colapso y tema ya no se superponen (se apilan en columna y el brand se oculta); el botón de colapso queda accesible para descontraer.
- Corregidas colisiones de CSS global: `Queries.css` y `PlayerSwapForm.css` ya no inyectan un fondo gradiente + Times New Roman que pisaba el tema; `BaseCRUD.css` escopa sus selectores (`.form-group`, `.toggle-password`, etc.) bajo `.item-form` para no romper el login.
- Login premium refinado: botón ✕ del modal ahora es un botón circular (34px, `--bg-elevated`, hover accent) bien posicionado; los iconos (mail, candado, ojo) se alinean con el texto real del input (ver técnica de centrado en `AGENTS.md` y `PLAN_LAYOUT_LANDING.md`).
- Corregidos 4 errores de ESLint que bloqueaban el build (vars sin usar en `PlayerSwapForm.jsx`, `Queries.jsx`, `admin.jsx`).

### Fase 2 — Features que demuestran skills (P2) ⏳ Pendiente

| # | Todo | Estado |
|---|---|---|
| 2.1 | Dashboard con charts (Recharts + ECharts-GL) | ⬜ No iniciado |
| 2.2 | Búsqueda y filtros frontend (URL sync) | ⬜ No iniciado |
| 2.3 | Error Boundaries en routes principales | ⬜ No iniciado |
| 2.4 | Skeleton loading states en todas las vistas | ⬜ No iniciado |
| 2.5 | API centralizada (sin hardcoded URLs) | ⬜ No iniciado |
| 2.6 | Form validation en tiempo real | ⬜ No iniciado |

### Fase 3 — Professionalismo (P3) ⏳ Pendiente

| # | Todo | Estado |
|---|---|---|
| 3.1 | CI/CD GitHub Actions | ⬜ No iniciado |
| 3.2 | Linting (ruff + ESLint) | ⬜ No iniciado |
| 3.3 | Coverage gate | ⬜ No iniciado |
| 3.4 | Deployment Railway | ⬜ No iniciado |
| 3.5 | .editorconfig | ⬜ No iniciado |
| 3.6 | LICENSE MIT | ⬜ No iniciado |
| 3.7 | README completo | ⬜ No iniciado |
| 3.8 | Docker Compose | ⬜ No iniciado |

### Fase 4 — Diferenciación (P4) ⏳ Pendiente

| # | Todo | Estado |
|---|---|---|
| 4.1 | Reportes PDF con branding | ⬜ No iniciado |
| 4.2 | Simulador de campeonato visual | ⬜ No iniciado |
| 4.3 | Comparación de jugadores lado a lado | ⬜ No iniciado |
| 4.4 | Swagger/DRFBrowsableAPI pulido | ⬜ No iniciado |

---

## 1. Estado actual del proyecto

### 1.1 Stack tecnológico
- **Backend**: Django 5.1 + Django REST Framework, PostgreSQL
- **Frontend**: React 18 (Create React App), JavaScript puro (sin TypeScript)
- **Auth**: Token-based (DRF), contraseñas en texto plano (intencional)
- **Reportes**: 9 reportes con SQL raw, exportación PDF/CSV vía plugin system
- **Tests**: 91 tests backend (unittest + MagicMock), 2 tests frontend (passing; `App.test.js` actualizado)

### 1.2 Lo que existe de verdad (verificado en código)
- CRUD completo para 18 entidades (Repository + BaseViewSet + Serializer)
- Login con roles (Admin, Director Técnico, Usuario General)
- Sistema de reportes con parámetros dinámicos y exportación
- Filtros dinámicos sobre modelos
- Sidebar con navegación por secciones
- Poblador de base de datos con Factory Boy

### 1.3 Problemas críticos

| Problema | Evidencia |
|---|---|
| Tests intencionalmente fallidos | `test_repositories.py:38,82,212,226` |
| Frontend test obsoleto | `App.test.js` busca "learn react" |
| `.env` con password real commiteado | `.env` → `DB_PASSWORD=101511` |
| Sin CI/CD | No hay workflows |
| Sin linting/formatting | No hay ruff, eslint config, .editorconfig |
| Sin LICENSE | No existe |
| README vacío | 1 sola línea |
| Trabajo sin commitear | Migración docs y AGENTS.md sin commit |
| UI obsoleta | Beige + Arial, tablas planas, sin dark mode |
| Hardcoded URLs | `localhost:8000` en múltiples componentes |
| Sin responsive | Layout fijo con `margin-left: 330px` |
| Sin Error Boundaries | Cada componente maneja errores solo |
| Sin loading states | Solo texto "Cargando..." |

### 1.4 Puntuación PORTFOLIO_QUALITY.md

| Dimensión | Score |
|---|---|
| D1 · README | 1/5 |
| D2 · Higiene repo | 2/5 |
| D3 · Código | 2/5 |
| D4 · Tests | 2/5 |
| D5 · CI/CD | 1/5 |
| D6 · Git history | 2/5 |
| D7 · Documentación | 2/5 |
| D8 · Señales profesionalismo | 1/5 |
| **Promedio** | **1.75/5** (necesita ≥3) |

---

## 2. Benchmarking

| Proyecto | Stack | Gap con nosotros |
|---|---|---|
| **Sportlyzer** | React + Node | Dark theme premium, Recharts, deployment, CI |
| **Baseball Reference** | Custom | Dataviz masiva, filtros, responsive |
| **Retrospect** | React + Python | Dashboards Plotly, deployment Render |

| Criterio | Nosotros | Estándar 2026 | Gap |
|---|---|---|---|
| UI/UX | Beige, Arial, tablas | Dark theme, tipografía custom, gráficos | Crítico |
| Dataviz | Tablas HTML | Charts interactivos + 3D | Crítico |
| Responsive | Layout fijo | Mobile-first | Alto |
| Loading/Error | "Cargando..." | Skeleton + Error Boundaries | Alto |
| Deployment | localhost | URL pública | Alto |

---

## 3. Stack visual premium decidido

### 3.1 Paleta de colores: "Diamond Plate" — Dark industrial + amber accent

| Variable | Valor | Uso |
|---|---|---|
| `--bg-primary` | `#0B0E11` | Fondo principal |
| `--bg-secondary` | `#141820` | Cards, sidebar |
| `--bg-tertiary` | `#1C2128` | Hover, inputs |
| `--accent` | `#F59E0B` | Highlights, botones activos |
| `--accent-muted` | `#D97706` | Hover accent |
| `--text-primary` | `#F1F5F9` | Texto principal |
| `--text-secondary` | `#94A3B8` | Texto secundario |
| `--border` | `#2D333B` | Bordes sutiles |
| `--danger` | `#EF4444` | Errores |
| `--success` | `#10B981` | Éxito |

### 3.2 Tipografía

| Fuente | Uso | Dónde |
|---|---|---|
| **Inter** | Headings, UI general | Google Fonts, `--font-display` |
| **JetBrains Mono** | Datos, métricas, tablas, stats | Google Fonts, `--font-mono` |

### 3.3 Librerías de UI y animación

#### Capa 1 — En todos ladas (~36KB gzipped total)

| Librería | Para qué | Bundle |
|---|---|---|
| **Magic UI** | Bento grid, number ticker, glow cards, dock nav, animated beams | ~0 (copy-paste) |
| **react-tilt** | Cada card de stat con parallax 3D tipo Apple TV | ~6KB |
| **liquid-glass-component** | Paneles glass tipo Apple para standings/stats | ~3KB |
| **Premium React Loaders** | MorphBlob, GradientSpinner (70+ opciones, pure CSS) | ~0 |
| **Framer Motion** | Transiciones, page transitions, hover effects, scroll | ~30KB |

#### Capa 2 — Momentos hero (lazy-loaded)

| Librería | Para qué | Cuándo cargar |
|---|---|---|
| **React Three Fiber + drei** | 1-2 elementos 3D: baseball giratorio, trofeo | Landing/player detail |
| **Spline React** | Un elemento 3D interactivo (diseñado sin código) | Home page |
| **ECharts-GL** | 1-2 charts 3D standout | Reports |
| **tsParticles** | Confetti en victorias, fondo sutil | Eventos específicos |

#### Capa 3 — Extras premium

| Librería | Para qué | Bundle |
|---|---|---|
| **react-3d-card** | Flip cards para stats básicas/avanzadas | ~5KB |
| **Aceternity UI** | Spotlight cards para hero sections | ~0 (copy-paste) |

### 3.4 Estrategia de bundle

- **Siempre cargado**: shadcn/ui + Framer Motion + Magic UI + react-tilt + liquid-glass + Premium React Loaders = ~36KB gzipped
- **Lazy-loaded**: Three.js/R3F + ECharts-GL + Spline = solo cuando se visita la página
- **Condicional**: tsParticles = solo en eventos específicos (confetti)

---

## 4. Fase 0 — Cimientos (P0)

**Objetivo**: Que el proyecto funcione, los tests pasen, y el repo esté limpio.

| # | Tarea | Archivos | Verificación |
|---|---|---|---|
| 0.1 | **Levantar demo** — verificar venv, instalar deps, makemigrations + migrate + populate_db + npm start | — | Backend :8000, frontend :3000, login funcional |
| 0.2 | **Fix tests rotos** — arreglar assertions intencionalmente falsos en test_repositories.py (L38,82,212,226) | `db_structure/tests/test_repositories.py` | `manage.py test db_structure` → 0 failures |
| 0.3 | **Actualizar App.test.js** — reemplazar boilerplate CRA con test mínimo que pase | `Baseball_Management/src/App.test.js` | `npm test` → pass |
| 0.4 | **Untrack .env** — `git rm --cached .env Baseball_Management/.env`, crear `.env.example` con placeholders | `.env`, `.env.example`, `.gitignore` | `.env` fuera de跟踪 |
| 0.5 | **Commit pendiente** — docs migration, AGENTS.md, todos los fixes | Todos los archivos untracked | `git status` limpio |

**Orden**: 0.1 → 0.2 → 0.3 → 0.4 → 0.5

---

## 5. Fase 1 — Rediseño visual premium (P1)

**Objetivo**: Transformar la UI de beige/Arial a "Diamond Plate" dark industrial. Mayor ROI de todo el roadmap.

### 5.1 Theme system

| Archivo | Cambio |
|---|---|
| `index.css` | Variables CSS globales en `:root`, importar Inter + JetBrains Mono |
| `App.css` | Body background `#0B0E11`, tipografía global, dark mode como default |
| `package.json` | Agregar dependencias: framer-motion, lucide-react |

### 5.2 Sidebar rediseñada

| Aspecto | Actual | Nuevo |
|---|---|---|
| Ancho | 280px fijo | 60px collapsed, 240px expanded |
| Navegación | Texto plano con ▶/▼ | Iconos (lucide-react) + texto, animación |
| Logo | Imagen JPEG | SVG o imagen optimizada, encogible |
| Footer | Botón "Cuenta" | Avatar + nombre + dropdown |
| Colores | `rgba(47,79,79,0.1)` | `#141820` con border derecho `#2D333B` |

### 5.3 Login premium

| Aspecto | Actual | Nuevo |
|---|---|---|
| Posición | Absolute bottom-left | Centro vertical+horizontal de la pantalla |
| Estilo | Formulario plano | Card centrada con glass effect sutil, gradient border |
| Inputs | Básicos | Border glow on focus, iconos (mail, lock) |
| Botón | Azul genérico | Accent amber con hover glow |
| Background | Beige | `#0B0E11` con patrón sutil o particles |

### 5.4 Dashboard (main-page)

| Aspecto | Actual | Nuevo |
|---|---|---|
| Layout | Párrafo de texto | Bento grid asimétrico (2 grandes + 4 pequeñas cards) |
| Métricas | Ninguna | Total equipos, Total jugadores, Total juegos, Season activa, Wins promedio |
| Cards | Ninguna | react-tilt parallax, icono + Number Ticker + label |
| Fondo | `#8fd9f9` | `#0B0E11` con Magic UI Particles sutil |
| Header | h1 plano | Text Generate Effect (Aceternity) |

### 5.5 CRUD Tables

| Aspecto | Actual | Nuevo |
|---|---|---|
| Componente | Cada form es único | `DataTable` reutilizable |
| Estilo tabla | HTML plano | Dark rows, hover glow, sticky header |
| Paginación | Ninguna | Paginación con Number Ticker |
| Búsqueda | Ninguna | Search bar con filtro en tiempo real |
| Loading | "Cargando..." | MorphBlob o Shimmer skeleton |
| Empty state | Ninguno | Ilustración + mensaje amigable |
| Actions | Botones básicos | Icon buttons con tooltip (edit, delete) |

### 5.6 Reports

| Aspecto | Actual | Nuevo |
|---|---|---|
| Tabla | HTML plano | Dark table con accent headers |
| Params | `<select>` genérico | Custom select con glass effect |
| Export | Botón separado | Integrado en toolbar con iconos PDF/CSV |
| Loading | "Cargando..." | GradientSpinner |
| Error | "Error: {msg}" | Error Boundary con retry |
| Header | h1 plano | Text Generate Effect |

### 5.7 Responsive

| Breakpoint | Comportamiento |
|---|---|
| `>1024px` | Sidebar expanded, layout completo |
| `768-1024px` | Sidebar collapsed (solo iconos), grid 2 columnas |
| `<768px` | Sidebar overlay, grid 1 columna, tables scroll horizontal |

### 5.8 Dark/Light toggle

- Botón en sidebar (icono sun/moon de lucide-react)
- Persiste en `localStorage`
- Cambia `data-theme` en `<html>`
- Light theme: `--bg-primary: #F8FAFC`, `--bg-secondary: #FFFFFF`, accent mantiene amber

### 5.9 Micro-interacciones

| Elemento | Animación |
|---|---|
| Cards | `scale(1.02)` on hover, shadow shift |
| Botones | Framer Motion whileHover/whileTap |
| Sidebar items | Background slide-in on hover |
| Page transitions | AnimatePresence fade + slide |
| Stat numbers | CountUp animation on mount |
| Tables | Row fade-in stagger on load |

---

## 6. Fase 2 — Features que demuestran skills (P2)

**Objetivo**: Cada feature = una pregunta de entrevista que puedes defender.

### 6.1 Dashboard con charts (Recharts + ECharts-GL)

| Chart | Librería | Datos | Dónde |
|---|---|---|---|
| Wins por equipo (barras animadas) | Recharts | `get_team_score_statistics` | Dashboard |
| Batting average distribution (radar) | Recharts | `get_top_batting_average_players` | Dashboard |
| Season progression (line chart) | Recharts | Juegos por serie | Dashboard |
| 3D team comparison (bar3D) | ECharts-GL | Stats combinados | Reports section |

### 6.2 Búsqueda y filtros frontend

- Search bar en `DataTable` que filtra por todas las columnas
- Filtros por columna (dropdown por campo)
- URL sync (filtros preservados en query params)

### 6.3 Error Boundaries

- `ErrorBoundary` component global que captura errores de render
- Fallback UI con retry button + ilustración
- Wrapping en routes principales

### 6.4 Skeleton loading states

- Skeleton components que replican la forma del contenido real
- Shimmer animation CSS
- Uso en todas las vistas de datos (tablas, dashboard, reports)

### 6.5 API centralizada

```javascript
// services/api.js
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const api = {
  get: (path) => fetch(`${API_BASE}${path}`, { headers: authHeaders() }).then(handleResponse),
  post: (path, data) => fetch(`${API_BASE}${path}`, { method: 'POST', body: JSON.stringify(data), headers: { ...authHeaders(), 'Content-Type': 'application/json' } }).then(handleResponse),
  // ...
};
```

### 6.6 Form validation

- Validación en tiempo real (onChange)
- Feedback visual (borde rojo + mensaje debajo del input)
- Validación antes del submit
- Mensajes de error en español

---

## 7. Fase 3 — Professionalismo (P3)

**Objetivo**: Señales de que sabes lo que haces más allá del código.

### 7.1 CI/CD — GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: pip install -r requirements.txt
      - run: ruff check .
      - run: python manage.py test db_structure
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: cd Baseball_Management && npm ci
      - run: npm test -- --watchAll=false
      - run: npm run build
```

### 7.2 Linting

**Python** — `ruff` en `pyproject.toml`:
```toml
[tool.ruff]
line-length = 100
select = ["E", "F", "I", "W"]
```

**React** — Verificar ESLint de CRA, agregar reglas custom si necesario.

### 7.3 Coverage

```bash
pip install pytest-cov
pytest --cov=db_structure --cov-report=badge --cov-report=term
```
Badge de coverage en README.

### 7.4 Deployment — Railway

- **Servicio 1**: Django backend (Python buildpack)
- **Servicio 2**: PostgreSQL (plugin Railway)
- **Servicio 3**: React frontend (Node buildpack, o servir desde Django)
- Variables de entorno en Railway dashboard (no .env en repo)
- URL pública tipo `baseball-manager.up.railway.app`

### 7.5 .editorconfig

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{js,jsx,css,json}]
indent_style = space
indent_size = 2

[*.{py,html}]
indent_style = space
indent_size = 4
```

### 7.6 LICENSE

MIT License — archivo `LICENSE` en raíz + badge en README.

### 7.7 README completo

```markdown
# ⚾ Baseball Manager

> Plataforma de gestión de campeonatos de béisbol con dashboard interactivo,
> reportes con exportación PDF/CSV, y control de roles.

## Quick Start
... (comandos reproducibles desde clone limpio)

## Features
... (tabla con features verificadas en código)

## Architecture
... (diagrama: React → DRF API → PostgreSQL)

## Tech Stack
... (tabla de tecnologías)

## Screenshots
... (capturas reales del dashboard dark mode)

## Testing
- 91 backend tests (pytest)
- CI badge
- Coverage badge

## License
MIT
```

### 7.8 Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build: .
    ports: ["8000:8000"]
    depends_on: [db]
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: campeonatos
      POSTGRES_USER: lia
      POSTGRES_PASSWORD: ${DB_PASSWORD}
  frontend:
    build: ./Baseball_Management
    ports: ["3000:3000"]
```

---

## 8. Fase 4 — Diferenciación para entrevista (P4)

**Objetivo**: Features que nadie más tiene y que generan conversación.

### 8.1 Reportes PDF con branding

- Logo del proyecto en header de cada PDF
- Tablas formateadas con colores del theme
- Headers con fecha, nombre del reporte, filtros aplicados
- Footer con paginación
- Usar el plugin system existente (`api/reports/exports/`)

### 8.2 Simulador de campeonato visual

- UI que muestra el bracket/progreso de una temporada
- Animación de partidos siendo "jugados"
- Highlight del equipo ganador con confetti (tsParticles)
- Timeline visual de la temporada

### 8.3 Comparación de jugadores lado a lado

- Selector de 2 jugadores
- Vista side-by-side con radar charts (Recharts)
- Highlight de qué jugador gana en cada categoría
- Animación de transición al cambiar selección

### 8.4 Swagger/DRFBrowsableAPI pulido

- Documentación de endpoints con ejemplos
- Autenticación token visible en la UI
- Ejemplos de request/response

---

## 8.5. Fase B — Landing pública, perfiles y charts (completada)

| Subfase | Descripción | Estado |
|---|---|---|
| B1 | Migración de enrutado de `selectedOption` a React Router con rutas URL reales | ✅ |
| B2 | Landing pública con stats, standings, líderes de bateo, estrellas, campeones | ✅ |
| B3 | Perfiles navegables `/equipo/:id` y `/jugador/:id` con enlaces desde landing | ✅ |
| B4 | Charts ECharts (barras para standings + radar para perfil de jugador) | ✅ |
| B5 | Guard de protección por rol (`ProtectedRoute`) en rutas admin y DT | ✅ |
| B6 | Verificación final (build, tests) y docs (AGENTS.md, este roadmap) | ✅ |

**Archivos creados en Fase B:**
- `src/routes.js`, `src/path.js`, `src/viewRoutes.jsx` — sistema de rutas URL
- `src/components/Landing.jsx`, `src/components/landing.css` — landing pública
- `src/components/profilePages.jsx`, `src/components/profilePages.css` — perfiles equipo/jugador
- `src/components/ProtectedRoute.jsx` — guard por rol
- `src/components/ui/BarChart.jsx`, `src/components/ui/RadarChart.jsx` — charts ECharts

---

## 9. Definition of Done

> Estado tras completar Fase 0, Fase 1 y Fase B. Items pendientes pertenecen a Fases 2–4.

- [x] `manage.py test db_structure` → 0 failures (91 tests OK)
- [x] `npm test` → passes (2 tests)
- [ ] `ruff check .` → 0 errors
- [x] UI dark theme "Diamond Plate" funcional
- [x] Toggle dark/light funcional y persistente
- [x] Dashboard con ≥2 charts interactivos (barras standings + radar perfil jugador, ECharts)
- [ ] 1 chart 3D (ECharts-GL) (pendiente)
- [x] Responsive en 768px breakpoint
- [x] Skeleton loading states en las vistas de datos (dashboard + CRUD; reports usa spinner)
- [x] Error Boundaries implementados
- [x] API centralizada (sin hardcoded URLs en los componentes migrados)
- [x] react-tilt en todas las stat cards
- [x] liquid-glass en panels destacados (stat cards accent del dashboard)
- [x] Framer Motion en page transitions y hover
- [ ] README con quick start, screenshots, architecture, badges
- [ ] LICENSE (MIT) + .editorconfig
- [ ] CI/CD green badge
- [ ] Deployment público en Railway
- [x] .env no trackeado, .env.example existe
- [x] Git status limpio

---

## 10. Decisiones del usuario (confirmadas)

| Decisión | Elección |
|---|---|
| Deployment | Railway |
| UI library | Stack premium: Magic UI + react-tilt + liquid-glass + Framer Motion |
| Charts | Recharts + ECharts-GL para 3D |
| Animaciones | Framer Motion + React Three Fiber (hero moments) |
| 3D | Spline React + R3F para elementos show-stopping |
| Loading | Premium React Loaders (MorphBlob, GradientSpinner) |
| Colores | Dark industrial "Diamond Plate" + amber accent |
| Tipografía | Inter + JetBrains Mono |
