from django.db import connection
from django.db.models import Count
import db_structure.models as db
from django.db.models import Prefetch, Max, Q, F


cursor = connection.cursor()


def get_final_winner_teams_and_coaches(season_id):
    # Obtener series de la temporada específica
    series = db.Series.objects.filter(season_id=season_id)

    # Prefetch los juegos y filtrar el último juego de cada serie
    series = series.prefetch_related(
        Prefetch(
            'game_series',
            queryset=db.Game.objects.annotate(
                max_date=Max('date')  # Seleccionar el juego más reciente por serie
            ).select_related('score__winner__directionteam__technicaldirector__W_id__CI'),
            to_attr='final_games'  # Asignar juegos finales a un atributo específico
        )
    )

    # Recorrer las series y extraer datos de los ganadores de las finales
    result = []
    for serie in series:
        if serie.final_games:
            final_game = max(serie.final_games, key=lambda game: game.date)  # Tomar el último juego explícitamente
            if final_game.score and final_game.score.winner:
                team = final_game.score.winner
                technical_director = team.directionteam.technicaldirector
                result.append({
                    'team_name': team.name,
                    'coach_name': f"{technical_director.W_id.CI.name} {technical_director.W_id.CI.lastname}" if technical_director else "No asignado"
                })

    return result

def get_final_winner_teams_and_coaches_psql(season_id):
    query = """
        SELECT t.name AS team_name, p.name AS coach_name, p.lastname AS coach_lastname
        FROM series s
        JOIN (
            SELECT g.series_id, MAX(g.date) AS max_date
            FROM game g
            GROUP BY g.series_id
        ) AS final_games ON s.id = final_games.series_id
        JOIN game g ON g.series_id = final_games.series_id AND g.date = final_games.max_date
        JOIN score sc ON g.score_id = sc.id
        JOIN team t ON sc.winner_id = t.id
        LEFT JOIN directionteam dt ON t.id = dt.team_id
        LEFT JOIN technicaldirector td ON dt.id = td.direction_team_id
        LEFT JOIN worker w ON td.w_id = w.id
        LEFT JOIN person p ON w.ci_id = p.ci
        WHERE s.season_id = %s;
    """
    # Ejecutar la consulta con el parámetro
    cursor.execute(query, (season_id,))
    results = cursor.fetchall()

    # Construir la salida
    result = []
    for row in results:
        result.append({
            'team_name': row[0],
            'coach_name': f"{row[1]} {row[2]}" if row[1] and row[2] else "No asignado"
        })

    return result


def get_star_players_for_series(series_id):
    # Filtrar jugadores estrella por la serie especificada
    star_players = db.StarPlayer.objects.filter(series_id=series_id).select_related('BP_id__CI', 'position').prefetch_related('BP_id__playerinposition_bp')
    
    result = []
    for star_player in star_players:
        player = star_player.BP_id
        position = star_player.position
        effectiveness = player.playerinposition_bp.filter(position=position).first().effectiveness

        result.append({
            "name": player.CI.name,
            "lastname": player.CI.lastname,
            "position": position.name,
            "effectiveness": effectiveness,
        })
    
    return result

def get_star_players_for_series_psql(series_id):
    sql = """
    SELECT p.name, p.lastname, pos.name as position_name, pip.effectiveness
    FROM starplayer sp
    INNER JOIN baseballplayer bp ON sp.BP_id_id = bp.id
    INNER JOIN person p ON bp.CI_id = p.CI
    INNER JOIN position pos ON sp.position_id = pos.id
    INNER JOIN playerinposition pip ON pip.BP_id_id = sp.BP_id_id AND pip.position_id = sp.position_id
    WHERE sp.series_id = %s;
    """
    
    with connection.cursor() as cursor:
        cursor.execute(sql, [series_id])
        result = cursor.fetchall()
    
    return [
        {
            "name": row[0],
            "lastname": row[1],
            "position": row[2],
            "effectiveness": row[3],
        }
        for row in result
    ]


def get_max_min_game_per_series():
    series_with_counts = db.Series.objects.annotate(games_count=Count('game_series'))
    serie_con_más_juegos = series_with_counts.order_by('-games_count').first()
    serie_con_menos_juegos = series_with_counts.filter(games_count__gt=0).order_by('games_count').first()
    
    return serie_con_más_juegos, serie_con_menos_juegos

def get_max_min_game_per_series_psql():
    sql = """SELECT s.*, COUNT(g.id) as games_count
             FROM series s
             LEFT JOIN game s_g ON s.id = s_g.series_id
             GROUP BY s.id
             ORDER BY games_count DESC
             LIMIT 1;"""
    
    cursor.execute(sql)
    serie_con_más_juegos = cursor.fetchone()
    
    sql = """SELECT s.*, COUNT(g.id) as games_count
             FROM series s
             LEFT JOIN game s_g ON s.id = s_g.series_id
             GROUP BY s.id
             HAVING COUNT(g.id) > 0
             ORDER BY games_count ASC
             LIMIT 1;"""
    
    cursor.execute(sql)
    serie_con_menos_juegos = cursor.fetchone()
    
    return serie_con_más_juegos, serie_con_menos_juegos


def get_teams_by_series(season_id):
    # Filtrar las series por temporada
    series = db.Series.objects.filter(season_id=season_id)

    # Prefetch los juegos relacionados, ordenados por fecha
    games_prefetch = Prefetch(
        'game_series',
        queryset=db.Game.objects.select_related('score__winner', 'score__loser')
        .order_by('date')  # Ordenar los juegos por fecha
    )

    series = series.prefetch_related(games_prefetch)

    result = []

    for serie in series:
        # Obtener los equipos que participaron en la serie y contar las victorias y derrotas
        teams = db.Team.objects.annotate(
            victories=Count('winner_score', filter=Q(winner_score__game__series=serie)),
            losses=Count('loser_score', filter=Q(loser_score__game__series=serie))
        ).filter(
            winner_score__game__series=serie
        ).distinct()

        # Ordenar los equipos por el número de victorias (primer lugar) y derrotas (último lugar)
        sorted_teams = sorted(teams, key=lambda t: (t.victories, -t.losses), reverse=True)

        if sorted_teams:
            # El primer lugar es el equipo con más victorias
            first_place_team = sorted_teams[0]

            # El último lugar es el equipo con más derrotas
            last_place_team = sorted_teams[-1]

            result.append({
                'serie_name': serie.name,
                'serie_type': serie.type,
                'first_place_team': first_place_team.name,
                'last_place_team': last_place_team.name,
            })

    return result

def get_teams_by_series_psql(season_id):

    # Consulta SQL para obtener los equipos de primer y último lugar por serie
    query = """
    WITH team_stats AS (
        SELECT 
            t.id AS team_id,
            t.name AS team_name,
            COUNT(sc_winner.id) AS victories,
            COUNT(sc_loser.id) AS losses
        FROM team t
        LEFT JOIN score sc_winner ON sc_winner.winner_id = t.id
        LEFT JOIN score sc_loser ON sc_loser.loser_id = t.id
        JOIN game g ON g.series_id IN (SELECT id FROM series WHERE season_id = %s)
        WHERE g.score_id IS NOT NULL
        GROUP BY t.id
    )
    SELECT 
        s.name AS serie_name,
        s.type AS serie_type,
        first_team.team_name AS first_place_team,
        last_team.team_name AS last_place_team
    FROM series s
    JOIN team_stats first_team ON first_team.victories = (SELECT MAX(victories) FROM team_stats WHERE team_id = first_team.team_id)
    JOIN team_stats last_team ON last_team.losses = (SELECT MAX(losses) FROM team_stats WHERE team_id = last_team.team_id)
    WHERE s.season_id = %s
    ORDER BY s.type, s.init_date;
    """

    # Ejecutar la consulta pasando el parámetro season_id
    cursor.execute(query, (season_id, season_id))

    # Obtener los resultados
    results = cursor.fetchall()

    # Devolver los resultados
    return results


def get_pitcher_wins(pitcher_id):
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

def get_pitcher_losses(pitcher_id):
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
