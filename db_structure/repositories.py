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


class FavoriteTeamRepository(BaseRepository):
    model = FavoriteTeam

    @classmethod
    def get_by_user(cls, user):
        return cls.model.objects.filter(user_id=user.id).select_related('team')

    @classmethod
    def get_by_user_and_team(cls, user, team_id):
        return cls.model.objects.filter(user_id=user.id, team_id=team_id).first()

    @classmethod
    def toggle(cls, user, team_id):
        obj = cls.get_by_user_and_team(user, team_id)
        if obj:
            obj.delete()
            return None
        return cls.create({'user_id': user.id, 'team_id': team_id})


class FavoritePlayerRepository(BaseRepository):
    model = FavoritePlayer

    @classmethod
    def get_by_user(cls, user):
        return cls.model.objects.filter(user_id=user.id).select_related('player')

    @classmethod
    def get_by_user_and_player(cls, user, player_id):
        return cls.model.objects.filter(user_id=user.id, player_id=player_id).first()

    @classmethod
    def toggle(cls, user, player_id):
        obj = cls.get_by_user_and_player(user, player_id)
        if obj:
            obj.delete()
            return None
        return cls.create({'user_id': user.id, 'player_id': player_id})


class NotificationRepository(BaseRepository):
    model = Notification

    @classmethod
    def get_by_user(cls, user, unread_only=False):
        qs = cls.model.objects.filter(user_id=user.id)
        if unread_only:
            qs = qs.filter(is_read=False)
        return qs

    @classmethod
    def get_unread_count(cls, user):
        return cls.model.objects.filter(user_id=user.id, is_read=False).count()

    @classmethod
    def mark_read(cls, user, notification_id):
        obj = cls.model.objects.filter(user_id=user.id, id=notification_id).first()
        if obj:
            obj.is_read = True
            obj.save()
            return obj
        return None

    @classmethod
    def mark_all_read(cls, user):
        cls.model.objects.filter(user_id=user.id, is_read=False).update(is_read=True)


