// Mapa central de rutas URL <-> opciones del sidebar (selectedOption)

// Entidades CRUD de admin: slug -> opcion (selectedOption) del render condicional
export const CRUD_ROUTES = {
  posiciones: 'Posiciones',
  usuarios: 'Usuarios',
  temporadas: 'Temporadas',
  trabajadores: 'Trabajadores',
  equipos: 'Equipos',
  alineaciones: 'Alineaciones',
  personas: 'Personas',
  jugadores: 'Jugadores',
  'directores-tecnicos': 'Directores Técnicos',
  'jugadores-en-alineacion': 'Jugadores en Alineación',
  'bp-participations': 'BP Participations',
  'equipos-en-el-campo': 'Equipos en el Campo',
  puntuaciones: 'Puntuaciones',
  juegos: 'Juegos',
  pitchers: 'Pitchers',
  'jugadores-estrella': 'Jugadores Estrella',
  'jugadores-en-posicion': 'Jugadores en Posición',
  'intercambios-de-jugadores': 'Intercambios de Jugadores',
  series: 'Series',
  'direction-team': 'Direction Team',
};

// Reportes: slug -> { nombre, report_id, icon (material-symbols) }
export const REPORT_ROUTES = {
  'equipos-ganadores': { name: 'Equipos ganadores y directores técnicos por temporadas', short: 'Equipos Ganadores', reportId: 0, icon: 'emoji_events' },
  'jugadores-estrellas': { name: 'Jugadores estrellas', short: 'Jugadores Estrellas', reportId: 1, icon: 'star' },
  'primer-y-ultimo-lugar': { name: 'Primer y último lugar', short: 'Primer y Último Lugar', reportId: 2, icon: 'swap_vert' },
  'series-mas-menos-juegos': { name: 'Series con más/menos juegos celebrados', short: 'Series por Juegos', reportId: 3, icon: 'timeline' },
  'carreras-limpias-juegos-ganados': { name: 'Carreras limpias/juegos ganados', short: 'Carreras Limpias', reportId: 4, icon: 'monitoring' },
  average: { name: 'Average', short: 'Average de Bateo', reportId: 5, icon: 'percent' },
  'estadisticas-juegos-por-equipos': { name: 'Estadísticas de juegos por equipos', short: 'Juegos por Equipos', reportId: 6, icon: 'scoreboard' },
  'efectividad-por-posicion': { name: 'Efectividad por posición', short: 'Efectividad', reportId: 7, icon: 'radar' },
  'jugadores-de-un-equipo': { name: 'Jugadores de un equipo', short: 'Jugadores de Equipo', reportId: 8, icon: 'groups' },
};

// Consultas: tabla (value) -> ruta
// Solo tablas con datos legibles en el padrón público (las de solo IDs/FKs no se ofrecen).
export const QUERY_TABLES = [
  { value: 'Team', label: 'Equipos' },
  { value: 'Game', label: 'Juegos' },
  { value: 'Series', label: 'Series' },
  { value: 'Season', label: 'Temporadas' },
  { value: 'BaseballPlayer', label: 'Jugadores de Baseball' },
  { value: 'Pitcher', label: 'Pitchers' },
  { value: 'PlayerInPosition', label: 'Jugadores en Posición' },
];

// Helper: slug desde cadena (acentos/espacios)
export const slugify = (str) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
