"""Genera el roster oficial de un equipo en PDF.

Usado por GET /api/team-profile/<id>/pdf/.
Diseño: paleta Diamond Plate LNB PRO (heredada de la UI), mismo estándar que
la ficha de jugador (api/reports/player_ficha.py).
"""

from io import BytesIO

from django.db.models import Q, Sum, Case, When, F
from django.utils import timezone
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from api.reports.exports.theme import (
    CLAY, CHALK, CHALK_DIM, HAIR, LIGHTS, NIGHT, STRIPE, TURF,
    HEADER_H, NumberedCanvas,
)
from api.reports.exports.theme import draw_lnb_brand
from api.reports.player_ficha import _cell, _cell_bold, _make_table, _section_title
from db_structure.models import (
    BaseballPlayer, BPParticipation, Game, Pitcher, PlayerInPosition, Score,
    StarPlayer, Team, TeamOnTheField,
)


def _fmt(v):
    if v is None:
        return '—'
    if isinstance(v, float):
        return f'{v:.3f}'.lstrip('0')
    return str(v)


def _group_of(position_name):
    name = (position_name or '').lower()
    if 'pitcher' in name:
        return 'Lanzador'
    if 'catcher' in name:
        return 'Receptor'
    if 'base' in name or 'shortstop' in name:
        return 'Cuadro'
    if 'field' in name:
        return 'Jardín'
    return '—'


def build_team_ficha(team_id):
    # ── DATA FETCHING ──────────────────────────────────────────
    try:
        team = Team.objects.get(id=team_id)
    except Team.DoesNotExist:
        raise ValueError('Equipo no encontrado')

    dt_name = None
    try:
        td = team.directionteam.technicaldirector
        if td and td.W_id and td.W_id.P_id:
            dt_name = f'{td.W_id.P_id.name} {td.W_id.P_id.lastname}'
    except Exception:
        dt_name = None

    wins = Score.objects.filter(winner=team).count()
    losses = Score.objects.filter(loser=team).count()
    games = wins + losses
    agg = Score.objects.filter(Q(winner=team) | Q(loser=team)).aggregate(
        scored=Sum(Case(When(winner=team, then=F('w_points')), default=F('l_points'))),
        received=Sum(Case(When(winner=team, then=F('l_points')), default=F('w_points'))),
    )
    ca = agg['scored'] or 0
    cp = agg['received'] or 0
    pct = (f'{wins / games:.3f}'.lstrip('0') if games else '—')
    diff = ca - cp

    bp_person_ids = list(
        BPParticipation.objects.filter(team_id=team).values_list('BP_id', flat=True).distinct()
    )
    roster_bps = list(BaseballPlayer.objects.filter(P_id__in=bp_person_ids).select_related('P_id'))

    pip_by_bp = {}
    for row in PlayerInPosition.objects.select_related('position').filter(
        BP_id__in=[bp.P_id_id for bp in roster_bps]
    ):
        pip_by_bp.setdefault(row.BP_id_id, row)

    pitcher_by_bp = {}
    for p in Pitcher.objects.filter(P_id__in=[bp.P_id_id for bp in roster_bps]):
        pitcher_by_bp[p.P_id_id] = p

    star_bp_ids = set(
        StarPlayer.objects.filter(BP_id__in=[bp.id for bp in roster_bps]).values_list('BP_id_id', flat=True)
    )

    avg_vals, obp_vals, era_vals, fld_vals = [], [], [], []
    hr_total = k_total = sb_total = 0
    roster_rows = []
    for bp in roster_bps:
        person = bp.P_id
        pip = pip_by_bp.get(bp.P_id_id)
        pos = pip.position.name if (pip and pip.position) else 'Sin posición'
        era_row = pitcher_by_bp.get(bp.P_id_id)
        eff = pip.effectiveness if pip and pip.effectiveness is not None else 0
        is_star = bp.id in star_bp_ids
        if era_row is not None:
            status = 'ESTRELLA' if is_star else 'LANZADOR ACTIVO'
        elif eff >= 0.9:
            status = 'TITULAR' if not is_star else 'ESTRELLA'
        else:
            status = 'ESTRELLA' if is_star else 'EN ROSTER'

        if bp.batting_average is not None:
            avg_vals.append(bp.batting_average)
        if bp.obp is not None:
            obp_vals.append(bp.obp)
        if era_row is not None and era_row.running_average is not None:
            era_vals.append(era_row.running_average)
        if pip and pip.fielding_pct is not None:
            fld_vals.append(pip.fielding_pct)
        if era_row is not None:
            k_total += era_row.strikeouts or 0
        if pip:
            sb_total += pip.bases_stolen or 0
        hr_total += bp.home_runs or 0

        if era_row is not None:
            key = f'{era_row.running_average} ERA' if era_row.running_average is not None else '—'
            sub = f"{era_row.No_games_won or 0}-{era_row.No_games_lost or 0} · {era_row.strikeouts or 0} K · {_fmt(era_row.whip)}"
        else:
            key = f"{_fmt(bp.batting_average)} AVG" if bp.batting_average is not None else '—'
            sub = f"{bp.home_runs or 0} HR · {bp.rbi or 0} CI · {_fmt((bp.obp or 0) + (bp.slg or 0))} OPS"

        roster_rows.append([
            str(bp.id),
            f'{person.name} {person.lastname}',
            f'{pos} ({_group_of(pos)})',
            f"{bp.get_bats_display() or bp.bats} / {bp.get_throws_display() or bp.throws}",
            str(person.age or '—'),
            key,
            sub,
            status,
        ])

    avg_col = round(sum(avg_vals) / len(avg_vals), 3) if avg_vals else None
    obp_col = round(sum(obp_vals) / len(obp_vals), 3) if obp_vals else None
    era_col = round(sum(era_vals) / len(era_vals), 2) if era_vals else None
    fld_col = round(sum(fld_vals) / len(fld_vals), 3) if fld_vals else None

    # Próximos juegos
    tof_ids = list(TeamOnTheField.objects.filter(lineup_id__team_id=team).values_list('id', flat=True))
    upcoming = list(Game.objects.filter(
        Q(local_id__in=tof_ids) | Q(rival_id__in=tof_ids),
        date__gte=timezone.now(),
    ).select_related('local__lineup_id__team_id', 'rival__lineup_id__team_id', 'series__season').order_by('date')[:3])

    # ── DOCUMENT ────────────────────────────────────────────────
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=letter,
        topMargin=HEADER_H + 10, bottomMargin=20 * mm,
        leftMargin=16 * mm, rightMargin=16 * mm,
        title=f'Roster {team.name}',
        author='LNB PRO Telemetry & Analytics',
    )
    usable = doc.width
    elements = []

    # ── META CARD ───────────────────────────────────────────────
    label_w = usable * 0.15
    value_w = usable * 0.35
    meta_rows = [
        ['Entidad', team.representative_entity or '—', 'División', team.division or '—'],
        ['Récord (G-P)', f'{wins}-{losses}', 'PCT', pct],
        ['Sede', team.stadium or '—', 'Capacidad', f'{team.capacity:,}'.replace(',', '.') if team.capacity else '—'],
        ['Fundado en', str(team.founded_year or '—'), 'Director Técnico', dt_name or '—'],
    ]
    meta_body = []
    for row in meta_rows:
        cells = []
        for j, val in enumerate(row):
            style = _cell_bold if j % 2 == 0 else _cell
            cells.append(Paragraph(val, style))
        meta_body.append(cells)
    meta_table = Table(meta_body, colWidths=[label_w, value_w, label_w, value_w])
    meta_table.setStyle(TableStyle([
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
    meta_table.hAlign = 'LEFT'
    elements.append(meta_table)

    # ── KPIs COLECTIVOS ─────────────────────────────────────────
    kpi_headers = ['KPI', 'AVG', 'ERA', 'HR', 'FLD%', 'OBP', 'K', 'DIF']
    kpi_rows = [[
        'Colectivo',
        _fmt(avg_col), _fmt(era_col), str(hr_total), _fmt(fld_col),
        _fmt(obp_col), str(k_total), f'{diff:+d}',
    ]]
    elements.append(Spacer(1, 10))
    elements.append(_section_title('Indicadores Colectivos de Temporada', usable))
    elements.append(Spacer(1, 3))
    elements.append(_make_table(kpi_headers, kpi_rows, usable,
                                numeric_cols={1, 2, 3, 4, 5, 6, 7}, accent=TURF))

    # ── ROSTER ──────────────────────────────────────────────────
    roster_headers = ['#', 'JUGADOR', 'POSICIÓN', 'B/L', 'EDAD', 'ESTADÍSTICA CLAVE', 'ESTATUS DT']
    elements.append(Spacer(1, 10))
    elements.append(_section_title(
        f'Roster Oficial & Cuadro de Jugadores ({len(roster_rows)})', usable))
    elements.append(Spacer(1, 3))
    roster_display = [[r[0], r[1], r[2], r[3], r[4], f"{r[5]}<br/>{r[6]}", r[7]] for r in roster_rows]
    t_roster = _make_table(roster_headers, roster_display, usable,
                           numeric_cols={0, 4}, accent=NIGHT)
    elements.append(t_roster)

    # ── PRÓXIMOS JUEGOS ─────────────────────────────────────────
    if upcoming:
        upcoming_rows = []
        for g in upcoming:
            is_local = g.local.lineup_id.team_id == team
            rival = g.rival.lineup_id.team_id if is_local else g.local.lineup_id.team_id
            upcoming_rows.append([
                g.date.strftime('%d/%m/%Y'), g.date.strftime('%H:%M HRS'),
                'Local' if is_local else 'Visita',
                f'{rival.name} ({rival.initials})',
                f'{g.series.type} · {g.series.season.name}',
            ])
        elements.append(Spacer(1, 10))
        elements.append(_section_title('Calendario Inmediato · Próxima Serie', usable))
        elements.append(Spacer(1, 3))
        elements.append(_make_table(
            ['Fecha', 'Hora', 'Condición', 'Rival', 'Serie'],
            upcoming_rows, usable, numeric_cols=set(), accent=CLAY))

    # ── BUILD ───────────────────────────────────────────────────
    def _draw_header(canvas, docobj):
        page_w, page_h = docobj.pagesize
        canvas.saveState()
        canvas.setFillColor(NIGHT)
        canvas.rect(0, page_h - HEADER_H, page_w, HEADER_H, stroke=0, fill=1)
        canvas.setFillColor(CLAY)
        canvas.rect(0, page_h - HEADER_H, 3 * mm, HEADER_H, stroke=0, fill=1)

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

        draw_lnb_brand(canvas, page_w - 16 * mm, page_h - 6)

        canvas.setFillColor(CHALK)
        canvas.setFont('Helvetica-Bold', 14)
        canvas.drawString(16 * mm, page_h - 58, f'{team.name} ({team.initials})')

        canvas.setFillColor(CHALK_DIM)
        canvas.setFont('Helvetica', 8)
        canvas.drawString(
            16 * mm, page_h - 66,
            f'Roster Oficial · {team.division or team.representative_entity} · Récord {wins}-{losses} · {pct} PCT',
        )
        canvas.setFillColor(LIGHTS)
        canvas.setFont('Helvetica', 7.5)
        canvas.drawString(
            16 * mm, page_h - 78,
            f'ID {team_id} · LNB PRO Telemetry & Analytics',
        )

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