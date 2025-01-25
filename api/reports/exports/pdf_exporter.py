# api/reports/exports/pdf_exporter.py

from .base_exporter import BaseExporter
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from io import BytesIO

class PDFExporter(BaseExporter):
    def export(self, data):
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=landscape(letter))  # Página horizontal
        styles = getSampleStyleSheet()
        elements = []

        for title, rows in data.items():
            elements.append(Paragraph(title, styles["Title"]))
            elements.append(Spacer(1, 12))

            if rows and isinstance(rows, list):
                headers = list(rows[0].keys())
                table_data = [headers]

                # Agregar los valores como filas
                for row in rows:
                    table_data.append([str(row.get(key, "")) for key in headers])

                # Crear la tabla con repetición de encabezados
                table = Table(table_data, repeatRows=1)
                table.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                ]))

                elements.append(table)
                elements.append(Spacer(1, 24))

        doc.build(elements)

        buffer.seek(0)
        return buffer.getvalue()

    def get_file_extension(self):
        return "pdf"
    
    def get_content_type(self):
        return "application/pdf"