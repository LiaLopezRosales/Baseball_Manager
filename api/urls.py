# api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, PlayerSwapByDTView, PlayersAvailableInPosition, LineUpForTheGameView

# Definición del router para los ViewSets (CRUD automático)
router = DefaultRouter()

# Definición de las rutas
urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),  # Ruta para iniciar sesión
    path('player-swap/<int:team_id>/', PlayerSwapByDTView.as_view(), name='player_swap'),
    path('player-swap/', PlayerSwapByDTView.as_view(), name='player_swap_post'),  # Para guardar cambios
    path('player-swap/lineup/<int:team_on_the_field>/', LineUpForTheGameView.as_view(), name='players_in_lineup'),
    path('player-swap/available/<int:team_id>/<int:position_id>/<int:series_id>/<int:lineup_id>/', PlayersAvailableInPosition.as_view(), name='available_players'),
    path('queries/', include('api.reports.urls')),
] + router.urls  # Agrega automáticamente las rutas CRUD para el ViewSet

