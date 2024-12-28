from db_structure.models import *
from db_structure.generic_classes.BaseService import BaseService

class RolService(BaseService):
    model = Rol

from db_structure.models import User

class PositionService(BaseService):
    model= Position


class SeasonService(BaseService):
    model= Season


class UserService(BaseService):
    model= User

class WorkerService(BaseService):
    model= Worker


class DirectionTeamService(BaseService):
    model= DirectionTeam


class TeamService(BaseService):
    model= Team


class LineUpService(BaseService):
    model= LineUp


class PersonService(BaseService):
    model= Person


class BaseballPlayerService(BaseService):
    model= BaseballPlayer


class TechnicalDirectorService(BaseService):
    model= TechnicalDirector


class SeriesService(BaseService):
    model= Series


class BPParticipationService(BaseService):
    model= BPParticipation


class PlayerInLineUpService(BaseService):
    model= PlayerInLineUp


class TeamOnTheFieldService(BaseService):
    model= TeamOnTheField


class ScoreService(BaseService):
    model= Score


class GameService(BaseService):
    model= Game


class PitcherService(BaseService):
    model= Pitcher

class StarPlayerService(BaseService):
    model= StarPlayer


class PlayerInPositionService(BaseService):
    model= PlayerInPosition

class PlayerSwapService(BaseService):
    model= PlayerSwap




