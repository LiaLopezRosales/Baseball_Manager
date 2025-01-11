# api/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from db_structure.models import PlayerSwap
from .permissions import IsAdmin, IsDirectorTecnicoAndOwnTeam, IsUsuarioGeneral
from .models import CustomUser
from .serializers import UserSerializer, CambioSerializer

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



# Vista para estadísticas públicas (accesible a todos los usuarios)
class StatisticsView(APIView):
    permission_classes = [IsUsuarioGeneral]

    def get(self, request):
        return Response({"estadisticas": "Datos públicos de estadísticas."})


# Vista protegida para cambiar la alineación, solo para el DT de su equipo
class TeamLineupView(APIView):
    permission_classes = [IsAuthenticated, IsDirectorTecnicoAndOwnTeam]

    def post(self, request, team_id):
        # Solo el DT puede modificar su propio equipo
        return Response({"message": f"Alineación modificada para el equipo {team_id}"})


# Vista exclusiva para administradores con permisos CRUD completos
class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        return Response({"message": "Bienvenido al Panel de Administración"})


# Modelo de vista con CRUD completo para la tabla de cambios
class CambioViewSet(ModelViewSet):
    """
    Vista para gestionar los cambios en la alineación.
    Solo un DT puede modificar su propio equipo y un Admin tiene acceso total.
    """
    queryset = PlayerSwap.objects.all()
    serializer_class = CambioSerializer
    permission_classes = [IsAuthenticated, IsDirectorTecnicoAndOwnTeam]

    def get_queryset(self):
        """Filtra para que el DT solo vea sus propios cambios."""
        user = self.request.user
        if user.get_role_name() == "Director Técnico":
            return PlayerSwap.objects.filter(team_id=user.get_team_id())
        elif user.get_role_name() == "Admin":
            return PlayerSwap.objects.all()
        return PlayerSwap.objects.none()
