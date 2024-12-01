from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo CustomUser.
    Expone los datos del usuario necesarios para la API.
    """
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'rol']  # Campos expuestos en la API
