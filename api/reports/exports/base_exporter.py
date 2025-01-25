# api/reports/exports/base_exporter.py

from abc import ABC, abstractmethod

class BaseExporter(ABC):
    @abstractmethod
    def export(self, data, **kwargs) -> bytes:
        """
        Exporta los datos en un formato específico.
        Args:
            data (list[dict]): Datos a exportar.
            kwargs (dict): Opcionales, personalización.
        Returns:
            bytes: Archivo exportado en formato binario.
        """
        pass

    @abstractmethod
    def get_file_extension(self) -> str:
        """
        Devuelve la extensión de archivo asociada al formato.
        Returns:
            str: Extensión de archivo (ej. "pdf", "csv").
        """
        pass
    
    @abstractmethod
    def get_content_type(self) -> str:
        """
        Devuelve el content_type de; archivo asociada al formato.
        Returns:
            str: Extensión de archivo (ej. "application/json", "text/csv").
        """
        pass