# api/tests/integration/constants.py
# Constantes compartidas por la suite de integración (realismo con el seed).

import os

# ---------------------------------------------------------------------------
# Gate de la suite
# ---------------------------------------------------------------------------
INTEGRATION_TESTS = os.environ.get("INTEGRATION_TESTS", "0") == "1"

# ---------------------------------------------------------------------------
# Credenciales conocidas sembradas (populate_db.py → login real contra BD)
# ---------------------------------------------------------------------------
SEED_ADMIN_EMAIL = "lialopez@gmail.com"
SEED_ADMIN_PASS = "lia"
SEED_ADMIN_ROLE = "Admin"

SEED_GENERAL_EMAIL = "general@test.com"
SEED_GENERAL_PASS = "general"
SEED_GENERAL_ROLE = "Usuario General"

SEED_DT_EMAIL = "director@test.com"
SEED_DT_PASS = "director"
SEED_DT_ROLE = "Director Técnico"

# ---------------------------------------------------------------------------
# Rutas de la API (prefijo /api/)
# ---------------------------------------------------------------------------
LOGIN_PATH = "/api/login/"
REGISTER_PATH = "/api/register/"
USER_DASHBOARD_PATH = "/api/user/dashboard/"
FAVORITES_PATH = "/api/user/favorites/"
TOGGLE_TEAM_PATH = "/api/user/favorites/team/"
TOGGLE_PLAYER_PATH = "/api/user/favorites/player/"
NOTIFICATIONS_PATH = "/api/notifications/"
MARK_READ_TPL = "/api/notifications/{}/read/"
READ_ALL_PATH = "/api/notifications/read-all/"

# Reportes (api/reports/urls.py)
REPORTS_PATH = "/api/queries/reports/"
DYNAMIC_FILTER_PATH = "/api/queries/dinamic-filter/"
TABLES_PATH = "/api/queries/tables/"

# ---------------------------------------------------------------------------
# Paridad de factory/seed (api/tests/integration usa las mismas constantes)
# ---------------------------------------------------------------------------
SEED_GENERAL_TEAMS = 5
SEED_GENERAL_PLAYERS = 5
SEED_DEFAULT_TEAMS = 5
SEED_DEFAULT_PLAYERS = 5
