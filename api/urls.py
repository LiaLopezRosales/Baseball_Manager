# api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, PlayerSwapByDTView, PlayersAvailableInPosition, LineUpForTheGameView, PlayerSwapsForTeamView, RegisterView, DashboardView, toggle_favorite_team, toggle_favorite_player, get_favorites, get_notifications, mark_notification_read, mark_all_notifications_read

# Definición del router para los ViewSets (CRUD automático)
router = DefaultRouter()

# Definición de las rutas
urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),  # Ruta para iniciar sesión
    path('player-swap/<int:team_id>/', PlayerSwapByDTView.as_view(), name='player_swap'),
    path('player-swap/', PlayerSwapByDTView.as_view(), name='player_swap_post'),  # Para guardar cambios
    path('player-swap/lineup/<int:team_on_the_field>/', LineUpForTheGameView.as_view(), name='players_in_lineup'),
    path('player-swap/available/<int:team_id>/<int:position_id>/<int:series_id>/<int:lineup_id>/', PlayersAvailableInPosition.as_view(), name='available_players'),
    path("player-swaps/team/<int:team_id>/", PlayerSwapsForTeamView.as_view(), name="player-swaps"),
    path("player-swaps/delete/<int:swap_id>/", PlayerSwapsForTeamView.as_view(), name="delete-player-swap"),
    path('queries/', include('api.reports.urls')),
    path('register/', RegisterView.as_view(), name='register'),
    path('user/dashboard/', DashboardView.as_view(), name='user-dashboard'),
    path('user/favorites/', get_favorites, name='user-favorites'),
    path('user/favorites/team/', toggle_favorite_team, name='toggle-favorite-team'),
    path('user/favorites/player/', toggle_favorite_player, name='toggle-favorite-player'),
    path('notifications/', get_notifications, name='notifications'),
    path('notifications/<int:notification_id>/read/', mark_notification_read, name='mark-notification-read'),
    path('notifications/read-all/', mark_all_notifications_read, name='mark-all-notifications-read'),
] + router.urls  # Agrega automáticamente las rutas CRUD para el ViewSet

