#api/authentication.py

from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .roles import AdminRole, DirectorTecnicoRole, UsuarioGeneralRole

class RoleBasedAuthentication(TokenAuthentication):
    """
    Autenticación basada en roles y permisos específicos para Admin, Director Técnico y Usuario General.
    """
    def authenticate_credentials(self, key):
        user, token = super().authenticate_credentials(key)
        role_instance = user.get_role_instance()

        # Admin tiene acceso total
        if isinstance(role_instance, AdminRole):
            return user, token
        
        # Director Técnico solo puede acceder a su propio equipo
        elif isinstance(role_instance, DirectorTecnicoRole):
            team_id = user.get_team_id()
            if not role_instance.has_permission('view_team', user, team_id):
                raise AuthenticationFailed("Acceso denegado: No puedes gestionar este equipo.")
            return user, token

        # Usuario General solo tiene permisos básicos
        elif isinstance(role_instance, UsuarioGeneralRole):
            if not role_instance.has_permission('view_team'):
                raise AuthenticationFailed("Acceso denegado: Permisos insuficientes.")
            return user, token

        # Rol no identificado o inválido
        else:
            raise AuthenticationFailed("Rol no reconocido o sin permisos.")

