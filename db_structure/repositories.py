from db_structure.models import *
from db_structure.generic_classes.BaseRepository import BaseRepository
from rest_framework.authtoken.models import Token


class RolRepository(BaseRepository):
    model = Rol

class PositionRepository(BaseRepository):
    model= Position


class SeasonRepository(BaseRepository):
    model= Season


class UserRepository(BaseRepository):
    model= User
    
    @classmethod
    def delete(cls, obj_id):
        obj = cls.get_by_id(obj_id)
        if obj:
            Token.objects.filter(user_id=obj_id).delete()
            obj.delete()
            return True
        return False

class WorkerRepository(BaseRepository):
    model= Worker


class DirectionTeamRepository(BaseRepository):
    model= DirectionTeam


class TeamRepository(BaseRepository):
    model= Team


class LineUpRepository(BaseRepository):
    model= LineUp


class PersonRepository(BaseRepository):
    model= Person


class BaseballPlayerRepository(BaseRepository):
    model= BaseballPlayer


class TechnicalDirectorRepository(BaseRepository):
    model= TechnicalDirector


class SeriesRepository(BaseRepository):
    model= Series


class BPParticipationRepository(BaseRepository):
    model= BPParticipation


class PlayerInLineUpRepository(BaseRepository):
    model= PlayerInLineUp


class TeamOnTheFieldRepository(BaseRepository):
    model= TeamOnTheField


class ScoreRepository(BaseRepository):
    model= Score


class GameRepository(BaseRepository):
    model= Game


class PitcherRepository(BaseRepository):
    model= Pitcher

class StarPlayerRepository(BaseRepository):
    model= StarPlayer


class PlayerInPositionRepository(BaseRepository):
    model= PlayerInPosition

class PlayerSwapRepository(BaseRepository):
    model= PlayerSwap




