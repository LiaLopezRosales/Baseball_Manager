# Plan: Enlaces de la landing + Páginas de reemplazo temporal

Estado: Ejecutado (2026-09-17). Enlaces equipo/jugador/nav/callout y footer
re-mapeados; 10 páginas informativas creadas con un `InfoPage` unificado
(estilo landing, sin referencia externa propia) — 9 estáticas + `/altas-bajas`
funcional. Se añadieron además `/comision-arbitraje` y `/sala-prensa`.

## Contexto / motivación

La landing pública (Fase B) tiene muchos elementos visuales que deberían llevar
al usuario a más información, pero la mayoría están "muertos" (texto plano sin
click). Además, varias etiquetas del footer y de la tabla de posiciones apuntan a
destinos mentirosos o inexistentes:

- Nombres de **equipos y jugadores** no llevan a sus páginas de perfil.
- El enlace **"REGLAMENTO SERIE 2026"** scrollea a `#reglamento`, ancla que **no
  existe** → el click no hace nada.
- El footer usa etiquetas de marketing ("Protocolo Antidopaje", "Comisión de
  Arbitraje", "API Pública"...) que no describen la página real a la que enrutan.

El usuario definió una regla y la aclaró durante la sesión:

> "La dinámica es si el nombre sugiere una sección que no tenemos, la creamos" →
> aclarado: "cuando me refiero a secciones nuevas, digo **páginas**".

Es decir: cada etiqueta que sugiera una página inexistente se resuelve creando
una **página de reemplazo temporal** con contenido genérico estándar y una
advertencia en letras pequeñas indicando que es ficticio y un reemplazo
provisional.

---

## Decisiones confirmadas por el usuario

1. **Enlaces de equipos → `/equipo/:id`**: en TODOS los puntos propuestos
   (tabla de posiciones, Próximos Juegos, estrellas y podio, chips de marcadores
   del bento y nombre del equipo en la tarjeta del hero).
2. **Enlaces de jugadores → `/jugador/:id`**: en el podio de bateo (top 3) y en
   las tarjetas de Jugadores Estrella por posición.
3. **"REGLAMENTO SERIE 2026"** ya no scrollea a `#reglamento`: **navega a la
   página `/reglamento`** (se elimina el handler de scroll interno).
4. **10 páginas de reemplazo** confirmadas (ver tabla abajo).
5. **`/altas-bajas` funcional**: lista movimientos reales de `PlayerSwap` vía
   `POST /api/queries/dinamic-filter/`; si viene vacío o falla → aviso +
   disclaimer.
6. **Etiquetas del footer**: se mantienen como están (marketing, fiel al
   mockup); se cambia solo el **destino**.
7. **Nav**: convertir los `<a href>` de `LandingHeader` en `<Link>` de
   react-router (navegación SPA sin recarga) conservando la protección del
   Comparador.
8. **Tabs Div. Norte/Sur**: se mantienen deshabilitados (fiel al mockup).
9. **Callout**: comportamiento por rol —
   - "Portal de Cambios": si `rol === 'Director Técnico'` → `/dt/cambios`; si
     no → **modal de login** (ya no `/registro`).
   - "Gestión de Liga (Admin)": si `rol === 'Admin'` → `/admin/posiciones`; si
     no → **modal de login**.
10. **Estilo de las páginas nuevas**: *pendiente* — el usuario indicó "el estilo
    te lo voy a dar a continuación". No se deben implementar las páginas hasta
    recibirlo.

### Decisión en paralelo (anterior al alcance actual, ya ejecutada)

- Commit `b8e7fe0`: layout fluido adaptativo (8 contenedores fluidos con
  `--lnd-gutter: clamp(1.25rem, 4vw, 3rem)`), panel "Próximos Juegos" en la 3ª
  columna del grid de posiciones a `@media (min-width: 1600px)`, y corrección de
  `populate_db.py` (fechas de temporada ancladas a `now - 320 días` y usuario DT
  construido antes del INSERT por la constraint `TD_id`). La BD fue re-sembrada
  (304 juegos, 64 sin score, 5 futuros al 2026-09-14).

---

## Enlaces equipo/jugador — mapa de datos

Los IDs parten de datos ya cargados en `Landing.jsx` (9+ endpoints). La regla de
orte en todas partes: **si el id existe → Link; si no → texto plano** (fallback).

| Elemento | Texto a enlazar | Destino | De dónde sale el id |
|---|---|---|---|
| Tabla de posiciones | `row.name` (celda `.landing__table-team`) | `/equipo/${row.id}` | `row.id` (team id, ya usado en hero) |
| Próximos Juegos | `g.localTeam.name` y `g.rivalTeam.name` | `/equipo/${g.localTeam.id}` / `...rivalTeam.id` | `g.localTeam.id` / `g.rivalTeam.id` |
| Estrellas por posición | `star.fullName` y `star.team` | `/jugador/${star.bp.id}` y `/equipo/${star.team.id}` | `star.bp` y `star.team` ya guardados en el useMemo |
| Podio de bateo | `player.name` y `player.teamName` | `/jugador/${player.playerId}` y `/equipo/${player.teamId}` | **hay que añadir** `playerId: bp?.id ?? null` y `teamId: team?.id ?? null` al objeto de `podiumData` |
| Bento — chips de marcadores | iniciales de ganador/perdedor | `/equipo/${sc.winner}` y `/equipo/${sc.loser}` | `sc.winner` / `sc.loser` (ya son team ids) |
| Hero — nombre del líder | `leader.Equipo` / `leader.name` | `/equipo/${leader.id}` | `leader.id` (además del botón existente) |

Nota: el perfil `/jugador/:id` espera el **id de `BaseballPlayer`** (usa
`/baseball-players/${bpId}/`); `star.bp.id` y el futuro `podiumData.playerId`
son ids de BaseballPlayer. El perfil `/equipo/:id` espera el **id de `Team`**.

---

## Las 10 páginas de reemplazo

Todas públicas, con contenido genérico estándar y la advertencia en letra
pequeña (ver patrón abajo). Mapeo etiqueta del footer → página:

| # | Etiqueta actual (footer) | Ruta nueva | Contenido genérico |
|---|---|---|---|
| 1 | Reglamento de Campeonato 2025 · "REGLAMENTO SERIE 2026" (tabla) | `/reglamento` | Reglamento estándar de competición: formato de liga, reglas de juego, puntuación, criterios de clasificación y disciplina |
| 2 | Protocolo Antidopaje | `/protocolo-antidopaje` | Política antidopaje genérica: sustancias prohibidas, controles y sanciones |
| 3 | Altas y Bajas Semanales | `/altas-bajas` | **Funcional**: últimos `PlayerSwap` (dinamic-filter). Si vacío/falla → aviso + disclaimer |
| 4 | Comisión de Arbitraje | `/comision-arbitraje` | Reglas de arbitraje genéricas + proceso de protestas/impugnaciones |
| 5 | Sala de Prensa y Acreditaciones | `/sala-prensa` | Acreditación de prensa genérica: requisitos y canales |
| 6 | Federación Deportiva Nacional | `/federacion` | Info de federación genérica + CTA a `/registro` |
| 7 | API Pública de Estadísticas | `/api-publica` | Documentación ilustrativa de los endpoints públicos (reportes, consultas) |
| 8 | Cuadro de Play-Offs | `/playoffs` | Cuadro de llaves genérico (placeholder, sin datos reales) |
| 9 | Términos de Uso (legal) | `/terminos` | Términos genéricos |
| 10 | Política de Privacidad (legal) | `/privacidad` | Política de privacidad genérica |

"Auditoría de Datos" (legal, articulo actual → `/registro`) puede fundirse en
`/api-publica` (decisión menor pendiente de confirmar).

Etiquetas que **ya tienen página real** → se quedan tal cual: Tabla de
Posiciones → `/reporte/estadisticas-juegos-por-equipos`, Líderes Ofensivos y
Pitcheo → `/reporte/average`, Calendario de Temporada → `/consultas/Series`,
Comparador de Peloteros → `/comparar`, Portal Directores Técnicos → `/dt/cambios`,
Mesa de Control y Anotadores → `/dt/listar-cambios`, Anotaciones Certificadas →
reporte 0.

### Advertencia obligatoria (todas las páginas)

En **letras pequeñas** (`<small>`), al pie del contenido, aproximadamente:

> "Contenido ficticio de demostración. Página temporal de reemplazo; el
> contenido oficial la sustituirá."

---

## Patrón de implementación propuesto

> Bloqueo: no implementar hasta recibir el estilo del usuario.

- **Componente compartido** `src/components/infoPages/InfoPage.jsx` (o nombre
  similar): envoltorio único con título + eyebrow + secciones de contenido +
  disclaimer `<small>`. Cada página aporta su contenido (config o JSX propio).
- **Estilos**: `src/components/infoPages/infoPages.css` (el usuario dará el
  estilo: layout, tokens, presentación).
- **Rutas**: añadir en `App.js` (dentro del `<Routes>` del shell de la app, que
  es `isStandalone === false`): `<Route path="/reglamento" element={<InfoPage .../>} />`
  y análogas. Todas públicas (sin `ProtectedRoute`).
- **Enlaces**: actualizar en `Landing.jsx` (footer, legal, "REGLAMENTO SERIE
  2026") y en `LandingHeader.jsx` (nav a `<Link>`).
- **`/altas-bajas`**: `POST /api/queries/dinamic-filter/ {model:'PlayerSwap',
  filters:{}}` para listar cambios recientes (jugador, equipos origen/destino,
  fecha). El modelo PlayerSwap está sembrado por `populate_db.py`.

---

## Fases / checklist de ejecución (completadas 2026-09-17)

- [x] A. IDs de enlace: `podiumData` gana `playerId`/`teamId`; estrellas/hero/
      standings/recent/bento ya tienen id.
- [x] B. Envolver nombres de equipos y jugadores en `Link` con fallback a texto.
- [x] C. Nav `<a>` → `<Link>` (SPA, conservar protección Comparador).
- [x] D. Callout por rol → modal de login si no corresponde el rol.
- [x] E. "REGLAMENTO SERIE 2026" → `Link to="/reglamento"` (quitar handler scroll).
- [x] F. Crear las páginas con el patrón + disclaimer + clases de estilo.
      Implementadas con `InfoPage` unificado (estilo landing, sin ref propia):
      `/reglamento`, `/protocolo-antidopaje`, `/comision-arbitraje`,
      `/sala-prensa`, `/federacion`, `/api-publica`, `/playoffs`, `/terminos`,
      `/privacidad` + `/altas-bajas` funcional (PlayerSwap vía dinamic-filter).
- [x] G. Registrar rutas en `App.js` (rama de fallback: `/altas-bajas` y
      `INFO_PAGES[pathname]`).
- [x] H. Re-mapear destinos del footer (extraído a `LandingFooter.jsx`) con la
      tabla de páginas; legal del footer y de `ConsultasLayout` a `/terminos`,
      `/privacidad`, `/federacion`.

## Verificación planificada

- `CI=false npx react-scripts build` limpio.
- `python manage.py test db_structure` (96 tests).
- Playwright (1280/1440/1600/1920, light+dark):
  - hrefs de equipo/jugador correctos (computed `href`).
  - Click en jugador → `/jugador/:id`; en equipo → `/equipo/:id`.
  - "REGLAMENTO SERIE 2026" navega a `/reglamento`.
  - Cada página de reemplazo renderiza contenido + disclaimer visible.
  - Callout sin sesión abre modal (no redirige a `/registro`).
  - 0 errores de consola (salvo los 2 avisos preexistentes `/direction-team/:0`).
- Commit con mensaje al estilo del repo.

## Gotchas relevantes

- **Verificación visual**: este modelo no puede leer imágenes; la QA se hace por
  métricas de DOM/computed styles, no por screenshots.
- **Tema**: para QA dark/light hay que setear `document.documentElement.dataset
  .theme` y `.landing.dataset.theme` (o localStorage + reload) — el toggle por
  sí solo no basta para las capturas.
- **Session tras re-sembrado**: tras el `flush`, los tokens previos quedaron
  truncados; los usuarios de prueba se recargaron en `populate_db.py`
  (lialopez@gmail.com/lia · director@test.com/director · general@test.com/general).
- **IDs**: nunca mezclar `db_structure.User` (perfiles de acceso) con
  `api.models.CustomUser` (token). Para perfiles usar `Team.id` y
  `BaseballPlayer.id` según corresponda.
- **`/altas-bajas`**: `PlayerSwap` no tiene endpoint REST GET; solo se accede vía
  `POST /api/queries/dinamic-filter/` (excluye `User` y `Rol`, `PlayerSwap` sí).