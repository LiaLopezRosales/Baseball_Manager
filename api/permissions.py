# api/permissions.py

from rest_framework import permissions


def _role_name(user):
    """Devuelve el nombre del rol (None si no hay usuario autenticado)."""
    if user is None or not getattr(user, 'is_authenticated', False):
        return None
    fn = getattr(user, 'get_role_name', None)
    return fn() if callable(fn) else None


class IsAdmin(permissions.BasePermission):
    """Permite acceso completo a los administradores."""
    def has_permission(self, request, view):
        return _role_name(request.user) == "Admin"


class IsUsuarioGeneral(permissions.BasePermission):
    """Permite ver información a cualquier usuario con cuenta."""
    def has_permission(self, request, view):
        return _role_name(request.user) in ["Usuario General", "Admin", "Director Técnico"]


class IsDirectorTecnicoAndOwnTeam(permissions.BasePermission):
    """
    Permite al DT modificar solo su equipo, o al Admin hacerlo en cualquiera.
    """
    def has_permission(self, request, view):
        role = _role_name(request.user)
        if role == "Admin":
            return True
        if role == "Director Técnico":
            team_id = view.kwargs.get('team_id')
            user_team_id = request.user.get_team_id()
            if team_id and int(team_id) == user_team_id:
                return True
        return False

    def has_object_permission(self, request, view, obj):
        if _role_name(request.user) == "Admin":
            return True
        return obj.team_id == request.user.get_team_id()


class IsAdminOrDirectorTecnico(permissions.BasePermission):
    """Permite a Admin y Director Técnico (la propiedad del equipo se valida en la vista)."""
    def has_permission(self, request, view):
        return _role_name(request.user) in ["Admin", "Director Técnico"]