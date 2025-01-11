# api/urls.py

from django.urls import path
from .views import LoginView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),  # Ruta para iniciar sesión
]

