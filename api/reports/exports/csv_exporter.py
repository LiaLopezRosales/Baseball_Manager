# api/reports/exports/csv_exporter.py

import csv
from io import StringIO
from .base_exporter import BaseExporter  # Asegúrate de importar tu clase base correctamente.


def _to_text(value):
    """Convierte valores escalares o listas/tuplas a texto plano (sin repr de Python)."""
    if isinstance(value, (list, tuple)):
        return ', '.join(str(x) for x in value)
    return '' if value is None else value


class CSVExporter(BaseExporter):
    def export(self, data, **kwargs):
        # Usamos StringIO para manejar el CSV en memoria
        buffer = StringIO()
        writer = csv.writer(buffer)

        for section, rows in data.items():
            # Escribimos el encabezado de la sección
            writer.writerow([section])  # Título de la sección
            if rows:
                if isinstance(rows, dict):
                    rows = [rows]
                # Escribimos los encabezados de las columnas
                headers = rows[0].keys()
                writer.writerow(headers)
                # Escribimos los datos fila por fila
                for row in rows:
                    writer.writerow([_to_text(row.get(h)) for h in headers])
            # Línea en blanco entre secciones
            writer.writerow([])

        # Convertimos el buffer en una cadena
        buffer.seek(0)
        return buffer.getvalue()

    def get_file_extension(self):
        return "csv"

    def get_content_type(self):
        return "text/csv"