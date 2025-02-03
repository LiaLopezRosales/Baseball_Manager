# api/reports/queries.py

from django.db import connection
from django.db.models import Count, Sum
import db_structure.models as db
from django.db.models import Prefetch, Max, Q, F

# Obtener nombres de equipos ganadores y directores técnicos en series nacionales por temporada
def get_final_winner_teams_and_coaches_(season_name, season_type='National'):  
    
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

def get_final_winner_teams_and_coaches(season_name, season_type='National'):
    query = """
    WITH final_games AS (
        SELECT
            g."id" AS game_id,
            g."series_id",
            g."date",
            s."winner_id",
            s."loser_id",
            s."w_points",
            s."l_points",
            ROW_NUMBER() OVER (PARTITION BY g."series_id" ORDER BY g."date" DESC) AS rn
        FROM
            "db_structure_game" g
        JOIN
            "db_structure_score" s ON g."score_id" = s."id"
        WHERE
            g."series_id" IN (
                SELECT se."id"
                FROM "db_structure_series" se
                WHERE se."type" = %s
                  AND (%s IS NULL OR se."season_id" = (
                      SELECT sea."id"
                      FROM "db_structure_season" sea
                      WHERE sea."name" = %s
                  ))
            )
    )
    SELECT
        t."name" AS "Equipo",
        CONCAT(p."name", ' ', p."lastname") AS "Director Técnico",
        sea."name" AS "Temporada",
        ser."name" AS "Serie"
    FROM
        final_games fg
    JOIN
        "db_structure_team" t ON fg."winner_id" = t."id"
    JOIN
        "db_structure_directionteam" dt ON t."id" = dt."Team_id_id"
    LEFT JOIN
        "db_structure_technicaldirector" td ON dt."id" = td."direction_team_id"
    LEFT JOIN
        "db_structure_worker" w ON td."W_id_id" = w."id"
    LEFT JOIN
        "db_structure_person" p ON w."P_id_id" = p."id"
    JOIN
        "db_structure_series" ser ON fg."series_id" = ser."id"
    JOIN
        "db_structure_season" sea ON ser."season_id" = sea."id"
    WHERE
        fg.rn = 1;
    """
    
    # Parámetros para la consulta
    params = (season_type, season_name, season_name)

    # Ejecutar la consulta
    with connection.cursor() as cursor:
        cursor.execute(query, params)
        results = cursor.fetchall()

    # Convertir los resultados en una lista de diccionarios
    result_list = []
    for row in results:
        result_list.append({
            'Equipo': row[0],
            'Director Técnico': row[1],
            'Temporada': row[2],
            'Serie': row[3],
        })

    return result_list

# Obtener nombres y posiciones de jugadores del equipo "Todos Estrellas" y su efectividad por serie
def get_star_players_for_series_(series_name):
    
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

def get_star_players_for_series(series_name):
    query = """
    SELECT 
        p."name" AS "Nombre",
        p."lastname" AS "Apellido",
        pos."name" AS "Posición",
        pip."effectiveness" AS "Efectividad",
        s."name" AS "Serie"
    FROM 
        "db_structure_starplayer" sp
    JOIN 
        "db_structure_baseballplayer" bp ON sp."BP_id_id" = bp."P_id_id"
    JOIN 
        "db_structure_person" p ON bp."P_id_id" = p."id"
    JOIN 
        "db_structure_position" pos ON sp."position_id" = pos."id"
    JOIN 
        "db_structure_playerinposition" pip ON bp."P_id_id" = pip."BP_id_id" AND sp."position_id" = pip."position_id"
    JOIN 
        "db_structure_series" s ON sp."series_id" = s."id"
    """
    
    # Si se proporciona un nombre de serie, filtramos por él
    if series_name:
        query += " WHERE s.\"name\" = %s"
        params = (series_name,)
    else:
        params = None

    # Ejecutar la consulta
    with connection.cursor() as cursor:
        cursor.execute(query, params)
        results = cursor.fetchall()

    # Convertir los resultados en una lista de diccionarios
    result_list = []
    for row in results:
        result_list.append({
            "Nombre": row[0],
            "Apellido": row[1],
            "Posición": row[2],
            "Efectividad": row[3],
            "Serie": row[4]
        })

    return result_list

# Obtener series con mayor y menor cantidad de juegos celebrados
def get_max_min_game_per_series_():
    # Anotar la cantidad de juegos celebrados por serie
    series_with_counts = db.Series.objects.annotate(games_count=Count('game_series'))

    # Seleccionar la serie con mayor cantidad de juegos
    serie_con_más_juegos = series_with_counts.order_by('-games_count').first().__str__()

    # Seleccionar la serie con menor cantidad de juegos, excluyendo las que tienen 0 juegos
    serie_con_menos_juegos = series_with_counts.order_by('games_count').first().__str__()

    return [{ "Serie con más juegos": serie_con_más_juegos, 
             "Serie con menos juegos": serie_con_menos_juegos}]

def get_max_min_game_per_series():
    query = """
    WITH series_game_counts AS (
        SELECT
            s."id",
            s."name",
            COUNT(g."id") AS games_count
        FROM
            "db_structure_series" s
        LEFT JOIN
            "db_structure_game" g ON s."id" = g."series_id"
        GROUP BY
            s."id", s."name"
    )
    SELECT
        'Serie con más juegos: ' || smax."name" || ' (' || smax.games_count || ' juegos)' AS "serie con más juegos",
        'Serie con menos juegos: ' || smin."name" || ' (' || smin.games_count || ' juegos)' AS "serie con menos juegos"
    FROM
        (SELECT * FROM series_game_counts ORDER BY games_count DESC LIMIT 1) smax,
        (SELECT * FROM series_game_counts WHERE games_count > 0 ORDER BY games_count ASC LIMIT 1) smin;
    """
    
    # Ejecutar la consulta
    with connection.cursor() as cursor:
        cursor.execute(query)
        result = cursor.fetchone()

    # Formatear el resultado como una lista de diccionarios
    if result:
        return [{
            "Serie con más juegos": result[0],
            "Serie con menos juegos": result[1],
        }]
    else:
        return []

# Listar equipos en primer y último lugar por serie, clasificados por tipo y orden cronológico
def get_teams_by_series_(season_name):
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

def get_teams_by_series(season_name):
    query = """
    WITH team_stats AS (
        SELECT
            t."id" AS team_id,
            t."name" AS team_name,
            COUNT(CASE WHEN s."winner_id" = t."id" THEN 1 END) AS victories,
            COUNT(CASE WHEN s."loser_id" = t."id" THEN 1 END) AS losses,
            ser."id" AS series_id,
            ser."name" AS series_name,
            ser."type" AS series_type,
            sea."name" AS season_name
        FROM
            "db_structure_team" t
        LEFT JOIN
            "db_structure_score" s ON t."id" = s."winner_id" OR t."id" = s."loser_id"
        LEFT JOIN
            "db_structure_game" g ON s."id" = g."score_id"
        LEFT JOIN
            "db_structure_series" ser ON g."series_id" = ser."id"
        LEFT JOIN
            "db_structure_season" sea ON ser."season_id" = sea."id"
        WHERE
            %s IS NULL OR sea."name" = %s
        GROUP BY
            t."id", t."name", ser."id", ser."name", ser."type", sea."name"
    ),
    ranked_teams AS (
        SELECT
            ts."season_name",
            ts."series_name",
            ts."series_type",
            ts."team_name",
            ts."victories",
            ts."losses",
            ROW_NUMBER() OVER (PARTITION BY ts."series_id" ORDER BY ts."victories" DESC, ts."losses" ASC) AS rank_asc,
            ROW_NUMBER() OVER (PARTITION BY ts."series_id" ORDER BY ts."victories" ASC, ts."losses" DESC) AS rank_desc
        FROM
            team_stats ts
    )
    SELECT
        rt."season_name" AS "Temporada",
        rt."series_name" AS "Serie",
        rt."series_type" AS "Tipo",
        MAX(CASE WHEN rt.rank_asc = 1 THEN rt."team_name" END) AS "Equipo en Primer Lugar",
        MAX(CASE WHEN rt.rank_desc = 1 THEN rt."team_name" END) AS "Equipo en Ultimo Lugar"
    FROM
        ranked_teams rt
    GROUP BY
        rt."season_name", rt."series_name", rt."series_type";
    """
    
    # Parámetros para la consulta
    params = (season_name, season_name)

    # Ejecutar la consulta
    with connection.cursor() as cursor:
        cursor.execute(query, params)
        results = cursor.fetchall()

    # Convertir los resultados en una lista de diccionarios
    result_list = []
    for row in results:
        result_list.append({
            'Temporada': row[0],
            'Serie': row[1],
            'Tipo': row[2],
            'Equipo en Primer Lugar': row[3],
            'Equipo en Ultimo Lugar': row[4],
        })

    return result_list

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
def get_top_batting_average_players_():
    players = db.BaseballPlayer.objects.select_related('P_id').order_by('-batting_average')[:10]
    return [
        {
            "Nombre": player.P_id.name,
            "Apellido": player.P_id.lastname,
            "Promedio de Bateo": player.batting_average,
        }
        for player in players
    ]

def get_top_batting_average_players():
    query = """
    SELECT
        p."name" AS "Nombre",
        p."lastname" AS "Apellido",
        bp."batting_average" AS "Promedio de Bateo"
    FROM
        "db_structure_baseballplayer" bp
    JOIN
        "db_structure_person" p ON bp."P_id_id" = p."id"
    ORDER BY
        bp."batting_average" DESC
    LIMIT 10;
    """
    
    # Ejecutar la consulta
    with connection.cursor() as cursor:
        cursor.execute(query)
        results = cursor.fetchall()

    # Convertir los resultados en una lista de diccionarios
    result_list = []
    for row in results:
        result_list.append({
            "Nombre": row[0],
            "Apellido": row[1],
            "Promedio de Bateo": row[2],
        })

    return result_list

# Obtener estadísticas de puntos ganados, perdidos y juegos jugados por equipo.
def get_team_score_statistics_():
    stats = db.Score.objects.values('winner__name').annotate(
        games_played=Count('id'),
        total_points_won=Sum('w_points'),
        total_points_lost=Sum('l_points')
    )
    
    return list(stats)

def get_team_score_statistics():
    query = """
    SELECT
        t."name" AS "winner__name",
        COUNT(s."id") AS "games_played",
        SUM(s."w_points") AS "total_points_won",
        SUM(s."l_points") AS "total_points_lost"
    FROM
        "db_structure_score" s
    JOIN
        "db_structure_team" t ON s."winner_id" = t."id"
    GROUP BY
        t."name";
    """
    
    # Ejecutar la consulta
    with connection.cursor() as cursor:
        cursor.execute(query)
        results = cursor.fetchall()

    # Convertir los resultados en una lista de diccionarios
    result_list = []
    for row in results:
        result_list.append({
            "Equipo": row[0],
            "Total de juegos": row[1],
            "Total de puntos en juegos ganados": row[2],
            "Total de puntos en juegos perdidos": row[3],
        })

    return result_list

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
                "Equipo": team_name,
                "Series": []
            }
        
        players_series[player]["Series"].append(series_name)

    # Convertir el resultado en una lista
    return list(players_series.values())
    query = """
    WITH team_participations AS (
        SELECT
            p."name" AS player_name,
            p."lastname" AS player_lastname,
            s."name" AS series_name
        FROM
            "db_structure_bpparticipation" bp
        JOIN
            "db_structure_baseballplayer" b ON bp."BP_id_id" = b."P_id_id"
        JOIN
            "db_structure_person" p ON b."P_id_id" = p."id"
        JOIN
            "db_structure_series" s ON bp."series_id" = s."id"
        WHERE
            %s IS NULL OR bp."team_id_id" = (
                SELECT t."id"
                FROM "db_structure_team" t
                WHERE t."name" = %s
            )
    )
    SELECT
        player_name AS "Nombre",
        player_lastname AS "Apellido",
        ARRAY_AGG(series_name) AS "Series"
    FROM
        team_participations
    GROUP BY
        player_name, player_lastname;
    """
    
    # Parámetros para la consulta
    params = (team_name, team_name)

    # Ejecutar la consulta
    with connection.cursor() as cursor:
        cursor.execute(query, params)
        results = cursor.fetchall()

    # Convertir los resultados en una lista de diccionarios
    result_list = []
    for row in results:
        result_list.append({
            "Nombre": row[0],
            "Apellido": row[1],
            "Series": row[2],
        })

    return result_list