# api/roles.py

from abc import ABC, abstractmethod

class Role(ABC):
    """
    Clase base abstracta para roles con permisos.
    """
    name = "BaseRole"
    permissions = []

    @abstractmethod
    def has_permission(self, permission):
        return permission in self.permissions

class AdminRole(Role):
    name = "Admin"
    permissions = ["*"]  # Acceso total

    def has_permission(self, permission):
        return True

class DirectorTecnicoRole(Role):
    name = "Director Técnico"
    permissions = ["view_team", "change_lineup", "view_game"]

    def has_permission(self, permission, user, team_id=None):
        # Validar si el equipo pertenece al Director Técnico
        if permission in self.permissions:
            user_team_id = user.get_team_id()
            if team_id and user_team_id == team_id:
                return True
            elif not team_id:
                return True  # Acceso general si no se pasa un team_id
        return False

class UsuarioGeneralRole(Role):
    name = "Usuario General"
    permissions = ["view_team", "view_game"]

    def has_permission(self, permission):
        return permission in self.permissions

