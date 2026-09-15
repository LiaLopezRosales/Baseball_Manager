# api/reports/player_ficha.py
# Genera una ficha de jugador en PDF (usada por GET /api/player-profile/<id>/pdf/).

from io import BytesIO

from django.db.models import Q
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from db_structure.models import BaseballPlayer, Game, StarPlayer, TeamOnTheField


def build_player_ficha(player_id):
    try:
        player = BaseballPlayer.objects.select_related('P_id', 'pitcher').get(id=player_id)
    except BaseballPlayer.DoesNotExist:
        raise ValueError('Jugador no encontrado')

    person = player.P_id
    pip = player.playerinposition_bp.select_related('position').first()

    segmento = None
    if pip is not None and pip.position is not None:
        segmento = pip.position.name
    part = player.bp_participations.select_related('team_id', 'series__season').order_by('-series__init_date').first()
    equipo = part.team_id.name if part else 'Agente libre'

    fmt = lambda v: '—' if v is None else (f'{v:.3f}'.lstrip('0') if isinstance(v, float) else str(v))

    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=letter,
                            topMargin=18 * mm, bottomMargin=18 * mm,
                            leftMargin=16 * mm, rightMargin=16 * mm)
    styles = getSampleStyleSheet()
    h1 = styles['Title']
    sub = styles.get('Heading2', styles['Title']).__class__(
        styles['BodyText'])
    body = styles['BodyText']
    body.fontSize = 9.5
    body.leading = 13

    elements = [Paragraph(f'{person.name} {person.lastname}', h1),
                Spacer(1, 4),
                Paragraph(f'Ficha registral · Liga Nacional de Béisbol', sub)]
    sub.textColor = colors.HexColor('#7c3c20')
    sub.fontSize = 10.5
    elements.append(Spacer(1, 10))

    meta = Table([[Paragraph('<b>Equipo</b>', body), Paragraph(equipo, body),
                   Paragraph('<b>Posición</b>', body), Paragraph(segmento or '—', body)],
                  [Paragraph('<b>Edad</b>', body), Paragraph(f'{person.age} años', body),
                   Paragraph('<b>Nac.</b>', body), Paragraph(person.birth_date.strftime('%d/%m/%Y') if person.birth_date else '—', body)],
                  [Paragraph('<b>Altura</b>', body), Paragraph(f'{person.height_cm or "—"} cm', body),
                   Paragraph('<b>Peso</b>', body), Paragraph(f'{person.weight_kg or "—"} kg', body)],
                  [Paragraph('<b>Nacionalidad</b>', body), Paragraph(person.nationality or '—', body),
                   Paragraph('<b>B/L</b>', body), Paragraph(f'{player.get_bats_display()} / {player.get_throws_display()}', body)]],
                 colWidths=[24 * mm, 62 * mm, 24 * mm, 62 * mm])
    meta.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#d8d3c8')),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f2eee4')),
        ('BACKGROUND', (2, 0), (2, -1), colors.HexColor('#f2eee4')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(meta)

    if person.bio:
        elements.append(Spacer(1, 8))
        elements.append(Paragraph(f'<b>Biografía:</b> {person.bio}', body))

    stats = [['Bateo', 'AVG', 'OBP', 'SLG', 'OPS', 'HR', 'RBI', 'WAR'],
             ['Carrera', fmt(player.batting_average), fmt(player.obp), fmt(player.slg),
              fmt((player.obp or 0) + (player.slg or 0)), str(player.home_runs), str(player.rbi),
              fmt(player.war)]]
    elements.append(Spacer(1, 10))
    t = Table(stats, colWidths=[30 * mm, 22 * mm, 22 * mm, 22 * mm, 22 * mm, 18 * mm, 20 * mm, 20 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3a5f')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#c8c3b8')),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('ROWBACKGROUNDS', (0, 1), (-1, 1), [colors.HexColor('#f7f4ec')]),
    ]))
    t.hAlign = 'LEFT'
    elements.append(t)

    if pip is not None:
        fd = [['Defensa', 'FLD%', 'Efectividad', 'Doble Plays', 'Asistencias', 'Robos'],
              [segmento or '—', fmt(pip.fielding_pct), f'{pip.effectiveness * 100:.1f}%' if pip.effectiveness is not None else '—',
               str(pip.double_plays), str(pip.assists_of), str(pip.bases_stolen)]]
        elements.append(Spacer(1, 10))
        t2 = Table(fd, colWidths=[30 * mm, 24 * mm, 42 * mm, 32 * mm, 32 * mm, 22 * mm])
        t2.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#023047')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#c8c3b8')),
            ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
            ('ROWBACKGROUNDS', (0, 1), (-1, 1), [colors.HexColor('#f7f4ec')]),
        ]))
        t2.hAlign = 'LEFT'
        elements.append(t2)

    pitcher = player.pitcher if (hasattr(player, 'pitcher') and player.pitcher_id) else None
    if pitcher is None:
        from db_structure.models import Pitcher
        pitcher = Pitcher.objects.filter(P_id=player).first()
    if pitcher is not None:
        pdata = [['Pitcheo', 'G', 'P', 'ERA', 'K', 'IP', 'SV', 'WHIP'],
                 ['Carrera', str(pitcher.No_games_won), str(pitcher.No_games_lost),
                  fmt(pitcher.running_average), str(pitcher.strikeouts),
                  fmt(pitcher.innings_pitched), str(pitcher.saves), fmt(pitcher.whip)]]
        elements.append(Spacer(1, 10))
        t3 = Table(pdata, colWidths=[30 * mm, 18 * mm, 18 * mm, 20 * mm, 18 * mm, 20 * mm, 18 * mm, 22 * mm])
        t3.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#9a3412')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#c8c3b8')),
            ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
            ('ROWBACKGROUNDS', (0, 1), (-1, 1), [colors.HexColor('#f7f4ec')]),
        ]))
        t3.hAlign = 'LEFT'
        elements.append(t3)

    # Resumen de últimas 5 series
    recent = list(player.bp_participations.select_related('team_id', 'series__season').order_by('-series__init_date')[:5])
    if recent:
        rows = [['Serie', 'Tipo', 'Temporada', 'Equipo', 'Juegos', 'Récord']]
        totals_g = 0
        totals_w = 0
        for p in recent:
            s = p.series
            t = p.team_id
            tof_ids = TeamOnTheField.objects.filter(lineup_id__team_id=t).values_list('id', flat=True)
            games = list(Game.objects.filter(series=s).filter(
                Q(local_id__in=tof_ids) | Q(rival_id__in=tof_ids), score__isnull=False).select_related('score'))
            wins = sum(1 for g in games if g.score.winner_id == t.id)
            rows.append([s.name, s.type, s.season.name, t.name, str(len(games)), f'{wins}-{len(games) - wins}'])
            totals_g += len(games)
            totals_w += wins
            star_mark = ' ★' if StarPlayer.objects.filter(series=s, BP_id=player).exists() else ''
            rows[-1][0] += star_mark
        rows.append(['Acumulado', '', '', '', str(totals_g), f'{totals_w}-{totals_g - totals_w}'])
        elements.append(Spacer(1, 10))
        t4 = Table(rows, colWidths=[52 * mm, 24 * mm, 32 * mm, 50 * mm, 22 * mm, 24 * mm])
        t4.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#022c43')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8.5),
            ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#c8c3b8')),
            ('ALIGN', (4, 0), (5, -1), 'CENTER'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.HexColor('#ffffff'), colors.HexColor('#f2eee4')]),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#dcecf5')),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ]))
        t4.hAlign = 'LEFT'
        elements.append(t4)

    doc.build(elements)
    return buf.getvalue()