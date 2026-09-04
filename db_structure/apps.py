from django.apps import AppConfig


class DbStructureConfig(AppConfig):
    name = 'db_structure'
    verbose_name = 'Estructura de la base de datos'

    def ready(self):
        from db_structure import signals  # noqa: F401