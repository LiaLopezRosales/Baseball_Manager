# api/reports/exports/csv_exporter.py

import csv
from io import StringIO
from .base_exporter import BaseExporter  # Asegúrate de importar tu clase base correctamente.

class CSVExporter(BaseExporter):
    def export(self, data):
        # Usamos StringIO para manejar el CSV en memoria
        buffer = StringIO()
        writer = csv.writer(buffer)

        for section, rows in data.items():
            # Escribimos el encabezado de la sección
            writer.writerow([section])  # Título de la sección
            if rows:
                # Escribimos los encabezados de las columnas
                headers = rows[0].keys()
                writer.writerow(headers)
                # Escribimos los datos fila por fila
                for row in rows:
                    writer.writerow(row.values())
            # Línea en blanco entre secciones
            writer.writerow([])

        # Convertimos el buffer en una cadena
        buffer.seek(0)
        return buffer.getvalue()

    def get_file_extension(self):
        return "csv"

    def get_content_type(self):
        return "text/csv"