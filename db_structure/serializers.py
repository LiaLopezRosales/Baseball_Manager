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
    #CI = serializers.StringRelatedField()  # Muestra el `str()` del modelo Person relacionado
    def validate_years_of_experience(self, value):
        """🔹 Asegurar que `years_of_experience` no sea negativo"""
        if value < 0:
            raise serializers.ValidationError("Los años de experiencia no pueden ser negativos.")
        return value
    class Meta:
        model = BaseballPlayer
        fields = '__all__'

class TechnicalDirectorSerializer(serializers.ModelSerializer):
    

    class Meta:
        model = TechnicalDirector
        fields = '__all__'

class SeriesSerializer(serializers.ModelSerializer):
    

    class Meta:
        model = Series
        fields = '__all__'

class BPParticipationSerializer(serializers.ModelSerializer):
    
    BP_id = serializers.PrimaryKeyRelatedField(
        queryset=BaseballPlayer.objects.all()
    )

    class Meta:
        model = BPParticipation
        fields = '__all__'
        
class TeamOnTheFieldSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = TeamOnTheField
        fields = '__all__'

class ScoreSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Score
        fields = '__all__'

class GameSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Game
        fields = '__all__'
        
class PitcherSerializer(serializers.ModelSerializer):
    
    P_id= serializers.PrimaryKeyRelatedField(queryset=BaseballPlayer.objects.all())

    class Meta:
        model = Pitcher
        fields = '__all__'



class StarPlayerSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = StarPlayer
        fields = '__all__'

class PlayerInPositionSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = PlayerInPosition
        fields = '__all__'

class PlayerSwapSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = PlayerSwap
        fields = '__all__'

class PlayerInLineUpSerializer(serializers.ModelSerializer):
    

    class Meta:
        model = PlayerInLineUp
        fields = '__all__'