from rest_framework import permissions
from rest_framework import viewsets
from .models import *
from .serializers import *

class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
    permission_classes=[permissions.AllowAny]

class PositionViewSet(viewsets.ModelViewSet):
    queryset = Position.objects.all()
    serializer_class = PositionSerializer

class SeasonViewSet(viewsets.ModelViewSet):
    queryset = Season.objects.all()
    serializer_class = SeasonSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class WorkerViewSet(viewsets.ModelViewSet):
    queryset = Worker.objects.all()
    serializer_class = WorkerSerializer

class DirectionTeamViewSet(viewsets.ModelViewSet):
    queryset = DirectionTeam.objects.all()
    serializer_class = DirectionTeamSerializer

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

class LineUpViewSet(viewsets.ModelViewSet):
    queryset = LineUp.objects.all()
    serializer_class = LineUpSerializer

class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer

class BaseballPlayerViewSet(viewsets.ModelViewSet):
    queryset = BaseballPlayer.objects.all()
    serializer_class = BaseballPlayerSerializer

class TechnicalDirectorViewSet(viewsets.ModelViewSet):
    queryset = TechnicalDirector.objects.all()
    serializer_class = TechnicalDirectorSerializer

class SeriesViewSet(viewsets.ModelViewSet):
    queryset = Series.objects.all()
    serializer_class = SeriesSerializer

class BPParticipationViewSet(viewsets.ModelViewSet):
    queryset = BPParticipation.objects.all()
    serializer_class = BPParticipationSerializer

class PlayerInLineUpViewSet(viewsets.ModelViewSet):
    queryset = PlayerInLineUp.objects.all()
    serializer_class = PlayerInLineUpSerializer

class TeamOnTheFieldViewSet(viewsets.ModelViewSet):
    queryset = TeamOnTheField.objects.all()
    serializer_class = TeamOnTheFieldSerializer

class ScoreViewSet(viewsets.ModelViewSet):
    queryset = Score.objects.all()
    serializer_class = ScoreSerializer

class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer

class PitcherViewSet(viewsets.ModelViewSet):
    queryset = Pitcher.objects.all()
    serializer_class = PitcherSerializer

class StarPlayerViewSet(viewsets.ModelViewSet):
    queryset = StarPlayer.objects.all()
    serializer_class = StarPlayerSerializer

class PlayerInPositionViewSet(viewsets.ModelViewSet):
    queryset = PlayerInPosition.objects.all()
    serializer_class = PlayerInPositionSerializer

class PlayerSwapViewSet(viewsets.ModelViewSet):
    queryset = PlayerSwap.objects.all()
    serializer_class = PlayerSwapSerializer
