from django.shortcuts import render
from .services import *
from .serializers import *
from db_structure.generic_classes.BaseViewSet import BaseViewSet


class RolViewSet(BaseViewSet):
    service = RolService
    serializer_class = RolSerializer

class PositionViewSet(BaseViewSet):
    service = PositionService
    serializer_class = PositionSerializer


class SeasonViewSet(BaseViewSet):
    service = SeasonService
    serializer_class = SeasonSerializer

class UserViewSet(BaseViewSet):
    service = UserService
    serializer_class = UserSerializer



class WorkerViewSet(BaseViewSet):
    service = WorkerService
    serializer_class = WorkerSerializer



class DirectionTeamViewSet(BaseViewSet):
    service = DirectionTeamService
    serializer_class = DirectionTeamSerializer



class TeamViewSet(BaseViewSet):
    service = TeamService
    serializer_class = TeamSerializer


class LineUpViewSet(BaseViewSet):
    service = LineUpService
    serializer_class = LineUpSerializer



class PersonViewSet(BaseViewSet):
    service = PersonService
    serializer_class = PersonSerializer



class BaseballPlayerViewSet(BaseViewSet):
    service = BaseballPlayerService
    serializer_class = BaseballPlayerSerializer



class TechnicalDirectorViewSet(BaseViewSet):
    service = TechnicalDirectorService
    serializer_class = TechnicalDirectorSerializer



class SeriesViewSet(BaseViewSet):
    service = SeriesService
    serializer_class = SeriesSerializer



class BPParticipationViewSet(BaseViewSet):
    service = BPParticipationService
    serializer_class = BPParticipationSerializer



class PlayerInLineUpViewSet(BaseViewSet):
    service = PlayerInLineUpService
    serializer_class = PlayerInLineUpSerializer



class TeamOnTheFieldViewSet(BaseViewSet):
    service = TeamOnTheFieldService
    serializer_class = TeamOnTheFieldSerializer



class ScoreViewSet(BaseViewSet):
    service = ScoreService
    serializer_class = ScoreSerializer



class GameViewSet(BaseViewSet):
    service = GameService
    serializer_class = GameSerializer



class PitcherViewSet(BaseViewSet):
    service = PitcherService
    serializer_class = PitcherSerializer



class StarPlayerViewSet(BaseViewSet):
    service = StarPlayerService
    serializer_class = StarPlayerSerializer



class PlayerInPositionViewSet(BaseViewSet):
    service = PlayerInPositionService
    serializer_class = PlayerInPositionSerializer



class PlayerSwapViewSet(BaseViewSet):
    service = PlayerSwapService
    serializer_class = PlayerSwapSerializer





