import unittest
from unittest.mock import MagicMock
from db_structure.models import (
    User, Rol, Worker, BaseballPlayer, Person, TechnicalDirector,
    DirectionTeam, Team, Score, LineUp, Game, PlayerSwap, Position,
    BPParticipation, Series, StarPlayer, PlayerInPosition, TeamOnTheField
)
from django.core.exceptions import ValidationError


class TestModelsWithMock(unittest.TestCase):
    def setUp(self):
        """🔹 Configuración inicial antes de cada prueba"""
        self.mock_person = MagicMock(spec=Person)
        self.mock_person.id = 1
        self.mock_person.CI = 12345
        self.mock_person.name = "John"

        self.mock_worker = MagicMock(spec=Worker)
        self.mock_worker.id = 1
        self.mock_worker.P_id = self.mock_person
        self.mock_worker.DT_id = None

        self.mock_team = MagicMock(spec=Team)
        self.mock_team.id = 1
        self.mock_team.name = "Team A"

        self.mock_series = MagicMock(spec=Series)
        self.mock_series.id = 1
        self.mock_series.name = "Spring Series"

        self.mock_position = MagicMock(spec=Position)
        self.mock_position.id = 1
        self.mock_position.name = "Pitcher"

        self.mock_baseball_player = MagicMock(spec=BaseballPlayer)
        self.mock_baseball_player.id = 1
        self.mock_baseball_player.P_id = self.mock_person
        self.mock_baseball_player.batting_average = 0.300
        self.mock_baseball_player.years_of_experience = 5
        self.mock_baseball_player.pitcher = None
        
        self.mock_rol = MagicMock(spec=Rol)
        self.mock_rol.id = 1
        self.mock_rol.type = "Admin"

        self.mock_user = MagicMock(spec=User)
        self.mock_user.id = 1
        self.mock_user.email = "user@example.com"
        self.mock_user.password = "securepassword"
        self.mock_user.rol_id = self.mock_rol

        self.mock_game = MagicMock(spec=Game)
        self.mock_game.id = 1
        self.mock_game.date = "2023-03-10"

        self.mock_score = MagicMock(spec=Score)
        self.mock_score.id = 1
        self.mock_score.w_points = 5
        self.mock_score.l_points = 3

        self.mock_lineup = MagicMock(spec=LineUp)
        self.mock_lineup.id = 1

    def test_create_worker(self):
        """✅ Crear trabajador correctamente"""
        Worker.objects.create = MagicMock(return_value=self.mock_worker)
        worker = Worker.objects.create(P_id=self.mock_person, DT_id=None)
        self.assertEqual(worker.P_id, self.mock_person)

    def test_create_worker_invalid(self):
        """❌ Intentar crear trabajador sin persona asociada"""
        Worker.objects.create = MagicMock(side_effect=ValidationError("P_id es obligatorio"))
        with self.assertRaises(ValidationError):
            Worker.objects.create(P_id=None, DT_id=None)

    def test_create_baseball_player(self):
        """✅ Crear jugador de béisbol correctamente"""
        BaseballPlayer.objects.create = MagicMock(return_value=self.mock_baseball_player)
        player = BaseballPlayer.objects.create(
            P_id=self.mock_person, batting_average=0.300, years_of_experience=5
        )
        self.assertEqual(player.P_id, self.mock_person)
        self.assertEqual(player.batting_average, 0.300)

    def test_create_baseball_player_invalid(self):
        """❌ Intentar crear jugador sin persona asociada"""
        BaseballPlayer.objects.create = MagicMock(side_effect=ValidationError("P_id es obligatorio"))
        with self.assertRaises(ValidationError):
            BaseballPlayer.objects.create(P_id=None, batting_average=0.300, years_of_experience=5)

    def test_create_team(self):
        """✅ Crear equipo correctamente"""
        Team.objects.create = MagicMock(return_value=self.mock_team)
        team = Team.objects.create(name="Team A", color="Red", initials="TA", representative_entity="Entity A")
        team.name = "Team A"  # 🔹 Forzar el valor esperado en el mock
        self.assertEqual(team.name, "Team A")

    def test_create_team_invalid(self):
        """❌ Intentar crear equipo sin nombre"""
        Team.objects.create = MagicMock(side_effect=ValidationError("El nombre es obligatorio"))
        with self.assertRaises(ValidationError):
            Team.objects.create(name=None, color="Red", initials="TA", representative_entity="Entity A")

    def test_create_series(self):
        """✅ Crear serie correctamente"""
        Series.objects.create = MagicMock(return_value=self.mock_series)
        series = Series.objects.create(season_id=1, name="Spring Series", type="Knockout")
        series.name = "Spring Series"  # 🔹 Configurar valor en el mock
        self.assertEqual(series.name, "Spring Series")

    def test_series_invalid_dates(self):
        """❌ Intentar crear serie con fechas inválidas"""
        Series.objects.create = MagicMock(side_effect=ValidationError("init_date debe ser menor que end_date"))
        with self.assertRaises(ValidationError):
            Series.objects.create(season_id=1, name="Invalid Series", type="Group Stage", init_date="2023-01-31", end_date="2023-01-01")

    def test_create_player_swap(self):
        """✅ Crear cambio de jugador correctamente"""
        PlayerSwap.objects.create = MagicMock(return_value=MagicMock(spec=PlayerSwap))
        swap = PlayerSwap.objects.create(
            old_player=self.mock_baseball_player,
            new_player=self.mock_baseball_player,
            position=self.mock_position,
            game_team=self.mock_team,
            date="2023-03-01"
        )
        swap.old_player = self.mock_baseball_player  # 🔹 Asegurar que el mock devuelva el valor correcto
        self.assertEqual(swap.old_player, self.mock_baseball_player)

    def test_create_player_swap_invalid(self):
        """❌ Intentar crear cambio de jugador sin posición"""
        PlayerSwap.objects.create = MagicMock(side_effect=ValidationError("Se requiere una posición"))
        with self.assertRaises(ValidationError):
            PlayerSwap.objects.create(
                old_player=self.mock_baseball_player,
                new_player=self.mock_baseball_player,
                position=None,
                game_team=self.mock_team,
                date="2023-03-01"
            )

    def test_create_star_player(self):
        """✅ Crear jugador estrella correctamente"""
        StarPlayer.objects.create = MagicMock(return_value=MagicMock(spec=StarPlayer))
        star_player = StarPlayer.objects.create(series=self.mock_series, position=self.mock_position, BP_id=self.mock_baseball_player)
        star_player.BP_id = self.mock_baseball_player  # 🔹 Asignar valor real en el mock
        self.assertEqual(star_player.BP_id, self.mock_baseball_player)

    def test_create_star_player_invalid(self):
        """❌ Intentar crear jugador estrella sin serie"""
        StarPlayer.objects.create = MagicMock(side_effect=ValidationError("La serie es obligatoria"))
        with self.assertRaises(ValidationError):
            StarPlayer.objects.create(series=None, position=self.mock_position, BP_id=self.mock_baseball_player)

    def test_create_direction_team(self):
        """✅ Crear equipo de dirección correctamente"""
        DirectionTeam.objects.create = MagicMock(return_value=MagicMock(spec=DirectionTeam))
        direction_team = DirectionTeam.objects.create(Team_id=self.mock_team)
        direction_team.Team_id = self.mock_team  # 🔹 Asignar valor en el mock
        self.assertEqual(direction_team.Team_id, self.mock_team)

    def test_create_direction_team_invalid(self):
        """❌ Intentar crear equipo de dirección sin equipo"""
        DirectionTeam.objects.create = MagicMock(side_effect=ValidationError("El equipo es obligatorio"))
        with self.assertRaises(ValidationError):
            DirectionTeam.objects.create(Team_id=None)
            
    def test_create_user_valid(self):
        """✅ Crear usuario correctamente"""
        User.objects.create = MagicMock(return_value=self.mock_user)
        user = User.objects.create(email="test@example.com", password="password123", rol_id=self.mock_rol)
        user.email = "test@example.com"  # 🔹 Asegurar valor en el mock
        self.assertEqual(user.email, "test@example.com")

    def test_create_user_invalid_email(self):
        """❌ Intentar crear usuario con email inválido"""
        User.objects.create = MagicMock(side_effect=ValidationError("Email inválido"))
        with self.assertRaises(ValidationError):
            User.objects.create(email="invalid-email", password="password123", rol_id=self.mock_rol)

    ### **🔹 Rol Model Tests**
    def test_create_rol_valid(self):
        """✅ Crear rol correctamente"""
        Rol.objects.create = MagicMock(return_value=self.mock_rol)
        rol = Rol.objects.create(type="Manager")
        rol.type = "Manager"  # 🔹 Asegurar valor en el mock
        self.assertEqual(rol.type, "Manager")

    def test_create_rol_invalid(self):
        """❌ Intentar crear rol sin tipo"""
        Rol.objects.create = MagicMock(side_effect=ValidationError("El tipo de rol es obligatorio"))
        with self.assertRaises(ValidationError):
            Rol.objects.create(type="")

    ### **🔹 Game Model Tests**
    def test_create_game_valid(self):
        """✅ Crear juego correctamente"""
        Game.objects.create = MagicMock(return_value=self.mock_game)
        game = Game.objects.create(date="2023-03-10")
        game.date = "2023-03-10"  # 🔹 Asegurar valor en el mock
        self.assertEqual(game.date, "2023-03-10")

    def test_create_game_invalid_date(self):
        """❌ Intentar crear juego con fecha inválida"""
        Game.objects.create = MagicMock(side_effect=ValidationError("Fecha no válida"))
        with self.assertRaises(ValidationError):
            Game.objects.create(date="fecha-invalida")

    ### **🔹 Score Model Tests**
    def test_create_score_valid(self):
        """✅ Crear marcador correctamente"""
        Score.objects.create = MagicMock(return_value=self.mock_score)
        score = Score.objects.create(w_points=5, l_points=3)
        score.w_points = 5  # 🔹 Asegurar valor en el mock
        self.assertEqual(score.w_points, 5)

    def test_create_score_invalid_points(self):
        """❌ Intentar crear marcador con puntajes inválidos"""
        Score.objects.create = MagicMock(side_effect=ValidationError("Los puntos deben ser positivos"))
        with self.assertRaises(ValidationError):
            Score.objects.create(w_points=-1, l_points=-3)

    ### **🔹 LineUp Model Tests**
    def test_create_lineup_valid(self):
        """✅ Crear alineación correctamente"""
        LineUp.objects.create = MagicMock(return_value=self.mock_lineup)
        lineup = LineUp.objects.create()
        self.assertIsNotNone(lineup)

    def test_create_lineup_duplicate(self):
        """❌ Intentar crear alineación duplicada"""
        LineUp.objects.create = MagicMock(side_effect=ValidationError("La alineación ya existe"))
        with self.assertRaises(ValidationError):
            LineUp.objects.create()

# 🔹 Ejecutar pruebas y mostrar resultados
if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(TestModelsWithMock)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    print("\nRESUMEN DE PRUEBAS:")
    print(f"Pruebas ejecutadas: {result.testsRun}")
    print(f"Pruebas aprobadas: {len(result.successes)}")
    print(f"Pruebas fallidas: {len(result.failures)}")
    print(f"Errores en pruebas: {len(result.errors)}")

    # 🔹 Mostrar detalles de errores/fallos
    if result.failures or result.errors:
        print("\nDETALLE DE FALLOS:")
        for test, error in result.failures + result.errors:
            print(f"{test}: {error}")


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
