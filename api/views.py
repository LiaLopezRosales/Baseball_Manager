from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status
from .models import CustomUser
from .serializers import UserSerializer

class LoginView(APIView):
    """
    Vista para manejar el inicio de sesión.
    """
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        # Validar usuario y contraseña
        user = CustomUser.objects.filter(email=email).first()
        if not user or not user.check_password(password):
            return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

        # Generar o recuperar token
        token, _ = Token.objects.get_or_create(user=user)

        # Serializar usuario con permisos
        user_data = UserSerializer(user).data
        return Response({'token': token.key, 'user': user_data}, status=status.HTTP_200_OK)