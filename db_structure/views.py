from django.shortcuts import render
from .repositories import *
from .serializers import *
from db_structure.generic_classes.BaseViewSet import BaseViewSet


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





