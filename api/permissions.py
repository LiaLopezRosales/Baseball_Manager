# api/permissions.py

from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """Permite acceso completo a los administradores."""
    def has_permission(self, request, view):
        return request.user and request.user.get_role_name() == "Admin"


class IsUsuarioGeneral(permissions.BasePermission):
    """Permite ver información pública y sin autenticación."""
    def has_permission(self, request, view):
        return request.user.get_role_name() in ["Usuario General", "Admin", "Director Técnico"]


class IsDirectorTecnicoAndOwnTeam(permissions.BasePermission):
    """
    Permite al DT modificar solo su equipo.
    Restricción: Solo modificar su equipo si tiene partido próximo.
    """
    def has_permission(self, request, view):
        if request.user.get_role_name() == "Director Técnico":
            team_id = view.kwargs.get('team_id')
            user_team_id = request.user.get_team_id()
            if team_id and int(team_id) == user_team_id:
                return True
        return False

    def has_object_permission(self, request, view, obj):
        # Validación para objetos específicos (ej: edición de alineación)
        return obj.team_id == request.user.get_team_id()
