from django.db import models
from django.contrib.auth.models import AbstractUser
from .roles import AdminRole, DirectorTecnicoRole, UsuarioGeneralRole

class CustomUser(AbstractUser):
    """
    Modelo de usuario extendido.
    Incluye el campo 'rol' para asociar con clases de roles dinámicas.
    """
    ADMIN = AdminRole.name
    DIRECTOR_TECNICO = DirectorTecnicoRole.name
    USUARIO_GENERAL = UsuarioGeneralRole.name

    ROLES_CHOICES = [
        (ADMIN, 'Admin'),
        (DIRECTOR_TECNICO, 'Director Técnico'),
        (USUARIO_GENERAL, 'Usuario General'),
    ]

    email = models.EmailField(unique=True)
    rol = models.CharField(max_length=20, choices=ROLES_CHOICES, default=USUARIO_GENERAL)

    REQUIRED_FIELDS = ['username']
    USERNAME_FIELD = 'email'

    def __str__(self):
        return f"{self.email} ({self.rol})"

    def get_role_instance(self):
        """
        Devuelve una instancia de la clase de rol asociada al usuario.
        """
        if self.rol == self.ADMIN:
            return AdminRole()
        elif self.rol == self.DIRECTOR_TECNICO:
            return DirectorTecnicoRole()
        elif self.rol == self.USUARIO_GENERAL:
            return UsuarioGeneralRole()
        else:
            raise ValueError("Rol no válido.")
