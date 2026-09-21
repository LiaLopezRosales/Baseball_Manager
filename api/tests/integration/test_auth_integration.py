# api/tests/integration/test_auth_integration.py
# WP4 — Auth real (Postgres): registro público, login 3 roles, gating por token.
#
# La suite se siembra a sí misma (factories de populate_db) porque el CI crea
# una base de test vacía y no ejecuta populate_db como seed.

from unittest import skipUnless

from django.test import TestCase
from rest_framework.test import APIClient

from api.tests.integration import INTEGRATION_TESTS
from api.tests.integration.seed import seed_test_championship

LOGIN_PATH = "/api/login/"
REGISTER_PATH = "/api/register/"
USER_DASHBOARD_PATH = "/api/user/dashboard/"

# Usuarios reales creados por el seed (populate_users_and_workers → get_or_create)
SEED_GENERAL_EMAIL = "general@test.com"
SEED_GENERAL_PASS = "general"
SEED_ADMIN_EMAIL = "lialopez@gmail.com"
SEED_ADMIN_PASS = "lia"
SEED_DT_EMAIL = "director@test.com"
SEED_DT_PASS = "director"


@skipUnless(INTEGRATION_TESTS, "Requiere INTEGRATION_TESTS=1 (Postgres real en CI)")
class RegisterLoginIntegrationTests(TestCase):
    """Registro público y login de los tres roles contra Postgres real."""

    @classmethod
    def setUpTestData(cls):
        seed_test_championship()
        cls.admin_client = APIClient()
        cls.dt_client = APIClient()
        cls.general_client = APIClient()

    @staticmethod
    def _email(suffix):
        return f"integration.test.{suffix}@test.com"

    def test_register_creates_user_and_returns_token(self):
        """✅ Registro público crea Person + CustomUser (Usuario General) + token"""
        resp = self.general_client.post(REGISTER_PATH, {
            "name": "Integración",
            "lastname": "Prueba",
            "email": self._email("reg"),
            "password": "clave123",
        }, format="json")
        self.assertEqual(resp.status_code, 201)
        body = resp.data
        self.assertIn("token", body)
        self.assertEqual(body["role_name"], "Usuario General")
        # El token funciona contra un endpoint protegido
        self.general_client.credentials(HTTP_AUTHORIZATION=f"Token {body['token']}")
        dash = self.general_client.get(USER_DASHBOARD_PATH)
        self.assertEqual(dash.status_code, 200)

    def test_login_general_role(self):
        """✅ Login de Usuario General devuelve token + rol correcto"""
        resp = self.general_client.post(LOGIN_PATH, {
            "email": SEED_GENERAL_EMAIL, "password": SEED_GENERAL_PASS,
        }, format="json")
        self.assertEqual(resp.status_code, 200)
        body = resp.data
        self.assertEqual(body["role_name"], "Usuario General")
        self.assertIn("token", body)
        self.assertEqual(body["team_id"], None)

    def test_login_dt_role(self):
        """✅ Login de Director Técnico devuelve token + team_id de su equipo"""
        resp = self.dt_client.post(LOGIN_PATH, {
            "email": SEED_DT_EMAIL, "password": SEED_DT_PASS,
        }, format="json")
        self.assertEqual(resp.status_code, 200)
        body = resp.data
        self.assertEqual(body["role_name"], "Director Técnico")
        self.assertIn("team_id", body)
        self.assertIsNotNone(body["team_id"])

    def test_login_admin_role(self):
        """✅ Login de Admin devuelve token (+ team_id None)"""
        resp = self.admin_client.post(LOGIN_PATH, {
            "email": SEED_ADMIN_EMAIL, "password": SEED_ADMIN_PASS,
        }, format="json")
        self.assertEqual(resp.status_code, 200)
        body = resp.data
        self.assertEqual(body["role_name"], "Admin")
        self.assertIn("token", body)
        self.assertEqual(body["team_id"], None)

    def test_login_wrong_password(self):
        """❌ Contraseña incorrecta → 401 sin token"""
        resp = self.general_client.post(LOGIN_PATH, {
            "email": SEED_GENERAL_EMAIL, "password": "incorrecta",
        }, format="json")
        self.assertEqual(resp.status_code, 401)
        self.assertNotIn("token", resp.data)

    def test_login_unregistered_email(self):
        """❌ Email no registrado → 404"""
        resp = self.general_client.post(LOGIN_PATH, {
            "email": "noexiste@test.com", "password": "xxx",
        }, format="json")
        self.assertEqual(resp.status_code, 404)

    def test_protected_endpoint_requires_token(self):
        """❌ Endpoint protegido sin token → 401 (invitado no accede)"""
        anon = APIClient()
        resp = anon.get(USER_DASHBOARD_PATH)
        self.assertEqual(resp.status_code, 401)


@skipUnless(INTEGRATION_TESTS, "Requiere INTEGRATION_TESTS=1 (Postgres real en CI)")
class DashboardAndFavoritesIntegrationTests(TestCase):
    """Dashboard, favoritos y notificaciones de un usuario real."""

    @classmethod
    def setUpTestData(cls):
        seed_test_championship()
        # Login como usuario general sembrado
        raw = APIClient()
        resp = raw.post(LOGIN_PATH, {
            "email": SEED_GENERAL_EMAIL, "password": SEED_GENERAL_PASS,
        }, format="json")
        token = resp.data["token"]
        cls.general = APIClient()
        cls.general.credentials(HTTP_AUTHORIZATION=f"Token {token}")
        # Admin para probar que el toggle de favoritos es por usuario
        resp_admin = raw.post(LOGIN_PATH, {
            "email": SEED_ADMIN_EMAIL, "password": SEED_ADMIN_PASS,
        }, format="json")
        cls.admin = APIClient()
        cls.admin.credentials(HTTP_AUTHORIZATION=f"Token {resp_admin.data['token']}")

    def test_dashboard_returns_expected_keys(self):
        """✅ Dashboard devuelve la estructura real del seed (sin errores)"""
        resp = self.general.get(USER_DASHBOARD_PATH)
        self.assertEqual(resp.status_code, 200)
        data = resp.data
        self.assertIsInstance(data, dict)
        self.assertNotIn("error", data)
        # Claves que siempre emite DashboardView (con seed mínimo)
        self.assertIn("favorite_players", data)
        self.assertIn("unread_notifications", data)

    def test_favorites_toggle_team(self):
        """✅ Toggle favorito de equipo (add/remove) y lista por usuario"""
        favs = self.general.get("/api/user/favorites/").data
        teams = favs.get("teams", [])
        self.assertTrue(teams)  # el seed da favoritos al Usuario General
        team_id = teams[0]["id"]
        # Quitar
        resp = self.general.post("/api/user/favorites/team/", {"team_id": team_id}, format="json")
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(resp.data["favorited"])
        # Volver a añadir (crea → 201)
        resp2 = self.general.post("/api/user/favorites/team/", {"team_id": team_id}, format="json")
        self.assertEqual(resp2.status_code, 201)
        self.assertTrue(resp2.data["favorited"])

    def test_favorites_isolated_per_user(self):
        """✅ Los favoritos de admin y general no se mezclan"""
        favs_admin = self.admin.get("/api/user/favorites/").data["teams"]
        favs_general = self.general.get("/api/user/favorites/").data["teams"]
        ids_admin = {t["id"] for t in favs_admin}
        ids_general = {t["id"] for t in favs_general}
        # Ambos tienen equipos, pero subconjuntos distintos
        self.assertGreaterEqual(len(ids_admin), 1)
        self.assertGreaterEqual(len(ids_general), 1)
        self.assertNotEqual(ids_admin, ids_general)