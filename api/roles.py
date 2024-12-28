from abc import ABC, abstractmethod
from django.contrib.auth.models import Permission


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
    
    def has_permission(self, permission):
        """
        Devuelve True para cualquier permiso, ya que Admin tiene permisos globales.
        """
        return True

    @property
    def permissions(self):
        """
        Devuelve dinámicamente todos los permisos disponibles en el sistema.
        """
        all_permissions = Permission.objects.values_list('codename', flat=True)
        return list(all_permissions)

class DirectorTecnicoRole(Role):
    """
    Rol de Director Técnico.
    Tiene permisos limitados relacionados con equipos y juegos.
    """
    name = "Director Técnico"
    permissions = [
        'view_team', 'view_game',
        'add_lineup', 'change_lineup', 'view_lineup',
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
        'view_team', 'view_game', 'generate_reports',
    ]

    def has_permission(self, permission):
        return permission in self.permissions
