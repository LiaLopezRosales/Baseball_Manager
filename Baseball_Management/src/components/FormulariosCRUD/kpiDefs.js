// Baseball_Management/src/components/FormulariosCRUD/kpiDefs.js
// Helpers para construir KPIs configurables por entidad CRUD.
// Cada KPI: { label, icon, compute(data, fields) -> { value, sub, tone } }
// tone: 'red' | 'amber' | 'green' | 'neutral'

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const makeCountKpi = (label, icon, opts = {}) => ({
  label,
  icon,
  compute: (data) => ({
    value: data.length.toLocaleString('es-ES'),
    sub: opts.sub || `${data.length} registros`,
    tone: opts.tone || 'red',
  }),
});

export const makeAvgKpi = (label, icon, fieldKey, opts = {}) => ({
  label,
  icon,
  compute: (data) => {
    const values = data.map((r) => num(r[fieldKey]));
    const valid = values.filter((v) => v > 0);
    const avg = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
    const decimals = opts.decimals ?? 1;
    return {
      value: avg.toFixed(decimals),
      sub: opts.sub || `sobre ${valid.length} registros`,
      tone: opts.tone || 'amber',
    };
  },
});

export const makeSumKpi = (label, icon, fieldKey, opts = {}) => ({
  label,
  icon,
  compute: (data) => {
    const total = data.reduce((acc, r) => acc + num(r[fieldKey]), 0);
    return {
      value: total.toLocaleString('es-ES'),
      sub: opts.sub || `suma de ${fieldKey}`,
      tone: opts.tone || 'green',
    };
  },
});

export const makeBrandKpi = (label, icon, value = '—', opts = {}) => {
  // Tolerancia a la forma corta: makeBrandKpi(label, icon, { sub, tone }) sin valor literal
  if (value && typeof value === 'object') {
    opts = value;
    value = opts.value || '—';
  }
  return {
    label,
    icon,
    compute: () => ({
      value,
      sub: opts.sub || 'Estado verificado',
      tone: opts.tone || 'green',
    }),
  };
};

export const makeStatusKpi = (label, icon, opts = {}) =>
  makeBrandKpi(label, icon, opts.value || 'ÓPTIMO', {
    sub: opts.sub || 'Sin inconsistencias detectadas',
    tone: opts.tone || 'green',
  });

export const makePctKpi = (label, icon, fieldKey, opts = {}) => ({
  label,
  icon,
  compute: (data) => {
    const valid = data.filter((r) => r[fieldKey] !== null && r[fieldKey] !== undefined && r[fieldKey] !== "");
    const pct = data.length ? Math.round((valid.length / data.length) * 100) : 0;
    return {
      value: `${pct}%`,
      sub: opts.sub || `${valid.length}/${data.length}`,
      tone: opts.tone || 'green',
    };
  },
});

export const DEFAULT_CRUD_KPIS = [
  makeCountKpi("Total Registrado", "Groups", { sub: 'padrón completo', tone: 'red' }),
  makeStatusKpi("Estado del Padrón", "ShieldCheck", { value: 'ÓPTIMO', tone: 'green' }),
  makePctKpi("Ficha Homologada", "BadgeCheck", "id", { tone: 'green' }),
  makeCountKpi("Registros en Página", "Rows3", { sub: 'visibles por página', tone: 'amber' }),
];

// ── Hero por entidad (título del encabezado) ──────────────────────────────
// Key: el `title` que pasa cada wrapper CRUD al BaseCRUD.
export const CRUD_HERO = {
  Usuarios: {
    title: 'ADMINISTRACIÓN OFICIAL DE USUARIOS',
    subtitle: 'Credenciales, roles y acceso de los perfiles federativos registrados.',
  },
  Personas: {
    title: 'ADMINISTRACIÓN OFICIAL DE PERSONAS',
    subtitle: 'Nombres de sanción y técnica del aparato burocrático',
  },
  Trabajadores: {
    title: 'ADMINISTRACIÓN OFICIAL DE TRABAJADORES',
    subtitle: 'Orgánica laboral del aparato federativo y academias.',
  },
  Jugadores: {
    title: 'ADMINISTRACIÓN OFICIAL DE JUGADORES',
    subtitle: 'Jugadores de los equipos de toda la liga.',
  },
  Pitchers: {
    title: 'ADMINISTRACIÓN OFICIAL DE LANZADORES',
    subtitle: 'Pitchers de los equipos de toda la liga.',
  },
  'Direction Team': {
    title: 'ADMINISTRACIÓN OFICIAL DE EQUIPOS DE DIRECCIÓN',
    subtitle: 'Órganos técnicos que lideran cada franquicia.',
  },
  'Directores Técnicos': {
    title: 'ADMINISTRACIÓN OFICIAL DE DIRECTORES TÉCNICOS',
    subtitle: 'Directores técnicos de todo el campeonato.',
  },
  Temporadas: {
    title: 'ADMINISTRACIÓN OFICIAL DE TEMPORADAS',
    subtitle: 'Ciclo de federativo de cada temporada del campeonato.',
  },
  Series: {
    title: 'ADMINISTRACIÓN OFICIAL DE SERIES',
    subtitle: 'Series programadas dentro de cada temporada.',
  },
  Juegos: {
    title: 'ADMINISTRACIÓN OFICIAL DE JUEGOS',
    subtitle: 'Calendario de juegos del campeonato.',
  },
  Puntuaciones: {
    title: 'ADMINISTRACIÓN OFICIAL DE MARCADORES',
    subtitle: 'Resultados y marcadores registrados por juego.',
  },
  Equipos: {
    title: 'ADMINISTRACIÓN OFICIAL DE EQUIPOS',
    subtitle: 'Franquicias afiliadas a la liga y sus datos de marca.',
  },
  Alineaciones: {
    title: 'ADMINISTRACIÓN OFICIAL DE ALINEACIONES',
    subtitle: 'Alineaciones de los equipos en el campeonato.',
  },
  'Jugadores en Alineación': {
    title: 'ADMINISTRACIÓN OFICIAL DE JUGADORES EN ALINEACIÓN',
    subtitle: 'Jugadores asignados por juego a cada alineación.',
  },
  'Intercambios de Jugadores': {
    title: 'ADMINISTRACIÓN OFICIAL DE CAMBIOS DE JUGADOR',
    subtitle: 'Sustituciones registradas bajo criterio regulatorio WBSC.',
  },
  'Equipos en el Campo': {
    title: 'ADMINISTRACIÓN OFICIAL DE EQUIPOS EN EL CAMPO',
    subtitle: 'Equipos que disputan o disputaron cada juego.',
  },
  'BP Participations': {
    title: 'ADMINISTRACIÓN OFICIAL DE PARTICIPACIONES',
    subtitle: 'Participaciones de jugadores por serie.',
  },
  Posiciones: {
    title: 'ADMINISTRACIÓN OFICIAL DE POSICIONES',
    subtitle: 'Catálogo posicional del reglamento.',
  },
  'Jugadores en Posición': {
    title: 'ADMINISTRACIÓN OFICIAL DE JUGADORES EN POSICIÓN',
    subtitle: 'Posiciones defensivas y estadísticas de campo.',
  },
  'Jugadores Estrella': {
    title: 'ADMINISTRACIÓN OFICIAL DE JUGADORES ESTRELLA',
    subtitle: 'Estrellas del campeonato y su rendimiento.',
  },
};

export const CRUD_HERO_DEFAULT = {
  title: 'PANEL DE ADMINISTRACIÓN',
  subtitle: 'Administración integral del padrón del campeonato. Sincronizado con el nodo federativo.',
};