"""Genera la ficha registral de un jugador en PDF.

Usado por GET /api/player-profile/<id>/pdf/.
Diseño: paleta Diamond Plate LNB PRO (heredada de la UI).
"""

from io import BytesIO

from django.db.models import Q
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from api.reports.exports.theme import (
    CLAY, CHALK, CHALK_DIM, HAIR, LIGHTS, NIGHT, PALE, STRIPE, TURF, WHITE,
    HEADER_H, NumberedCanvas,
)
from api.reports.exports.theme import draw_lnb_brand
from db_structure.models import BaseballPlayer, Game, StarPlayer, TeamOnTheField


# ─── Estilos de celda ──────────────────────────────────────────────────
_cell = ParagraphStyle(
    'cell', fontName='Helvetica', fontSize=8.5, leading=11,
    textColor=NIGHT, wordWrap='CJK',
)
_cell_bold = ParagraphStyle(
    'cell_bold', parent=_cell, fontName='Helvetica-Bold',
)
_cell_num = ParagraphStyle(
    'cell_num', parent=_cell, fontName='Courier-Bold', fontSize=8.5,
    textColor=TURF, alignment=TA_CENTER,
)
_th = ParagraphStyle(
    'th', fontName='Helvetica-Bold', fontSize=8.5, leading=11,
    textColor=CHALK, wordWrap='CJK',
)
_th_center = ParagraphStyle(
    'th_center', parent=_th, alignment=TA_CENTER,
)


def _col_widths(headers, rows, usable):
    """Anchos proporcionales al contenido, con suelo 6% y techo 50%."""
    if not headers:
        return []
    lengths = []
    for j in range(len(headers)):
        mx = len(str(headers[j]))
        for row in rows:
            v = row[j] if isinstance(row, (list, tuple)) else str(row[j])
            if v is not None:
                mx = max(mx, len(str(v)))
        lengths.append(mx)
    total = sum(lengths) or 1
    floor = usable * 0.06
    cap = usable * 0.50
    raw = [min(cap, max(floor, (length / total) * usable)) for length in lengths]
    scale = usable / sum(raw)
    widths = [w * scale for w in raw]
    if sum(widths) > usable - 2:
        shrink = (usable - 2) / sum(widths)
        widths = [w * shrink for w in widths]
    return widths


def _make_table(headers, rows, usable, numeric_cols=None, accent=NIGHT):
    """Tabla estilo LNB PRO: cabecera NIGHT, zebra STRIPE, numerics Courier-Bold."""
    numeric_cols = numeric_cols or set()
    col_widths = _col_widths(headers, rows, usable)

    body_cells = []
    # header
    body_cells.append([
        Paragraph(headers[j], _th_center if j in numeric_cols else _th)
        for j in range(len(headers))
    ])
    # data rows
    for row in rows:
        cells = []
        for j, val in enumerate(row):
            text = '—' if val is None or val == '' else str(val)
            style = _cell_num if j in numeric_cols else _cell
            cells.append(Paragraph(text, style))
        body_cells.append(cells)

    table = Table(body_cells, colWidths=col_widths, repeatRows=1, splitByRow=1)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), accent),
        ('TEXTCOLOR', (0, 0), (-1, 0), CHALK),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, STRIPE]),
        ('GRID', (0, 0), (-1, -1), 0.4, HAIR),
        ('LINEABOVE', (0, 0), (-1, 0), 1.8, LIGHTS),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]
    table.setStyle(TableStyle(style_cmds))
    table.hAlign = 'LEFT'
    return table


def _meta_card(equipo, segmento, person, player, usable):
    """Tabla de metadatos del jugador estilo tarjeta con barra CLAY."""
    headers = ['', '']  # labels + values
    rows = [
        ['Equipo', equipo or '—', 'Posición', segmento or '—'],
        ['Edad', f'{person.age} años', 'Nac.', person.birth_date.strftime('%d/%m/%Y') if person.birth_date else '—'],
        ['Altura', f'{person.height_cm or "—"} cm', 'Peso', f'{person.weight_kg or "—"} kg'],
        ['Nacionalidad', person.nationality or '—', 'B/L', f'{player.get_bats_display()} / {player.get_throws_display()}'],
    ]
    col_widths = _col_widths(headers, rows, usable)
    # For the meta card, use a simple 2-col width split: label cols narrower
    label_w = usable * 0.15
    value_w = usable * 0.35
    col_widths = [label_w, value_w, label_w, value_w]

    body = []
    for row in rows:
        cells = []
        for j, val in enumerate(row):
            style = _cell_bold if j % 2 == 0 else _cell
            cells.append(Paragraph(val, style))
        body.append(cells)

    table = Table(body, colWidths=col_widths)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), STRIPE),
        ('BACKGROUND', (2, 0), (2, -1), STRIPE),
        ('GRID', (0, 0), (-1, -1), 0.4, HAIR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('LINEBELOW', (0, 0), (-1, 0), 1.8, CLAY),
    ]))
    table.hAlign = 'LEFT'
    return table


def _section_title(title, usable):
    """Cabecera de sección estilo barra CLAY + título NIGHT."""
    head = Table(
        [[Paragraph(title, ParagraphStyle(
            'sec', fontName='Helvetica-Bold', fontSize=10, leading=13,
            textColor=NIGHT, wordWrap='CJK',
        ))]],
        colWidths=[usable],
    )
    head.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), WHITE),
        ('LINEBELOW', (0, 0), (-1, -1), 1.8, CLAY),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    head.hAlign = 'LEFT'
    return head


def build_player_ficha(player_id):
    # ── DATA FETCHING ──────────────────────────────────────────
    try:
        player = BaseballPlayer.objects.select_related('P_id', 'pitcher').get(id=player_id)
    except BaseballPlayer.DoesNotExist:
        raise ValueError('Jugador no encontrado')

    person = player.P_id
    pip = player.playerinposition_bp.select_related('position').first()
    segmento = pip.position.name if pip and pip.position else None
    part = player.bp_participations.select_related(
        'team_id', 'series__season'
    ).order_by('-series__init_date').first()
    equipo = part.team_id.name if part else 'Agente libre'

    def fmt(v):
        if v is None:
            return '—'
        return f'{v:.3f}'.lstrip('0') if isinstance(v, float) else str(v)

    # ── DOCUMENT ────────────────────────────────────────────────
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=letter,
        topMargin=HEADER_H + 10, bottomMargin=20 * mm,
        leftMargin=16 * mm, rightMargin=16 * mm,
        title=f'Ficha {person.name} {person.lastname}',
        author='LNB PRO Telemetry & Analytics',
    )
    usable = doc.width
    elements = []

    # ── METADATA ────────────────────────────────────────────────
    elements.append(_meta_card(equipo, segmento, person, player, usable))

    if person.bio:
        elements.append(Spacer(1, 8))
        elements.append(Paragraph(
            f'<b>Biografía:</b> {person.bio}',
            ParagraphStyle('bio', parent=_cell, fontSize=8, leading=11),
        ))

    # ── BATEO ───────────────────────────────────────────────────
    batting_headers = ['Bateo', 'AVG', 'OBP', 'SLG', 'OPS', 'HR', 'RBI', 'WAR']
    batting_rows = [['Carrera',
        fmt(player.batting_average), fmt(player.obp), fmt(player.slg),
        fmt((player.obp or 0) + (player.slg or 0)),
        str(player.home_runs or 0), str(player.rbi or 0), fmt(player.war),
    ]]
    elements.append(Spacer(1, 10))
    elements.append(_section_title('Estadísticas de Bateo', usable))
    elements.append(Spacer(1, 3))
    elements.append(_make_table(batting_headers, batting_rows, usable,
                                numeric_cols={1, 2, 3, 4, 5, 6, 7}, accent=NIGHT))

    # ── DEFENSA ─────────────────────────────────────────────────
    if pip is not None:
        field_headers = ['Defensa', 'FLD%', 'Efectividad', 'Doble Plays', 'Asistencias', 'Robos']
        field_rows = [[
            segmento or '—',
            fmt(pip.fielding_pct),
            f'{pip.effectiveness * 100:.1f}%' if pip.effectiveness is not None else '—',
            str(pip.double_plays or 0), str(pip.assists_of or 0), str(pip.bases_stolen or 0),
        ]]
        elements.append(Spacer(1, 10))
        elements.append(_section_title('Estadísticas de Defensa', usable))
        elements.append(Spacer(1, 3))
        elements.append(_make_table(field_headers, field_rows, usable,
                                    numeric_cols={1, 3, 4, 5}, accent=TURF))

    # ── PITCHEO ─────────────────────────────────────────────────
    pitcher = player.pitcher if (hasattr(player, 'pitcher') and player.pitcher_id) else None
    if pitcher is None:
        from db_structure.models import Pitcher
        pitcher = Pitcher.objects.filter(P_id=player).first()
    if pitcher is not None:
        pitch_headers = ['Pitcheo', 'G', 'P', 'ERA', 'K', 'IP', 'SV', 'WHIP']
        pitch_rows = [['Carrera',
            str(pitcher.No_games_won or 0), str(pitcher.No_games_lost or 0),
            fmt(pitcher.running_average), str(pitcher.strikeouts or 0),
            fmt(pitcher.innings_pitched), str(pitcher.saves or 0), fmt(pitcher.whip),
        ]]
        elements.append(Spacer(1, 10))
        elements.append(_section_title('Estadísticas de Pitcheo', usable))
        elements.append(Spacer(1, 3))
        elements.append(_make_table(pitch_headers, pitch_rows, usable,
                                    numeric_cols={1, 2, 3, 4, 5, 6, 7}, accent=CLAY))

    # ── SERIES RECIENTES ────────────────────────────────────────
    recent = list(player.bp_participations.select_related(
        'team_id', 'series__season'
    ).order_by('-series__init_date')[:5])
    if recent:
        series_headers = ['Serie', 'Tipo', 'Temporada', 'Equipo', 'Juegos', 'Récord']
        series_rows = []
        totals_g = 0
        totals_w = 0
        for p in recent:
            s = p.series
            t = p.team_id
            tof_ids = TeamOnTheField.objects.filter(
                lineup_id__team_id=t
            ).values_list('id', flat=True)
            games = list(Game.objects.filter(series=s).filter(
                Q(local_id__in=tof_ids) | Q(rival_id__in=tof_ids),
                score__isnull=False,
            ).select_related('score'))
            wins = sum(1 for g in games if g.score.winner_id == t.id)
            star_mark = ' ★' if StarPlayer.objects.filter(series=s, BP_id=player).exists() else ''
            series_rows.append([
                f'{s.name}{star_mark}', s.type, s.season.name,
                t.name, str(len(games)), f'{wins}-{len(games) - wins}',
            ])
            totals_g += len(games)
            totals_w += wins
        series_rows.append(['Acumulado', '', '', '', str(totals_g), f'{totals_w}-{totals_g - totals_w}'])
        elements.append(Spacer(1, 10))
        elements.append(_section_title('Series Recientes (últimas 5)', usable))
        elements.append(Spacer(1, 3))
        t4 = _make_table(series_headers, series_rows, usable,
                         numeric_cols={4, 5}, accent=NIGHT)
        # Fila de acumulado con fondo ámbar suave
        t4.setStyle(TableStyle([
            ('BACKGROUND', (0, -1), (-1, -1), PALE),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ]))
        elements.append(t4)

    # ── BUILD ───────────────────────────────────────────────────
    def _draw_header(canvas, docobj):
        page_w, page_h = docobj.pagesize
        canvas.saveState()
        # Banda superior nocturna
        canvas.setFillColor(NIGHT)
        canvas.rect(0, page_h - HEADER_H, page_w, HEADER_H, stroke=0, fill=1)
        canvas.setFillColor(CLAY)
        canvas.rect(0, page_h - HEADER_H, 3 * mm, HEADER_H, stroke=0, fill=1)

        # Marca LNB PRO
        canvas.setFillColor(LIGHTS)
        canvas.rect(16 * mm, page_h - 40, 9, 9, stroke=0, fill=1)
        canvas.setFont('Helvetica-Bold', 15)
        canvas.drawString(16 * mm + 15, page_h - 36, 'LNB PRO')
        canvas.setFillColor(CHALK_DIM)
        canvas.setFont('Helvetica', 6.5)
        canvas.drawString(
            16 * mm + 15 + canvas.stringWidth('LNB PRO', 'Helvetica-Bold', 15) + 6,
            page_h - 33, 'TELEMETRY & ANALYTICS · WBSC',
        )

        # Wordmark LNB PRO (badge + marca, como en el header de la nueva UI)
        draw_lnb_brand(canvas, page_w - 16 * mm, page_h - 6)

        # Nombre del jugador
        player_name = f'{person.name} {person.lastname}'
        canvas.setFillColor(CHALK)
        canvas.setFont('Helvetica-Bold', 14)
        canvas.drawString(16 * mm, page_h - 58, player_name)

        # Subtítulo
        canvas.setFillColor(CHALK_DIM)
        canvas.setFont('Helvetica', 8)
        canvas.drawString(
            16 * mm, page_h - 66,
            f'Ficha registral · {equipo} · {segmento or "Sin posición"}',
        )
        canvas.setFillColor(LIGHTS)
        canvas.setFont('Helvetica', 7.5)
        canvas.drawString(
            16 * mm, page_h - 78,
            f'ID {player_id} · LNB PRO Telemetry & Analytics',
        )

        # Separador inferior
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
    return buf.getvalue()
