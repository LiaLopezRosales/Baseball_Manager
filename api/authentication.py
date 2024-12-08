from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .roles import AdminRole, DirectorTecnicoRole

class RoleBasedAuthentication(TokenAuthentication):
    """
    Autenticación basada en roles dinámicos.
    Permite el acceso solo a usuarios con roles específicos.
    """
    def authenticate_credentials(self, key):
        user, token = super().authenticate_credentials(key)

        # Validar que el usuario tiene un rol válido
        role_instance = user.get_role_instance()
        if not isinstance(role_instance, (AdminRole, DirectorTecnicoRole)):
            raise AuthenticationFailed("No tienes permisos para iniciar sesión.")
        return user, token
