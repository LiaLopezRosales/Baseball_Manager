// tables.js
const tables = {
    TechnicalDirector: [ [ 'Nombre (Equipo)', 'direction_team__Team_id__name'], [ 'Color (Equipo)', 'direction_team__Team_id__color'], [ 'Iniciales (Equipo)', 'direction_team__Team_id__initials'], [ 'Entidad Representativa (Equipo)', 'direction_team__Team_id__representative_entity'], [ 'Edad (Persona)', 'W_id__P_id__age'], [ 'Nombre (Persona)', 'W_id__P_id__name'], [ 'Apellido (Persona)', 'W_id__P_id__lastname']] , 
    Worker: [[ 'Edad (Persona)', 'P_id__age'], [ 'Nombre (Persona)', 'P_id__name'], [ 'Apellido (Persona)', 'P_id__lastname'], [ 'Nombre (Equipo)', 'DT_id__Team_id__name'], [ 'Iniciales (Equipo)', 'DT_id__Team_id__initials'] ] , 
    DirectionTeam: [ [ 'Nombre (Equipo)', 'Team_id__name'], [ 'Iniciales (Equipo)', 'Team_id__initials'] ] , 
    Team: [ [ 'Nombre', 'name'], [ 'Color', 'color'], [ 'Iniciales', 'initials'], [ 'Entidad Representativa', 'representative_entity']] , 
    Person: [[ 'Edad', 'age'], [ 'Nombre', 'name'], [ 'Apellido', 'lastname']] , 
    Position: [ [ 'Nombre', 'name']] , 
    BaseballPlayer: [[ 'Edad (Persona)', 'P_id__age'], [ 'Nombre (Persona)', 'P_id__name'], [ 'Apellido (Persona)', 'P_id__lastname'], [ 'Promedio de Bateo', 'batting_average'], [ 'Años de Experiencia', 'years_of_experience']] , 
    Season: [ [ 'Nombre', 'name']] , 
    Series: [ [ 'Nombre (Temporada)', 'season__name'], [ 'Nombre', 'name'], [ 'Tipo', 'type'], [ 'Fecha de Inicio', 'init_date'], [ 'Fecha de Fin', 'end_date']] , 
    Pitcher: [ [ 'Nombre (Persona)', 'P_id__P_id__name'], [ 'Apellido (Persona)', 'P_id__P_id__lastname'], [ 'Promedio de Bateo (Jugador de Béisbol)', 'P_id__batting_average'], [ 'Mano Dominante', 'dominant_hand'], [ 'Juegos Ganados', 'No_games_won'], [ 'Juegos Perdidos', 'No_games_lost'], [ 'Promedio de Carreras', 'running_average']] , 
    BPParticipation: [[ 'Nombre (Persona)', 'BP_id__P_id__name'], [ 'Apellido (Persona)', 'BP_id__P_id__lastname'], [ 'Nombre (Temporada)', 'series__season__name'], [ 'Nombre (Serie)', 'series__name'], [ 'Tipo (Serie)', 'series__type'], [ 'Fecha de Inicio (Serie)', 'series__init_date'], [ 'Fecha de Fin (Serie)', 'series__end_date'], [ 'Nombre (Equipo)', 'team_id__name']] , 
    LineUp: [ [ 'Nombre (Equipo)', 'team_id__name'], [ 'Iniciales (Equipo)', 'team_id__initials']] , 
    TeamOnTheField: [ [ 'Nombre (Equipo)', 'lineup_id__team_id__name']] , 
    StarPlayer: [ [ 'Nombre (Temporada)', 'series__season__name'], [ 'Nombre (Serie)', 'series__name'], [ 'Tipo (Serie)', 'series__type'], [ 'Nombre (Posición)', 'position__name'], [ 'Nombre (Persona)', 'BP_id__P_id__name'], [ 'Apellido (Persona)', 'BP_id__P_id__lastname']] , 
    PlayerInPosition: [ [ 'Nombre (Persona)', 'BP_id__P_id__name'], [ 'Apellido (Persona)', 'BP_id__P_id__lastname'], [ 'Nombre (Posición)', 'position__name'], [ 'Efectividad', 'effectiveness']] , 
    Score: [ [ 'Nombre (Equipo Ganador)', 'winner__name'], [ 'Puntos Ganador', 'w_points'], [ 'Puntos Perdedor', 'l_points'], [ 'Nombre (Equipo Perdedor)', 'loser__name']] , 
    Game: [ [ 'Nombre (Equipo Ganador)', 'score__winner__name'], [ 'Nombre (Equipo Perdedor)', 'score__loser__name'], [ 'Fecha', 'date'], [ 'Nombre (Temporada)', 'series__season__name'], [ 'Nombre (Serie)', 'series__name'], [ 'Puntos Ganador (Puntaje)', 'score__w_points'], [ 'Puntos Perdedor (Puntaje)', 'score__l_points']] , 
    PlayerSwap: [ [ 'Nombre (Jugador Entrante)', 'old_player__P_id__name'], [ 'Apellido (Jugador Entrante)', 'old_player__P_id__lastname'], [ 'Nombre (Jugador Saliente)', 'new_player__P_id__name'], [ 'Apellido (Jugador Saliente)', 'new_player__P_id__lastname'], [ 'Fecha', 'date'], [ 'Nombre (Posición)', 'position__name'], [ 'Nombre (Equipo)', 'game_team__lineup_id__team_id__name']] , 
    PlayerInLineUp: [ [ 'Nombre (Equipo)', 'line_up__team_id__name'], [ 'Nombre (Persona)', 'player_in_position__BP_id__P_id__name'], [ 'Apellido (Persona)', 'player_in_position__BP_id__P_id__lastname'], [ 'Nombre (Posición)', 'player_in_position__position__name']] 
};

const getFieldsForTable = (tableName) => {
    return tables[tableName] || [];
};

export { tables, getFieldsForTable };