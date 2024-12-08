from abc import ABC, abstractmethod

class Role(ABC):
    """
    Clase base abstracta para definir roles.
    Define la estructura que deben seguir todos los roles.
    """
    name = "BaseRole"
    permissions = []

    @abstractmethod
    def has_permission(self, permission):
        """
        Verifica si el rol tiene un permiso específico.
        """
        return permission in self.permissions


class AdminRole(Role):
    """
    Rol de Administrador.
    Tiene acceso completo al sistema.
    """
    name = "Admin"
    permissions = [
        'add_user', 'change_user', 'delete_user', 'view_user',
        'add_team', 'change_team', 'delete_team', 'view_team',
        'add_game', 'change_game', 'delete_game', 'view_game',
    ]

    def has_permission(self, permission):
        return permission in self.permissions


class DirectorTecnicoRole(Role):
    """
    Rol de Director Técnico.
    Tiene permisos limitados relacionados con equipos y juegos.
    """
    name = "Director Técnico"
    permissions = [
        'view_team', 'add_team', 'change_team',
        'view_game', 'change_game',
    ]

    def has_permission(self, permission):
        return permission in self.permissions


class UsuarioGeneralRole(Role):
    """
    Rol de Usuario General.
    Solo tiene permisos para visualizar información pública.
    """
    name = "Usuario General"
    permissions = [
        'view_team', 'view_game',
    ]

    def has_permission(self, permission):
        return permission in self.permissions
