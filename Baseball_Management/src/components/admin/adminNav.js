// Módulo Panel de Administración — ítems del sidebar "Formularios & CRUD".
// Cada ítem: { option } es la clave CRUD_ROUTES revesa? (option->slug vía toCRUDPath)
// y { label } es el texto mostrado (aliases legibles del sidebar).
export const ADMIN_NAV = [
  { option: 'Usuarios', label: 'Usuarios' },
  { option: 'Personas', label: 'Personas' },
  { option: 'Trabajadores', label: 'Trabajadores' },
  { option: 'Jugadores', label: 'Jugadores' },
  { option: 'Pitchers', label: 'Lanzadores' },
  { option: 'Direction Team', label: 'Equipos de Dirección' },
  { option: 'Directores Técnicos', label: 'Directores Técnicos' },
  { option: 'Temporadas', label: 'Temporadas' },
  { option: 'Series', label: 'Series' },
  { option: 'Juegos', label: 'Juegos' },
  { option: 'Puntuaciones', label: 'Marcadores' },
  { option: 'Equipos', label: 'Equipos' },
  { option: 'Alineaciones', label: 'Alineaciones' },
  { option: 'Jugadores en Alineación', label: 'Jugadores en Alineación' },
  { option: 'Intercambios de Jugadores', label: 'Cambios de Jugador' },
  { option: 'Equipos en el Campo', label: 'Equipos en el Campo' },
  { option: 'BP Participations', label: 'Participación de Jugadores' },
  { option: 'Posiciones', label: 'Posiciones' },
  { option: 'Jugadores en Posición', label: 'Jugadores en Posición' },
  { option: 'Jugadores Estrella', label: 'Jugadores Estrella' },
];

export const ADMIN_SIDEBAR_HEADING = 'Formularios & CRUD';