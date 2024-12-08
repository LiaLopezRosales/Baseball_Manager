from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status

from .roles import AdminRole, DirectorTecnicoRole
from .models import CustomUser

class LoginView(APIView):
    """
    Vista para manejar el inicio de sesión.
    Valida email, contraseña y rol del usuario.
    Genera un token solo para usuarios con roles permitidos.
    """
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        # Buscar al usuario por email
        user = CustomUser.objects.filter(email=email).first()
        if not user or not user.check_password(password):
            return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

        # Validar el rol del usuario
        role_instance = user.get_role_instance()
        if not isinstance(role_instance, (AdminRole, DirectorTecnicoRole)):
            return Response({'error': 'Acceso denegado: Rol no autorizado'}, status=status.HTTP_403_FORBIDDEN)

        # Generar o recuperar el token
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {
                'email': user.email,
                'rol': user.rol,
                'permissions': role_instance.permissions  # Enviar permisos al frontend
            }
        }, status=status.HTTP_200_OK)
