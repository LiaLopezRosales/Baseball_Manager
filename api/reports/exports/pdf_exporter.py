import re
from datetime import datetime
from html import escape
from io import BytesIO

from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from .base_exporter import BaseExporter
from .theme import (
    CLAY, CHALK, CHALK_DIM, GREY, HAIR, LIGHTS, NIGHT, PALE, STRIPE, TURF, WHITE,
    FOOTER_H, HEADER_H, NumberedCanvas,
)
from .theme import draw_lnb_brand

_NUM_RE = re.compile(r'^[+-]?(\d+(\.\d+)?|\.\d+)$')


class PDFExporter(BaseExporter):
    def export(self, data, **kwargs):
        buffer = BytesIO()
        filename = kwargs.get('filename') or 'Reporte'
        now = datetime.now()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(letter),
            leftMargin=16 * mm,
            rightMargin=16 * mm,
            topMargin=HEADER_H + 8,
            bottomMargin=20 * mm,
            title=filename,
            author='LNB PRO Telemetry & Analytics',
        )

        styles = self._build_styles()
        date_str = now.strftime('%d/%m/%Y a las %H:%M')
        elements = []
        total_rows = 0

        for section_title, rows in data.items():
            title = section_title or 'Datos del reporte'
            if not rows:
                block = [
                    self._section_head(title, 0, doc.width, styles),
                    Spacer(1, 4),
                    Paragraph('Sin registros para este corte.', styles['empty']),
                    Spacer(1, 14),
                ]
                elements.append(KeepTogether(block))
                continue

            if isinstance(rows, dict):
                rows = [rows]
            total_rows += len(rows)
            headers = list(rows[0].keys())
            col_widths = self._column_widths(headers, rows, doc.width)
            numeric_cols = self._numeric_columns(rows)
            small = len(headers) >= 8

            def cell_style(j):
                key = 'cell_sm_num' if small and j in numeric_cols else (
                    'cell_sm' if small else 'cell_num' if j in numeric_cols else 'cell')
                return styles[key]

            header_cells = [
                Paragraph(headers[j], styles['th_num'] if j in numeric_cols else styles['th'])
                for j in range(len(headers))
            ]
            body = [header_cells]
            for row in rows:
                cells = []
                for j, header in enumerate(headers):
                    v = row.get(header) if isinstance(row, dict) else None
                    text = self._to_text(v)
                    cells.append(Paragraph(
                        '' if not text.strip() else escape(text).replace('\r', '')
                        .replace('\n', '<br/>'),
                        cell_style(j),
                    ))
                body.append(cells)

            table = Table(body, colWidths=col_widths, repeatRows=1, splitByRow=1)
            pad = 3 if small else 4
            style_commands = [
                ('BACKGROUND', (0, 0), (-1, 0), NIGHT),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, STRIPE]),
                ('GRID', (0, 0), (-1, -1), 0.4, HAIR),
                ('LINEABOVE', (0, 0), (-1, 0), 2.2, LIGHTS),
                ('LINEBELOW', (0, 0), (-1, 0), 0.9, CLAY),
                ('TOPPADDING', (0, 0), (-1, -1), pad),
                ('BOTTOMPADDING', (0, 0), (-1, -1), pad),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ]
            # La fila líder (la primera del cuerpo) se resalta en ámbar suave,
            # espejando el glow de la barra líder de la landing.
            if len(rows) >= 2:
                style_commands.append(('BACKGROUND', (0, 1), (-1, 1), PALE))
            table.setStyle(TableStyle(style_commands))

            block = [
                self._section_head(title, len(rows), doc.width, styles),
                Spacer(1, 5),
                table,
                Spacer(1, 16),
            ]
            elements.append(KeepTogether(block))

        elements.append(Paragraph(
            f'Corte estadístico emitido el {date_str} · {total_rows} registros computados '
            'en total.',
            styles['summary'],
        ))

        def _draw_header(canvas, docobj):
            page_w, page_h = docobj.pagesize
            canvas.saveState()

            # Banda superior nocturna con la marca y título del reporte
            canvas.setFillColor(NIGHT)
            canvas.rect(0, page_h - HEADER_H, page_w, HEADER_H, stroke=0, fill=1)
            canvas.setFillColor(CLAY)
            canvas.rect(0, page_h - HEADER_H, 3 * mm, HEADER_H, stroke=0, fill=1)

            # Marca: cuadrado ámbar + LNB PRO + sello WBSC
            canvas.setFillColor(LIGHTS)
            canvas.rect(16 * mm, page_h - 40, 9, 9, stroke=0, fill=1)
            canvas.setFont('Helvetica-Bold', 15)
            canvas.drawString(16 * mm + 15, page_h - 36, 'LNB PRO')
            canvas.setFillColor(CHALK_DIM)
            canvas.setFont('Helvetica', 6.5)
            canvas.drawString(16 * mm + 15 + canvas.stringWidth('LNB PRO', 'Helvetica-Bold', 15) + 6,
                              page_h - 33, 'TELEMETRY & ANALYTICS · WBSC')

            # Wordmark LNB PRO (badge + marca, como en el header de la nueva UI)
            draw_lnb_brand(canvas, page_w - 16 * mm, page_h - 6)
            right_zone = page_w - 16 * mm - 118

            # Título del reporte, con tamaño adaptativo para no desbordar
            maxw = right_zone - 16 * mm
            size = 14.5
            font = 'Helvetica-Bold'
            disp_title = filename
            while size > 9.5 and canvas.stringWidth(disp_title, font, size) > maxw:
                size -= 0.5
            width = canvas.stringWidth(disp_title, font, size)
            if width > maxw:
                disp_title = disp_title.rstrip()
                while width > maxw - 20 and len(disp_title) > 6:
                    disp_title = disp_title[: len(disp_title) - 2].rstrip() + '…'
                    width = canvas.stringWidth(disp_title, font, size)
            canvas.setFillColor(CHALK)
            canvas.setFont(font, size)
            canvas.drawString(16 * mm, page_h - 58, disp_title)

            # Subtítulo + metadatos (fecha y conteo)
            canvas.setFillColor(CHALK_DIM)
            canvas.setFont('Helvetica', 7.5)
            canvas.drawString(
                16 * mm,
                page_h - 66,
                'Líderes de Rendimiento Técnico · Portal oficial de estadísticas y '
                'rendimiento homologado por la WBSC',
            )
            canvas.setFillColor(LIGHTS)
            canvas.setFont('Helvetica', 7.5)
            canvas.drawString(
                16 * mm,
                page_h - 78,
                f'Emitido el {date_str} · {total_rows} registros computados',
            )
            canvas.setFillColor(CHALK_DIM)
            canvas.setFont('Helvetica', 6.5)
            canvas.drawRightString(
                right_zone,
                page_h - 78,
                'Afiliado Oficial WBSC · Estatuto Técnico Art. 84 · Ciclo 2024',
            )

            # Separador inferior de la banda (sustituye al antiguo HR que se desbordaba)
            canvas.setStrokeColor(CLAY)
            canvas.setLineWidth(2.2)
            canvas.line(0, page_h - HEADER_H, page_w, page_h - HEADER_H)

            canvas.restoreState()

        doc.build(
            elements,
            onFirstPage=_draw_header,
            onLaterPages=_draw_header,
            canvasmaker=NumberedCanvas,
        )
        buffer.seek(0)
        return buffer.getvalue()

    def _to_text(self, value):
        if isinstance(value, (list, tuple)):
            return ', '.join(str(x) for x in value)
        return '' if value is None else str(value)

    def _section_head(self, title, count, width, styles):
        head = Table(
            [
                ['', Paragraph(title, styles['section'])],
                ['', Paragraph(f'{count} registros computados', styles['meta_count'])],
            ],
            colWidths=[3 * mm, max(width - 3 * mm, 1)],
        )
        head.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), CLAY),
            ('BACKGROUND', (1, 0), (1, -1), WHITE),
            ('VALIGN', (0, 0), (1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (0, -1), 0),
            ('RIGHTPADDING', (0, 0), (0, -1), 0),
            ('TOPPADDING', (0, 0), (0, -1), 0),
            ('BOTTOMPADDING', (0, 0), (0, -1), 0),
            ('LEFTPADDING', (1, 0), (1, -1), 6),
            ('RIGHTPADDING', (1, 0), (1, -1), 6),
            ('BOX', (0, 0), (-1, -1), 0.5, HAIR),
        ]))
        head.hAlign = 'LEFT'
        return head

    def _column_widths(self, headers, rows, usable):
        """Anchos proporcionales al contenido, con suelo y techo para que nada se salga."""
        if not headers:
            return []
        lengths = []
        for j in range(len(headers)):
            mx = len(str(headers[j]))
            for row in rows:
                v = row.get(headers[j]) if isinstance(row, dict) else None
                if v is not None:
                    mx = max(mx, len(str(v)))
            lengths.append(mx)
        total = sum(lengths) or 1
        floor = usable * 0.06
        cap = usable * 0.55
        raw = [min(cap, max(floor, (l / total) * usable)) for l in lengths]
        scale = usable / sum(raw)
        widths = [w * scale for w in raw]
        # Guardia final: nunca superar el ancho útil
        if sum(widths) > usable - 0.5:
            shrink = (usable - 0.5) / sum(widths)
            widths = [w * shrink for w in widths]
        return widths

    def _numeric_columns(self, rows):
        if not rows or not isinstance(rows, list) or not isinstance(rows[0], dict):
            return set()
        headers = list(rows[0].keys())
        numeric = set()
        for j, header in enumerate(headers):
            vals = [
                row.get(header) for row in rows
                if row.get(header) is not None and str(row.get(header)).strip() != ''
            ]
            if vals and all(_NUM_RE.match(str(v).strip()) is not None for v in vals):
                numeric.add(j)
        return numeric

    def _build_styles(self):
        base = {
            'fontName': 'Helvetica',
            'textColor': NIGHT,
            'fontSize': 8,
            'leading': 10,
            'wordWrap': 'CJK',  # evita que celdas largas se salgan del borde
        }
        styles = {
            'section': ParagraphStyle('section', fontName='Helvetica-Bold', fontSize=11,
                                      textColor=NIGHT, leading=14, spaceAfter=2),
            'meta_count': ParagraphStyle('meta_count', fontName='Helvetica-Bold', fontSize=7.5,
                                         textColor=CLAY, leading=10, spaceAfter=0),
            'empty': ParagraphStyle('empty', fontName='Helvetica-Oblique', fontSize=8,
                                    textColor=GREY, leading=10),
            'summary': ParagraphStyle('summary', fontName='Helvetica-Oblique', fontSize=7.5,
                                      textColor=GREY, leading=10, spaceBefore=2, spaceAfter=0),
            'th': ParagraphStyle('th', fontName='Helvetica-Bold', fontSize=8.2,
                                 textColor=CHALK, leading=10, alignment=TA_LEFT,
                                 wordWrap='CJK'),
            'th_num': ParagraphStyle('th_num', fontName='Helvetica-Bold', fontSize=8.2,
                                     textColor=LIGHTS, leading=10, alignment=TA_RIGHT,
                                     wordWrap='CJK'),
            'cell': ParagraphStyle('cell', textColor=NIGHT, fontSize=8, leading=10,
                                   wordWrap='CJK'),
            'cell_num': ParagraphStyle('cell_num', fontName='Courier-Bold', textColor=TURF,
                                       fontSize=7.8, leading=10, alignment=TA_RIGHT,
                                       wordWrap='CJK'),
            'cell_sm': ParagraphStyle('cell_sm', textColor=NIGHT, fontSize=7.2, leading=9,
                                      wordWrap='CJK'),
            'cell_sm_num': ParagraphStyle('cell_sm_num', fontName='Courier-Bold',
                                          textColor=TURF, fontSize=7, leading=9,
                                          alignment=TA_RIGHT, wordWrap='CJK'),
        }
        return styles

    def get_file_extension(self):
        return "pdf"

    def get_content_type(self):
        return "application/pdf"