# api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, StatisticsView, TeamLineupView, AdminDashboardView, CambioViewSet


# Definición del router para los ViewSets (CRUD automático)
router = DefaultRouter()
router.register(r'cambios', CambioViewSet, basename='cambios')

# Definición de las rutas
urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),  # Ruta para iniciar sesión
    path('stats/', StatisticsView.as_view(), name='statistics'),
    path('team/<int:team_id>/lineup/', TeamLineupView.as_view(), name='team_lineup'),
    path('admin-dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('queries/', include('api.reports.urls')),
] + router.urls  # Agrega automáticamente las rutas CRUD para el ViewSet

