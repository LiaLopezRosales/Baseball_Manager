from rest_framework import serializers
from .models import *

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = '__all__'

class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = '__all__'

class SeasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Season
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class WorkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Worker
        fields = '__all__'

class DirectionTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = DirectionTeam
        fields = '__all__'

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class LineUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = LineUp
        fields = '__all__'
        
class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = '__all__'


class BaseballPlayerSerializer(serializers.ModelSerializer):
    CI = serializers.StringRelatedField()  # Muestra el `str()` del modelo Person relacionado

    class Meta:
        model = BaseballPlayer
        fields = '__all__'

class TechnicalDirectorSerializer(serializers.ModelSerializer):
    # W_id = WorkerSerializer()  # Serializa el detalle del trabajador

    class Meta:
        model = TechnicalDirector
        fields = '__all__'

class SeriesSerializer(serializers.ModelSerializer):
    # season = SeasonSerializer(read_only=True)  # Incluye datos completos de la temporada solo en lecturas
    # season_id = serializers.PrimaryKeyRelatedField(
    #     queryset=Season.objects.all(), write_only=True  # Solo se usa `id` al escribir
    # )

    class Meta:
        model = Series
        fields = '__all__'

class BPParticipationSerializer(serializers.ModelSerializer):
    #BP_id = BaseballPlayerSerializer()  # Incluye el jugador completo
    # team_id = TeamSerializer(read_only=True)  # Solo detalles del equipo en lecturas
    BP_id = serializers.PrimaryKeyRelatedField(
        queryset=BaseballPlayer.objects.all()
    )

    class Meta:
        model = BPParticipation
        fields = '__all__'
        
class TeamOnTheFieldSerializer(serializers.ModelSerializer):
    # team_id = LineUpSerializer(read_only=True)  # Detalles completos de `LineUp` para lectura
    # lineup_id = serializers.PrimaryKeyRelatedField(queryset=LineUp.objects.all())  # Solo `id` al escribir

    class Meta:
        model = TeamOnTheField
        fields = '__all__'

class ScoreSerializer(serializers.ModelSerializer):
    def validate(self, data):
        if data['winner'] == data['loser']:
            raise serializers.ValidationError("El ganador y el perdedor no pueden ser el mismo equipo.")
        if data['w_points'] < data['l_points']:
            raise serializers.ValidationError("Los puntos del ganador deben ser mayores o iguales a los del perdedor.")
        return data

    class Meta:
        model = Score
        fields = '__all__'

class GameSerializer(serializers.ModelSerializer):
    # local = TeamOnTheFieldSerializer()
    # rival = TeamOnTheFieldSerializer()
    # series = SeriesSerializer()

    class Meta:
        model = Game
        fields = '__all__'
        
class PitcherSerializer(serializers.ModelSerializer):
    #id = BaseballPlayerSerializer()  # Incluye detalles del `BaseballPlayer`
    CI = serializers.PrimaryKeyRelatedField(queryset=BaseballPlayer.objects.all())

    class Meta:
        model = Pitcher
        fields = '__all__'



class StarPlayerSerializer(serializers.ModelSerializer):
    # series = SeriesSerializer(read_only=True)  # Detalles de la Serie en lectura
    # season = SeasonSerializer(read_only=True)  # Detalles de la Temporada en lectura
    # position = PositionSerializer(read_only=True)
    # BP_id = BaseballPlayerSerializer(read_only=True)

    # series_id = serializers.PrimaryKeyRelatedField(queryset=Series.objects.all(), write_only=True)
    # season_id = serializers.PrimaryKeyRelatedField(queryset=Season.objects.all(), write_only=True)
    # position_id = serializers.PrimaryKeyRelatedField(queryset=Position.objects.all(), write_only=True)
    # BP_id = serializers.PrimaryKeyRelatedField(queryset=BaseballPlayer.objects.all(), write_only=True)

    class Meta:
        model = StarPlayer
        fields = '__all__'

class PlayerInPositionSerializer(serializers.ModelSerializer):
    # BP_id = BaseballPlayerSerializer(read_only=True)  # Detalles del jugador en lectura
    # position = PositionSerializer(read_only=True)  # Detalles de la posición en lectura

    # BP_id_id = serializers.PrimaryKeyRelatedField(queryset=BaseballPlayer.objects.all(), write_only=True)
    # position_id = serializers.PrimaryKeyRelatedField(queryset=Position.objects.all(), write_only=True)

    class Meta:
        model = PlayerInPosition
        fields = '__all__'

class PlayerSwapSerializer(serializers.ModelSerializer):
    # old_player = BaseballPlayerSerializer(read_only=True)  # Detalles del jugador antiguo en lectura
    # new_player = BaseballPlayerSerializer(read_only=True)  # Detalles del jugador nuevo en lectura
    # position = PositionSerializer(read_only=True)  # Detalles de la posición en lectura
    # game_team = TeamOnTheFieldSerializer(read_only=True)  # Detalles del equipo en lectura

    old_player_id = serializers.PrimaryKeyRelatedField(queryset=BaseballPlayer.objects.all(), write_only=True)
    new_player_id = serializers.PrimaryKeyRelatedField(queryset=BaseballPlayer.objects.all(), write_only=True)
    position_id = serializers.PrimaryKeyRelatedField(queryset=Position.objects.all(), write_only=True)
    game_team_id = serializers.PrimaryKeyRelatedField(queryset=TeamOnTheField.objects.all(), write_only=True)

    class Meta:
        model = PlayerSwap
        fields = '__all__'

class PlayerInLineUpSerializer(serializers.ModelSerializer):
    # line_up = LineUpSerializer(read_only=True)  # Incluye detalles completos de la alineación
    # player_in_position = PlayerInPositionSerializer(read_only=True)
    # player_in_position = serializers.PrimaryKeyRelatedField(
    #     queryset=PlayerInPosition.objects.all(), write_only=True
    # )

    class Meta:
        model = PlayerInLineUp
        fields = '__all__'