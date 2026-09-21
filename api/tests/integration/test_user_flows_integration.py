# api/tests/integration/test_user_flows_integration.py
# WP4 — Flujos de usuario general sobre Postgres real: auth (3 roles),
# favoritos (equipo/jugador), notificaciones (listar/leer/todas) y estado.

from unittest import skipUnless

from django.test import TestCase
from rest_framework.test import APIClient

from api.tests.integration import INTEGRATION_TESTS
from api.tests.integration.seed import seed_test_championship

LOGIN_PATH = "/api/login/"
USER_DASHBOARD_PATH = "/api/user/dashboard/"
FAVORITES_PATH = "/api/user/favorites/"
TOGGLE_TEAM_PATH = "/api/user/favorites/team/"
TOGGLE_PLAYER_PATH = "/api/user/favorites/player/"
NOTIFICATIONS_PATH = "/api/notifications/"
MARK_READ_TPL = "/api/notifications/{}/read/"
READ_ALL_PATH = "/api/notifications/read-all/"

SEED_GENERAL_EMAIL = "general@test.com"
SEED_GENERAL_PASS = "general"
SEED_ADMIN_EMAIL = "lialopez@gmail.com"
SEED_ADMIN_PASS = "lia"
SEED_DT_EMAIL = "director@test.com"
SEED_DT_PASS = "director"


@skipUnless(INTEGRATION_TESTS, "Requiere INTEGRATION_TESTS=1 (Postgres real)")
class UserFlowsIntegrationTests(TestCase):
    """Flujos de Usuario General sobre la BD real sembrada por las factories."""

    @classmethod
    def setUpTestData(cls):
        seed_test_championship()

        raw = APIClient()

        def _login(email, password):
            return raw.post(LOGIN_PATH, {"email": email, "password": password}, format="json")

        cls.general_resp = _login(SEED_GENERAL_EMAIL, SEED_GENERAL_PASS)
        cls.admin_resp = _login(SEED_ADMIN_EMAIL, SEED_ADMIN_PASS)
        cls.dt_resp = _login(SEED_DT_EMAIL, SEED_DT_PASS)

        cls.general = APIClient()
        cls.general.credentials(HTTP_AUTHORIZATION=f"Token {cls.general_resp.data['token']}")

    def test_general_login_shape(self):
        """✅ Login general: token + rol correctos, sin team_id"""
        self.assertEqual(self.general_resp.status_code, 200)
        body = self.general_resp.data
        self.assertIn("token", body)
        self.assertEqual(body["role_name"], "Usuario General")
        self.assertIsNone(body["team_id"])

    def test_dt_login_shape(self):
        """✅ Login DT: token + rol + team_id (Director Técnico)"""
        self.assertEqual(self.dt_resp.status_code, 200)
        body = self.dt_resp.data
        self.assertIn("token", body)
        self.assertEqual(body["role_name"], "Director Técnico")
        self.assertIsNotNone(body["team_id"])

    def test_admin_login_shape(self):
        """✅ Login admin: token + rol Admin, sin team_id"""
        self.assertEqual(self.admin_resp.status_code, 200)
        body = self.admin_resp.data
        self.assertIn("token", body)
        self.assertEqual(body["role_name"], "Admin")
        self.assertIsNone(body["team_id"])

    def test_wrong_password_rejected(self):
        """❌ Contraseña incorrecta → 401 sin token"""
        raw = APIClient()
        resp = raw.post(LOGIN_PATH, {
            "email": SEED_GENERAL_EMAIL, "password": "incorrecta",
        }, format="json")
        self.assertEqual(resp.status_code, 401)
        self.assertNotIn("token", resp.data)

    def test_dashboard_requires_token(self):
        """❌ Dashboard sin token → 401"""
        anon = APIClient()
        resp = anon.get(USER_DASHBOARD_PATH)
        self.assertEqual(resp.status_code, 401)

    def test_dashboard_with_token(self):
        """✅ Dashboard con token general → 200 con claves reales de DashboardView"""
        resp = self.general.get(USER_DASHBOARD_PATH)
        self.assertEqual(resp.status_code, 200)
        data = resp.data
        # Claves emitidas por DashboardView (api/views.py)
        self.assertIn("favorite_team", data)
        self.assertIn("recent_games", data)
        self.assertIn("favorite_players", data)
        self.assertIn("unread_notifications", data)

    def test_favorites_has_teams_and_players(self):
        """✅ Favoritos: estructura y no vacíos (seed: 5+5 para general)"""
        resp = self.general.get(FAVORITES_PATH)
        self.assertEqual(resp.status_code, 200)
        data = resp.data
        self.assertIn("teams", data)
        self.assertIn("players", data)
        self.assertGreaterEqual(len(data["teams"]), 5)
        self.assertGreaterEqual(len(data["players"]), 5)

    def test_toggle_team_returns_favorited(self):
        """✅ Toggle de favorito de equipo → devuelve `favorited`"""
        favs = self.general.get(FAVORITES_PATH).data
        team_id = favs["teams"][0]["id"]
        resp = self.general.post(TOGGLE_TEAM_PATH, {"team_id": team_id}, format="json")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("favorited", resp.data)

    def test_toggle_player_returns_favorited(self):
        """✅ Toggle de favorito de jugador → devuelve `favorited`"""
        favs = self.general.get(FAVORITES_PATH).data
        player_id = favs["players"][0]["id"]
        resp = self.general.post(TOGGLE_PLAYER_PATH, {"player_id": player_id}, format="json")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("favorited", resp.data)

    def test_notifications_flow_mark_all(self):
        """✅ Notificaciones: listar con unread_count, marcar todas leídas"""
        resp = self.general.get(NOTIFICATIONS_PATH)
        self.assertEqual(resp.status_code, 200)
        first = resp.data
        self.assertIn("unread_count", first)
        self.assertIn("notifications", first)

        all_read = self.general.post(READ_ALL_PATH, {}, format="json")
        self.assertEqual(all_read.status_code, 200)

        after = self.general.get(NOTIFICATIONS_PATH).data
        self.assertEqual(after["unread_count"], 0)

    def test_notifications_mark_single_and_poll(self):
        """✅ Notificación individual: leer una → baja el contador"""
        resp = self.general.get(NOTIFICATIONS_PATH)
        notifs = resp.data["notifications"]
        self.assertTrue(notifs)  # el seed siembra notificaciones para general
        nid = notifs[0]["id"]
        before = resp.data["unread_count"]
        mark = self.general.post(MARK_READ_TPL.format(nid), {}, format="json")
        self.assertEqual(mark.status_code, 200)
        after = self.general.get(NOTIFICATIONS_PATH).data
        self.assertEqual(after["unread_count"], max(0, before - 1))