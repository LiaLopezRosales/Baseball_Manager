# Plan: 4 Secciones Faltantes de la Landing

**Fecha:** 2026-09-14
**Estado:** En implementación

## Contexto

La landing `/` solo renderiza Header, Hero, Palmarés+Callout y Footer. Los mockups
(dark `(2)` y light `(6)`) definen 6 secciones de contenido. Faltan 4:

1. ~~Header + Navbar~~ ✅
2. ~~Hero~~ ✅
3. **Resumen Ejecutivo de Circuito** (bento 4 cards) ❌
4. **Tabla Oficial de Posiciones + Diferencial Neto** ❌
5. **Podio de Líderes de Bateo** (oro/plata/bronce) ❌
6. **Jugadores Estrella por Posición** (8 cards) ❌
7. ~~Palmarés + Callout DT~~ ✅
8. ~~Footer 5-col~~ ✅

## Cambios en la BD

### BaseballPlayer — 5 campos nuevos

| Campo | Tipo | Descripción |
|---|---|---|
| `home_runs` | IntegerField | Jonrones |
| `rbi` | IntegerField | Carreras empujadas |
| `obp` | FloatField | On-Base Percentage |
| `slg` | FloatField | Slugging Percentage |
| `war` | FloatField | Wins Above Replacement |

### Pitcher — 4 campos nuevos

| Campo | Tipo | Descripción |
|---|---|---|
| `strikeouts` | IntegerField | Ponches registrados |
| `innings_pitched` | FloatField | Entradas lanzadas |
| `saves` | IntegerField | Salvamentos |
| `whip` | FloatField | Walks+Hits per Inning Pitched |

### PlayerInPosition — 4 campos nuevos

| Campo | Tipo | Descripción |
|---|---|---|
| `fielding_pct` | FloatField | Porcentaje de fildeo |
| `double_plays` | IntegerField | Jugadas dobles iniciadas |
| `bases_stolen` | IntegerField | Bases robadas |
| `assists_of` | IntegerField | Asistencias de jardines |

### Campos OMITIDOS (estadísticas demasiado avanzadas)

CS%, Pop Time, DRS, Arm Strength MPH, UZR → no se agregan.

## Secciones a implementar

### S3: Resumen Ejecutivo de Circuito (bento 4 cards)

- **Calendario Oficial:** `scores.length` = juegos disputados; % = juegos jugados/programados;
  últimos 2 scores reales como mini chips (equipoInicial + puntos vs equipoRival + puntos).
- **Pitcheo Colectivo:** ERA = avg(running_average) de todos los Pitchers;
  Ponches = sum(strikeouts) [campo nuevo].
- **Formato de Liga:** `teams.length` = franquicias;
  % calendario = scores.length / games.length * 100.
- **Comunidad Fan Plus:** CTA estático "Activar Alertas" → link a `/registro`.

### S4: Tabla Oficial de Posiciones + Diferencial Neto

- **Tabla 8 col:** POS / EQUIPO / JJ / JG / JP / PCT / DIF / U10 / RACHA.
  Datos: `buildStandingsFromScores()` fusionado con report 6. Todo real.
- **Diferencial Neto:** barras horizontales CA-CP por equipo (pf-pc).
- **Tabs:** solo "General" activa (sin división en BD).
- **Sin cambios de BD.**

### S5: Podio de Líderes de Bateo

- **Top 3:** report 5 (Nombre, Apellido, Promedio de Bateo).
- **Enriquecimiento:** person→BP→participation→team; BP→players-in-position→position.
- **Hero metric:** Promedio de Bateo (report 5).
- **Sub-stats:** HR, RBI, OBP, SLG [nuevos campos BaseballPlayer].
- **Layout:** 2° izquierda (plata), 1° centro (oro, -mt-6), 3° derecha (bronce).

### S6: Jugadores Estrella por Posición (8 cards)

- **1 card por posición:** SP, RP, C, 1B, 2B, 3B, SS, OF.
- **SP/RP:** los 2 mejores pitchers por effectiveness (PlayerInPosition).
- **OF:** mejor entre Left Field, Center Field, Right Field.
- **Headline:** WAR [nuevo campo] en badge amber.
- **Sub-stats por posición:**
  - C: effectiveness + years_of_experience + age
  - 1B: AVG/OPS (OBP+SLG) + fielding_pct [nuevo]
  - 2B: double_plays [nuevo] + bases_stolen [nuevo]
  - 3B: HR/RBI [nuevos] + effectiveness
  - SS: effectiveness + age + batting_average
  - OF: assists_of [nuevo] + AVG/HR
  - SP: récord (won/lost) + ERA (running_average) + K (strikeouts [nuevo])
  - RP: saves [nuevo] + whip [nuevo]

## Archivos a modificar

### Backend
- `db_structure/models.py` — 3 modelos con campos nuevos
- `db_structure/serializers.py` — serializar campos nuevos
- `populate_db.py` — popular campos con datos de ejemplo
- `db_structure/tests/test_serializers.py` — tests actualizados
- `api/reports/queries.py` — posiblemente ajustar report 1 para incluir team

### Frontend
- `Landing.jsx` — 4 secciones + fetch `/bp-participations/`, report 1
- `landing.css` — estilos dark+light para las 4 secciones
- Opcionalmente: componentes separados por sección

## Verificación
1. `python manage.py makemigrations && migrate`
2. `python manage.py test db_structure`
3. `CI=false npx react-scripts build`
4. Playwright dark + light: 4 secciones, 0 errores
5. Vision model: datos reales visibles
6. Contraste AA
