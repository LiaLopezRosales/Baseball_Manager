import os
import django

# Configurar el entorno de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Baseball_Manager.settings')  # Cambia por tu proyecto
django.setup()

import factory
import pytz
import random
from collections import defaultdict
from datetime import datetime, timedelta
from factory.django import DjangoModelFactory
from django.core.exceptions import ValidationError
from db_structure.models import User, Rol, TechnicalDirector, Worker, DirectionTeam, Team, Person, Position, BaseballPlayer, Season, Series, Pitcher, BPParticipation, LineUp, LineUp, TeamOnTheField, StarPlayer, PlayerInPosition, Score, Game, PlayerSwap, PlayerInLineUp

# Rol Factory
class RolFactory(DjangoModelFactory):
    class Meta:
        model = Rol

    type = factory.Iterator(["periodistas", "admin", "dt"])

# Person Factory
class PersonFactory(DjangoModelFactory):
    class Meta:
        model = Person

    CI = factory.Faker('random_int', min=10000000, max=99999999)
    age = factory.Faker('random_int', min=18, max=70)
    name = factory.Faker('first_name')
    lastname = factory.Faker('last_name')

# Worker Factory
class WorkerFactory(DjangoModelFactory):
    class Meta:
        model = Worker

    CI = factory.SubFactory(PersonFactory)
    DT_id = None  # This can be assigned later

# Team Factory
class TeamFactory(DjangoModelFactory):
    class Meta:
        model = Team

    name = factory.Faker('city')
    color = factory.Faker('color_name')
    initials = factory.LazyAttribute(lambda o: ''.join([word[0] for word in o.name.split()]).upper())
    representative_entity = factory.Faker('company')

# DirectionTeam Factory
class DirectionTeamFactory(DjangoModelFactory):
    class Meta:
        model = DirectionTeam

    Team_id = factory.SubFactory(TeamFactory)

# TechnicalDirector Factory
class TechnicalDirectorFactory(DjangoModelFactory):
    class Meta:
        model = TechnicalDirector

    direction_team = factory.SubFactory(DirectionTeamFactory)
    W_id = factory.SubFactory(WorkerFactory)

# User Factory
class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Faker('email')
    password = factory.Faker('password')
    rol_id = factory.SubFactory(RolFactory)
    TD_id = factory.Maybe(
        'rol_id',
        yes_declaration=factory.SubFactory(TechnicalDirectorFactory),
        no_declaration=None
    )

# Position Factory
class PositionFactory(DjangoModelFactory):
    class Meta:
        model = Position

    name = factory.Iterator([
        'Pitcher', 'Catcher', 'First Base', 'Second Base', 
        'Third Base', 'Shortstop', 'Left Field', 'Center Field', 'Right Field'
    ])

# BaseballPlayer Factory
class BaseballPlayerFactory(DjangoModelFactory):
    class Meta:
        model = BaseballPlayer

    CI = factory.SubFactory(PersonFactory)  # Assume PersonFactory exists
    batting_average = factory.Faker('pyfloat', positive=True, max_value=1, right_digits=3)
    years_of_experience = factory.Faker('random_int', min=1, max=20)
    pitcher = None  # Can be set explicitly

# Season Factory
class SeasonFactory(DjangoModelFactory):
    class Meta:
        model = Season

# Series Factory
class SeriesFactory(DjangoModelFactory):
    class Meta:
        model = Series

    season = factory.SubFactory(SeasonFactory)
    name = factory.Sequence(lambda n: f"Serie-{n + 1}")
    type = factory.Faker('random_element', elements=['National', 'Provincial'])
    init_date = factory.LazyFunction(lambda: datetime.now(pytz.UTC))
    end_date = factory.LazyAttribute(lambda o: o.init_date + timedelta(days=30))

# Pitcher Factory
class PitcherFactory(DjangoModelFactory):
    class Meta:
        model = Pitcher

    CI = factory.SubFactory(BaseballPlayerFactory)
    dominant_hand = factory.Faker('random_element', elements=['izquierda', 'derecha'])
    No_games_won = factory.Faker('random_int', min=0, max=20)
    No_games_lost = factory.Faker('random_int', min=0, max=20)
    running_average = factory.Faker('pyfloat', positive=True, max_value=5, right_digits=2)

# BPParticipation Factory
class BPParticipationFactory(DjangoModelFactory):
    class Meta:
        model = BPParticipation

    BP_id = factory.SubFactory(BaseballPlayerFactory)
    series = factory.SubFactory(SeriesFactory)
    team_id = factory.SubFactory(TeamFactory)

# LineUp Factory
class LineUpFactory(DjangoModelFactory):
    class Meta:
        model = LineUp

    team_id = factory.SubFactory(TeamFactory)

# LineUp Factory
class LineUpFactory(DjangoModelFactory):
    class Meta:
        model = LineUp

    team_id = factory.SubFactory(TeamFactory)  

# TeamOnTheField Factory
class TeamOnTheFieldFactory(DjangoModelFactory):
    class Meta:
        model = TeamOnTheField

    lineup_id = factory.SubFactory(LineUpFactory)

# StarPlayer Factory
class StarPlayerFactory(DjangoModelFactory):
    class Meta:
        model = StarPlayer

    series = factory.SubFactory(SeriesFactory)  
    position = factory.SubFactory(PositionFactory)  
    BP_id = factory.SubFactory(BaseballPlayerFactory)  

# PlayerInPosition Factory
class PlayerInPositionFactory(DjangoModelFactory):
    class Meta:
        model = PlayerInPosition

    BP_id = factory.SubFactory(BaseballPlayerFactory)  
    position = factory.SubFactory(PositionFactory)  
    effectiveness = factory.Faker('pyfloat', positive=True, max_value=1, right_digits=3)

# Score Factory
class ScoreFactory(DjangoModelFactory):
    class Meta:
        model = Score

    winner = factory.SubFactory(TeamFactory)  
    loser = factory.SubFactory(TeamFactory)
    w_points = factory.Faker('random_int', min=0, max=20)
    l_points = factory.LazyAttribute(lambda o: abs(o.w_points - factory.Faker('random_int', min=0, max=5).generate({})))

# Game Factory
class GameFactory(DjangoModelFactory):
    class Meta:
        model = Game

    local = factory.SubFactory(TeamOnTheFieldFactory)
    rival = factory.SubFactory(TeamOnTheFieldFactory)
    series = factory.SubFactory(SeriesFactory)  
    score = factory.SubFactory(ScoreFactory)
    date = factory.LazyAttribute(lambda o: o.series.init_date + timedelta(days=factory.Faker('random_int', min=0, max=30).generate({})))

# PlayerSwap Factory
class PlayerSwapFactory(DjangoModelFactory):
    class Meta:
        model = PlayerSwap

    old_player = factory.SubFactory(BaseballPlayerFactory)  
    new_player = factory.SubFactory(BaseballPlayerFactory)
    position = factory.SubFactory(PositionFactory)  
    game_team = factory.SubFactory(TeamOnTheFieldFactory)
    date = factory.Faker('date_time_this_year', tzinfo=pytz.UTC)

# PlayerInLineUp Factory
class PlayerInLineUpFactory(DjangoModelFactory):
    class Meta:
        model = PlayerInLineUp

    line_up = factory.SubFactory(LineUpFactory)
    player_in_position = factory.SubFactory(PlayerInPositionFactory)


def populate_users_and_workers():
    # Crear roles predefinidos
    roles = {
        "admin": RolFactory(type="admin"),
        "dt": RolFactory(type="dt"),
        "periodista": RolFactory(type="periodistas")
    }

    # Crear equipos y equipos de dirección
    teams = TeamFactory.create_batch(4)
    direction_teams = [DirectionTeamFactory(Team_id=team) for team in teams]

    # Crear usuarios y directores técnicos
    users = []
    technical_directors = []
    workers = []

    for direction_team in direction_teams:
        # Crear un director técnico y asignarlo al equipo de dirección
        worker = WorkerFactory(DT_id=direction_team)
        technical_director = TechnicalDirectorFactory(direction_team=direction_team, W_id=worker)
        technical_directors.append(technical_director)

        # Crear usuario asociado al director técnico
        users.append(
            UserFactory(
                rol_id=roles["dt"],
                TD_id=technical_director
            )
        )

    # Crear trabajadores no directores técnicos
    for i in range(10):  # 10 trabajadores
        worker = WorkerFactory()
        workers.append(worker)

        # Asignar trabajadores a equipos de dirección
        worker.DT_id = random.choice(direction_teams)
        worker.save()

        # Crear usuario aleatorio
        if i%2==0:
            users.append(
                UserFactory(
                    rol_id=random.choice([roles["admin"], roles["periodista"]]),
                    TD_id=None
                )
            )

    print(f"{len(users)} usuarios creados.")
    print(f"{len(workers)} trabajadores creados y asignados a equipos de dirección.")
    return {
        "roles": roles,
        "users": users,
        "workers": workers,
        "teams": teams,
        "direction_teams": direction_teams,
        "technical_directors": technical_directors
    }


def populate_baseball_players_and_positions(teams):
    # Crear posiciones estándar
    positions = PositionFactory.create_batch(9)

    # Crear jugadores de béisbol
    num_players = len(teams) * len(positions) * 2  # 2 jugadores por posición por equipo
    baseball_players = BaseballPlayerFactory.create_batch(num_players)

    # Asignar posiciones y efectividad
    team_player_mapping = {}
    for i, team in enumerate(teams):
        team_players = baseball_players[i * 18:(i + 1) * 18]  # 18 jugadores por equipo
        team_player_mapping[team] = team_players

        for j, player in enumerate(team_players):
            position = positions[j % len(positions)]
            PlayerInPositionFactory(
                BP_id=player,
                position=position,
                effectiveness=random.uniform(0.5, 1.0)
            )

            # Si la posición es "Pitcher", agregar a la tabla Pitcher
            if position.name == "Pitcher":
                pitcher = PitcherFactory(CI=player)


    print(f"{len(baseball_players)} jugadores de béisbol creados y asignados a posiciones.")
    print(f"Jugadores con posición 'Pitcher' añadidos a la tabla Pitcher.")
    return {"positions": positions, "baseball_players": baseball_players, "team_player_mapping": team_player_mapping}


def simulate_championship_with_participations(positions, team_player_mapping):
    # Crear temporadas y series
    seasons = SeasonFactory.create_batch(2)  # Dos temporadas
    series = []

    for i, season in enumerate(seasons):
        start_date = datetime(2024, 1, 1) + timedelta(days=i * 80)  # Espaciado entre temporadas
        for j in range(2):  # 2 series por temporada
            series.append(
                SeriesFactory(
                    season=season,
                    init_date=start_date + timedelta(days=j * 40),
                    end_date=start_date + timedelta(days=j * 40 + 30)
                )
            )

    # Crear participaciones
    participations = []
    for team_id, players in team_player_mapping.items():
        for player in players:
            for s in series:
                participations.append(
                    BPParticipationFactory(
                        BP_id=player,
                        series=s,
                        team_id=team_id
                    )
                )

    # Crear LineUps para cada equipo
    lineups = {}
    for team_id in team_player_mapping.keys():
        lineups[team_id] = LineUpFactory(team_id=team_id)

    # Simular juegos y marcadores
    games = []
    scores = []
    for s in series:
        team_pairs = [(team1, team2) for team1 in team_player_mapping.keys() for team2 in team_player_mapping.keys() if team1 != team2]
        for local_team_id, rival_team_id in team_pairs:
            local_lineup = lineups[local_team_id]
            rival_lineup = lineups[rival_team_id]
            local_field_team = TeamOnTheFieldFactory(lineup_id=local_lineup)
            rival_field_team = TeamOnTheFieldFactory(lineup_id=rival_lineup)

            winner, loser = random.sample([local_team_id, rival_team_id], 2)
            score = ScoreFactory(
                winner=winner,
                loser=loser,
                w_points=random.randint(5, 15),
                l_points=random.randint(0, 5)
            )
            scores.append(score)

            game_date = s.init_date + timedelta(days=random.randint(0, 29))
            games.append(
                GameFactory(
                    local=local_field_team,
                    rival=rival_field_team,
                    series=s,
                    score=score,
                    date=game_date
                )
            )

    # Poblar tabla PlayerInLineUp con los mismos LineUps
    player_in_lineup = []
    for team_id, players in team_player_mapping.items():
        lineup = lineups[team_id]  # Usar los mismos LineUps creados previamente
        for position in positions:
            player = random.choice([p for p in players if any(pp.position == position for pp in p.playerinposition_bp.all())])
            player_in_lineup.append(
                PlayerInLineUpFactory(
                    line_up=lineup,
                    player_in_position=player.playerinposition_bp.first()
                )
            )

    # Poblar tabla PlayerSwap
    player_swaps = []
    for game in games:
        local_team_players = team_player_mapping[game.local.lineup_id.team_id]
        rival_team_players = team_player_mapping[game.rival.lineup_id.team_id]

    for team_players, field_team in [(local_team_players, game.local), (rival_team_players, game.rival)]:
        for position in positions:
            if random.randint(1, 100) % 2:
                lineup_player = next(p for p in team_players if any(pp.position == position for pp in p.playerinposition_bp.all()))
                bench_player = random.choice([p for p in team_players if p != lineup_player])
                
                # Verificar si ya existe un swap para el jugador en la misma fecha
                existing_swap = PlayerSwap.objects.filter(
                    old_player=lineup_player,
                    date=game.date
                ).exists()

                if not existing_swap:
                    player_swaps.append(
                        PlayerSwapFactory(
                            old_player=lineup_player,
                            new_player=bench_player,
                            position=position,
                            game_team=field_team,
                            date=game.date
                        )
                    )


    # Seleccionar jugadores estrella por posición
    star_players = []
    for s in series:
        for position in positions:
            position_players = [
                p for p in participations if p.series == s and any(
                    pp.position == position for pp in p.BP_id.playerinposition_bp.all()
                )
            ]
            if position_players:
                best_player = max(position_players, key=lambda p: random.random())
                star_players.append(
                    StarPlayerFactory(
                        series=s,
                        position=position,
                        BP_id=best_player.BP_id
                    )
                )

    print("Campeonato simulado exitosamente.")
    return {
        "seasons": seasons,
        "series": series,
        "participations": participations,
        "games": games,
        "scores": scores,
        "player_in_lineup": player_in_lineup,
        "player_swaps": player_swaps, 
        "star_player": star_players
    }


def simulate_full_championship():
    user_worker_data = populate_users_and_workers()
    player_position_data = populate_baseball_players_and_positions(user_worker_data["teams"])
    championship_data = simulate_championship_with_participations(
        positions=player_position_data["positions"],
        team_player_mapping=player_position_data["team_player_mapping"]
    )

    print("Simulación completa del campeonato.")
    return {**user_worker_data, **player_position_data, **championship_data}

# Llamar a la función para ejecutar todo el proceso
if __name__ == "__main__":
    simulate_full_championship()


