import unittest
from unittest.mock import MagicMock
from unittest.mock import patch
from db_structure.serializers import (
    RolSerializer, UserSerializer, TeamSerializer, ScoreSerializer, PositionSerializer, SeasonSerializer, PersonSerializer,
    BaseballPlayerSerializer, BPParticipationSerializer, PlayerInLineUpSerializer
)
from db_structure.models import BaseballPlayer, BPParticipation, PlayerInLineUp


class TestSerializersWithMock(unittest.TestCase):
    def setUp(self):
        """🔹 Configuración inicial antes de cada prueba"""
        self.mock_instance = MagicMock()
        self.mock_instance.id = 1


    def test_rol_serializer_valid_serialization(self):
        """✅ Serializar un rol correctamente"""
        data = {"id": 1, "type": "Admin"}
        serializer = RolSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["type"], "Admin")

    def test_rol_serializer_invalid_serialization(self):
        """❌ Intentar serializar rol sin tipo"""
        data = {"id": 1}  # Falta el campo "type"
        serializer = RolSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("type", serializer.errors)

    def test_user_serializer_valid_data(self):
        """✅ Validar datos correctos en UserSerializer"""
        data = {"id": 1, "email": "user@example.com", "password": "securePass123", "rol_id": 2}
        serializer = UserSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["email"], "user@example.com")

    def test_user_serializer_invalid_email(self):
        """❌ Intentar validar UserSerializer con email inválido"""
        data = {"id": 1, "email": "invalid-email", "password": "securePass123", "rol_id": 2}
        serializer = UserSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)

    def test_team_serializer_valid_serialization(self):
        """✅ Serializar un equipo correctamente"""
        data = {"id": 1, "name": "Los Leones", "color": "Rojo", "initials": "LL", "representative_entity": "Ciudad A"}
        serializer = TeamSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["name"], "Los Leones")

    def test_team_serializer_invalid_missing_name(self):
        """❌ Intentar crear TeamSerializer sin nombre"""
        data = {"id": 1, "color": "Azul", "initials": "AB", "representative_entity": "Ciudad B"}  # Falta el campo "name"
        serializer = TeamSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)

    def test_score_serializer_valid_data(self):
        """✅ Validar datos correctos en ScoreSerializer"""
        data = {"id": 1, "winner": 2, "loser": 3, "w_points": 10, "l_points": 5}
        serializer = ScoreSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["w_points"], 10)

    def test_score_serializer_invalid_missing_fields(self):
        """❌ Intentar validar ScoreSerializer sin campos obligatorios"""
        data = {"winner": 1}  # Falta `loser`, `w_points`, `l_points`
        serializer = ScoreSerializer(data=data)
        
        self.assertFalse(serializer.is_valid())  # La validación debería fallar
        self.assertIn("loser", serializer.errors)
        self.assertIn("w_points", serializer.errors)
        self.assertIn("l_points", serializer.errors)

        
    def test_position_serializer_valid(self):
        """✅ Serializar posición correctamente"""
        data = {"id": 1, "name": "Pitcher"}
        serializer = PositionSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["name"], "Pitcher")

    def test_position_serializer_invalid_missing_name(self):
        """❌ Intentar serializar posición sin nombre"""
        data = {"id": 1}
        serializer = PositionSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)

    def test_season_serializer_valid(self):
        """✅ Serializar temporada correctamente"""
        data = {"id": 1, "name": "Temporada 2025"}
        serializer = SeasonSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["name"], "Temporada 2025")

    def test_season_serializer_invalid_missing_name(self):
        """❌ Intentar serializar temporada sin nombre"""
        data = {"id": 1}
        serializer = SeasonSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)

    def test_person_serializer_valid(self):
        """✅ Serializar persona correctamente"""
        data = {"id": 1, "CI": 12345678, "name": "Juan", "lastname": "Pérez", "age": 30}
        serializer = PersonSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["name"], "Juan")

    def test_person_serializer_invalid_ci(self):
        """❌ Intentar serializar persona con CI inválido"""
        data = {"id": 1, "CI": "abc123", "name": "Juan", "lastname": "Pérez", "age": 30}
        serializer = PersonSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("CI", serializer.errors)

    def test_baseball_player_serializer_valid(self):
        """✅ Serializar jugador de béisbol correctamente"""
        data = {"id": 1, "batting_average": 0.345, "years_of_experience": 5, "P_id": 1}
        serializer = BaseballPlayerSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["batting_average"], 0.345)

    def test_baseball_player_serializer_invalid_experience(self):
        """❌ Intentar serializar jugador con años de experiencia negativos"""
        data = {"CI": "12345678", "batting_average": 0.3, "years_of_experience": -5}  # ❌ Invalido
        serializer = BaseballPlayerSerializer(data=data)

        self.assertFalse(serializer.is_valid())  # Debe fallar
        self.assertIn("years_of_experience", serializer.errors)  # Verificar error en el campo correcto

    def test_bp_participation_serializer_invalid_no_BP_id(self):
        """❌ Intentar serializar participación sin jugador"""
        self.mock_baseball_player = MagicMock(spec=BaseballPlayer)
        self.mock_baseball_player.id = 1
        self.mock_baseball_player.batting_average = 0.300
        self.mock_baseball_player.years_of_experience = 5
        self.mock_bp_participation = MagicMock(spec=BPParticipation)
        self.mock_bp_participation.BP_id = self.mock_baseball_player
        self.mock_bp_participation.series_id = 1
        data = {"series": 1}
        serializer = BPParticipationSerializer(data=data)
        self.assertFalse(serializer.is_valid())


    def test_bp_participation_serializer_invalid_missing_bp(self):
        """❌ Intentar serializar participación sin jugador"""
        data = {"id": 1, "series": 2, "team_id": 3}  # Falta BP_id
        serializer = BPParticipationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("BP_id", serializer.errors)

    def test_player_in_lineup_serializer_valid(self):
        """✅ Serializar jugador en alineación correctamente"""
        from db_structure.models import LineUp, PlayerInPosition, PlayerInLineUp
        line_up = LineUp.objects.first()
        used = set(
            PlayerInLineUp.objects.filter(line_up=line_up).values_list(
                "player_in_position_id", flat=True
            )
        )
        free_pip = PlayerInPosition.objects.exclude(id__in=used).first()
        if line_up is None or free_pip is None:
            self.skipTest("No hay datos de alineación disponibles en la base de datos")
        data = {"line_up": line_up.id, "player_in_position": free_pip.id}
        serializer = PlayerInLineUpSerializer(data=data)
        self.assertTrue(serializer.is_valid())  # 🔹 Debe pasar correctamente

    def test_player_in_lineup_serializer_invalid_no_player(self):
        """❌ Intentar serializar alineación sin jugador"""
        self.mock_player_in_lineup = MagicMock(spec=PlayerInLineUp)
        self.mock_player_in_lineup.line_up_id = 1
        self.mock_player_in_lineup.player_in_position_id = 1
        data = {"line_up": 1}
        serializer = PlayerInLineUpSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_player_in_lineup_serializer_invalid_missing_position(self):
        """❌ Intentar serializar alineación sin posición"""
        data = {"id": 1, "line_up": 1}  # Falta player_in_position
        serializer = PlayerInLineUpSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("player_in_position", serializer.errors)
