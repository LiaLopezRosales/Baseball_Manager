# Plan: Agente `redesign-expert` generalizado (IA de rediseño perfecto para CUALQUIER UI)

> Estado: **implementación en curso — §10 pasos 1–4 ✓; paso 5 en curso**.
> Pendientes: retest Baseball Landing (paso 5), retest segundo proyecto (paso 6), cerrar docs (paso 7).
> V1 (específica de Baseball Manager) renombrada a `redesign-expert-v1.md`; el nombre `redesign-expert` ahora
> lo toma la V2 global. Requiere **reiniciar opencode** para que agentes/skills/config globales se carguen.
> Decisiones del usuario para v2 → §3. Implementación detallada en §10.
>
> **BLOQUEADOR RESUELTO (sept-2026)**: `task` con la V2 fallaba con `Requests ending with a model turn are
> not supported` (`AI_APICallError`, provider google, gemini-3.6-flash) cuando el flujo del subagente
> cerraba con un tool call de `write` (read+texto final sí pasaba). Causa: contrato de Google que prohibe
> requests que terminan en turno `model` (prefilled model turns). Fix implementado como **plugin global**:
> `~/.config/opencode/plugins/gemini-synthetic-user-turn.ts` (hook `experimental.chat.messages.transform`,
> mutación in-place `push`, condicionado a providerID `google` y último mensaje role != user) — anexa un
> turno de usuario sintético ("Continue.") para que la request nunca cierre en turno model. El fix upstream
> no está publicado (issue anomalyco/opencode#45359 abierto; latest v1.18.30 sin fix). Requiere reiniciar
> opencode para activar el plugin.

## 1. Objetivo

Transformar el agente `redesign-expert` (hoy atado a Baseball Manager) en una **herramienta
reutilizable en cualquier proyecto** que produzca "el diseño perfecto" de cada UI como:

**especificación/dirección de rediseño** (diseño visual + marketing/CRO + psicología), **sin tocar
el código de la app**, con **verificación visual real** (nada de "suena bien en papel y luego no se ve").

- V1 ya verifica: captura real (Playwright MCP) → visión (`google/gemini-3.6-flash`, free tier) →
  crítica anclada a mediciones.
- V2 lo hace **genérico**: brief parametrizado, formato de entregable configurable, skills reutilizables,
  validadores opcionales (UXRay local + segunda opinión con visión Nvidia) e instalación **global**.

## 2. Estado actual (V1) — ya funcionando

- `.opencode/agents/redesign-expert.md` (subagent, `model: google/gemini-3.6-flash`, `bash: deny`).
- Proveedor `google` cableado vía `opencode.json` con `options.apiKey: "{file:~/.secrets/google-gemini.key}"`.
- Smoke test de visión superado (describe componentes, paleta y valores reales de la Landing).
- Gotchas de la key gratis documentados en AGENTS.md y aquí abajo en §8.

**Limitaciones de V1 a corregir**: prompt hardcodeado a tokens Diamond Plate y Fases 1–4;
output siempre en español; no genera prototipos; no usa validadores externos; rutas de captura de este repo.

## 3. Decisiones del usuario (para V2)

| # | Decisión | Opción elegida |
|---|---|---|
| 1 | Idioma/plantilla del entregable | **Parametrizado por brief** (el brief define idioma del deliverable; default por defecto del orquestador) |
| 2 | Arquitectura | **Full-loop**: el agente también genera prototipos desechables para auto-verificar antes de escribir la spec |
| 3 | Validadores a cablear ahora | **UXRay local** (Ollama + Gemma) + **segunda opinión con visión Nvidia** (`nvidia/google/gemma-4-31b-it`) |
| 4 | Ubicación | **Global**: `~/.config/opencode/agents/` + `~/.config/opencode/skills/` (reutilizable entre proyectos) |
| 5 | Skills | **Todas** (pack completo de 7 skills, ver §5) |

## 4. Diseño del agente generalizado

### 4.1. Frontmatter propuesto

```yaml
---
description: >-
  Experto en rediseño visual completo: especifica el "diseño perfecto" de cualquier UI
  (diseño + CRO/marketing + psicología) leyendo capturas reales. NO implementa en la app;
  sí genera prototipos desechables para auto-verificar. Escribe el blueprint en <dir segun brief>.
mode: subagent
model: google/gemini-3.6-flash        # visión gratis; fallback opcional nvidia/google/gemma-4-31b-it
temperature: 0.4
permission:
  read: allow
  glob: allow
  grep: allow
  list: allow
  edit: allow                         # restringido por prompt a docs/ + designlab/
  bash:                               # análisis solo lectura/scripts de medición
    "*": deny
    "python3 *": allow
    "node *": allow
    "uxray*": allow                       # auditor local (Ollama)
    "git status*": allow
    "git log*": allow
  external_directory:                 # scratch de prototipos fuera de cada repo
    "*": deny
    "/tmp/opencode/designlab/**": allow
  skill: allow                        # carga el pack de skills
  task: deny
  webfetch: deny
  websearch: deny
---
```

### 4.2. Prompt: flujo "modo producto" (etapas universales)

1. **Brief intake (contextualizar antes de opinar)**
   Entradas que puede dar el orquestador (por parámetro o por convention en `/tmp/opencode/design/brief.json`):
   tipo de producto, stack/framework, usuarios y personas, objetivo de negocio/conversión, marca/tono,
   sistema de tokens actual (rutas), alcance de páginas, entregable (spec / maquetas / ambos),
   **idioma del deliverable**, nivel de accesibilidad (AA/AAA), restricciones (p. ej. "no renombrar tokens").
   Regla: dato ausente → marcarlo `[ASUMIDO: <valor por defecto>]`, nunca inventar en silencio.

2. **Diagnóstico objetivo**
   Lee cada captura (Dark/Light/Mobile) con la herramienta `read`; PRIMERO describe lo que ve con
   precisión, luego apunta: jerarquía F/Z, contraste (medido, no a ojo), escala tipográfica,
   espaciado, alineaciones, densidad/carga cognitiva, hit targets (<44px), estados faltantes,
   accesibilidad (no-color-only, focus), consistencia de tokens.

3. **Estrategia (psicología + marketing por persona/embudo)**
   Norte del rediseño, arquetipo, emociones objetivo, principios psicológicos aplicados decisión por
   decisión (Gestalt, Hick, Fitts, efecto serial, prueba social, autoridad, framing, anclaje, color).

4. **Adjudicación de sugerencias/restricciones del usuario**
   Toda sugerencia del usuario que llegue en el brief (p. ej. "la nueva paleta debe incluir menta") se
   evalúa contra el norte visual y NO se acepta ni se ignora en silencio. Veredicto obligatorio por
   sugerencia con rationale `principio → evidencia → valor`:
   - **ADOPT** — si refuerza la estrategia (se integra tal cual al sistema).
   - **ADAPT** — si aporta pero requiere ajuste (p. ej. "menta como acento semántico de éxito, no como
     primario; valor oscurecido para cumplir AA 4.5:1 sobre blanco").
   - **REJECT** — si choca con la estrategia; SIEMPRE con al menos una alternativa concreta.
   Distinguir `constraints hard` (obligatorias, se cumplen sí o sí) de `preferences to evaluate`
   (como la menta: subjetivas, se pesan contra estrategia/psicología/accesibilidad). Cuando el tradeoff
   es gusto personal puro, el subagente NO decide: devuelve la pregunta al orquestador/usuario.
   Cada veredicto se documenta en la sección "Decisión Log — sugerencias del usuario" del blueprint.

5. **Sistema visual (regla universal)**
   **Reutilizar los tokens del proyecto cambiando valores; solo crear tokens faltantes.** Plantillas
   neutras: tipo (escala 1.333), espaciado 4/8, radios, elevación, motion, dark/light con contraste AA.

6. **Spec por página**
   Layout, jerarquías, microcopy/CRO, estados vacíos/error/carga, responsive. Todo cambio lleva:
   principio + evidencia (captura/medición) + valor concreto, registrado en un **Decisión Log**
   (justificación multidisciplinaria anclada a diseño + psicología + sociología + conversión).

7. **Bucle de verificación visual (full-loop, el antídoto a "suena bien en papel")**
   - Genera prototipos estáticos desechables (HTML+CSS autocontenido) en el scratch designlab
     (`/tmp/opencode/designlab/` o el dir que diga el brief), por página/tema, con los nuevos tokens.
   - Pide al orquestador capturarlos con Playwright y volver con los PNGs.
   - Critica sus propios renders, mide (contraste/hit targets) e itera N rondas hasta que "se vea bien".
   - Solo lo aprobado pasa a la spec escrita.

8. **Roadmap + "definición de perfecto" (criterios de aceptación del proyecto)**
   Medibles por proyecto: AA, hit targets ≥44px, una sola fuente de tokens, consistencia, cobertura
   de estados, tiempos de escaneo razonables. Cierra con resumen de decisiones + tradeoffs + preguntas abiertas.

9. **Entregables en modo según brief (§11.3)**
   (a) solo `blueprint.md`, o (b) + `tokens.json`/`tokens.css`, o (c) + `DESIGN.md` (Google Stitch,
   validado con `@google/design.md`). El modo (c) engancha con la capa de enforcement del proyecto (§11.2).

### 4.3. Guardrails

- Nunca afirmar contenido de una captura que no se perciba (decir "NO percibo X").
- Nunca ignorar una sugerencia/restricción del usuario en silencio: toda sugerencia termina con
  veredicto ADOPT/ADAPT/REJECT + rationale + (si REJECT) alternativa concreta.
- Código SOLO para mockups desechables; jamás en la app del cliente.
- Datos confidenciales → solo validadores locales (UXRay local, Nvidia vía API existente).
- Velar por el gate humano: entregar tradeoffs y preguntas abiertas, no "verdad absoluta".

## 5. Pack de skills (global → reutilizable)

| Skill | Path global | Contenido |
|---|---|---|
| `design-brief` | `~/.config/opencode/skills/design-brief/SKILL.md` | Cuestionario/plantilla de intake → Brief parametrizado (idioma, alcance, modo de entregable §11.3, **restricciones `hard` vs `preferences to evaluate`**) |
| `visual-audit` | `.../visual-audit/SKILL.md` | Diagnóstico + métricas (contraste/geometría/hit targets) + **checklist de QA objetivo propio** (tokens, a11y, estados) inspirado en ui-architect (25 pts) e impeccable (anti-patrones) |
| `design-principles` | `.../design-principles/SKILL.md` | Psicología + heurísticas + **arquetipos de marca** (Sabio/Héroe/Explorador…) y color psicológico → cómo traducirlas a spec |
| `cro-microcopy` | `.../cro-microcopy/SKILL.md` | Microcopy persuasivo sin dark patterns, CTAs, **empty states motivacionales**, estados error/carga |
| `design-tokens` | `.../design-tokens/SKILL.md` | Plantillas de token (tipo, spacing, elevación, motion, dark/light) + **OKLCH, estados semánticos hover/active/disabled, dark como elevación de superficies** |
| `designlab-prototype` | `.../designlab-prototype/SKILL.md` | Prototipos HTML/CSS desechables para el loop + **motion (easing/tiempos) y prompts de assets IA** |
| `blueprint-template` | `.../blueprint-template/SKILL.md` | Plantilla del entregable + **Decisión Log obligatorio (incl. "sugerencias del usuario")** + checklist "definition of perfect" + modos de entregable (§11.3) |

Todas con frontmatter `name` + `description` (para auto-carga/skill tool). Contenido y agente global
**en inglés** (decisión del usuario; consistencia skills↔agente); el idioma del deliverable final lo
fija `brief.language.deliverable`, no el prompt.

Enriquecimiento por fuentes externas verificadas (ideas, no copia):
- **Design Auditor** (Ashutos1997): formas, i18n/RTL, iconografía, navegación, Nielsen 10 → `visual-audit`.
- **TasteCheck** (KyaniteLabs, MIT): anti-"AI slop" → `design-principles`; cognitive-a11y → `visual-audit/references/`; data-viz/Tufte → `visual-audit` + `design-tokens`.
- **ui-audit** (tommygeoco/uxtools): heading ≥2:1, ≤3–4 colores, CTA ≤3s → `visual-audit`.
- Verificación de campo: **squirrelscan** (técnico SEO/perf/seguridad) y **SyteCheck** (SEO-MCP) son eje técnico, NO complementan UXRay → descartados del agente (QA opcional a nivel proyecto).

## 6. Validadores externos (cablear ahora)

### 6.1. UXRay local (Ollama + Gemma) — segunda opinión UX/a11y ✅ INSTALADO
- Ollama v0.32.14 (snap) + **`gemma4:12b`** vision (Q4_K_M, 7.4GB, cabe en RTX 4070 8GB).
- Script global **`~/.local/bin/uxray`** (Python stdlib, sin dependencias): `uxray <captura> [...]`
  → reporte score 0–100, carga cognitiva, friction points (Nielsen/Gestalt/WCAG), flags a11y,
  recomendaciones priorizadas. Flags: `--lang`, `--model`, `--out`, `--json`, `--raw`, `--think`.
- Prueba real: Landing dark → **score 88, ~28s**, con P0/P1 concretos y flags WCAG AA.
- Gotcha CLAVE: `gemma4` activa `thinking` por defecto (respuesta vacía en `/api/generate` y ~8x
  más lento) → el script manda `"think": false` (~10s/llamada).
- El agente lo usa como **insumo objetivo cruzado** en §2 (diagnóstico), no como voz única.
- Privado (todo local), $0; hardware verificado OK (§7): 30GiB RAM + GPU 8GB. Masas grandes →
  `gemma4:e4b` (ligero) o `gemma4:31b` (pesado, no en GPU 8GB).

### 6.2. Segunda opinión con visión Nvidia (`nvidia/google/gemma-4-31b-it`)
- Ya autenticado en este equipo (auth list: Nvidia). Gratis, sin setup.
- Uso: cruzar el juicio estético del diseño propuesto con otra perspectiva de modelo; barato.
- Se puede invocar como llamado del agente principal (respaldo) o, en el futuro, con `task` habilitado
  para un sub-agente espejo (queda pendiente; hoy `task: deny`).

### 6.3. Futuro opcional (no se cablea ahora)
- MagicPath (MCP remoto OAuth): canvas para maquetas cuando el proyecto lo permita.
- MCP "design-analysis" genéricos: requiren URL/imagen pública → caveat de privacidad.

## 7. Infraestructura y permisos

- Instalación **global**: `~/.config/opencode/agents/redesign-expert.md` +
  `~/.config/opencode/skills/<skill>/*`.
- `opencode.json` del proyecto queda solo para Baseball (provider google + MCP playwright).
- Scratch designlab global en `/tmp/opencode/designlab/` (permitido vía `external_directory`).
- Hardware/privacidad: UXRay local necesita Ram/GPU decentes; **verificado**: 30GiB RAM + RTX 4070
  8GB (gemma4:12b Q4_K_M en VRAM). Si en otro equipo sobra poco, se omite con flag y sigue el audit
  propio + segunda opinión Nvidia.
- Recordatorio: cambios de agentes/skills/config en opencode requieren **reiniciar opencode**;
  `opencode run` sirve para probar headless (subagentes no como agente primario).

## 8. Gotchas ya verificados (V1 — conservar)

- Key `AQ....` de AI Studio: funciona solo con `?key=` en `generativelanguage.googleapis.com`;
  **no** con `Authorization: Bearer` (401 `API_KEY_SERVICE_BLOCKED`).
- `gemini-2.5-flash` retirado para usuarios nuevos (404) → usar `gemini-3.6-flash`.
- En opencode la key va en `provider.google.options.apiKey` (NO `api_key` top-level).
- `{env:VAR}` no resuelve si opencode no carga `.env` → se usa `{file:~/.secrets/google-gemini.key}`.
- MCP Playwright solo escribe dentro del workspace (`.playwright-mcp/`); no usa rutas fuera.

## 9. Criterios de aceptación (V2)

- [ ] El agente (global) produce el blueprint en el idioma del brief para un proyecto EJEMPLO no-Baseball.
- [ ] Full-loop verificado: genera prototipo → orquestador captura → critica → itera (al menos 1 ronda documentada).
- [ ] UXRay local instalado y reporte integrado al diagnóstico (o flag OFF documentado si falta hardware).
- [ ] Segunda opinión Nvidia funcionando como cruce de juicio.
- [ ] Pack de 7 skills cargable por `skill tool` y referenciado por el agente.
- [ ] **Adjudicación de sugerencias verificada**: una sugerencia de usuario (p. ej. "incluir menta en la
  paleta") se procesa con veredicto ADOPT/ADAPT/REJECT + rationale + alternativa, visible en el Decisión Log.
- [ ] Checklist de QA objetivo (tokens/a11y/estados/hit targets) documentado en `visual-audit` y ejercido en ≥1 loop.
- [ ] Entregable en modo `DESIGN.md` (Google Stitch) validado con `@google/design.md` si el brief lo pide.
- [ ] V1 sigue funcionando en Baseball Manager (no regresión).

## 10. Plan de implementación (siguiente paso en orden)

1. **Instalar Ollama + Gemma vision y script `uxray` local (probar con una captura de ejemplo)**
   — ✅ HECHO (§6.1): Ollama snap, `gemma4:12b`, `~/.local/bin/uxray`, prueba en Landing = score 88.
2. **Escribir las 7 skills** en `~/.config/opencode/skills/` (frontmatter name+description, contenido)
   con la sustancia de §5/§11 (OKLCH, arquetipos, Decisión Log, QA checklist, modos de entregable).
   — ✅ HECHO: 7 skills escritas en inglés, densas, con OKLCH/dark-elevation/adjudicación/QA-checklist.
3. **Reescribir el agente** como global (`~/.config/opencode/agents/redesign-expert.md`) con
   frontmatter y prompt generalizado (§4) referenciando las skills.
   — ✅ HECHO: agente escrito con `skill: allow`, 9 etapas, adjudicación integrada, permisos.
4. **Config/permissions** aplicadas en el frontmatter; verificar `external_directory` al designlab.
   — ✅ HECHO: provider google añadido a `~/.config/opencode/opencode.jsonc` (global), glob skills/agent
   OK, JSONC validado.
5. **Retest en Baseball** (no regresión): brief del proyecto → blueprint de una sección → 1 loop.
   — 🔄 EN CURSO (sección: **Landing**). Pre-flight HECHO: servidores arriba (django:200/react:200),
   capturas `.playwright-mcp/retest-landing-{dark,light,mobile-dark}.png`, UXRay dark/light (score 88/88),
   contrastes calculados (`/tmp/opencode/design/contrast.py`), brief en `/tmp/opencode/design/brief.json`
   (sugerencia "menta" como `preferences_to_evaluate`, deliverable `es`, mode `a`).
   **Bloqueador resuelto**: V1 renombrada a `.opencode/agents/redesign-expert-v1.md` para liberar el
   nombre; **requiere reiniciar opencode** para que cargue la V2 global y se pueda lanzar por `task`.
   Tras el reinicio: `task` con `subagent_type: redesign-expert` + brief + capturas → blueprint →
   loop designlab (≥2 rondas) → cruce UXRay.
6. **Retest en un segundo proyecto** (ejemplo sintético/otra app) con brief en otro idioma para
   validar parametrización.
7. Actualizar `AGENTS.md` (sección herramienta → versión global) y este doc a "implementado".

## 11. Integración de hallazgos externos (AuraVision + ecosistema) — orientación

> Origen: análisis de la opinión "AuraVision UI Architect" + verificación de campo de su encuesta de
> herramientas. Conclusión: el ecosistema existente es todo **ejecutor** (aplica/enforcea un sistema
> ya definido); la fase de **Dirección de Arte estratégica** que producimos nosotros no la cubre nadie.

### 11.1 Matriz adopta / adapta / descarta (del perfil "AuraVision UI Architect")

| Aporte | Decisión | Dónde aterriza |
|---|---|---|
| OKLCH + estados semánticos (hover/active/disabled), no solo paleta base | ADOPTAR | `design-tokens` |
| Dark mode como **elevación de superficies**, no inversión | ADOPTAR (ya aplicado en Fase 0) | `design-tokens` |
| Arquetipos de marca (Sabio/Héroe/Explorador…) + color psicológico | ADOPTAR | `design-principles` |
| Ley de Hick/Fitts como check de carga cognitiva | ADOPTAR (explicitar) | `visual-audit` |
| Motion: easing concretos + tiempos + micro-interacciones | ADOPTAR | `design-tokens`, `designlab-prototype` |
| Prompts de assets para IAs de imagen | ADOPTAR (opcional por brief; Nvidia flux/qwen-image) | `blueprint-template` |
| Justificación multidisciplinaria ("el porqué") | ADOPTAR → **Decisión Log** obligatorio | `blueprint-template` |
| Empty states motivacionales (CRO) | ADOPTAR | `cro-microcopy` |
| Librerías de componentes recomendadas (shadcn/Radix/Framer) | ADOPTAR | `blueprint-template` |
| "3D/4K inmersivo" como horizonte | DESCARTAR default (solo si lo pide el brief) | — |
| AuraVision como "capataz/ejecutor" | DESCARTAR: el agente es **estratega puro** | — |
| QA forzado en fase de estrategia ("no partial work") | DESCARTAR: el enforcement vive en implementación | — |

### 11.2 Capa de ejecución a nivel proyecto (fuera del agente)

El agente produce la dirección; ejecutar lo hace el agente principal del proyecto. Candidatos
**verificados** (NUNCA dependencias del agente; se evalúan por proyecto):

- **oh-my-design (`oh-my-design-cli`)** (kwakseongjae, MIT): 20 skills + 18 sub-agentes (a11y audit,
  slop-audit, persona testing ×4, microcopy…) + 440+ referencias `DESIGN.md` (Google Stitch). OpenCode:
  `npx oh-my-design-cli@latest install-skills --global` + verificar con `doctor --global`.
  **Candidato más coherente hoy**: enforcement + roles sobre nuestro `DESIGN.md` emitido.
- **Open Design** (nexu-io, 8.9k★): daemon local-first + MCP (`od mcp install opencode`), 151 design
  systems, y **Critique Theater** (jurado Designer/Critic/Brand/A11y/Copy, composite ≥8, loop
  auto-convergente → "ship"). Útil como "jurado" del resultado, no como ejecutor.
- **design-md-toolkit** (ArtiomB5): genera/valida `DESIGN.md` (modo codebase-scan extrae tokens de
  Tailwind/CSS; valida con `@google/design.md`) y sincroniza a AGENTS.md. Puente contrato→implementación.
- **ui-architect-skill**: checklist de QA 25-pt / 9 lint checks → **inspiración** (no copiar).
- **impeccable** (pbakaus, 15.9k★): librería anti-patrones (no Inter, no gradient hero…) + refs de
  typography/color/layout/motion → fuente de contenido para `visual-audit`; no dependencia.
- **opencode-design-lab** (HuakunShen): review ciega multi-modelo (`/design-lab:ask`) — futuro.

### 11.3 Modos de entregable del blueprint (según brief, forzado en etapa 9)

1. `blueprint.md` — dirección estratégica completa (default).
2. `+ tokens.json` / `tokens.css` — design tokens exportables.
3. `+ DESIGN.md` — contrato Google Stitch (validado con `@google/design.md`) para enganchar la capa
   de enforcement del proyecto (§11.2).

Todo entregable incluye el **Decisión Log** (por cada decisión: principio + evidencia + valor).

### 11.4 Verificación de la encuesta (control de realidad)

| Herramienta | Estado |
|---|---|
| `open-design` (nexu-io) | ✅ real |
| `oh-my-design-cli` (kwakseongjae) | ✅ real (la encuesta lo describía como "pesado"; tiene `doctor` y no lo es) |
| `ui-architect-skill` | ✅ real (OpenCode nativo, 31 estilos, QA 25-pt) |
| `design-md-toolkit` (ArtiomB5) | ✅ real (OpenCode nativo, codebase-scan) |
| `impeccable` (pbakaus) | ✅ real (**no estaba en la encuesta**; 15.9k★, 20 comandos, anti-patrones) |
| `opencode-design-lab` (HuakunShen) | ✅ real (plugin OpenCode; review ciega multi-modelo) |
| `make-interfaces-feel-better` (jakubkrehel) | ✅ real (ya incluido en `opencode-agent-kit`) |
| `frontend-design` (Anthropic) | ✅ real (plugin oficial Claude Code; `SKILL.md` nativo OpenCode; ports) |
| `vibe-design-harness` | ⚠️ no existe con ese nombre → el real es **`vibe-design-skills`** (nick3, 12 skills) |
| `page-design-skill`, `opencode-ai-design-skill` | ⚠️ no verificados → no apostar el plan |

### 11.5 Próximo paso (opcional, tras §10)

Sesión de prueba en sandbox de `oh-my-design` y/o `Open Design` A NIVEL GLOBAL (fuera del repo) para
elegir con evidencia la capa de ejecución que consumirá el `DESIGN.md` emitido por el agente.