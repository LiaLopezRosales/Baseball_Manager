# Plan: Corrección de layout CSS + Refactor a Landing Pública

Estado: En ejecución - Sección A iniciada (2026-09-03)

## Contexto / motivación

La aplicación es una tool de administración/CRUD para campeonatos de béisbol.
Para un usuario común no es atractiva ni cómoda de navegar: solo permite
manipular y consultar una base de datos. Además presenta numerosos errores
de colocación gráfica ("mala colocación") que rompen el tema visual Diamond
Plate.

Este plan tiene dos frentes:

- **Fase A** — Corregir los errores de layout/posicionamiento CSS.
- **Fase B** — Refactor de propósito y presentación hacia una **landing
  pública** que atraiga visitas (standings, líderes, campeones, perfiles de
  equipo/jugador, gráficos ECharts-GL).

## Decisiones de alcance (confirmadas por el usuario)

- **Alcance Fase B:** Landing pública atractiva + perfiles de equipo/jugador.
- **Charts:** ECharts-GL (permite gráficos 3D distintivos; agrega ~1MB+).
- **Acceso:** la home y la información pública son accesibles **sin login**
  para todos los visitantes; el CRUD de admin queda tras login por rol.

---

## FASE A — Corrección de errores de colocación gráfica

### A1. Restaurar el tema global (CRÍTICO)
Los archivos `Queries.css` y `PlayerSwapForm.css` declaran un bloque global
`body, header { background: linear-gradient(45deg,#49a09d,#5f2c82);
font-family: 'Times New Roman' }`. Como CRA bundlea todo el CSS importado
de forma global, estas reglas **sobreescriben el tema dark de `index.css`
en toda la app** (fondo morado/teal + Times New Roman en vez del tema
Diamond Plate).

- [x] `Queries.css`: eliminar el bloque `html, body, header` y el
  `body, header`; dejar solo selectores scoped `.queries-*`.
- [x] `PlayerSwapForm.css`: eliminar el bloque `body, header` (y los
  selectores genéricos table/th/td, ahora scoped bajo `.player-swap-form`).
- [x] `PlayerSwapTable.css`: reescribir completo a variables del tema
  (quitar `#5f2c82`/`#0e599b`, `min-width:800px`, fuentes de 50-62px,
  Times New Roman).

### A2. Modal / Login
- [x] `Modal.css`: añadir `position: relative` a `.modal-content` para que el
  botón ✕ (`.modal-close`, `position: absolute`) se ancle al modal y no al
  viewport.
- [x] `login.css`: quitar `min-height: 70vh` del `.login-board` (evita que el
  modal de login ocupe el 70% de la pantalla).
- [x] `App.css` (líneas ~139-150): eliminar el bloque `.login` huérfano
  (carta stale posicionada fixed bottom-right; el login real es
  `.login-board` en el modal).

### A3. Estructura de layout
- [x] Resolver el doble padding: `MainPage` renderiza `class="base-page
  dashboard"` y ambas clases declaran `padding` (24px / 28px). Dejar un solo
  dueño del padding. → Se dejó solo `.dashboard` (se quitó `base-page` de
  MainPage).
- [x] Unificar `max-width` + padding: `.content` (1280px) vs
  `.base-crud-container` / `.reports-container` (1400px) con padding doble.
  → `.content` es el único dueño del ancho; los contenedores internos solo
  tienen `padding`.
- [x] Eliminar `UserCRUD.jsx` muerto en `src/components/` (el real está en
  `src/components/FormulariosCRUD/UserCRUD.jsx`).

### A4. Verificación
- [x] `npm run build` (exit 0).
- [x] Tests frontend (`CI=true npm test`) y backend (`manage.py test
  db_structure`).
- [ ] Revisión visual en `npm start` (login, sidebar colapsada, dashboard,
  tablas, reports).

---

## FASE B — Refactor de presentación: landing pública + perfiles

### Estrategia
Convertir el shell actual (enrutado por estado `selectedOption`) en una
**experiencia pública orientada al visitante**, manteniendo el CRUD para
admin por rol. Aprovechar los 9 reportes existentes (ya públicos) y los
endpoints DRF (equipos, jugadores, juegos, temporadas, series) como fuente
de datos; el seed (`populate_db.py`) ya genera volumen realista.

### B1. Enrutado real por URL
- [ ] Migrar el shell de `selectedOption`-state a rutas React Router reales
  en la parte pública (URLs compartibles/recargables para perfiles).
- [ ] Mantener (o reflejar en rutas paralelas) el shell de admin.

### B2. Landing pública (sin login)
- [ ] Rehacer la home (`MainPage`) como landing que cuente la historia del
  campeonato:
  - Hero con CTA (particles + text-reveal existentes).
  - Tabla de posiciones (standings) en vivo → `get_teams_by_series`.
  - Líderes: top-10 bateo (`get_top_batting_average_players`) y pitchers
    (`get_pitcher_wins_and_running_average`).
  - Campeones por temporada (`get_final_winner_teams_and_coaches`) → línea
    de tiempo.
  - Jugadores estrella (`get_star_players_for_series`).
  - Mantener las stat cards de conteo como parte del diseño.

### B3. Perfiles navegables
- [ ] Perfil de equipo: roster (reporte de jugadores por serie),
  estadísticas de juegos (`get_team_score_statistics`), efectividad,
  victorias/derrotas.
- [ ] Perfil de jugador: avg de bateo, ERA/ganados (si es pitcher),
  efectividad por posición, equipos/series.
- [ ] Navegación clickeable desde landing y leaderboards.

### B4. Charts con ECharts-GL
- [ ] Instalar `echarts` + `echarts-for-react` + `echarts-gl`.
- [ ] Gráficos 3D distintivos: barras 3D de wins por equipo, superficie de
  progresión de temporada, scatter 3D de jugadores.
- [ ] Gráficos 2D para legibilidad: ranking de barras, líneas de progreso de
  puntos, radar de jugadores estrella.

### B5. Experiencia no autenticada
- [ ] Home e info pública accesibles sin login.
- [ ] Botón "Entrar" → modal de login para acceder a CRUD/swap por rol.
- [ ] Guard: rutas admin (Formularios) requieren rol Admin; DT requieren su
  rol; el visitante ve solo la parte pública.

### B6. Verificación final + docs
- [ ] Build + tests.
- [ ] Actualizar `ROADMAP_PROFESIONAL.md` y todos.
- [ ] Commits conventional: fix de layout y feat de landing.

---

## Estado de progreso (checklist Fase A)

- [x] Documentar planes.
- [x] A1 tema global
- [x] A2 modal/login
- [x] A3 estructura
- [ ] A4 verificación visual pendiente (build/tests OK)

---

## Apéndice — Habilitador de revisión visual de la UI

Para que un agente pueda "ver" cómo queda la UI mientras edita se necesitan
**dos piezas** (ninguna modelo de LLM ve el navegador por sí solo):

1. **Modelo con visión** (para interpretar el screenshot). Entre los models
   gratis de OpenCode Zen, solo estos aceptan imagen:
   - `opencode/muse-spark-1.3-contributor-free` (recomendado)
   - `opencode/muse-spark-1.2-contributor-free`
   - `opencode/mimo-v2.5-free`
   Los demás (Ling 3.0 Flash Fin, Nemotron 3.5 Lightning, Nemotron 3 Ultra,
   Big Pickle) son solo texto y NO pueden ver imágenes.
2. **MCP de navegador** (para capturar la UI): configurado en
   `opencode.json` del proyecto con `@playwright/mcp` (Chromium headless,
   permite navegar a `localhost:3000`). Verificado: responde al handshake
   JSON-RPC.

### Pasos para usarlo
1. Reiniciar opencode para que cargue el nuevo MCP (`opencode.json` no se
   hot-recarrega).
2. En la sesión, `/models` → seleccionar un modelo con visión
   (p. ej. `Muse Spark 1.3 Free`).
3. El agente lanza `cd Baseball_Management && npm start`, usa la herramienta
   de navegador del MCP para navegar a `http://localhost:3000`, toma
   screenshots y los interpreta él mismo.
