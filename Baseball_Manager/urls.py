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
router.register(r'roles', RolViewSet)
router.register(r'positions', PositionViewSet)
router.register(r'seasons', SeasonViewSet)
router.register(r'users', UserViewSet)
router.register(r'workers', WorkerViewSet)
router.register(r'direction-teams', DirectionTeamViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'lineups', LineUpViewSet)
router.register(r'persons', PersonViewSet)
router.register(r'baseball-players', BaseballPlayerViewSet)
router.register(r'technical-directors', TechnicalDirectorViewSet)
router.register(r'series', SeriesViewSet)
router.register(r'bp-participations', BPParticipationViewSet)
router.register(r'players-in-lineup', PlayerInLineUpViewSet)
router.register(r'teams-on-field', TeamOnTheFieldViewSet)
router.register(r'scores', ScoreViewSet)
router.register(r'games', GameViewSet)
router.register(r'pitchers', PitcherViewSet)
router.register(r'star-players', StarPlayerViewSet)
router.register(r'players-in-position', PlayerInPositionViewSet)
router.register(r'player-swaps', PlayerSwapViewSet)

urlpatterns = [
    path('admin/', admin.site.urls)
    #path('', router.urls)
]+ router.urls
