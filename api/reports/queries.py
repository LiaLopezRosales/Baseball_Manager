# api/reports/queries.py

from django.db import connection
from django.db.models import Count, Sum
import db_structure.models as db
from django.db.models import Prefetch, Max, Q, F

# Obtener nombres de equipos ganadores y directores técnicos en series nacionales por temporada
def get_final_winner_teams_and_coaches(season_name, season_type='National'):  
    
    if not season_name:
       series = db.Series.objects.filter(type=season_type)  
    else:
        # Obtener las series asociadas a la temporada específica
        series = db.Series.objects.filter(season__name=season_name,type=season_type) 

    # Prefetch los juegos relacionados y filtrar el último juego de cada serie
    series = series.prefetch_related(
        Prefetch(
            'game_series',
            queryset=db.Game.objects.annotate(
                max_date=Max('date')  # Seleccionar el juego más reciente de cada serie
            ).select_related('score__winner__directionteam__technicaldirector__W_id__P_id'),
            to_attr='final_games'  # Almacenar los juegos finales en un atributo específico
        )
    )

    # Recorrer las series y extraer los datos de los equipos ganadores y sus directores técnicos
    result = []
    for serie in series:
        if serie.final_games:
            final_game = max(serie.final_games, key=lambda game: game.date)  # Identificar el último juego explícitamente
            if final_game.score and final_game.score.winner:
                team = final_game.score.winner
                technical_director = team.directionteam.technicaldirector
                result.append({
                    'Equipo': team.name,
                    'Director Técnico': f"{technical_director.W_id.P_id.name} {technical_director.W_id.P_id.lastname}" if technical_director else "No asignado",
                    'Temporada': serie.season.name,
                    'Serie': serie.name,
                })

    return result

# Obtener nombres y posiciones de jugadores del equipo "Todos Estrellas" y su efectividad por serie
def get_star_players_for_series(series_name):
    
    if not series_name:
       star_players = db.StarPlayer.objects.select_related(
        'BP_id__P_id', 'position').prefetch_related('BP_id__playerinposition_bp') 
    else:
     # Obtener las series asociadas a la temporada específica
        star_players = db.StarPlayer.objects.filter(series__name=series_name).select_related(
        'BP_id__P_id', 'position').prefetch_related('BP_id__playerinposition_bp')

    
    # Filtrar jugadores estrella asociados a la serie específica
    result = []
    for star_player in star_players:
        player = star_player.BP_id
        position = star_player.position
        # Obtener la efectividad del jugador en la posición específica
        effectiveness = player.playerinposition_bp.filter(position=position).first().effectiveness

        result.append({
            "Nombre": player.P_id.name,
            "Apellido": player.P_id.lastname,
            "Posición": position.name,
            "Efectividad": effectiveness,
            "Serie": star_player.series.name
        })
        
    return result

# Obtener series con mayor y menor cantidad de juegos celebrados
def get_max_min_game_per_series():
    # Anotar la cantidad de juegos celebrados por serie
    series_with_counts = db.Series.objects.annotate(games_count=Count('game_series'))

    # Seleccionar la serie con mayor cantidad de juegos
    serie_con_más_juegos = series_with_counts.order_by('-games_count').first().__str__()

    # Seleccionar la serie con menor cantidad de juegos, excluyendo las que tienen 0 juegos
    serie_con_menos_juegos = series_with_counts.order_by('games_count').first().__str__()

    return [{ "serie con más juegos": serie_con_más_juegos, 
             "serie con menos juegos": serie_con_menos_juegos}]

# Listar equipos en primer y último lugar por serie, clasificados por tipo y orden cronológico
def get_teams_by_series(season_name):
    # Filtrar las series asociadas a la temporada
    
    if not season_name:
        series = db.Series.objects
    else:
        series = db.Series.objects.filter(season__name=season_name)

    # Prefetch los juegos relacionados y ordenarlos por fecha
    games_prefetch = Prefetch(
        'game_series',
        queryset=db.Game.objects.select_related('score__winner', 'score__loser').order_by('date')
    )
    series = series.prefetch_related(games_prefetch)

    result = []

    for serie in series:
        # Anotar las victorias y derrotas de los equipos en la serie
        teams = db.Team.objects.annotate(
            victories=Count('winner_score', filter=Q(winner_score__game__series=serie)),
            losses=Count('loser_score', filter=Q(loser_score__game__series=serie))
        ).filter(winner_score__game__series=serie).distinct()

        # Ordenar los equipos por victorias (primer lugar) y derrotas (último lugar)
        sorted_teams = sorted(teams, key=lambda t: (t.victories, -t.losses), reverse=True)

        if sorted_teams:
            first_place_team = sorted_teams[0]  # Equipo en primer lugar
            last_place_team = sorted_teams[-1]  # Equipo en último lugar

            result.append({
                'Temporada': serie.season.name,
                'Serie': serie.name,
                'Tipo': serie.type,
                'Equipo en Primer Lugar': first_place_team.name,
                'Equipo en Ultimo Lugar': last_place_team.name,
            })

    return result

# Obtener total de juegos ganados por un lanzador
def get_pitcher_wins(pitcher_id=None, player_id=None):
    # Filtrar los juegos ganados por el lanzador
    if not player_id:
        player_id = db.Pitcher.objects.filter(id=pitcher_id).values_list('P_id', flat=True)[0]
    wins = db.Game.objects.filter(
        (
            Q(local__lineup_id__player_in_lineup__player_in_position__BP_id__P_id=player_id) &
            Q(score__winner=F('local__lineup_id__team_id'))
        ) |
        (
            Q(rival__lineup_id__player_in_lineup__player_in_position__BP_id__P_id=player_id) &
            Q(score__winner=F('rival__lineup_id__team_id'))
        )
    ).distinct().count()

    return wins

# Obtener total de juegos perdidos por un lanzador
def get_pitcher_losses(pitcher_id=None, player_id=None):
    # Filtrar los juegos ganados por el lanzador
    if not player_id:
        player_id = db.Pitcher.objects.filter(id=pitcher_id).values_list('P_id', flat=True)[0]
    losses = db.Game.objects.filter(
        (
            Q(local__lineup_id__player_in_lineup__player_in_position__BP_id__P_id=player_id) &
            Q(score__loser=F('local__lineup_id__team_id'))
        ) |
        (
            Q(rival__lineup_id__player_in_lineup__player_in_position__BP_id__P_id=player_id) &
            Q(score__loser=F('rival__lineup_id__team_id'))
        )
    ).distinct().count()
    return losses

# Obtener el promedio de carreras limpias permitidas por un lanzador
def get_pitcher_wins_and_running_average(pitcher_name=None, pitcher_lastname=None):
    if pitcher_name and pitcher_lastname:
        list = db.Pitcher.objects.filter(P_id__P_id__name__startswith=pitcher_name, P_id__P_id__lastnam__startswith=pitcher_lastname)
    elif pitcher_name:
        list = db.Pitcher.objects.filter(P_id__P_id__name__startswith=pitcher_name)
    elif pitcher_lastname:
        list = db.Pitcher.objects.filter(P_id__P_id__lastname__startswith=pitcher_lastname)
    else:
        list = db.Pitcher.objects
    
    group_list = list.values_list('P_id','id', 'P_id__P_id__name', 'P_id__P_id__lastname')
    data = []
    
    for pitcher_prop in group_list:    
        # Total de juegos ganados
        wins = get_pitcher_wins(player_id=pitcher_prop[0])
        # Obtener el promedio de carreras limpias del lanzador
        running_average = db.Pitcher.objects.filter(id=pitcher_prop[1]).values_list('running_average', flat=True).first()

        data.append({
            "Nombre": pitcher_prop[2],
            "Apellido": pitcher_prop[3],
            "Juegos Ganados": wins,
            "Promedio de Carreras Limpias": running_average
        })
        
    return data 

# Obtener los jugadores con mejor promedio de bateo.
def get_top_batting_average_players():
    players = db.BaseballPlayer.objects.select_related('P_id').order_by('-batting_average')[:10]
    return [
        {
            "Nombre": player.P_id.name,
            "Apellido": player.P_id.lastname,
            "Promedio de Bateo": player.batting_average,
        }
        for player in players
    ]

# Obtener estadísticas de puntos ganados, perdidos y juegos jugados por equipo.
def get_team_score_statistics():
    stats = db.Score.objects.values('winner__name').annotate(
        games_played=Count('id'),
        total_points_won=Sum('w_points'),
        total_points_lost=Sum('l_points')
    )
    return list(stats)

# Obtener los jugadores con mayor efectividad por posición.
def get_player_effectiveness_by_position():
    players = db.PlayerInPosition.objects.select_related('BP_id__P_id', 'position').order_by('-effectiveness')[:10]
    return [
        {
            "Posición": player.position.name,
            "Nombre": player.BP_id.P_id.name,
            "Apellido": player.BP_id.P_id.lastname,
            "Efectividad": player.effectiveness,
        }
        for player in players
    ]

# Obtener los jugadores de un equipo específico que participaron en una serie dada. 
def get_team_players_at_a_specified_serie(team_name): 
    
    if not team_name:
        participations = db.BPParticipation.objects.select_related('BP_id__P_id', 'series')
    else:
        # Obtener todas las participaciones del equipo
        participations = db.BPParticipation.objects.filter(team_id__name=team_name).select_related('BP_id__P_id', 'series')

    # Organizar la información por jugador
    players_series = {}
    for participation in participations:
        player =  participation.BP_id.P_id
        series_name = participation.series.name

        if player not in players_series:
            players_series[player] = {
                "Nombre": player.name,
                "Apellido": player.lastname,
                "Series": []
            }
        
        players_series[player]["Series"].append(series_name)

    # Convertir el resultado en una lista
    return list(players_series.values())