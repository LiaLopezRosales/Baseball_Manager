from django.db import connection
from django.db.models import Count, Sum
import db_structure.models as db
from django.db.models import Prefetch, Max, Q, F

# Obtener nombres de equipos ganadores y directores técnicos en series nacionales por temporada
def get_final_winner_teams_and_coaches(season_id):  
    # Obtener las series asociadas a la temporada específica
    series = db.Series.objects.filter(season_id=season_id)  

    # Prefetch los juegos relacionados y filtrar el último juego de cada serie
    series = series.prefetch_related(
        Prefetch(
            'game_series',
            queryset=db.Game.objects.annotate(
                max_date=Max('date')  # Seleccionar el juego más reciente de cada serie
            ).select_related('score__winner__directionteam__technicaldirector__W_id__CI'),
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
                    'team_name': team.name,
                    'coach_name': f"{technical_director.W_id.CI.name} {technical_director.W_id.CI.lastname}" if technical_director else "No asignado"
                })

    return result

# Obtener nombres y posiciones de jugadores del equipo "Todos Estrellas" y su efectividad por serie
def get_star_players_for_series(series_id):
    # Filtrar jugadores estrella asociados a la serie específica
    star_players = db.StarPlayer.objects.filter(series_id=series_id).select_related(
        'BP_id__CI', 'position'
    ).prefetch_related('BP_id__playerinposition_bp')

    result = []
    for star_player in star_players:
        player = star_player.BP_id
        position = star_player.position
        # Obtener la efectividad del jugador en la posición específica
        effectiveness = player.playerinposition_bp.filter(position=position).first().effectiveness

        result.append({
            "name": player.CI.name,
            "lastname": player.CI.lastname,
            "position": position.name,
            "effectiveness": effectiveness,
        })

    return result

# Obtener series con mayor y menor cantidad de juegos celebrados
def get_max_min_game_per_series():
    # Anotar la cantidad de juegos celebrados por serie
    series_with_counts = db.Series.objects.annotate(games_count=Count('game_series'))

    # Seleccionar la serie con mayor cantidad de juegos
    serie_con_más_juegos = series_with_counts.order_by('-games_count').first()

    # Seleccionar la serie con menor cantidad de juegos, excluyendo las que tienen 0 juegos
    serie_con_menos_juegos = series_with_counts.filter(games_count__gt=0).order_by('games_count').first()

    return serie_con_más_juegos, serie_con_menos_juegos

# Listar equipos en primer y último lugar por serie, clasificados por tipo y orden cronológico
def get_teams_by_series(season_id):
    # Filtrar las series asociadas a la temporada
    series = db.Series.objects.filter(season_id=season_id)

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
                'serie_name': serie.name,
                'serie_type': serie.type,
                'first_place_team': first_place_team.name,
                'last_place_team': last_place_team.name,
            })

    return result

# Obtener total de juegos ganados por un lanzador
def get_pitcher_wins(pitcher_id):
    # Filtrar los juegos ganados por el lanzador
    wins = db.Game.objects.filter(
        (
            Q(local__lineup_id__player_in_lineup__player_in_position__BP_id__pitcher_id=pitcher_id) &
            Q(score__winner=F('local__lineup_id__team_id'))
        ) |
        (
            Q(rival__lineup_id__player_in_lineup__player_in_position__BP_id__pitcher_id=pitcher_id) &
            Q(score__winner=F('rival__lineup_id__team_id'))
        )
    ).distinct().count()

    return wins

# Obtener total de juegos perdidos por un lanzador
def get_pitcher_losses(pitcher_id):
    # Filtrar los juegos ganados por el lanzador
    losses = db.Game.objects.filter(
        (
            Q(local__lineup_id__player_in_lineup__player_in_position__BP_id__pitcher_id=pitcher_id) &
            Q(score__loser=F('local__lineup_id__team_id'))
        ) |
        (
            Q(rival__lineup_id__player_in_lineup__player_in_position__BP_id__pitcher_id=pitcher_id) &
            Q(score__loser=F('rival__lineup_id__team_id'))
        )
    ).distinct().count()
    return losses

# Obtener el promedio de carreras limpias permitidas por un lanzador
def get_pitcher_wins_and_running_average(pitcher_id):
    wins = get_pitcher_wins(pitcher_id)  # Total de juegos ganados
    # Obtener el promedio de carreras limpias del lanzador
    running_average = db.Pitcher.objects.filter(id=pitcher_id).values_list('running_average', flat=True).first()

    return {
        "total_wins": wins,
        "running_average": running_average
    }

# Obtener los jugadores con mejor promedio de bateo.
def get_top_batting_average_players():
    players = db.BaseballPlayer.objects.select_related('CI').order_by('-batting_average')[:limit]
    return [
        {
            "name": player.CI.name,
            "lastname": player.CI.lastname,
            "batting_average": player.batting_average,
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
    players = db.PlayerInPosition.objects.select_related('BP_id__CI', 'position').order_by('-effectiveness')[:limit]
    return [
        {
            "position": player.position.name,
            "name": player.BP_id.CI.name,
            "lastname": player.BP_id.CI.lastname,
            "effectiveness": player.effectiveness,
        }
        for player in players
    ]

# Obtener los jugadores de un equipo específico que participaron en una serie dada. 
def get_team_players_at_a_specified_serie(team_id=id): 
    # Obtener todas las participaciones del equipo
    participations = db.BPParticipation.objects.filter(team_id__id=team_id).select_related('BP_id__CI', 'series')

    # Organizar la información por jugador
    players_series = {}
    for participation in participations:
        player = participation.BP_id.CI
        series_name = participation.series.name

        if player.CI not in players_series:
            players_series[player.CI] = {
                "name": player.name,
                "lastname": player.lastname,
                "series": []
            }
        
        players_series[player.CI]["series"].append(series_name)

    # Convertir el resultado en una lista
    return list(players_series.values())