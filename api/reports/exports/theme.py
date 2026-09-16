"""Tema visual compartido LNB PRO — paleta Diamond Plate + canvas con paginación."""
from pathlib import Path

from reportlab.lib import colors
from reportlab.pdfgen import canvas as pdfcanvas

# ─── Paleta Diamond Plate (sincronizada con src/index.css) ─────────────
NIGHT = colors.HexColor('#0b1712')
TURF = colors.HexColor('#142c22')
TURF_2 = colors.HexColor('#1c3a2c')
CHALK = colors.HexColor('#f3efe3')
CHALK_DIM = colors.HexColor('#b9c2b7')
WHITE = colors.white
LIGHTS = colors.HexColor('#f2a93b')
CLAY = colors.HexColor('#b5502f')
STRIPE = colors.HexColor('#f0ead8')
PALE = colors.HexColor('#fbe9cf')
GREY = colors.HexColor('#454f5b')
HAIR = colors.HexColor('#d8d2c2')

LOGO = Path(__file__).resolve().parent / 'logo.jpg'

HEADER_H = 92   # altura de la banda superior nocturna (pt)
FOOTER_H = 28   # altura de la banda inferior nocturna (pt)


class NumberedCanvas(pdfcanvas.Canvas):
    """Canvas que añade pie nocturno con "Página X de Y" al final de cada página."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved = []

    def showPage(self):
        self._saved.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        total = len(self._saved)
        for state in self._saved:
            self.__dict__.update(state)
            self._draw_footer(total)
            super().showPage()
        super().save()

    def _draw_footer(self, total):
        w, h = self._pagesize
        self.saveState()
        # Banda inferior nocturna
        self.setFillColor(NIGHT)
        self.rect(0, 0, w, FOOTER_H, stroke=0, fill=1)
        self.setStrokeColor(CLAY)
        self.setLineWidth(1.4)
        self.line(0, FOOTER_H, w, FOOTER_H)
        # Marca + afiliación
        self.setFillColor(LIGHTS)
        self.setFont('Helvetica-Bold', 7.5)
        self.drawString(16, 10, 'LNB PRO')
        self.setFillColor(CHALK_DIM)
        self.setFont('Helvetica', 6.5)
        self.drawString(
            50, 10,
            '· Afiliado Oficial WBSC · Criterio Regulatorio WBSC (Estatuto Técnico Art. 84)',
        )
        # Paginación
        self.setFillColor(LIGHTS)
        self.setFont('Courier-Bold', 7.5)
        self.drawRightString(w - 16, 10, f'{self._pageNumber} / {total}')
        self.restoreState()


def _draw_letterspaced(canvas, text, x_right, y, font, size, color, tracking):
    """Dibuja texto con espaciado +tracking, anclado a la derecha en x_right."""
    canvas.setFillColor(color)
    canvas.setFont(font, size)
    total = sum(canvas.stringWidth(c, font, size) + tracking for c in text) - tracking
    x = x_right - total
    for ch in text:
        canvas.drawString(x, y, ch)
        x += canvas.stringWidth(ch, font, size) + tracking


def draw_lnb_brand(canvas, x_right, y_top, badge_size=24):
    """Wordmark LNB PRO (estilo landing header): badge CLAY con pelota + "LNB PRO"
    apilado con "LIGA NACIONAL DE BÉISBOL" espaciado. Anclaje arriba-derecha en
    (x_right, y_top); el texto queda a la izquierda del badge."""
    x0 = x_right - badge_size
    y0 = y_top - badge_size

    # ── Badge CLAY con shimmer LIGHTS (simula el gradiente 135° de la UI) ──
    canvas.setFillColor(CLAY)
    canvas.roundRect(x0, y0, badge_size, badge_size, badge_size * 0.22, stroke=0, fill=1)
    canvas.saveState()
    canvas.setFillAlpha(0.55)
    canvas.setFillColor(LIGHTS)
    canvas.roundRect(x0, y0 + badge_size * 0.46, badge_size, badge_size * 0.54,
                     badge_size * 0.22, stroke=0, fill=1)
    canvas.restoreState()

    # ── Pelota blanca centrada + costuras finas ──
    cx, cy = x0 + badge_size / 2, y0 + badge_size / 2
    r = badge_size * 0.30
    canvas.setFillColor(WHITE)
    canvas.circle(cx, cy, r, stroke=0, fill=1)
    canvas.setStrokeColor(CLAY)
    canvas.setLineWidth(1.0)
    sr = r * 0.90
    canvas.arc(cx - sr, cy - sr, cx + sr, cy + sr, startAng=95, extent=170)
    canvas.arc(cx - sr, cy - sr, cx + sr, cy + sr, startAng=275, extent=170)

    # ── Wordmark "LNB PRO" (dos tonos) a la izquierda, alineado a la derecha ──
    text_right = x0 - 9
    font, size = 'Helvetica-Bold', 10.5
    w_pro = canvas.stringWidth('PRO', font, size)
    baseline = y_top - badge_size * 0.30
    canvas.setFillColor(LIGHTS)
    canvas.drawRightString(text_right, baseline, 'PRO')
    canvas.setFillColor(CHALK)
    canvas.drawRightString(text_right - w_pro, baseline, 'LNB ')

    # ── Subtítulo espaciado en mayúsculas ──
    _draw_letterspaced(canvas, 'LIGA NACIONAL DE BÉISBOL',
                       text_right, baseline - 8, 'Helvetica', 5.5,
                       CHALK_DIM, 0.8)
