# Plan de Implementación — Landing Pública "Diamond Pro Series" (Baseball Manager)

> Rediseño de la landing `/` a partir de los mockups Stitch aprobados
> (dark: `stitch_baseball_championship_modern_landing(1)` / light: `(5)`),
> 100% fiel en estructura y **100% alimentado con datos reales calculados**
> (NO se inventan métricas falsas; lo que el mockup muestra y no existe se
> adapta/computa con datos de la DB).

Estado: **APROBADO por el usuario** (todas las decisiones interactivas cerradas).
Fecha: 2026-09-11

---

## 1. Decisiones cerradas (resumen de la sesión interactiva)

| Tema | Decisión |
|---|---|
| Layout | **Landing standalone**: ruta `/` sin sidebar, con header+footer propios. Resto de la app conserva sidebar. |
| Temas | **Dark y Light** con toggle. Ya existe `data-theme` en `<html>` + `theme.js`. |
| Fondos hero | **Assets reales**: `screen.png` de (1)=dark y (5)=light copiados a `public/img/` como `landing-hero-dark.png` / `landing-hero-light.png` (usados con overlay). |
| Tipografía | **Oswald** (headlines) + **Inter** (body). Ambos diseños reales los usan (aunque DESIGN.md diga lo contrario, `code.html` es la fuente de verdad). Import en `index.css`, scoped a `.landing-root`. |
| Métricas hero (ribbon) | **Calculadas con datos reales**: RACHA, DIFERENCIAL, RÉCORD LOCAL, U10, PCT. "4 EN VIVO" → reemplazado por métrica real (hubo 0 juegos real-time; se usa "X juegos esta temporada" o equivalente calculable). |
| Card Calendario | **"Juegos disputados / total estimado"**. El total estimado NO existía → se computa con juegos **programados** (ver §3 seeder). |
| Card Pitcheo | ERA promedio de liga (calculado) + **% triunfos de local** como 2ª métrica (calculable). |
| Podium bateo | Datos reales: Promedio de Bateo (R5), Equipo, Posición, Efectividad. Sin HR/RBI/OBP/SLG ficticios. |
| Estrellas por posición (9 cards) | Efectividad (R7) + Promedio + Experiencia + Equipo reales. Sin WAR/DRS/UZR/Statcast. |
| Timeline campeones | Reporte 0 real (Equipo, DT, Temporada, Serie). 4 temporadas. |
| Bento "Formato" | 6 equipos (no 12). "2,840 ponches / ERA" → % triunfos de local. |
| Seeder | **Modificar `populate_db.py` para sembrar también juegos PROGRAMADOS** (sin Score, fecha futura) que sirvan de denominador del calendario → no hace falta migrar modelos, solo enriquecer el seed. Teoría confirmada: el `%` de calendario tendrá denominador real. |

---

## 2. Arquitectura

### 2.1 Enrutamiento (`src/App.js`)
- Ruta `/` renderiza `<Landing>` **fuera** del wrapper con sidebar (estado standalone).
- Para no romper el resto: `Landing` recibe props `onModalOpen`, `isLogged`, `role`, `onThemeToggle`, `theme`.
- El resto de rutas (`/admin/:slug`, `/reporte/:slug`, `/consultas/:tabla`, `/equipo/:id`, `/jugador/:id`, `/comparar`, `/registro`, `/dt/*`) sin cambios.

### 2.2 Estructura de componentes (`src/components/landing/`)
```
landing/
├── Landing.jsx            # Orquestador: fetch + derivación + composición
├── landing.css            # Tokens dark/light + estilos (reescritura completa)
├── LandingHeader.jsx      # Navbar fijo: logo, links, auth (Login/Registro), campana notif
├── LandingHero.jsx        # Hero 2-col: headline + leader card + metric ribbon
├── LandingBento.jsx       # Grid 4 cards: Calendario, Pitcheo, Formato, Comunidad
├── LandingStandings.jsx   # Tabla posiciones real (POS/EQUIPO/JJ/JG/JP/PCT/DIF/U10/RACHA) + barras diferencial
├── LandingPodium.jsx      # Podio bateo top3 (oro/plata/bronce)
├── LandingStars.jsx       # Jugadores estrella por posición (9 cards, R7)
├── LandingChampions.jsx   # Timeline campeones (R0) + callout DT/Admin
└── LandingFooter.jsx      # Footer 4-col con rutas reales
```
Nota: caja `StatCard.jsx` actual de `ui/` queda en desuso para la landing (se reemplaza por `StatCard` local del bento). Se marcará como no usada por la nueva landing; se conserva si otra vista la usa.

### 2.3 Estado global
- Landing lee `ThemeContext` para activar dark/light (ya es global).
- Login/Registro reutiliza el `Modal` existente vía `onModalOpen`.

---

## 3. Seed: juegos programados para el denominador del calendario

`populate_db.py` actualmente crea **240 juegos TODOS con Score** (todos disputados).

Cambio (solo en `populate_db.py`, sin migraciones):
1. Tras crear los 240 juegos disputados, sembrar **N juegos programados** adicionales realistas
   (fechas futuras, sin `Score` → no entran en scores/games-disputados) para modelar la segunda
   mitad del calendario. Con 6 equipos y round-robin doble el total estimado real sería ~ **240
   disputados + ~46 programados ≈ 286** si mañana se jugaran a doble dígito por serie — no importa el
   número exacto: el frontend calcula `% = disputados / (disputados + programados)`.
2. `Game` exige `Score` FK? No: `Game.score` es FK nullable (relación inversa de `Score.game`).
   Verificar en modelos que `game.score`/`Score.game` sea opcional antes de asumir. Para programar
   solo se necesita una fila `Game` sin `Score` asociada y con fecha futura.

**Riesgo verificado en Etapa 3:** revisar `Game`/`Score` (`db_structure/models.py`) para confirmar
que una `Game` sin `Score` es válida (FK nullable / Score con `game` null=True). Si `Score` exige
`game` y `Game` exige `Score` a la vez, es un ciclo → en ese caso NO se toca el modelo y el
denominador del calendario se define como **240 juegos cumplidos de un calendario de 240** (100%),
documentándose la limitación en la UI (sin inventar).

---

## 4. Mapeo sección → fuente de datos real

| Sección UI | Fuente (endpoint / cálculo) |
|---|---|
| Métricas top (líder líder) | `/scores/` + `/games/` (goles por equipo) |
| RACHA | Secuencia JG/JP por equipo desde `scores` ordenado por fecha |
| DIFERENCIAL | Σ(w_points va l_points) por equipo desde `scores` |
| RÉCORD LOCAL | Juagadas ganadas cuando `game.local == team` (join scores→games) |
| UNITO M10 | Últimos 10 juegos por equipo desde `games`+`scores` |
| PCT | JG/(JG+JP) |
| Card Calendario | `games.length` (disputados) / (disputados + programados del seed) |
| Card Pitcheo | `running_average` promedio (ERA liga) + % triunfos de local (scores local==winner) |
| Card Formato | `teams.length` (6) + `seasons.length` (4) + `series.length` (8) |
| Card Comunidad | `bp-participations` (favoritos) + notificaciones si hay token |
| Podium bateo | Reporte 5 (top AVG) + joins jugador/equipo/posición |
| Estrellas por posición | Reporte 7 (efectividad por posición) + `players-in-position` |
| Timeline campeones | Reporte 0 (campeones por temporada) |
| Tabla posiciones | Scores + Games (record/PCT/DIF/U10/RACHA computados en frontend) |
| Callout DT/Admin | `role` del usuario logueado → rutas `/dt/cambios`, `/admin/equipos` |

---

## 5. Sistema de tokens CSS (`src/index.css` + `landing.css`)

Reutilizados: `--night/bg-*`, `--chalk/text-*`, `--lights/--accent*`, `--clay`, `--hairline`.

Nuevos escopéd a landing (no rompen el resto):
- Fonts: `--lnd-font-display: 'Oswald'`, `--lnd-font-body: 'Inter'`.
- Flip dark/light vía `html[data-theme]`.
- Multiplicadores espaciado, radios base, fuentes de números (JetBrains Mono ya existente para `.num`).

Paleta (del mockup):

| Token | Dark | Light |
|---|---|---|
| `--lnd-bg` | `#0b1712`(night) | `#f0f7ff`(ice) |
| `--lnd-surface` | `#142c22`(turf) | `#ffffff` |
| `--lnd-card` | `#1c3a2c`(turf-2) | `#f8fafc` |
| `--lnd-text` | `#f3efe3`(chalk) | `#0f2744`(brand navy) |
| `--lnd-accent` | `#f59e0b`(gold) | `#0284c7`(blue) |
| `--lnd-crimson` | `#e11d48` | `#0284c7` |
| `--lnd-emerald` | `#10b981` | `#059669` |

---

## 6. Fase C (integraciones que se conservan en la landing)

- `FavoriteButton` (corazones) en filas de standings y stars (solo token).
- `UserDashboard` + `FavoritesPanel` como secciones condicionales si hay token.
- `NotificationBell` en el header de la landing.
- Login/Registro reutilizan Modal existente.
- Modo invitado: ocultar corazones/panel/página de usuario.

---

## 7. Verificación (Definition of Done)

1. `CI=false npx react-scripts build` sin errores.
2. `python manage.py test db_structure` (96 tests) intactos.
3. Reseed con juegos programados: `python populate_db.py`.
4. Playwright: capturar `/` dark y light; verificar hero/bento/tabla/podio/timeline con datos reales; probar toggle tema; guardas de invitado.
5. Contraste AA (WCAG): comprobar métricas minimal 12px, hit targets 44px, focus visible.
6. No romper el resto de rutas (sidebar, reportes/consultas/admin)
