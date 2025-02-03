from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader
from io import BytesIO
from .base_exporter import BaseExporter

class PDFExporter(BaseExporter):
    def export(self, data):
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=landscape(letter))
        styles = getSampleStyleSheet()
        elements = []

        def header(canvas, doc):
            """Función para dibujar encabezado con logo y línea horizontal"""
            canvas.saveState()
            width, height = doc.pagesize
            
            # Agregar logo en la esquina superior derecha
            try:
                logo_path = "../api/reports/exports/logo.jpg"
                logo = ImageReader(logo_path)
                logo_width = 73
                logo_height = 50
                canvas.drawImage(logo, width - logo_width - 30, height - logo_height - 10, width=logo_width, height=logo_height, mask="auto")
            except Exception as e:
                print("Error al cargar el logo:", e)
            
            # Texto del encabezado
            canvas.setFont("Times-BoldItalic", 23)  # Cambiado a Times-Bold
            canvas.drawCentredString(width / 2.0, height - 45, "Reportes")
            
            # Dibujar una línea horizontal debajo del encabezado y logo
            canvas.setLineWidth(1)
            # La línea se dibuja desde 30 puntos desde la izquierda hasta 30 puntos desde la derecha, en y = height - 50
            canvas.line(30, height - 63, width - 30, height - 63)
            
            canvas.restoreState()

        # Procesar los datos, asegurando que el título y la tabla no se separen
        for title, rows in data.items():
            section_elements = []  # Grupo de elementos para asegurar KeepTogether
            
            section_elements.append(Paragraph(title, styles["Title"]))
            section_elements.append(Spacer(1, 12))

            if rows and isinstance(rows, list):
                headers = list(rows[0].keys())
                table_data = [headers]

                # Agregar filas de datos
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

                section_elements.append(table)
                section_elements.append(Spacer(1, 24))

                # Agrupar título y tabla en un solo bloque
                elements.append(KeepTogether(section_elements))

        # Construir el PDF asegurando el encabezado en cada página
        doc.build(elements, onFirstPage=header, onLaterPages=header)

        buffer.seek(0)
        return buffer.getvalue()

    def get_file_extension(self):
        return "pdf"
    
    def get_content_type(self):
        return "application/pdf"