from django.test import TestCase
from django.core.exceptions import ValidationError
from ..models import *

class UserModelTestCase(TestCase):
    
    def setUp(self):
        self.rol_dt = Rol.objects.create(type="Director")
        
    def test_create_user(self):
        rol_admin2=Rol.objects.create(type="Admin")
        td_team = DirectionTeam.objects.create(Team_id=Team.objects.create(
            name="Team C", color="Green", initials="TC", representative_entity="Entity C"))
        td_worker = Worker.objects.create(CI=Person.objects.create(CI=7890, age=35, name="Tom", lastname="Smith"), DT_id=None)
        td = TechnicalDirector.objects.create(W_id=td_worker, direction_team=td_team)
        
        user = User.objects.create(email="admin@example.com", password="password123", rol_id=rol_admin2)
        self.assertEqual(user.email, "admin@example.com")

    def test_user_constraints(self):
        """Ensure rol_id 2 requires TD_id to be non-null."""
        with self.assertRaises(ValidationError):
            user = User(email="director@example.com", rol_id=self.rol_dt, password="securepassword")
            user.clean()  # Trigger validation

class RolModelTestCase(TestCase):
    def test_create_rol(self):
        rol = Rol.objects.create(type="User")
        self.assertEqual(rol.type, "User")
        self.assertEqual(str(rol), "User")

class TechnicalDirectorTestCase(TestCase):
    def setUp(self):
        person = Person.objects.create(CI=1, age=30, name="John", lastname="Doe")
        self.team = Team.objects.create(name="Team A", color="Red", initials="TA", representative_entity="Entity A")
        self.worker = Worker.objects.create(CI=person, DT_id=None)

    def test_create_technical_director(self):
        direction_team = DirectionTeam.objects.create(Team_id=self.team)
        director = TechnicalDirector.objects.create(W_id=self.worker, direction_team=direction_team)
        self.assertEqual(director.W_id, self.worker)
        self.assertEqual(director.direction_team, direction_team)

class WorkerModelTestCase(TestCase):
    def setUp(self):
        self.person = Person.objects.create(CI=12345, age=30, name="John", lastname="Doe")

    def test_create_worker(self):
        worker = Worker.objects.create(CI=self.person, DT_id=None)
        self.assertEqual(worker.CI, self.person)

class TeamModelTestCase(TestCase):
    def test_create_team(self):
        team = Team.objects.create(name="Team A", color="Red", initials="TA", representative_entity="Entity A")
        self.assertEqual(team.name, "Team A")
        self.assertEqual(team.initials, "TA")

class BaseballPlayerModelTestCase(TestCase):
    def setUp(self):
        self.person = Person.objects.create(CI=54321, age=25, name="Alice", lastname="Smith")

    def test_create_baseball_player(self):
        player = BaseballPlayer.objects.create(CI=self.person, batting_average=0.300, years_of_experience=5)
        self.assertEqual(player.CI, self.person)
        self.assertEqual(player.batting_average, 0.300)

class SeriesModelTestCase(TestCase):
    def setUp(self):
        self.season = Season.objects.create()

    def test_create_series(self):
        series = Series.objects.create(season=self.season, name="Spring Series", type="Knockout", init_date="2023-01-01", end_date="2023-01-31")
        self.assertEqual(series.name, "Spring Series")
        self.assertEqual(series.type, "Knockout")

    def test_series_constraints(self):
        """Ensure init_date is before end_date."""
        with self.assertRaises(ValidationError):
            series = Series(season=self.season, name="Invalid Series", type="Group Stage", init_date="2023-01-31", end_date="2023-01-01")
            series.clean()  # Trigger validation

class PitcherModelTestCase(TestCase):
    def setUp(self):
        self.person = Person.objects.create(CI=54321, age=25, name="Alice", lastname="Smith")
        self.player = BaseballPlayer.objects.create(CI=self.person, batting_average=0.300, years_of_experience=5)

    def test_create_pitcher(self):
        pitcher = Pitcher.objects.create(CI=self.player, dominant_hand="derecha", No_games_won=10, No_games_lost=2, running_average=3)
        self.assertEqual(pitcher.dominant_hand, "derecha")
        self.assertEqual(pitcher.No_games_won, 10)

class ScoreModelTestCase(TestCase):
    def setUp(self):
        self.team_a = Team.objects.create(name="Team A", color="Red", initials="TA", representative_entity="Entity A")
        self.team_b = Team.objects.create(name="Team B", color="Blue", initials="TB", representative_entity="Entity B")

    def test_create_score(self):
        score = Score.objects.create(winner=self.team_a, loser=self.team_b, w_points=5, l_points=3)
        self.assertEqual(score.winner, self.team_a)
        self.assertEqual(score.l_points, 3)

    def test_score_constraints(self):
        with self.assertRaises(ValidationError):
            score = Score(winner=self.team_a, loser=self.team_a, w_points=5, l_points=3)
            score.clean() 

class DirectionTeamModelTestCase(TestCase):
    def setUp(self):
        self.team = Team.objects.create(name="Team A", color="Red", initials="TA", representative_entity="Entity A")

    def test_create_direction_team(self):
        direction_team = DirectionTeam.objects.create(Team_id=self.team)
        self.assertEqual(direction_team.Team_id, self.team)

class PersonModelTestCase(TestCase):
    def test_create_person(self):
        person = Person.objects.create(CI=123456, age=30, name="John", lastname="Doe")
        self.assertEqual(person.CI, 123456)
        self.assertEqual(person.name, "John")

class PositionModelTestCase(TestCase):
    def test_create_position(self):
        position = Position.objects.create(name="Pitcher")
        self.assertEqual(position.name, "Pitcher")

class BPParticipationModelTestCase(TestCase):
    def setUp(self):
        self.season = Season.objects.create()
        self.series = Series.objects.create(season=self.season, name="Series A", type="Knockout", init_date="2023-01-01", end_date="2023-01-31")
        self.team = Team.objects.create(name="Team A", color="Red", initials="TA", representative_entity="Entity A")
        self.person = Person.objects.create(CI=54321, age=25, name="Alice", lastname="Smith")
        self.player = BaseballPlayer.objects.create(CI=self.person, batting_average=0.300, years_of_experience=5)

    def test_create_bp_participation(self):
        participation = BPParticipation.objects.create(BP_id=self.player, series=self.series, team_id=self.team)
        self.assertEqual(participation.BP_id, self.player)

class LineUpModelTestCase(TestCase):
    def setUp(self):
        self.team = Team.objects.create(name="Team A", color="Red", initials="TA", representative_entity="Entity A")

    def test_create_lineup(self):
        lineup = LineUp.objects.create(team_id=self.team)
        self.assertEqual(lineup.team_id, self.team)

class TeamOnTheFieldModelTestCase(TestCase):
    def setUp(self):
        self.team = Team.objects.create(name="Team A", color="Red", initials="TA", representative_entity="Entity A")
        self.lineup = LineUp.objects.create(team_id=self.team)

    def test_create_team_on_field(self):
        team_on_field = TeamOnTheField.objects.create(lineup_id=self.lineup)
        ##self.assertEqual(team_on_field.team_id, self.lineup)

class StarPlayerModelTestCase(TestCase):
    def setUp(self):
        self.season = Season.objects.create()
        self.series = Series.objects.create(season=self.season, name="Series A", type="Knockout", init_date="2023-01-01", end_date="2023-01-31")
        self.position = Position.objects.create(name="Pitcher")
        self.person = Person.objects.create(CI=54321, age=25, name="Alice", lastname="Smith")
        self.player = BaseballPlayer.objects.create(CI=self.person, batting_average=0.300, years_of_experience=5)

    def test_create_star_player(self):
        star_player = StarPlayer.objects.create(series=self.series, position=self.position, BP_id=self.player)
        self.assertEqual(star_player.BP_id, self.player)

class PlayerInPositionModelTestCase(TestCase):
    def setUp(self):
        self.position = Position.objects.create(name="Pitcher")
        self.person = Person.objects.create(CI=54321, age=25, name="Alice", lastname="Smith")
        self.player = BaseballPlayer.objects.create(CI=self.person, batting_average=0.300, years_of_experience=5)

    def test_create_player_in_position(self):
        player_in_position = PlayerInPosition.objects.create(BP_id=self.player, position=self.position, effectiveness=0.85)
        self.assertEqual(player_in_position.effectiveness, 0.85)

class GameModelTestCase(TestCase):
    def setUp(self):
        self.team_a = Team.objects.create(name="Team A", color="Red", initials="TA", representative_entity="Entity A")
        self.team_b = Team.objects.create(name="Team B", color="Blue", initials="TB", representative_entity="Entity B")
        self.lineup_a = LineUp.objects.create(team_id=self.team_a)
        self.lineup_b = LineUp.objects.create(team_id=self.team_b)
        self.team_on_field_a = TeamOnTheField.objects.create(lineup_id=self.lineup_a)
        self.team_on_field_b = TeamOnTheField.objects.create(lineup_id=self.lineup_b)
        self.series = Series.objects.create(
            season=Season.objects.create(),
            name="Series A",
            type="Knockout",
            init_date="2023-01-01",
            end_date="2023-01-31"
        )
        self.score = Score.objects.create(winner=self.team_a, loser=self.team_b, w_points=5, l_points=3)

    def test_create_game(self):
        game = Game.objects.create(local=self.team_on_field_a, date="2023-02-01", rival=self.team_on_field_b, series=self.series, score=self.score)
        self.assertEqual(game.local, self.team_on_field_a)

class PlayerSwapModelTestCase(TestCase):
    def setUp(self):
        self.position = Position.objects.create(name="Pitcher")
        self.person1 = Person.objects.create(CI=54321, age=25, name="Alice", lastname="Smith")
        self.person2 = Person.objects.create(CI=12345, age=30, name="Bob", lastname="Johnson")
        self.player1 = BaseballPlayer.objects.create(CI=self.person1, batting_average=0.300, years_of_experience=5)
        self.player2 = BaseballPlayer.objects.create(CI=self.person2, batting_average=0.250, years_of_experience=3)
        self.team = Team.objects.create(name="Team A", color="Red", initials="TA", representative_entity="Entity A")
        self.lineup = LineUp.objects.create(team_id=self.team)
        self.team_on_field = TeamOnTheField.objects.create(lineup_id=self.lineup)

    def test_create_player_swap(self):
        player_swap = PlayerSwap.objects.create(old_player=self.player1, new_player=self.player2, position=self.position, game_team=self.team_on_field, date="2023-03-01")
        self.assertEqual(player_swap.old_player, self.player1)

# class PlayerInLineUpModelTestCase(TestCase):
#     def setUp(self):
#         self.position = Position.objects.create(name="Pitcher")
#         self.person = Person.objects.create(CI=54321, age=25, name="Alice", lastname="Smith")
#         self.player = BaseballPlayer.objects.create(CI=self.person, batting_average=0.300, years_of_experience=5)
#         self.team = Team.objects.create(name="Team A", color="Red", initials="TA", representative_entity="Entity A")
#         self.lineup = LineUp.objects.create(team_id=self.team)

#     def test_create_player_in_lineup(self):
#         player_in_lineup = PlayerInLineUp.objects.create(line_up=self.lineup, team=self.team, position=self.position, player=self.player)
#         self.assertEqual(player_in_lineup.line_up, self.lineup)
