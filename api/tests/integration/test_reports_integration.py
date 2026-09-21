# api/tests/integration/test_reports_integration.py
# WP4 — Reportes sobre Postgres REAL (SQL crudo + CTEs) con datos reales.
#
# La suite se construye a sí misma con las factories de populate_db: el runner
# de Django crea una base de test vacía y el CI NO corre el seed, así que los
# reportes verían listas vacías si no sembráramos aquí un campeonato mínimo.

from unittest import skipUnless

from django.test import TestCase

from api.tests.integration import INTEGRATION_TESTS
from api.tests.integration.seed import seed_test_championship, first_team_name

REPORTS_PATH = "/api/queries/reports/"


@skipUnless(INTEGRATION_TESTS, "Requiere INTEGRATION_TESTS=1 (Postgres real en CI)")
class ReportsIntegrationTests(TestCase):
    """Reportes 5 y 6 (sin params), 0 y 8 (con params) + filtro dinámico.

    Los shapes se validan contra los fetchall de queries.py (claves reales),
    no contra un seed previo: cada clase siembra su propio campeonato.
    """

    @classmethod
    def setUpTestData(cls):
        cls.data = seed_test_championship()
        cls.season_name = cls.data["seasons"][0].name
        cls.team_name = first_team_name()

    def test_report0_shape_with_season(self):
        """✅ Reporte 0: campeón por victorias + DT + temporada + serie (real)"""
        resp = self.client.get(REPORTS_PATH, {"report_id": 0, "season_name": self.season_name}, format="json")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIsInstance(data, list)
        self.assertTrue(data)
        self.assertEqual(
            {"Equipo", "Director Técnico", "Temporada", "Serie"},
            set(data[0].keys()),
        )

    def test_report5_shape(self):
        """✅ Reporte 5: jugadores con promedio de bateo (real)"""
        resp = self.client.get(REPORTS_PATH, {"report_id": 5}, format="json")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data)
        self.assertIn("Promedio de Bateo", data[0])

    def test_report6_shape(self):
        """✅ Reporte 6: estadísticas de puntaje por equipo (real)"""
        resp = self.client.get(REPORTS_PATH, {"report_id": 6}, format="json")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data)
        self.assertIn("Partidos Jugados", data[0])

    def test_report8_shape(self):
        """✅ Reporte 8: jugadores de un equipo con sus series (real)"""
        resp = self.client.get(REPORTS_PATH, {"report_id": 8, "team_name": self.team_name}, format="json")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIsInstance(data, list)
        self.assertTrue(data)
        self.assertEqual(
            {"Nombre", "Apellido", "Equipo", "Series"},
            set(data[0].keys()),
        )

    def test_dynamic_filter_on_team(self):
        """✅ Filtro dinámico sobre un modelo real (Team)"""
        resp = self.client.post(
            "/api/queries/dinamic-filter/",
            {
                "table_name": "Team",
                "fields": ["name", "initials"],
                "filters": {},
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIsInstance(data, list)
        self.assertTrue(data)
        self.assertEqual({"name", "initials"}, set(data[0].keys()))

    def test_invalid_report_id_is_400(self):
        """❌ report_id inválido → 400 (validación del serializer)"""
        resp = self.client.get(REPORTS_PATH, {"report_id": 999}, format="json")
        self.assertEqual(resp.status_code, 400)
        payload = resp.json()
        # La validación de DRF devuelve errores por campo, no {"error": ...}.
        self.assertIsInstance(payload, dict)
        self.assertIn("report_id", payload)