# api/tests/integration/seed.py
# Seed autocontenido para la suite de integración sobre Postgres REAL.
#
# El runner de Django crea una base de test VACÍA (solo migraciones), así que
# la suite NO puede depender del seed de desarrollo (populate_db.py). Este
# módulo reconstruye un campeonato mínimo con las MISMAS factories que usa
# populate_db para que las consultas SQL crudas y los endpoints tengan datos
# reales en el mismo Postgres del CI.

from populate_db import (
    populate_users_and_workers,
    populate_baseball_players_and_positions,
    simulate_championship_with_participations,
    seed_favorites_and_notifications,
)
from db_structure.models import Series, Team


def seed_test_championship(team_numbers=6, season_numbers=1):
    """Construye un campeonato completo en la BD conectada.

    Reutiliza las funciones de populate_db (factory-based): roles, equipos,
    directores técnicos, jugadores con posiciones, temporadas/series, juegos
    con marcadores y favoritos/notificaciones de ejemplo.

    Devuelve el dict combinado con las referencias creadas (teams, users…),
    igual que simulate_full_championship().
    """
    user_worker_data = populate_users_and_workers(team_numbers=team_numbers)
    player_position_data = populate_baseball_players_and_positions(
        user_worker_data["teams"]
    )
    championship_data = simulate_championship_with_participations(
        positions=player_position_data["positions"],
        team_player_mapping=player_position_data["team_player_mapping"],
        season_numbers=season_numbers,
    )

    # El reporte 0 filtra por series 'National'; garantizar que al menos las
    # del seed lo sean para que la consulta SQL devuelva filas.
    Series.objects.all().update(type='National')

    # Favoritos + notificaciones de ejemplo para general/admin (idempotente).
    seed_favorites_and_notifications(user_worker_data["teams"])

    return {**user_worker_data, **player_position_data, **championship_data}


def first_team_name():
    """Nombre del primer equipo sembrado (para reporte 8)."""
    return Team.objects.order_by('id').first().name