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
from faker import Faker
from factory.django import DjangoModelFactory
from django.core.exceptions import ValidationError
from db_structure.models import User, Rol, TechnicalDirector, Worker, DirectionTeam, Team, Person, Position, BaseballPlayer, Season, Series, Pitcher, BPParticipation, LineUp, LineUp, TeamOnTheField, StarPlayer, PlayerInPosition, Score, Game, PlayerSwap, PlayerInLineUp

# Rol Factory
class RolFactory(DjangoModelFactory):
    class Meta:
        model = Rol

    type = factory.Iterator(["Admin", "Director Técnico", "Usuario General"])
    
    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        # Recuperar o crear la instancia del rol
        instance, _ = model_class.objects.get_or_create(*args, **kwargs)
        return instance

# Person Factory
class PersonFactory(DjangoModelFactory):
    class Meta:
        model = Person
    
    
    CI = factory.Faker('random_int', min=10000000, max=99999999)
    age = factory.Faker('random_int', min=18, max=45)
    name = factory.Faker('first_name')
    lastname = factory.Faker('last_name')
    bio = factory.Faker('paragraph', nb_sentences=3)
    birth_date = factory.Faker('date_of_birth', minimum_age=20, maximum_age=45)
    height_cm = factory.Faker('random_int', min=165, max=198)
    weight_kg = factory.Faker('random_int', min=75, max=110)
    nationality = factory.Faker('random_element', elements=['Rep. Dominicana', 'Venezuela', 'Cuba', 'México', 'Puerto Rico', 'Panamá', 'Estados Unidos', 'Colombia'])

# Worker Factory
class WorkerFactory(DjangoModelFactory):
    class Meta:
        model = Worker

    P_id = factory.SubFactory(PersonFactory)
    DT_id = None  # This can be assigned later

# Team Factory
class TeamFactory(DjangoModelFactory):
    class Meta:
        model = Team

    name = factory.Faker('city')
    color = factory.Faker('color_name')
    initials = factory.LazyAttribute(lambda o: ''.join([word[0] for word in o.name.split()]).upper())
    representative_entity = factory.Faker('company')
    founded_year = factory.Faker('random_int', min=1960, max=2000)
    stadium = factory.LazyAttribute(lambda o: f"Estadio {o.initials} Arena")
    capacity = factory.Faker('random_int', min=10000, max=40000)
    division = factory.Faker('random_element', elements=['Norte', 'Sur', 'Este', 'Oeste'])
    slogan = factory.Faker('sentence', nb_words=9)

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
    rol_id = factory.Faker('random_int', min=1, max=3)
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

    P_id = factory.SubFactory(PersonFactory)  # Assume PersonFactory exists
    batting_average = factory.Faker('pyfloat', positive=True, min_value=0.150, max_value=0.400, right_digits=3)
    years_of_experience = factory.Faker('random_int', min=1, max=20)
    home_runs = factory.Faker('random_int', min=0, max=40)
    rbi = factory.Faker('random_int', min=0, max=120)
    obp = factory.Faker('pyfloat', positive=True, min_value=0.200, max_value=0.500, right_digits=3)
    slg = factory.Faker('pyfloat', positive=True, min_value=0.250, max_value=0.700, right_digits=3)
    war = factory.Faker('pyfloat', min_value=-1.0, max_value=8.0, right_digits=1)
    bats = factory.Faker('random_element', elements=['R', 'L'])
    throws = factory.Faker('random_element', elements=['R', 'L'])
    pitcher = None  # Can be set explicitly

# Season Factory
class SeasonFactory(DjangoModelFactory):
    class Meta:
        model = Season
        
    name = factory.Faker('random_element', elements=['Spring-Summer', 'Fall-Winter', 'Spring', 'Winter', 'Summer', 'Fall'])

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

    P_id = factory.SubFactory(BaseballPlayerFactory)
    dominant_hand = factory.Faker('random_element', elements=['izquierda', 'derecha'])
    No_games_won = factory.Faker('random_int', min=0, max=20)
    No_games_lost = factory.Faker('random_int', min=0, max=20)
    running_average = factory.Faker('pyfloat', positive=True, max_value=5, right_digits=2)
    strikeouts = factory.Faker('random_int', min=20, max=200)
    innings_pitched = factory.Faker('pyfloat', positive=True, min_value=30, max_value=200, right_digits=1)
    saves = factory.Faker('random_int', min=0, max=35)
    whip = factory.Faker('pyfloat', positive=True, min_value=0.80, max_value=2.00, right_digits=2)

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
    fielding_pct = factory.Faker('pyfloat', positive=True, min_value=0.900, max_value=1.000, right_digits=3)
    double_plays = factory.Faker('random_int', min=0, max=150)
    bases_stolen = factory.Faker('random_int', min=0, max=40)
    assists_of = factory.Faker('random_int', min=0, max=300)

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


def populate_users_and_workers(team_numbers=6):
    # Crear roles predefinidos
    roles = {
        "Admin": RolFactory(type="Admin"),
        "Director Técnico": RolFactory(type="Director Técnico"),
        "Usuario General": RolFactory(type="Usuario General")
    }

    # Crear equipos y equipos de dirección
    teams = TeamFactory.create_batch(team_numbers)
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
                rol_id=roles["Director Técnico"],
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
                    rol_id=random.choice([roles["Admin"], roles["Usuario General"]]),
                    TD_id=None
                )
            )

    print(f"{len(users)} usuarios creados.")
    print(f"{len(workers)} trabajadores creados y asignados a equipos de dirección.")

    # Admin conocido para desarrollo
    admin_user, created = User.objects.get_or_create(
        email='lialopez@gmail.com',
        defaults={
            'password': 'lia',
            'rol_id': roles['Admin'],
            'TD_id': None,
        }
    )
    if created:
        print("Admin conocido creado: lialopez@gmail.com / lia")
    else:
        print("Admin conocido ya existía: lialopez@gmail.com")

    # Director Técnico conocido para desarrollo
    dt_person, _ = Person.objects.get_or_create(
        CI=20000001,
        defaults={
            'age': 45,
            'name': 'Carlos',
            'lastname': 'Garcia',
        }
    )
    # Montar la cadena Worker -> DirectionTeam -> TechnicalDirector ANTES de
    # insertar el usuario: la constraint a nivel BD exige TD_id no nulo para
    # el rol "Director Técnico" en el propio INSERT.
    first_team = teams[0] if teams else None
    dt_td = None
    if first_team:
        dt_worker = Worker.objects.filter(P_id=dt_person).first()
        if not dt_worker:
            dt_worker = Worker.objects.create(P_id=dt_person, DT_id=None)
        dt_dir_team = DirectionTeam.objects.filter(Team_id=first_team).first()
        if not dt_dir_team:
            dt_dir_team = DirectionTeam.objects.create(Team_id=first_team)
        dt_td = TechnicalDirector.objects.filter(direction_team=dt_dir_team).first()
        if not dt_td:
            dt_td = TechnicalDirector.objects.create(direction_team=dt_dir_team, W_id=dt_worker)

    dt_user, created = User.objects.get_or_create(
        email='director@test.com',
        defaults={
            'password': 'director',
            'rol_id': roles['Director Técnico'],
            'TD_id': dt_td,
        }
    )
    if created:
        print("Director Técnico conocido creado: director@test.com / director")
    else:
        print("Director Técnico conocido ya existía: director@test.com")

    # Usuario General conocido para desarrollo
    ug_person, _ = Person.objects.get_or_create(
        CI=30000001,
        defaults={
            'age': 25,
            'name': 'María',
            'lastname': 'López',
        }
    )
    ug_user, created = User.objects.get_or_create(
        email='general@test.com',
        defaults={
            'password': 'general',
            'rol_id': roles['Usuario General'],
            'TD_id': None,
        }
    )
    if created:
        print("Usuario General conocido creado: general@test.com / general")
    else:
        print("Usuario General conocido ya existía: general@test.com")

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
    pitcher_list = []
    
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
                pitcher_list.append(PitcherFactory(P_id=player))


    print(f"{len(baseball_players)} jugadores de béisbol creados y asignados a posiciones.")
    print(f"Jugadores con posición 'Pitcher' añadidos a la tabla Pitcher.")
    return {"positions": positions, "baseball_players": baseball_players, "team_player_mapping": team_player_mapping, "pitcher_list": pitcher_list}


def simulate_championship_with_participations(positions, team_player_mapping, season_numbers=4):
    # Crear temporadas y series
    seasons = SeasonFactory.create_batch(season_numbers)
    series = []

    # Anclar la temporada más reciente cerca de hoy: la última serie termina
    # ~10 días antes del presente y sus juegos programados (sin score) caen en
    # el futuro, alimentando el panel "Próximos Juegos" de la landing.
    base_date = datetime.now(pytz.UTC) - timedelta(days=320)
    for i, season in enumerate(seasons):
        start_date = base_date + timedelta(days=i * 80)  # Espaciado entre temporadas
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

        # Juegos programados (sin Score aún) para el denominador del calendario.
        # Fecha posterior al fin de la serie y única por (local, date) vía offset idx.
        SCHEDULED_PER_SERIES = 8
        shuffled_pairs = random.sample(team_pairs, len(team_pairs))
        for idx, (local_team_id, rival_team_id) in enumerate(shuffled_pairs[:SCHEDULED_PER_SERIES]):
            local_lineup = lineups[local_team_id]
            rival_lineup = lineups[rival_team_id]
            scheduled_date = s.end_date + timedelta(days=1 + idx * 3)
            games.append(
                GameFactory(
                    local=TeamOnTheFieldFactory(lineup_id=local_lineup),
                    rival=TeamOnTheFieldFactory(lineup_id=rival_lineup),
                    series=s,
                    score=None,
                    date=scheduled_date
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

    for g in games:
        g.save()
        
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


UPCOMING_SERIES_NAME = "Calendario Futuro LNB"


def schedule_upcoming_games(rounds=5, days_between=6):
    """
    Programa juegos futuros (round-robin) para que el panel DT muestre próximos partidos.

    Crea una serie nueva llamada UPCOMING_SERIES_NAME que comienza hoy, clona las
    participaciones de la serie más reciente (para que el bullpen del panel siga
    funcionando) y genera un round-robin sin score con fechas futuras espaciadas.
    Idempotente: si la serie ya existe, no hace nada.
    """
    if Series.objects.filter(name=UPCOMING_SERIES_NAME).exists():
        print(f"> '{UPCOMING_SERIES_NAME}' ya existe; no se agregaron juegos.")
        return

    teams = list(Team.objects.all().order_by('id'))
    if len(teams) < 2:
        print("> No hay suficientes equipos para programar futuros juegos.")
        return

    lineups = {}
    for team in teams:
        lineup = LineUp.objects.filter(team_id=team).first()
        if lineup:
            lineups[team.id] = lineup
    if not lineups:
        print("> No hay alineaciones de equipos; no se programó nada.")
        return

    now = datetime.now(pytz.UTC)
    season, _ = Season.objects.get_or_create(name="Temporada Futura")
    upcoming_series = SeriesFactory(
        season=season,
        name=UPCOMING_SERIES_NAME,
        init_date=now,
        end_date=now + timedelta(days=rounds * days_between + 7),
    )

    # Clonar participaciones desde la serie más reciente para que el bullpen funcione
    base_series = Series.objects.exclude(name=UPCOMING_SERIES_NAME).order_by('-end_date').first()
    added_participations = 0
    if base_series:
        for team in teams:
            for bp_id in BPParticipation.objects.filter(series=base_series, team_id=team).values_list('BP_id', flat=True):
                BPParticipation.objects.get_or_create(series=upcoming_series, team_id=team, BP_id_id=bp_id)
                added_participations += 1

    # Round-robin por rotación (cada equipo juega una vez por ronda)
    rotation = teams[:]
    round_robin = []
    for r in range(rounds):
        half = len(rotation) // 2
        for i in range(half):
            local, rival = rotation[i], rotation[-1 - i]
            if r % 2 == 1:
                local, rival = rival, local
            round_robin.append((local, rival, r))
        rotation = [rotation[0]] + [rotation[-1]] + rotation[1:-1]

    games_created = 0
    for local_team, rival_team, r in round_robin:
        if local_team.id not in lineups or rival_team.id not in lineups:
            continue
        game_date = (now + timedelta(days=3 + r * days_between)).replace(hour=19, minute=0, second=0, microsecond=0)
        GameFactory(
            local=TeamOnTheFieldFactory(lineup_id=lineups[local_team.id]),
            rival=TeamOnTheFieldFactory(lineup_id=lineups[rival_team.id]),
            series=upcoming_series,
            score=None,
            date=game_date,
        )
        games_created += 1

    print(f"> '{UPCOMING_SERIES_NAME}' creada: {games_created} juegos futuros, {added_participations} participaciones clonadas.")


def generate_player_portraits(players):
    """
    Genera retratos placeholder (gradiente + iniciales) con Pillow para cada jugador.
    Solo se crea si la persona aún no tiene foto.
    """
    from PIL import Image, ImageDraw, ImageFont
    from django.conf import settings

    media_players = os.path.join(settings.MEDIA_ROOT, 'players')
    os.makedirs(media_players, exist_ok=True)

    generated = 0
    for bp in players:
        person = bp.P_id
        if person.photo:
            continue
        initials = f"{person.name[0]}{person.lastname[0]}".upper()
        # Gradiente vertical entre dos tonos de la paleta
        top = (15, 42, 43)      # turf oscuro
        bottom = (181, 80, 47)  # clay
        w, h = 320, 400
        img = Image.new('RGB', (w, h))
        draw = ImageDraw.Draw(img)
        for y in range(h):
            t = y / (h - 1)
            draw.line(
                [(0, y), (w, y)],
                fill=tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)),
            )
        # Iniciales centradas
        try:
            font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 96)
        except OSError:
            font = ImageFont.load_default()
        bbox = draw.textbbox((0, 0), initials, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text(
            ((w - tw) / 2 - bbox[0], (h - th) / 2 - bbox[1]),
            initials,
            font=font,
            fill=(243, 239, 227, 255),
        )
        fname = f'person_{person.id}.png'
        img.save(os.path.join(media_players, fname))
        person.photo = f'players/{fname}'
        person.save(update_fields=['photo'])
        generated += 1

    print(f"Retratos placeholder generados para {generated} jugadores.")
    return generated


def backfill_person_biometrics():
    """
    Backfill de los campos nuevos de Person/BaseballPlayer sobre una BD ya sembrada:
    birth_date, height_cm, weight_kg, nationality, bats y throws a los registros sin valor.
    """
    from datetime import timedelta
    faker = Faker()
    NATIONALITIES = ['Rep. Dominicana', 'Venezuela', 'Cuba', 'México', 'Puerto Rico', 'Panamá', 'Estados Unidos', 'Colombia']

    updated = 0
    for person in Person.objects.filter(birth_date__isnull=True):
        person.birth_date = faker.date_of_birth(minimum_age=20, maximum_age=45)
        person.height_cm = faker.random_int(min=165, max=198)
        person.weight_kg = faker.random_int(min=75, max=110)
        person.nationality = faker.random_element(NATIONALITIES)
        person.save(update_fields=['birth_date', 'height_cm', 'weight_kg', 'nationality'])
        updated += 1

    player_updated = 0
    for bp in BaseballPlayer.objects.filter(bats__in=['', None]):
        bp.bats = faker.random_element(['R', 'L'])
        bp.throws = faker.random_element(['R', 'L'])
        bp.save(update_fields=['bats', 'throws'])
        player_updated += 1

    print(f"Backfill biométrico: {updated} personas, {player_updated} jugadores.")
    return updated + player_updated


def backfill_team_brand():
    """
    Backfill de los campos nuevos de Team (migración 0007) sobre una BD ya sembrada:
    founded_year, stadium, capacity, division y slogan.
    """
    faker = Faker()
    DIVISIONS = ['Norte', 'Sur', 'Este', 'Oeste']
    updated = 0
    for team in Team.objects.filter(founded_year__isnull=True):
        team.founded_year = faker.random_int(min=1960, max=2000)
        team.stadium = f"Estadio {team.initials} Arena"
        team.capacity = faker.random_int(min=10000, max=40000)
        team.division = faker.random_element(DIVISIONS)
        team.slogan = faker.sentence(nb_words=9)
        team.save(update_fields=['founded_year', 'stadium', 'capacity', 'division', 'slogan'])
        updated += 1
    print(f"Backfill de marca de equipos: {updated} equipos.")
    return updated


def seed_favorites_and_notifications(teams=None):
    """
    Siembra favoritos para los usuarios de prueba y registra un resultado
    nuevo para que el signal post_save de Score genere notificaciones.
    Idempotente: no duplica favoritos ni recrea el resultado si el usuario
    ya tiene notificaciones.
    """
    from db_structure.models import FavoriteTeam, FavoritePlayer, Notification

    general = User.objects.filter(email='general@test.com').first()
    admin = User.objects.filter(email='lialopez@gmail.com').first()
    team_list = list(teams or Team.objects.all()[:4])

    if not team_list:
        print("Sin equipos: no se sembraron favoritos.")
        return

    targets = [
        (general, team_list[:5]),
        (admin, team_list[-4:] if len(team_list) >= 4 else team_list[:1]),
    ]
    for user, fav_teams in targets:
        if not user:
            continue
        for team in fav_teams:
            FavoriteTeam.objects.get_or_create(user=user, team=team)

    if general:
        for bp in BaseballPlayer.objects.all()[:5]:
            FavoritePlayer.objects.get_or_create(user=general, player=bp)

    if admin:
        for bp in BaseballPlayer.objects.all()[5:10]:
            FavoritePlayer.objects.get_or_create(user=admin, player=bp)

    if (
        general
        and len(team_list) >= 2
        and team_list[0].id != team_list[1].id
        and not Notification.objects.filter(user=general).exists()
    ):
        from db_structure.signals import create_result_notifications

        # Resultado de muestra SIN persistir: reutiliza la misma lógica del signal
        # para redactar las notificaciones, pero no contamina Score/reportes.
        sample = Score(
            winner=team_list[0],
            loser=team_list[1],
            w_points=7,
            l_points=3,
        )
        created = create_result_notifications(sample)
        print(f"Notificaciones de ejemplo sembradas: {len(created)} (sin resultado sintético).")


def simulate_full_championship():
    user_worker_data = populate_users_and_workers(team_numbers=6)
    player_position_data = populate_baseball_players_and_positions(user_worker_data["teams"])
    generate_player_portraits(player_position_data["baseball_players"])
    backfill_person_biometrics()
    backfill_team_brand()
    championship_data = simulate_championship_with_participations(
        positions=player_position_data["positions"],
        team_player_mapping=player_position_data["team_player_mapping"],
        season_numbers=4
    )
    
    for pitcher in player_position_data['pitcher_list']:
        # pitcher.No_games_won = get_pitcher_wins(pitcher.id)
        # pitcher.No_games_lost = get_pitcher_losses(pitcher.id)
        pitcher.save()

    seed_favorites_and_notifications(user_worker_data["teams"])

    print("Simulación completa del campeonato.")
    return {**user_worker_data, **player_position_data, **championship_data}

# Llamar a la función para ejecutar todo el proceso
if __name__ == "__main__":
    simulate_full_championship()


