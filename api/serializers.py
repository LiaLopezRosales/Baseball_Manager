from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo CustomUser.
    """
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'rol', 'permissions']

    def get_permissions(self, obj):
        role_instance = obj.get_role_instance()
        return role_instance.permissions
