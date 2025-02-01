import unittest
from unittest.mock import MagicMock
from db_structure.views import (
    RolViewSet, PositionViewSet, SeasonViewSet, UserViewSet,
    WorkerViewSet, DirectionTeamViewSet, TeamViewSet, LineUpViewSet,
    PersonViewSet, BaseballPlayerViewSet, TechnicalDirectorViewSet, GameViewSet
)


class TestViewSetsWithMock(unittest.TestCase):
    def setUp(self):
        """🔹 Configuración inicial antes de cada prueba"""
        self.mock_repository = MagicMock()
        self.mock_serializer = MagicMock()
        self.mock_instance = MagicMock()
        self.mock_instance.id = 1
        self.mock_repository.DoesNotExist = Exception
        
        # 🔹 Mock para request
        self.mock_request = MagicMock()
        self.mock_request.data = {}

    def test_rol_viewset_valid_list(self):
        """✅ Listar roles con éxito"""
        RolViewSet.repository = self.mock_repository
        self.mock_repository.get_all.return_value = [self.mock_instance]
        result = RolViewSet().list(None)
        self.mock_repository.get_all.assert_called_once()
        self.assertEqual(len(result.data), 1)

    def test_rol_viewset_invalid_list(self):
        """❌ Error al listar roles"""
        RolViewSet.repository = self.mock_repository
        self.mock_repository.get_all.side_effect = Exception("Error obteniendo datos")
        with self.assertRaises(Exception):
            RolViewSet().list(None)

    def test_position_viewset_valid_retrieve(self):
        """✅ Obtener posición con éxito"""
        PositionViewSet.repository = self.mock_repository
        self.mock_repository.get_by_id.return_value = self.mock_instance
        result = PositionViewSet().retrieve(None, pk=1)
        self.mock_repository.get_by_id.assert_called_once_with(1)
        self.assertEqual(result.data["id"], 1)

    def test_position_viewset_invalid_retrieve(self):
        """❌ Obtener posición inexistente"""
        PositionViewSet.repository = self.mock_repository
        self.mock_repository.get_by_id.return_value = None  

        # ✅ Evitar AttributeError en repository.model.__name__
        self.mock_repository.model.__name__ = "Position"

        result = PositionViewSet().retrieve(self.mock_request, pk=99)
        self.mock_repository.get_by_id.assert_called_once_with(99)
        self.assertEqual(result.status_code, 404)

    def test_season_viewset_valid_create(self):
        """✅ Crear temporada correctamente"""
        SeasonViewSet.repository = self.mock_repository
        SeasonViewSet.serializer_class = self.mock_serializer

        self.mock_serializer.return_value = self.mock_serializer  
        self.mock_serializer.is_valid.return_value = True
        self.mock_serializer.validated_data = {"name": "Nueva Temporada"}
        self.mock_repository.create.return_value = self.mock_instance

        result = SeasonViewSet().create(self.mock_request)  
        self.mock_repository.create.assert_called_once()
        self.assertEqual(result.status_code, 201)

    def test_season_viewset_invalid_create(self):
        """❌ Intentar crear temporada con datos inválidos"""
        SeasonViewSet.repository = self.mock_repository
        SeasonViewSet.serializer_class = self.mock_serializer

        self.mock_serializer.return_value = self.mock_serializer
        self.mock_serializer.is_valid.return_value = False
        self.mock_serializer.errors = {"name": ["Este campo es obligatorio."]}

        # ✅ Usar request mockeado en lugar de None
        mock_request = MagicMock()
        mock_request.data = {"name": ""}

        result = SeasonViewSet().create(mock_request)
        self.assertEqual(result.status_code, 400)
        self.assertIn("errors", result.data)

    def test_user_viewset_valid_update(self):
        """✅ Actualizar usuario correctamente"""
        UserViewSet.repository = self.mock_repository
        UserViewSet.serializer_class = self.mock_serializer

        self.mock_repository.get_by_id.return_value = self.mock_instance
        self.mock_serializer.return_value = self.mock_serializer  
        self.mock_serializer.is_valid.return_value = True
        self.mock_serializer.validated_data = {"email": "test@example.com"}
        self.mock_serializer.save.return_value = self.mock_instance

        result = UserViewSet().update(self.mock_request, pk=1)  
        self.mock_repository.get_by_id.assert_called_once_with(1)
        self.assertEqual(result.status_code, 201)

    def test_user_viewset_invalid_update(self):
        """❌ Intentar actualizar usuario inexistente"""
        UserViewSet.repository = self.mock_repository
        self.mock_repository.get_by_id.return_value = None  

        # ✅ Evitar AttributeError en repository.model.__name__
        self.mock_repository.model.__name__ = "User"

        result = UserViewSet().update(self.mock_request, pk=99)
        self.mock_repository.get_by_id.assert_called_once_with(99)
        self.assertEqual(result.status_code, 404)

    def test_worker_viewset_valid_destroy(self):
        """✅ Eliminar trabajador correctamente"""
        WorkerViewSet.repository = self.mock_repository
        self.mock_repository.delete.return_value = True
        result = WorkerViewSet().destroy(None, pk=1)
        self.mock_repository.delete.assert_called_once_with(1)
        self.assertEqual(result.status_code, 204)

    def test_worker_viewset_invalid_destroy(self):
        """❌ Intentar eliminar trabajador inexistente"""
        WorkerViewSet.repository = self.mock_repository
        self.mock_repository.delete.return_value = False  

        # ✅ Evitar AttributeError en repository.model.__name__
        self.mock_repository.model.__name__ = "Worker"

        result = WorkerViewSet().destroy(None, pk=99)
        self.mock_repository.delete.assert_called_once_with(99)
        self.assertEqual(result.status_code, 404)

    def test_team_viewset_invalid_retrieve(self):
        """❌ Obtener equipo inexistente"""
        TeamViewSet.repository = self.mock_repository
        self.mock_repository.get_by_id.return_value = None  

        # ✅ Evitar AttributeError en repository.model.__name__
        self.mock_repository.model.__name__ = "Team"

        result = TeamViewSet().retrieve(None, pk=99)
        self.mock_repository.get_by_id.assert_called_once_with(99)
        self.assertEqual(result.status_code, 404)

    def test_game_viewset_invalid_destroy(self):
        """❌ Intentar eliminar juego inexistente"""
        GameViewSet.repository = self.mock_repository
        self.mock_repository.delete.return_value = False  

        # ✅ Evitar AttributeError en repository.model.__name__
        self.mock_repository.model.__name__ = "Game"

        result = GameViewSet().destroy(self.mock_request, pk=99)
        self.mock_repository.delete.assert_called_once_with(99)
        self.assertEqual(result.status_code, 404)
        
    def test_person_viewset_valid_list(self):
        """✅ Listar personas con éxito"""
        PersonViewSet.repository = self.mock_repository
        self.mock_repository.get_all.return_value = [self.mock_instance]
        result = PersonViewSet().list(None)
        self.mock_repository.get_all.assert_called_once()
        self.assertEqual(len(result.data), 1)

    def test_person_viewset_invalid_retrieve(self):
        """❌ Obtener persona inexistente"""
        PersonViewSet.repository = self.mock_repository
        self.mock_repository.get_by_id.return_value = None  

        # ✅ Evitar AttributeError en repository.model.__name__
        self.mock_repository.model.__name__ = "Person"

        result = PersonViewSet().retrieve(self.mock_request, pk=99)
        self.mock_repository.get_by_id.assert_called_once_with(99)
        self.assertEqual(result.status_code, 404)

    def test_technical_director_viewset_valid_create(self):
        """✅ Crear director técnico correctamente"""
        TechnicalDirectorViewSet.repository = self.mock_repository
        TechnicalDirectorViewSet.serializer_class = self.mock_serializer

        self.mock_serializer.return_value = self.mock_serializer
        self.mock_serializer.is_valid.return_value = True
        self.mock_serializer.validated_data = {"W_id": 1}
        self.mock_repository.create.return_value = self.mock_instance

        result = TechnicalDirectorViewSet().create(self.mock_request)
        self.mock_repository.create.assert_called_once()
        self.assertEqual(result.status_code, 201)

    def test_technical_director_viewset_invalid_create(self):
        """❌ Intentar crear director técnico con datos inválidos"""
        TechnicalDirectorViewSet.repository = self.mock_repository
        TechnicalDirectorViewSet.serializer_class = self.mock_serializer

        self.mock_serializer.return_value = self.mock_serializer
        self.mock_serializer.is_valid.return_value = False
        self.mock_serializer.errors = {"W_id": ["Este campo es obligatorio."]}

        mock_request = MagicMock()
        mock_request.data = {"W_id": ""}

        result = TechnicalDirectorViewSet().create(mock_request)
        self.assertEqual(result.status_code, 400)
        self.assertIn("errors", result.data)

    def test_baseball_player_viewset_valid_retrieve(self):
        """✅ Obtener jugador correctamente"""
        BaseballPlayerViewSet.repository = self.mock_repository
        self.mock_repository.get_by_id.return_value = self.mock_instance
        result = BaseballPlayerViewSet().retrieve(None, pk=1)
        self.mock_repository.get_by_id.assert_called_once_with(1)
        self.assertEqual(result.data["id"], 1)

    def test_baseball_player_viewset_invalid_destroy(self):
        """❌ Intentar eliminar jugador inexistente"""
        BaseballPlayerViewSet.repository = self.mock_repository
        self.mock_repository.delete.return_value = False  

        # ✅ Evitar AttributeError en repository.model.__name__
        self.mock_repository.model.__name__ = "BaseballPlayer"

        result = BaseballPlayerViewSet().destroy(self.mock_request, pk=99)
        self.mock_repository.delete.assert_called_once_with(99)
        self.assertEqual(result.status_code, 404)

    def test_lineup_viewset_valid_destroy(self):
        """✅ Eliminar alineación correctamente"""
        LineUpViewSet.repository = self.mock_repository
        self.mock_repository.delete.return_value = True
        result = LineUpViewSet().destroy(None, pk=1)
        self.mock_repository.delete.assert_called_once_with(1)
        self.assertEqual(result.status_code, 204)

    def test_game_viewset_invalid_update(self):
        """❌ Intentar actualizar juego inexistente"""
        GameViewSet.repository = self.mock_repository
        self.mock_repository.get_by_id.return_value = None  

        # ✅ Evitar AttributeError en repository.model.__name__
        self.mock_repository.model.__name__ = "Game"

        result = GameViewSet().update(self.mock_request, pk=99)
        self.mock_repository.get_by_id.assert_called_once_with(99)
        self.assertEqual(result.status_code, 404)



# 🔹 Ejecutar pruebas y mostrar resultados
if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(TestViewSetsWithMock)
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
