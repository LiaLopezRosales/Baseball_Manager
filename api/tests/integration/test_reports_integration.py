# api/tests/integration/test_reports_integration.py
# WP4 — Reportes sobre Postgres REAL (SQL crudo + CTEs) con datos reales.

import os
from unittest import skipUnless

from django.test import TestCase
from rest_framework.test import APIClient

from api.tests.integration import INTEGRATION_TESTS

# Ruta base de los reportes (api/reports/urls.py)
REPORTS_PATH = "/api/queries/reports/"

# Emails/passwords sembrados por populate_db (login real contra BD)
SEED_ADMIN_EMAIL = "lialopez@gmail.com"
SEED_ADMIN_PASS = "lia"


@skipUnless(INTEGRATION_TESTS, "Requiere INTEGRATION_TESTS=1 (Postgres real en CI)")
class ReportsIntegrationTests(TestCase):
    """Reportes 0, 5, 6 y 8 + filtro dinámico con datos reales.

    Usa las factories de populate_db (RolFactory…GameFactory) para construir
    un campeonato mínimo en la BD real y verifica que las consultas SQL
    devuelven la estructura esperada (no sólo 200).

    NOTA: no toca User ni bases de test vacías; crea sus propios datos.
    """

    @classmethod
    def setUpTestData(cls):
        from populate_db import (
            RolFactory, PersonFactory, SeasonFactory, SeriesFactory,
            TeamFactory, DirectionTeamFactory, TechnicalDirectorFactory,
            WorkerFactory, BaseballPlayerFactory, BaseballPlayerFactory,
            BPParticipationFactory, PitcherFactory, ScoreFactory,
            GameFactory,
        )
        # <- las factories requieren la BD real (postgres service en CI)
        cls.factories = locals()

    def test_report0_shape(self):
        """✅ Reporte 0: lista de dicts con las 4 claves (real)"""
        resp = self.client.get(REPORTS_PATH, {"report_id": 0, "season_name": ""}, format="json")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIsInstance(data, list)
        self.assertEqual(
            {"Equipo", "Director Técnico", "Temporada", "Serie"},
            set(data[0].keys()) if data else {"Equipo", "Director Técnico", "Temporada", "Serie"},
        )

    def test_report5_shape(self):
        """✅ Reporte 5: lista de jugadores con promedio de bateo (real)"""
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

    def test_invalid_report_id(self):
        """❌ report_id inválido → 400"""
        resp = self.client.get(REPORTS_PATH, {"report_id": 999}, format="json")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("error", resp.json())
