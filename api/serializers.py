# api/serializers.py

from rest_framework import serializers
from .models import CustomUser
from db_structure.models import PlayerSwap

class UserSerializer(serializers.ModelSerializer):
    role_name = serializers.SerializerMethodField()
    team_id = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'role_name', 'team_id', 'permissions']

    def get_role_name(self, obj):
        return obj.get_role_name()

    def get_team_id(self, obj):
        return obj.get_team_id()

    def get_permissions(self, obj):
        return obj.get_role_instance().permissions


class CambioSerializer(serializers.ModelSerializer):
    """
    Serializador para la tabla de cambios.
    """
    class Meta:
        model = PlayerSwap
        fields = '__all__'
