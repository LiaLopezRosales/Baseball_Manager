"""
URL configuration for Baseball_Manager project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from rest_framework.routers import DefaultRouter
from db_structure.views import *


router = DefaultRouter()
# router.register(r'users', UserViewSet, basename='user')
# router.register(r'rols', RolViewSet, basename='rol')
router.register(r'roles', RolViewSet, basename='rol')
router.register(r'positions', PositionViewSet, basename='position')
router.register(r'seasons', SeasonViewSet, basename='season')
router.register(r'users', UserViewSet, basename='user')
router.register(r'workers', WorkerViewSet, basename='worker')
router.register(r'direction-teams', DirectionTeamViewSet, basename='direction-team')
router.register(r'teams', TeamViewSet, basename='team')
router.register(r'lineups', LineUpViewSet, basename='lineup')
router.register(r'persons', PersonViewSet, basename='person')
router.register(r'baseball-players', BaseballPlayerViewSet, basename='baseball-player')
router.register(r'technical-directors', TechnicalDirectorViewSet, basename='technical-director')
router.register(r'series', SeriesViewSet, basename='serie')
router.register(r'bp-participations', BPParticipationViewSet, basename='bp-participation')
router.register(r'players-in-lineup', PlayerInLineUpViewSet, basename='player-in-lineup')
router.register(r'teams-on-field', TeamOnTheFieldViewSet, basename='team-on-field')
router.register(r'scores', ScoreViewSet, basename='score')
router.register(r'games', GameViewSet, basename='game')
router.register(r'pitchers', PitcherViewSet, basename='pitcher')
router.register(r'star-players', StarPlayerViewSet, basename='star-player')
router.register(r'players-in-position', PlayerInPositionViewSet, basename='player-in-position')
router.register(r'player-swaps', PlayerSwapViewSet, basename='player-swap')

urlpatterns = [
    path('admin/', admin.site.urls)
    #path('', router.urls)
]+ router.urls
