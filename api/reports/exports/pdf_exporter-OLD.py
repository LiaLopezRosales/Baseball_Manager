# api/reports/exports/pdf_exporter.py

from .base_exporter import BaseExporter
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib import colors
from io import BytesIO
import os

class PDFExporter2(BaseExporter):
    def export(self, data):
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        # Definir el encabezado (por ejemplo, título y fecha)
        header_text = "Reporte de Datos - Mi Servicio"
        c.setFont("Helvetica-Bold", 16)
        c.drawCentredString(width / 2.0, height - 50, header_text)

        # Opción: agregar logo en el encabezado
        try:
            logo_path = "../api/reports/exports/logo.jpg"  # Actualiza con la ruta real de tu logo
            logo = ImageReader(logo_path)
            logo_width = 50
            logo_height = 50
            c.drawImage(logo, 30, height - 80, width=logo_width, height=logo_height, mask='auto')
        except Exception as e:
            print("No se pudo cargar el logo:", e)

        # # Dibujar la marca de agua en el centro de la página (con transparencia)
        # c.saveState()
        # c.setFont("Helvetica", 50)
        # c.setFillColorRGB(0.9, 0.9, 0.9, alpha=0.3)  # Color gris claro con transparencia
        # c.drawCentredString(width / 2.0, height / 2.0, "Mi Servicio")
        # c.restoreState()

        # Espacio para el contenido (debajo del encabezado)
        y_position = height - 100
        c.setFont("Helvetica", 12)
        c.drawString(100, y_position, "Reporte de Datos")
        y_position -= 50

        # Escribir los datos (ejemplo simple de iteración sobre el primer bloque)
        # Aquí podrías iterar sobre la data y construir el reporte
        for section, records in data.items():
            c.drawString(100, y_position, f"Sección: {section}")
            y_position -= 20
            for record in records:
                for key, value in record.items():
                    c.drawString(120, y_position, f"{key}: {value}")
                    y_position -= 15
                    # Si el espacio se agota, se crea una nueva página con el mismo encabezado
                    if y_position < 100:
                        c.showPage()
                        # Volver a dibujar el encabezado y la marca de agua en la nueva página
                        c.setFont("Helvetica-Bold", 16)
                        c.drawCentredString(width / 2.0, height - 50, header_text)
                        try:
                            c.drawImage(logo, 30, height - 80, width=logo_width, height=logo_height, mask='auto')
                        except Exception:
                            pass
                        c.saveState()
                        c.setFont("Helvetica", 50)
                        c.setFillColorRGB(0.9, 0.9, 0.9, alpha=0.3)
                        c.drawCentredString(width / 2.0, height / 2.0, "Mi Servicio")
                        c.restoreState()
                        y_position = height - 100
            y_position -= 30  # Espacio entre secciones

        c.showPage()
        c.save()

        buffer.seek(0)
        return buffer.getvalue()

    
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