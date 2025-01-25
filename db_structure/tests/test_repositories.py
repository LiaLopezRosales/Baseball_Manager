import unittest
from unittest.mock import MagicMock
from db_structure.repositories import (
    RolRepository,
    PositionRepository,
    SeasonRepository,
    UserRepository,
    WorkerRepository,
    DirectionTeamRepository,
    TeamRepository,
    LineUpRepository,
    SeriesRepository,
    PersonRepository,
    BPParticipationRepository,
    PlayerInLineUpRepository,
)

class TestRepositoriesWithMock(unittest.TestCase):
    def setUp(self):
        # Mock para el modelo base
        self.mock_model = MagicMock()
        self.mock_instance = MagicMock()
        self.mock_instance.id = 1
        self.mock_model.DoesNotExist = Exception

    def test_rol_repository_valid_get_all(self):
        RolRepository.model = self.mock_model
        self.mock_model.objects.all.return_value = [self.mock_instance]
        result = RolRepository.get_all()
        self.mock_model.objects.all.assert_called_once()
        self.assertEqual(len(result), 1)

    def test_rol_repository_invalid_get_by_id(self):
        RolRepository.model = self.mock_model
        self.mock_model.objects.get.side_effect = self.mock_model.DoesNotExist
        result = RolRepository.get_by_id(1)
        self.mock_model.objects.get.assert_called_once_with(id=1)
        self.assertIsNotNone(result)  # Esto falla porque result es None

    def test_position_repository_valid_create(self):
        PositionRepository.model = self.mock_model
        data = {"name": "Midfielder"}
        self.mock_model.objects.create.return_value = self.mock_instance
        result = PositionRepository.create(data)
        self.mock_model.objects.create.assert_called_once_with(**data)
        self.assertEqual(result, self.mock_instance)

    def test_position_repository_invalid_create(self):
        PositionRepository.model = self.mock_model
        data = {"name": "Defender"}
        self.mock_model.objects.create.side_effect = Exception("Error al crear")
        with self.assertRaises(Exception):
            PositionRepository.create(data)

    def test_season_repository_valid_get_by_id(self):
        SeasonRepository.model = self.mock_model
        self.mock_model.objects.get.return_value = self.mock_instance
        result = SeasonRepository.get_by_id(1)
        self.mock_model.objects.get.assert_called_once_with(id=1)
        self.assertEqual(result.id, 1)

    def test_season_repository_invalid_get_by_id(self):
        SeasonRepository.model = self.mock_model
        self.mock_model.objects.get.side_effect = self.mock_model.DoesNotExist
        result = SeasonRepository.get_by_id(1)
        self.mock_model.objects.get.assert_called_once_with(id=1)
        self.assertIsNotNone(result)  # Esto falla porque result es None

    def test_user_repository_valid_delete(self):
        UserRepository.model = self.mock_model
        self.mock_model.objects.get.return_value = self.mock_instance
        result = UserRepository.delete(1)
        self.mock_model.objects.get.assert_called_once_with(id=1)
        self.mock_instance.delete.assert_called_once()
        self.assertTrue(result)

    def test_user_repository_invalid_delete(self):
        UserRepository.model = self.mock_model
        self.mock_model.objects.get.side_effect = self.mock_model.DoesNotExist
        result = UserRepository.delete(1)
        self.mock_model.objects.get.assert_called_once_with(id=1)
        self.assertTrue(result)  # Esto falla porque result es False

    def test_worker_repository_valid_update(self):
        WorkerRepository.model = self.mock_model
        self.mock_model.objects.get.return_value = self.mock_instance
        data = {"name": "Updated Worker"}
        result = WorkerRepository.update(1, data)
        self.mock_model.objects.get.assert_called_once_with(id=1)
        self.mock_instance.save.assert_called_once()
        self.assertEqual(result, self.mock_instance)

    def test_worker_repository_invalid_update(self):
        WorkerRepository.model = self.mock_model
        self.mock_model.objects.get.side_effect = self.mock_model.DoesNotExist
        data = {"name": "Updated Worker"}
        result = WorkerRepository.update(1, data)
        self.mock_model.objects.get.assert_called_once_with(id=1)
        self.assertIsNotNone(result)  # Esto falla porque result es None

    def test_direction_team_repository_valid_get_all(self):
        DirectionTeamRepository.model = self.mock_model
        self.mock_model.objects.all.return_value = [self.mock_instance]
        result = DirectionTeamRepository.get_all()
        self.mock_model.objects.all.assert_called_once()
        self.assertEqual(len(result), 1)

    def test_direction_team_repository_invalid_get_all(self):
        DirectionTeamRepository.model = self.mock_model
        self.mock_model.objects.all.side_effect = Exception("Error al obtener")
        with self.assertRaises(Exception):
            DirectionTeamRepository.get_all()

    def test_team_repository_valid_create(self):
        TeamRepository.model = self.mock_model
        data = {"name": "Team A"}
        self.mock_model.objects.create.return_value = self.mock_instance
        result = TeamRepository.create(data)
        self.mock_model.objects.create.assert_called_once_with(**data)
        self.assertEqual(result, self.mock_instance)

    def test_team_repository_invalid_create(self):
        TeamRepository.model = self.mock_model
        data = {"name": "Team B"}
        self.mock_model.objects.create.side_effect = Exception("Error al crear")
        with self.assertRaises(Exception):
            TeamRepository.create(data)

    def test_lineup_repository_valid_delete(self):
        LineUpRepository.model = self.mock_model
        self.mock_model.objects.get.return_value = self.mock_instance
        result = LineUpRepository.delete(1)
        self.mock_model.objects.get.assert_called_once_with(id=1)
        self.mock_instance.delete.assert_called_once()
        self.assertTrue(result)

    def test_lineup_repository_invalid_delete(self):
        LineUpRepository.model = self.mock_model
        self.mock_model.objects.get.side_effect = self.mock_model.DoesNotExist
        result = LineUpRepository.delete(1)
        self.mock_model.objects.get.assert_called_once_with(id=1)
        self.assertTrue(result)  # Esto falla porque result es False

    def test_series_repository_valid_get_by_id(self):
        SeriesRepository.model = self.mock_model
        self.mock_model.objects.get.return_value = self.mock_instance
        result = SeriesRepository.get_by_id(1)
        self.mock_model.objects.get.assert_called_once_with(id=1)
        self.assertEqual(result.id, 1)

    def test_series_repository_invalid_get_by_id(self):
        SeriesRepository.model = self.mock_model
        self.mock_model.objects.get.side_effect = self.mock_model.DoesNotExist
        result = SeriesRepository.get_by_id(1)
        self.mock_model.objects.get.assert_called_once_with(id=1)
        self.assertIsNotNone(result)  # Esto falla porque result es None

    def test_person_repository_valid_create(self):
        PersonRepository.model = self.mock_model
        data = {"name": "John"}
        self.mock_model.objects.create.return_value = self.mock_instance
        result = PersonRepository.create(data)
        self.mock_model.objects.create.assert_called_once_with(**data)
        self.assertEqual(result, self.mock_instance)

    def test_person_repository_invalid_create(self):
        PersonRepository.model = self.mock_model
        data = {"name": "Jane"}
        self.mock_model.objects.create.side_effect = Exception("Error al crear")
        with self.assertRaises(Exception):
            PersonRepository.create(data)

    def test_bp_participation_repository_valid_get_all(self):
        BPParticipationRepository.model = self.mock_model
        self.mock_model.objects.all.return_value = [self.mock_instance]
        result = BPParticipationRepository.get_all()
        self.mock_model.objects.all.assert_called_once()
        self.assertEqual(len(result), 1)

    def test_bp_participation_repository_invalid_get_all(self):
        BPParticipationRepository.model = self.mock_model
        self.mock_model.objects.all.side_effect = Exception("Error al obtener")
        with self.assertRaises(Exception):
            BPParticipationRepository.get_all()

    def test_player_in_lineup_repository_valid_delete(self):
        PlayerInLineUpRepository.model = self.mock_model
        self.mock_model.objects.get.return_value = self.mock_instance
        result = PlayerInLineUpRepository.delete(1)
        self.mock_model.objects.get.assert_called_once_with(id=1)
        self.mock_instance.delete.assert_called_once()
        self.assertTrue(result)

    def test_player_in_lineup_repository_invalid_delete(self):
        PlayerInLineUpRepository.model = self.mock_model
        self.mock_model.objects.get.side_effect = self.mock_model.DoesNotExist
        result = PlayerInLineUpRepository.delete(1)
        self.mock_model.objects.get.assert_called_once_with(id=1)
        self.assertTrue(result)  # Esto falla porque result es False
        
    def test_player_in_lineup_repository_invalid_get_all(self):
        PlayerInLineUpRepository.model = self.mock_model
        self.mock_model.objects.all.return_value = []  # Simula que no hay resultados

        # Llamada al método
        result = PlayerInLineUpRepository.get_all()

        # Verificaciones
        self.mock_model.objects.all.assert_called_once()

        # Fallo intencional: se espera que haya resultados, pero el mock devuelve una lista vacía
        self.assertGreater(len(result), 0)  # Esto fallará porque result es una lista vacía

    
    def test_season_repository_invalid_create(self):
        # Configuración
        SeasonRepository.model = self.mock_model
        data = {"field1": "value1"}  # Datos que se enviarán
        self.mock_model.objects.create.return_value = self.mock_instance
        self.mock_instance.field1 = "wrong_value"  # Simulamos un valor incorrecto

        # Llamada al método
        result = SeasonRepository.create(data)

        # Verificación intencionalmente incorrecta
        self.assertEqual(result.field1, "value1")  

# Personalización para imprimir resumen de pruebas
if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(TestRepositoriesWithMock)
    runner = unittest.TextTestRunner(verbosity=2)

    # Ejecutar pruebas y capturar resultados
    result = runner.run(suite)

    print("\nRESUMEN DE PRUEBAS:")
    print(f"Pruebas ejecutadas: {result.testsRun}")
    print(f"Pruebas aprobadas: {len(result.successes)}")
    print(f"Pruebas fallidas: {len(result.failures)}")
    print(f"Errores en pruebas: {len(result.errors)}")

    # Detalle de fallas
    if result.failures or result.errors:
        print("\nDETALLE DE FALLOS:")
        for test, error in result.failures + result.errors:
            print(f"{test}: {error}")
