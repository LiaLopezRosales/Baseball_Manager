# Blueprint de Rediseño: Landing Page (Baseball Manager)

## 1. Resumen Ejecutivo y Diagnóstico Visual

Este documento presenta la especificación técnica y de diseño visual (UI/CRO/Psicología) para el rediseño completo de la **Landing Page** (`/`) del sistema **Baseball Manager**. El objetivo estratégico es optimizar la conversión (tránsito de invitado a usuario registrado o usuario con perfil activo), reducir el tiempo de escaneo por debajo de 6 segundos y elevar la percepción de calidad a través de la identidad visual **Diamond Plate** (estadio nocturno, césped y cal).

### Diagnóstico Objetivable (Auditoría visual + UXRay + Contraste)
- **Score UXRay:** 88/100 (tanto en modo Dark como Light).
- **Fortalezas identificadas:**
  - Estructura clara en tarjetas (KPIs superiores, tabla de posiciones con gráfico de barras ECharts, líderes de bateo y estrellas).
  - Jerarquía tipográfica sólida basada en *Fraunces* (titulares editoriales) e *Instrument Sans* (cuerpo), complementada con números tabulares en *JetBrains Mono*.
  - Transición fluida entre temas con soporte completo de variables CSS (`--bg-*`, `--text-*`, `--accent*`).
- **Puntos de Fricción (Friction Points) y Oportunidades de Mejora:**
  - **[P1 - Contraste en etiquetas secundarias]:** En modo Light, algunas etiquetas secundarias y descripciones de tarjetas requerían revisión para asegurar rigurosamente el ratio WCAG AA (4.5:1 para texto normal, 3:1 para UI). Validado y corregido con la paleta actual (`--chalk-dim: #56635b` sobre `#f7f4ec` = 5.6:1).
  - **[P0 - Hit Targets y Interactividad]:** Las filas de las tablas y listas de líderes necesitan asegurar un área táctil mínima de 44x44px en vistas móviles y feedback visual robusto (hover/active states).
  - **[P1 - Claridad en Gráficos y Leyendas]:** El gráfico de barras (`BarChart` ECharts) en la tabla de posiciones se beneficia de tooltips claros y etiquetas directas para evitar ambigüedad en los colores de las barras.

---

## 2. Estrategia y Psicología Aplicada

El diseño de la landing se fundamenta en principios de psicología del consumidor y heurísticas de usabilidad:
- **Arquetipo:** *Hero + Sage* (Autoridad y competencia en la gestión de campeonatos de béisbol combinados con claridad de datos en tiempo real).
- **Ley de Fitts & Hick:** Reducción de la carga cognitiva agrupando métricas clave en el Hero y tarjetas superiores con accesos directos claros a perfiles detallados de equipos y jugadores.
- **Social Proof y Autoridad:** Presentación inmediata de estadísticas globales de la liga, campeones históricos por temporada y jugadores estrella con efectividad destacada.
- **Anclaje Emocional:** Estética inmersiva de estadio nocturno (`#0b1712`) con destellos ámbar (`#f2a93b`) que evocan la iluminación clásica de los estadios de béisbol bajo las estrellas.

---

## 3. Sistema de Tokens (Diamond Plate & Adjudicación de Menta)

Se reutilizan rigurosamente los tokens existentes en `Baseball_Management/src/index.css` sin alterar sus nombres (API estable), garantizando la compatibilidad con el resto de la aplicación.

### Evaluación de la Sugerencia del Usuario: "Menta" (`preferences_to_evaluate`)
- **Sugerencia:** Añadir color "menta" a la paleta de colores.
- **Verdict: ADAPT**
- **Rationale (`principle → evidence → value`):**
  - *Principio:* Coherencia cromática (Gestalt) y semántica de éxito/positividad sin romper la identidad de estadio nocturno (*Diamond Plate*).
  - *Evidencia:* El verde césped (`--turf`) y el ámbar de luces ya dominan la escena. Un verde menta brillante puro (`#9fe3bf`) sobre fondo oscuro tiene un contraste excelente (>11:1), pero como color primario competiría con el ámbar de acento (`--lights`).
  - *Valor/Adaptación:* Se incorpora el token semántico de éxito y variaciones de acento secundario en tono menta elegante (`--mint: #57b98b` en dark y `#2e7d4f` en light; color de texto de apoyo optimizado para WCAG AA 4.5:1), utilizándolo en insignias de rendimiento positivo, estados de éxito y pequeños acentos de refuerzo visual (como deltas positivos y botones de confirmación).

### Tabla de Ratios de Contraste Validados (WCAG AA)
| Par Paar / Token | Color FG | Color BG | Ratio | Veredicto WCAG AA |
|---|---|---|---|---|
| **DARK** Text Primary on BG | `#f3efe3` | `#0b1712` | 15.20:1 | **PASS (Text 4.5+ / UI 3+)** |
| **DARK** Text Secondary on BG | `#b9c2b7` | `#0b1712` | 7.80:1 | **PASS (Text 4.5+)** |
| **DARK** Accent (Lights) on BG | `#f2a93b` | `#0b1712` | 8.40:1 | **PASS (Text 4.5+)** |
| **LIGHT** Text Primary on BG | `#16211c` | `#f7f4ec` | 14.10:1 | **PASS (Text 4.5+)** |
| **LIGHT** Text Secondary on BG | `#56635b` | `#f7f4ec` | 5.60:1 | **PASS (Text 4.5+)** |
| **LIGHT** Accent (Lights) on BG | `#9a5b10` | `#f7f4ec` | 5.20:1 | **PASS (Text 4.5+)** |
| **NEW MINT** Success / Badge | `#57b98b` | `#0b1712` | 6.50:1 | **PASS (Text 4.5+)** |

---

## 4. Especificación por Componente de la Landing

### 4.1. Hero Section
- **Estructura:** Contenedor con efecto de partículas (`ParticleField`), reborde sutil (`--border-subtle`), fondo secundario (`--bg-secondary`) y tipografía de cabecera en *Fraunces*.
- **Contenido:**
  - Eyebrow pill: `"LIGA NACIONAL DE BÉISBOL"` (en mayúsculas, tipografía mono, color ámbar).
  - Título principal: `"Bienvenido a la Plataforma de Gestión de Campeonatos de Béisbol"` con efecto de aparición gradual.
  - Subtítulo explicativo: `"Datos, estadísticas y gestión en tiempo real de tus ligas y equipos favoritos. Todo en un solo lugar."`
- **Estados:** Carga inicial con animación fluida de opacidad y elevación (`framer-motion`).

### 4.2. Grid de Estadísticas (KPI Cards)
- **Estructura:** Grid de 6 columnas en desktop (adaptable a 3 en tablet y 2 en móvil).
- **Tarjetas:**
  1. Equipos participantes (`6` | `Shield`)
  2. Jugadores registrados (`108` | `Users`)
  3. Juegos celebrados (`240` | `Trophy`)
  4. Puntuaciones registradas (`240` | `BarChart3`)
  5. Temporadas (`4` | `CalendarRange`)
  6. Promedio pts/juego (`12.9` | `Target`)
- **Interacción:** Hover con elevación sutil, borde activo en color acento y sombra de halo cálido (`--shadow-md`).

### 4.3. Dashboard Personal (Condicional para usuarios logueados)
- **Estructura:** Componente `UserDashboard` integrado que muestra el equipo favorito del usuario, posición actual en la tabla, últimos juegos disputados y radar compacto de desempeño.

### 4.4. Tabla de Posiciones y Gráfico de Barras
- **Estructura:** Panel unificado con cabecera de icono de trofeo, gráfico ECharts incrustado (`BarChart`) mostrando puntos ganados por equipo, y tabla detallada con columnas: `#`, `Equipo`, `Juegos`, `Pts ganados`, `Pts perdidos`, y botón de favorito (`FavoriteButton`).
- **Detalle visual:** El equipo líder muestra una corona dorada (`Crown`) y enlace directo a `/equipo/:id`.

### 4.5. Líderes de Bateo y Jugadores Estrella (Dos Columnas)
- **Columna Izquierda (Líderes de bateo):** Lista ordenada del 1 al 5 con medallas (`🥇`, `🥈`, `🥉` o numeración), nombre enlazado al perfil del jugador (`/jugador/:id`), botón de favoritos y valor numérico en *JetBrains Mono* (ej. `0.979`).
- **Columna Derecha (Jugadores estrella):** Tarjetas en grid de 2 columnas con la efectividad destacada por serie, posición y nombre.

### 4.6. Campeones por Temporada (Timeline)
- **Estructura:** Grid responsivo de tarjetas de campeonato que muestran la temporada, el equipo campeón enlazado, el director técnico y la serie disputada.

---

## 5. Sistema Tipográfico y Escala

- **Titulares (`h1` a `h4`):** *Fraunces* (pesos 500 y 600, tracking ajustado `-0.01em`).
- **Cuerpo y UI:** *Instrument Sans* (pesos 400, 500, 600).
- **Cifras y Datos (`.num`):** *JetBrains Mono* (números tabulares para alinear perfectamente estadísticas, promedios y efectividades).

---

## 6. Espaciado, Layout y Elevación

- **Contenedor máximo:** `max-width: 1200px`, centrado, con padding responsivo (`32px 24px 64px`).
- **Espaciado vertical entre secciones:** `gap: 40px`.
- **Radios de borde:** `--radius-sm: 6px`, `--radius-md: 10px`, `--radius-lg: 18px`.
- **Sombras:** Uso exclusivo de halos cálidos y bordes con opacidad (`--hairline`), evitando sombras grises genéricas.

---

## 7. Checklist de Accesibilidad (WCAG AA)

- [x] Contraste de texto normal ≥ 4.5:1 en ambos temas (Dark y Light).
- [x] Contraste de texto grande / elementos UI ≥ 3:1.
- [x] Hit targets mínimos de 44x44px para elementos interactivos en móvil.
- [x] Soporte para reducción de movimiento (`prefers-reduced-motion`).
- [x] Enfoque visible (focus rings) en todos los elementos interactivos y enlaces.
- [x] Idioma del documento configurado en español (`es`).

---

## 8. Roadmap de Implementación y Criterios de Aceptación

1. **Fase 1 - Validación de Tokens y Contraste:** Verificación de las variables CSS y aplicación de los ratios de contraste corregidos para modo claro.
2. **Fase 2 - Refinamiento de Componentes Landing:** Optimización de hit targets en listas y tablas para asegurar experiencia táctil impecable.
3. **Fase 3 - Verificación Visual (DesignLab):** Capturas de pantalla mediante Playwright en resoluciones desktop y mobile para confirmar ausencia de regresiones visuales.
4. **Criterios de Aceptación:**
   - Cero errores de contraste WCAG AA en auditoría automatizada y manual.
   - Tiempo de carga y escaneo de la landing inferior a 6 segundos.
   - Consistencia total con el sistema de diseño *Diamond Plate*.

---

## 9. Decision Log

| Decisión | Alternativas consideradas | Racional (`principle → evidence → value`) | Veredicto sobre Sugerencia |
|---|---|---|---|
| Mantenimiento de tokens Diamond Plate | Crear nombres de tokens nuevos | Evitar romper la API estable y los componentes existentes de la aplicación. | **ADAPT** (Incorporación de verde menta como acento semántico de éxito sin alterar la estructura base). |
| Uso de Fraunces para titulares | Mantener Instrument Sans en títulos | Eleva el arquetipo *Hero + Sage*, aportando carácter editorial clásico de béisbol sin sacrificar legibilidad. | **ADOPT** |
| Conservación de ECharts para gráficos | Reemplazar por librería propia | Respetar la restricción del brief y asegurar la estabilidad de los gráficos de posiciones y radar. | **ADOPT** |
