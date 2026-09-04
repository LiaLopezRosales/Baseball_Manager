from django.shortcuts import render
from .repositories import *
from .serializers import *
from db_structure.generic_classes.BaseViewSet import BaseViewSet
from api.serializers import *

class RolViewSet(BaseViewSet):
    repository = RolRepository
    serializer_class = RolSerializer

class PositionViewSet(BaseViewSet):
    repository = PositionRepository
    serializer_class = PositionSerializer


class SeasonViewSet(BaseViewSet):
    repository = SeasonRepository
    serializer_class = SeasonSerializer

class UserViewSet(BaseViewSet):
    repository = UserRepository
    serializer_class = UserSerializer



class WorkerViewSet(BaseViewSet):
    repository = WorkerRepository
    serializer_class = WorkerSerializer



class DirectionTeamViewSet(BaseViewSet):
    repository = DirectionTeamRepository
    serializer_class = DirectionTeamSerializer



class TeamViewSet(BaseViewSet):
    repository = TeamRepository
    serializer_class = TeamSerializer


class LineUpViewSet(BaseViewSet):
    repository = LineUpRepository
    serializer_class = LineUpSerializer



class PersonViewSet(BaseViewSet):
    repository = PersonRepository
    serializer_class = PersonSerializer



class BaseballPlayerViewSet(BaseViewSet):
    repository = BaseballPlayerRepository
    serializer_class = BaseballPlayerSerializer



class TechnicalDirectorViewSet(BaseViewSet):
    repository = TechnicalDirectorRepository
    serializer_class = TechnicalDirectorSerializer



class SeriesViewSet(BaseViewSet):
    repository = SeriesRepository
    serializer_class = SeriesSerializer



class BPParticipationViewSet(BaseViewSet):
    repository = BPParticipationRepository
    serializer_class = BPParticipationSerializer



class PlayerInLineUpViewSet(BaseViewSet):
    repository = PlayerInLineUpRepository
    serializer_class = PlayerInLineUpSerializer



class TeamOnTheFieldViewSet(BaseViewSet):
    repository = TeamOnTheFieldRepository
    serializer_class = TeamOnTheFieldSerializer



class ScoreViewSet(BaseViewSet):
    repository = ScoreRepository
    serializer_class = ScoreSerializer



class GameViewSet(BaseViewSet):
    repository = GameRepository
    serializer_class = GameSerializer



class PitcherViewSet(BaseViewSet):
    repository = PitcherRepository
    serializer_class = PitcherSerializer



class StarPlayerViewSet(BaseViewSet):
    repository = StarPlayerRepository
    serializer_class = StarPlayerSerializer



class PlayerInPositionViewSet(BaseViewSet):
    repository = PlayerInPositionRepository
    serializer_class = PlayerInPositionSerializer



class PlayerSwapViewSet(BaseViewSet):
    repository = PlayerSwapRepository
    serializer_class = PlayerSwapSerializer


class FavoriteTeamViewSet(BaseViewSet):
    repository = FavoriteTeamRepository
    serializer_class = FavoriteTeamSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return FavoriteTeamRepository.get_by_user(self.request.user)
        return FavoriteTeamRepository.model.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FavoritePlayerViewSet(BaseViewSet):
    repository = FavoritePlayerRepository
    serializer_class = FavoritePlayerSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return FavoritePlayerRepository.get_by_user(self.request.user)
        return FavoritePlayerRepository.model.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NotificationViewSet(BaseViewSet):
    repository = NotificationRepository
    serializer_class = NotificationSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return NotificationRepository.get_by_user(self.request.user)
        return NotificationRepository.model.objects.none()



