from datetime import datetime
from io import BytesIO
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from .base_exporter import BaseExporter

# ─── Paleta LNB PRO (alineada con la UI) ──────────────────────────────
NIGHT = colors.HexColor('#0b1712')
TURF = colors.HexColor('#142c22')
TURF_2 = colors.HexColor('#1c3a2c')
CHALK = colors.HexColor('#f3efe3')
CHALK_DIM = colors.HexColor('#b9c2b7')
WHITE = colors.white
LIGHTS = colors.HexColor('#f2a93b')
CLAY = colors.HexColor('#b5502f')
STRIPE = colors.HexColor('#f2efe4')
GREY = colors.HexColor('#5b6673')
HAIR = colors.HexColor('#d8d2c2')

LOGO = Path(__file__).resolve().parent / 'logo.jpg'


class PDFExporter(BaseExporter):
    def export(self, data, **kwargs):
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(letter),
            leftMargin=16 * mm,
            rightMargin=16 * mm,
            topMargin=20 * mm,
            bottomMargin=20 * mm,
            title=kwargs.get('filename', 'Reporte'),
            author='LNB PRO Telemetry & Analytics',
        )

        styles = self._build_styles()
        elements = []

        # Cabecera de documento (título + subtítulo + meta)
        elements.append(Paragraph(kwargs.get('filename', 'Reporte'), styles['title']))
        elements.append(Paragraph(
            'Líderes de Rendimiento Técnico · Portal oficial de estadísticas '
            'y rendimiento homologado por la WBSC',
            styles['subtitle'],
        ))
        elements.append(Spacer(1, 4))
        elements.append(HRFlowable(width='100%', thickness=1.6, color=CLAY))
        elements.append(Spacer(1, 12))

        total_rows = 0
        for section_title, rows in data.items():
            title = section_title or 'Datos del reporte'
            if not rows:
                block = [
                    Paragraph(title, styles['section']),
                    Paragraph('Sin registros para este corte.', styles['cell']),
                    Spacer(1, 14),
                ]
                elements.append(KeepTogether(block))
                continue

            if isinstance(rows, dict):
                rows = [rows]
            total_rows += len(rows)
            headers = list(rows[0].keys())

            header_cells = [Paragraph(h, styles['th']) for h in headers]
            body = [header_cells]
            for row in rows:
                body.append([
                    Paragraph('' if v is None else str(v), styles['cell'])
                    for v in row.values()
                ])

            usable = doc.width
            col_w = usable / len(headers) if headers else usable
            table = Table(body, colWidths=[col_w] * len(headers), repeatRows=1)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), NIGHT),
                ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, STRIPE]),
                ('GRID', (0, 0), (-1, -1), 0.5, HAIR),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ]))

            block = [
                Paragraph(title, styles['section']),
                Spacer(1, 4),
                Paragraph(f'{len(rows)} registros computados', styles['meta']),
                Spacer(1, 6),
                table,
                Spacer(1, 16),
            ]
            elements.append(KeepTogether(block))

        # Pie con conteo acumulado
        elements.append(Paragraph(
            f'Corte estadístico emitido el {datetime.now().strftime("%d/%m/%Y")} '
            f'a las {datetime.now().strftime("%H:%M")} · {total_rows} registros computados '
            'en total.',
            styles['meta'],
        ))

        def draw_chrome(canvas, docobj):
            page_w, page_h = docobj.pagesize
            canvas.saveState()

            # Banda superior nocturna con la marca LNB PRO
            canvas.setFillColor(NIGHT)
            canvas.rect(0, page_h - 52, page_w, 52, stroke=0, fill=1)
            canvas.setFillColor(LIGHTS)
            canvas.setFont('Helvetica-Bold', 15)
            canvas.drawString(16 * mm, page_h - 33, 'LNB PRO')
            canvas.setFillColor(CLAY)
            canvas.rect(16 * mm, page_h - 52, 3, 52, stroke=0, fill=1)
            canvas.setFillColor(CHALK_DIM)
            canvas.setFont('Helvetica', 7)
            canvas.drawRightString(
                page_w - 16 * mm,
                page_h - 33,
                'Estadísticas Oficiales · World Baseball Softball Confederation Sanctioned Platform',
            )
            try:
                if LOGO.exists():
                    logo = ImageReader(str(LOGO))
                    canvas.drawImage(
                        str(LOGO),
                        page_w - 16 * mm - 58,
                        page_h - 44,
                        width=58,
                        height=34,
                        mask='auto',
                    )
            except Exception as exc:  # pragma: no cover - protección ante assets ausentes
                print('Error al cargar el logo:', exc)

            # Pie de página: afiliación + criterio regulatorio + número de página
            canvas.setStrokeColor(CLAY)
            canvas.setLineWidth(1)
            canvas.line(16 * mm, 14 * mm, page_w - 16 * mm, 14 * mm)
            canvas.setFillColor(GREY)
            canvas.setFont('Helvetica', 7)
            canvas.drawString(
                16 * mm,
                10.5 * mm,
                'Afiliado Oficial WBSC · Criterio Regulatorio WBSC (Estatuto Técnico Art. 84) · Válido Ciclo 2024',
            )
            canvas.drawRightString(page_w - 16 * mm, 10.5 * mm, f'Página {docobj.page}')

            canvas.restoreState()

        doc.build(elements, onFirstPage=draw_chrome, onLaterPages=draw_chrome)
        buffer.seek(0)
        return buffer.getvalue()

    def _build_styles(self):
        base = {
            'fontName': 'Helvetica',
            'textColor': NIGHT,
            'fontSize': 8,
            'leading': 10,
        }
        styles = {
            'title': ParagraphStyle('title', fontName='Helvetica-Bold', fontSize=19,
                                    textColor=NIGHT, leading=23, spaceAfter=3),
            'subtitle': ParagraphStyle('subtitle', fontName='Helvetica-Oblique', fontSize=9,
                                       textColor=GREY, leading=12, spaceAfter=2),
            'section': ParagraphStyle('section', fontName='Helvetica-Bold', fontSize=11,
                                      textColor=TURF, leading=14, spaceAfter=2),
            'meta': ParagraphStyle('meta', fontName='Helvetica-Oblique', fontSize=7.5,
                                   textColor=GREY, leading=10, spaceAfter=6),
            'th': ParagraphStyle('th', fontName='Helvetica-Bold', fontSize=8,
                                 textColor=WHITE, leading=10, alignment=TA_LEFT),
            'cell': ParagraphStyle('cell', textColor=NIGHT, fontSize=8, leading=10),
        }
        for style in ('subtitle', 'meta'):
            styles[style].alignment = TA_LEFT
        return styles

    def get_file_extension(self):
        return "pdf"

    def get_content_type(self):
        return "application/pdf"