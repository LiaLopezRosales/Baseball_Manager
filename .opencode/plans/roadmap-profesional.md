# Roadmap de Elevación a Nivel Profesional — Baseball Manager

Estado actual + benchmarking + plan priorizado para convertir este proyecto académico
en un portafolio de nivel profesional para puestos de desarrollo web (2026).

---

## 1. Estado actual del proyecto

### 1.1 Stack tecnológico
- **Backend**: Django 5.1 + Django REST Framework, PostgreSQL
- **Frontend**: React 18 (Create React App), JavaScript puro (sin TypeScript)
- **Auth**: Token-based (DRF), contraseñas en texto plano (intencional)
- **Reportes**: 9 reportes con SQL raw, exportación PDF/CSV vía plugin system
- **Tests**: 91 tests backend (unittest + MagicMock), 1 test frontend obsoleto

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

### 1.4 Puntuación con rúbrica PORTFOLIO_QUALITY.md

| Dimensión | Score | Bloqueador |
|---|---|---|
| D1 · README | 1/5 | 1 línea |
| D2 · Higiene repo | 2/5 | .env tracked, sin commitear |
| D3 · Código | 2/5 | Sin linting |
| D4 · Tests | 2/5 | Tests fallidos intencionalmente |
| D5 · CI/CD | 1/5 | No existe |
| D6 · Git history | 2/5 | Inactivo 1.5 años |
| D7 · Documentación | 2/5 | Fuentes sin integrar |
| D8 · Señales profesionalismo | 1/5 | Sin LICENSE, badges, demo |
| **Promedio** | **1.75/5** | Necesita ≥3 en todas |

---

## 2. Benchmarking

### Referencias del dominio

| Proyecto | Stack | Qué tiene que nosotros no |
|---|---|---|
| **Sportlyzer** (sports mgmt) | React + Node | Dark theme premium, gráficos Recharts, deployment público, CI |
| **Baseball Reference** | Custom | Dataviz masiva, filtros avanzados, responsive completo |
| **Retrospect** (sports analytics) | React + Python | Dashboards Plotly, deployment Render, README con screenshots |

### Gap summary

| Criterio | Nosotros | Referencia | Gap |
|---|---|---|---|
| UI/UX | Beige, Arial, tablas | Dark theme, tipografía custom, gráficos | Crítico |
| Dataviz | Tablas HTML | Charts interactivos | Crítico |
| Responsive | Layout fijo | Mobile-first | Alto |
| Loading/Error | "Cargando..." | Skeleton + Error Boundaries | Alto |
| Deployment | localhost | URL pública | Alto |
| CI/CD | Ninguno | Green badge | Medio |
| Dark mode | No | Toggle funcional | Medio |

---

## 3. Roadmap priorizado

### Fase 0 — Cimientos (P0, primero)

| # | Tarea | Verificación |
|---|---|---|
| 0.1 | **Levantar demo** — verificar venv, deps, makemigrations + migrate + populate_db + npm start | Backend :8000, frontend :3000 |
| 0.2 | **Fix tests rotos** — arreglar test_repositories.py + actualizar App.test.js | 0 failures en ambos |
| 0.3 | **Untrack .env** — git rm --cached, crear .env.example | .env fuera de跟踪 |
| 0.4 | **Commit pendiente** — docs migration, AGENTS.md | git status limpio |

### Fase 1 — Rediseño visual premium (P1, el mayor ROI)

**Decisión de diseño: "Diamond Plate" — Dark industrial + amber accent**

Estética oscura industrial con detalles dorados. No es el purple de AI. No es el
dark-mode-aburrido. Comunica: "esto es serio, esto es ingeniería."

| Variable | Valor | Uso |
|---|---|---|
| `--bg-primary` | `#0B0E11` | Fondo principal |
| `--bg-secondary` | `#141820` | Cards, sidebar |
| `--bg-tertiary` | `#1C2128` | Hover, inputs |
| `--accent` | `#F59E0B` | Highlights, botones activos |
| `--text-primary` | `#F1F5F9` | Texto principal |
| `--text-secondary` | `#94A3B8` | Texto secundario |
| `--border` | `#2D333B` | Bordes sutiles |
| `--font-display` | `Inter` | Headings |
| `--font-mono` | `JetBrains Mono` | Datos, métricas |

| # | Tarea | Detalle |
|---|---|---|
| 1.1 | Theme system — CSS variables globales | Dark mode como default |
| 1.2 | Sidebar rediseñada — compacta, iconos (lucide-react) | 60px collapsed, 240px expanded |
| 1.3 | Login premium — card centrada, gradient sutil | Centrado vertical+horizontal |
| 1.4 | Dashboard — bento grid con métricas clave | 2 grandes + 4 pequeñas cards |
| 1.5 | CRUD tables — dark, hover rows, sticky header | Componente DataTable reutilizable |
| 1.6 | Reports — tablas dark, export integrado | Skeleton loader |
| 1.7 | Tipografía — Inter + JetBrains Mono | Consistencia global |
| 1.8 | Micro-interacciones — hover scale, fade-in | CSS transitions + Framer Motion |
| 1.9 | Responsive — sidebar collapsible en mobile | @media 768px |
| 1.10 | Dark/Light toggle — persiste en localStorage | data-theme en html |

### Fase 2 — Features que demuestran skills (P2)

| # | Feature | Skill que demuestra | Pregunta en entrevista |
|---|---|---|---|
| 2.1 | **Dashboard con charts** — Recharts para wins, batting avg, pitcher stats | Data visualization | "Cuéntame de una feature con dataviz" |
| 2.2 | **Búsqueda y filtros frontend** — search bar, filtros por columna | State management | "¿Cómo manejas filtering?" |
| 2.3 | **Error Boundaries** — fallback UI en errores de render | Resiliencia | "¿Qué pasa si una parte falla?" |
| 2.4 | **Skeleton loading** — shimmer placeholders | UX, percepción de speed | "¿Cómo mejoras percepción de velocidad?" |
| 2.5 | **API centralizada** — api.js con baseURL configurable | Arquitectura, DRY | "¿Cómo organizas la comunicación?" |
| 2.6 | **Form validation** — validación en tiempo real | UX, state management | "¿Cómo validas input?" |

### Fase 3 — Professionalismo (P3)

| # | Tarea | Detalle |
|---|---|---|
| 3.1 | CI/CD — GitHub Actions: ruff + tests + npm test | Badge verde en README |
| 3.2 | Linting — ruff (Python) + ESLint (React) | 0 errores |
| 3.3 | Coverage — pytest-cov gate 60% | Badge coverage |
| 3.4 | Deployment — Railway (backend+DB+frontend) | URL pública |
| 3.5 | .editorconfig — indent, UTF-8, LF | Consistencia |
| 3.6 | LICENSE — MIT | Badge |
| 3.7 | README completo — value prop, quick start, screenshots, architecture, badges | Primer archivo del reclutador |
| 3.8 | Docker Compose — 1 comando para levantar todo | Quick start reproducible |

### Fase 4 — Diferenciación para entrevista (P4)

| # | Feature | Por qué destaca | Esfuerzo |
|---|---|---|---|
| 4.1 | Reportes PDF con branding — logo, headers, tablas | Plugin system ya existe | Medio |
| 4.2 | Simulador de campeonato visual — brackets/wins | Feature unique | Alto |
| 4.3 | Comparación de jugadores lado a lado | Interactive, UI design | Medio |
| 4.4 | Swagger/DRFBrowsableAPI pulido | DX signal | Bajo |

---

## 4. Orden de ejecución

```
Fase 0 (cimientos) → Fase 1 (UI premium) → Fase 2 (features) → Fase 3 (pro) → Fase 4 (diferenciación)
```

---

## 5. Decisiones pendientes del usuario

| Decisión | Opciones | Recomendación |
|---|---|---|
| Deployment | Railway vs Render vs Vercel | Railway (todo junto) |
| Charts | Recharts vs Chart.js vs Nivo | Recharts |
| Animaciones | CSS vs Framer Motion vs GSAP | Framer Motion |
| Component library | Custom CSS vs shadcn/ui vs Ant Design | shadcn/ui |
| Tipografía | Inter + JetBrains Mono | Ya definido |

---

## 6. Definition of Done

- [ ] `manage.py test db_structure` → 0 failures
- [ ] `npm test` → passes
- [ ] `ruff check .` → 0 errors
- [ ] UI dark theme + toggle dark/light
- [ ] Dashboard con ≥2 charts interactivos
- [ ] Responsive en 768px
- [ ] Skeleton loading states
- [ ] Error Boundaries
- [ ] API centralizada (sin hardcoded URLs)
- [ ] README completo con screenshots y badges
- [ ] LICENSE + .editorconfig
- [ ] CI/CD green badge
- [ ] Deployment público
- [ ] .env no trackeado, .env.example existe
- [ ] Git status limpio
