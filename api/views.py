# api/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status
from .models import CustomUser
from .serializers import UserSerializer

class LoginView(APIView):
    """
    Vista para manejar el login de usuarios con validación de roles y permisos.
    """
    def post(self, request, *args, **kwargs):
        try:
            email = request.data.get('email')
            password = request.data.get('password')

            # Validación básica
            if not email or not password:
                return Response({'error': 'El correo y la contraseña son obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

            user = CustomUser.objects.filter(email=email).first()
            
            if not user:
                return Response({'error': 'El correo electrónico no está registrado.'}, status=status.HTTP_404_NOT_FOUND)

            if not user.check_password(password):
                return Response({'error': 'Contraseña incorrecta.'}, status=status.HTTP_401_UNAUTHORIZED)

            # Generación del token
            token, created = Token.objects.get_or_create(user=user)
            user_data = UserSerializer(user).data
            return Response({
                'token': token.key, 
                'user': user_data,
                'team_id': user.get_team_id(),
                'role_name': user.get_role_name()
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            # Captura cualquier otro error inesperado
            return Response({'error': f'Error interno del servidor: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

