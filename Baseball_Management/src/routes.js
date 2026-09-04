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

// Reportes: slug -> { nombre, report_id }
export const REPORT_ROUTES = {
  'equipos-ganadores': { name: 'Equipos ganadores y directores técnicos por temporadas', reportId: 0 },
  'jugadores-estrellas': { name: 'Jugadores estrellas', reportId: 1 },
  'primer-y-ultimo-lugar': { name: 'Primer y último lugar', reportId: 2 },
  'series-mas-menos-juegos': { name: 'Series con más/menos juegos celebrados', reportId: 3 },
  'carreras-limpias-juegos-ganados': { name: 'Carreras limpias/juegos ganados', reportId: 4 },
  average: { name: 'Average', reportId: 5 },
  'estadisticas-juegos-por-equipos': { name: 'Estadísticas de juegos por equipos', reportId: 6 },
  'efectividad-por-posicion': { name: 'Efectividad por posición', reportId: 7 },
  'jugadores-de-un-equipo': { name: 'Jugadores de un equipo', reportId: 8 },
};

// Consultas: tabla (value) -> ruta
export const QUERY_TABLES = [
  { value: 'Team', label: 'Equipos' },
  { value: 'Game', label: 'Juegos' },
  { value: 'Series', label: 'Series' },
  { value: 'Worker', label: 'Trabajadores' },
  { value: 'DirectionTeam', label: 'Equipos de Dirección' },
  { value: 'BaseballPlayer', label: 'Jugadores de Baseball' },
  { value: 'Season', label: 'Temporadas' },
  { value: 'Pitcher', label: 'Pitchers' },
  { value: 'TeamOnTheField', label: 'Equipo en Campo' },
  { value: 'StarPlayer', label: 'Jugador Estrella' },
  { value: 'PlayerInPosition', label: 'Jugadores en Posición' },
  { value: 'Score', label: 'Puntuaciones' },
  { value: 'BPParticipation', label: 'Participación de los Jugadores' },
  { value: 'PlayerSwap', label: 'Cambio de Jugador' },
  { value: 'PlayerInLineUp', label: 'Jugadores en Alineación' },
];

// Helper: slug desde cadena (acentos/espacios)
export const slugify = (str) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
