# api/models.py

from django.db import models
from db_structure.models import Rol, TechnicalDirector
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.auth.hashers import make_password, check_password
from .roles import AdminRole, DirectorTecnicoRole, UsuarioGeneralRole

class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    Modelo de usuario solo lectura que refleja la tabla 'db_structure_user'.
    """
    id = models.AutoField(primary_key=True)
    email = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=128)

    # Se especifica la columna real de la base de datos
    rol = models.ForeignKey(Rol, db_column="rol_id_id", on_delete=models.DO_NOTHING)
    TD_id = models.ForeignKey(TechnicalDirector, db_column="TD_id_id", on_delete=models.DO_NOTHING, null=True, blank=True)

    USERNAME_FIELD = 'email'  # Autenticación por email
    REQUIRED_FIELDS = ['password']

    # Solo lectura: no se permitirá modificación de datos y se quitan campos de AbstractUser que no están en la tabla User
    last_login = None  
    is_superuser = None
    is_active = None 
    is_staff = None 

    class Meta:
        db_table = 'db_structure_user'
        managed = False  # Solo lectura
        default_permissions = ()  # No genera permisos automáticos

    def get_role_instance(self):
        """Devuelve una instancia del rol basada en la relación con Rol."""
        if self.rol.type == AdminRole.name:
            return AdminRole()
        elif self.rol.type == DirectorTecnicoRole.name:
            return DirectorTecnicoRole()
        elif self.rol.type == UsuarioGeneralRole.name:
            return UsuarioGeneralRole()
        raise ValueError("Rol no válido.")

    def get_role_name(self):
        """Devuelve el nombre del rol desde la relación con Rol."""
        return self.rol.type if self.rol else "Sin Rol"

    def get_team_id(self):
        """Obtiene el ID del equipo si el Director Técnico tiene un equipo asociado."""
        if self.TD_id and self.TD_id.direction_team:
            return self.TD_id.direction_team.Team_id.id
        return None

    def check_password(self, raw_password):
        """Validación directa sin cifrado. NO SEGURO PARA PRODUCCIÓN."""
        return self.password == raw_password  # Comparación directa de contraseñas

    def save(self, *args, **kwargs):
        """Guardar sin cifrar la contraseña."""
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.email} - Rol: {self.get_role_name()}"


    #### PARA SI SE IMPLEMENTA ENCRIPTACIÓN DE LA CONTRASEÑA ####

    # # Sobrescribir el guardado para cifrar contraseñas correctamente
    # def save(self, *args, **kwargs):
    #     if not self.password.startswith('pbkdf2_'):
    #         self.password = make_password(self.password)
    #     super().save(*args, **kwargs)

    # # Validación segura de contraseña
    # def check_password(self, raw_password):
    #     return check_password(raw_password, self.password)

    