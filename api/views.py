# api/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status
from db_structure.models import Team, LineUp, Game, PlayerInLineUp, BPParticipation, TeamOnTheField, PlayerInPosition, PlayerSwap, Person, Rol, BaseballPlayer, Pitcher, StarPlayer, Score, Position, Series, FavoriteTeam as FavoriteTeamModel, FavoritePlayer as FavoritePlayerModel, Notification as NotificationModel
from .models import CustomUser
from .serializers import CustomUserSerializer
# from datetime import datetime
from db_structure.serializers import PlayerSwapSerializer, BaseballPlayerSerializer
from db_structure.views import FavoriteTeamViewSet, FavoritePlayerViewSet, NotificationViewSet
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q, Sum, Case, When, F
from django.utils import timezone
from django.http import HttpResponse


class PlayerProfileView(APIView):
    """
    Perfil público de jugador: agrega persona, posición, equipo, fielding,
    pitcheo, logros, últimos juegos por serie e hitos de carrera.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    @staticmethod
    def _rank_in(qs, field, player_id, desc=True):
        order = ('-' if desc else '') + field
        ids = list(qs.order_by(order).values_list('id', flat=True))
        return (ids.index(player_id) + 1) if player_id in ids else None

    def get(self, request, player_id):
        try:
            player = BaseballPlayer.objects.select_related('P_id').get(id=player_id)
        except BaseballPlayer.DoesNotExist:
            return Response({'error': 'Jugador no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        person = player.P_id
        pip = player.playerinposition_bp.select_related('position').first()
        position_name = pip.position.name if pip else None

        # Equipo más reciente (por fecha de inicio de serie)
        part = player.bp_participations.select_related('team_id', 'series__season').order_by('-series__init_date').first()
        team = part.team_id if part else None

        games_played = player.bp_participations.count()

        # Rankings de liga por estadística (posiciones en queries ordenadas)
        avg_rank = self._rank_in(BaseballPlayer.objects.all(), 'batting_average', player.id)
        obp_rank = self._rank_in(BaseballPlayer.objects.all(), 'obp', player.id)
        slg_rank = self._rank_in(BaseballPlayer.objects.all(), 'slg', player.id)
        ops = round((player.obp or 0) + (player.slg or 0), 3)

        ops_rank = None
        dp_rank = None
        if pip is not None:
            same_position = PlayerInPosition.objects.filter(position_id=pip.position_id)
            dp_ids = list(same_position.order_by('-double_plays').values_list('BP_id', flat=True))
            if player.id in dp_ids:
                dp_rank = dp_ids.index(player.id) + 1
            ops_ids = list(BaseballPlayer.objects.order_by('-obp', '-slg').values_list('id', flat=True))
            if player.id in ops_ids:
                ops_rank = ops_ids.index(player.id) + 1

        # Pitcher: unir por P_id de la persona (player.pitcher suele ser None)
        pitcher_data = None
        pitcher = Pitcher.objects.filter(P_id=player).first()
        if pitcher:
            pitcher_data = {
                'dominant_hand': pitcher.dominant_hand,
                'No_games_won': pitcher.No_games_won,
                'No_games_lost': pitcher.No_games_lost,
                'running_average': pitcher.running_average,
                'strikeouts': pitcher.strikeouts,
                'innings_pitched': pitcher.innings_pitched,
                'saves': pitcher.saves,
                'whip': pitcher.whip,
            }

        # Logros derivados
        star_count = StarPlayer.objects.filter(BP_id=player).count()
        badges = []
        if star_count > 0:
            badges.append({
                'icon': 'star',
                'label': 'Estrella de serie',
                'count': star_count,
                'caption': 'Elegido por labor destacada',
            })
        if player.home_runs >= 10:
            badges.append({
                'icon': 'local_fire_department',
                'label': 'Poder',
                'detail': f'{player.home_runs} HR',
                'caption': 'Cañonero de la liga',
            })
        if pip is not None and pip.fielding_pct >= 0.97:
            badges.append({
                'icon': 'shield',
                'label': 'Guante de Oro',
                'detail': f'{pip.fielding_pct:.3f}',
                'caption': 'Defensa de élite',
            })
        if pip is not None and pip.bases_stolen >= 10:
            badges.append({
                'icon': 'bolt',
                'label': 'Robador de bases',
                'detail': f'{pip.bases_stolen} SB',
                'caption': 'Peligro en las bases',
            })

        # Estado (próximo compromiso)
        live_status = None
        if team is not None:
            tof_ids = TeamOnTheField.objects.filter(lineup_id__team_id=team).values_list('id', flat=True)
            upcoming = Game.objects.filter(
                Q(local_id__in=tof_ids) | Q(rival_id__in=tof_ids),
                score__isnull=True,
                date__gte=timezone.now(),
            ).select_related('local__lineup_id__team_id', 'rival__lineup_id__team_id', 'series').order_by('date').first()
            if upcoming:
                is_local = upcoming.local.lineup_id.team_id == team
                rival = upcoming.rival.lineup_id.team_id if is_local else upcoming.local.lineup_id.team_id
                live_status = {
                    'date': upcoming.date.strftime('%d/%m/%Y'),
                    'rival': rival.name,
                    'rival_initials': rival.initials,
                    'series': f"{upcoming.series.type} · {upcoming.series.season.name}",
                }

        # Últimas 5 series de participación (con récord de la serie para su equipo)
        last_series = []
        recent_parts = list(player.bp_participations.select_related('team_id', 'series__season').order_by('-series__init_date')[:5])
        for p in recent_parts:
            s = p.series
            t = p.team_id
            tof_ids = TeamOnTheField.objects.filter(lineup_id__team_id=t).values_list('id', flat=True)
            games_qs = list(Game.objects.filter(series=s).filter(
                Q(local_id__in=tof_ids) | Q(rival_id__in=tof_ids),
                score__isnull=False,
            ).select_related('score'))
            wins = sum(1 for g in games_qs if g.score.winner_id == t.id)
            losses = len(games_qs) - wins
            last_series.append({
                'series': s.name,
                'type': s.type,
                'season': s.season.name,
                'team': t.name,
                'team_initials': t.initials,
                'games': len(games_qs),
                'wins': wins,
                'losses': losses,
                'star': StarPlayer.objects.filter(series=s, BP_id=player).exists(),
            })

        person_data = {
            'id': person.id,
            'name': person.name,
            'lastname': person.lastname,
            'age': person.age,
            'bio': person.bio,
            'photo': request.build_absolute_uri(person.photo.url) if person.photo else None,
            'birth_date': person.birth_date.strftime('%d/%m/%Y') if person.birth_date else None,
            'height_cm': person.height_cm,
            'weight_kg': person.weight_kg,
            'nationality': person.nationality or None,
        }

        fielding = None
        if pip is not None:
            fielding = {
                'effectiveness': round(pip.effectiveness, 3) if pip.effectiveness is not None else None,
                'fielding_pct': pip.fielding_pct,
                'double_plays': pip.double_plays,
                'bases_stolen': pip.bases_stolen,
                'assists_of': pip.assists_of,
            }

        player_data = BaseballPlayerSerializer(player, context={'request': request}).data

        # Hito de carrera destacado (derivado de los mejores agregados reales)
        latest_season = recent_parts[0].series.season.name if recent_parts else 'Temporada oficial LNB'
        hito = {'icon': 'military_tech', 'headline': None, 'sub': None}
        if player.rbi and player.rbi >= 60:
            hito['headline'] = f'{player.rbi} Impulsadas en LNB'
            hito['sub'] = f'Registro acumulado · {latest_season}'
        elif player.home_runs and player.home_runs >= 15:
            hito['headline'] = f'{player.home_runs} Jonrones en LNB'
            hito['sub'] = f'Registro acumulado · {latest_season}'
        elif player.batting_average and player.batting_average >= 0.330:
            hito['headline'] = f'Promedio de {player.batting_average:.3f} en LNB'
            hito['sub'] = f'Registro acumulado · {latest_season}'
        elif player.batting_average:
            hito['headline'] = f'Promedio de {player.batting_average:.3f} en LNB'
            hito['sub'] = f'Registro acumulado · {latest_season}'
        else:
            hito['headline'] = f'{games_played} Series disputadas'
            hito['sub'] = f'Participación acumulada · {latest_season}'

        active_streak = sum(s['games'] for s in last_series)
        is_starting = sum(1 for s in last_series if s['games'] > 0)

        return Response({
            'player': player_data,
            'person': person_data,
            'position': position_name,
            'team': {
                'name': team.name,
                'initials': team.initials,
                'color': team.color,
            } if team else None,
            'fielding': fielding,
            'games_played': games_played,
            'pitcher': pitcher_data,
            'star_count': star_count,
            'badges': badges,
            'live_status': live_status,
            'last_series': last_series,
            'ops': ops,
            'avg_rank': avg_rank,
            'obp_rank': obp_rank,
            'slg_rank': slg_rank,
            'ops_rank': ops_rank,
            'dp_rank': dp_rank,
            'active_streak': active_streak,
            'is_starting': is_starting,
            'hito': {k: v for k, v in hito.items()},
            'milestones': {
                'games': games_played,
                'hr': player.home_runs,
                'rbi': player.rbi,
                'avg': player.batting_average,
                'war': player.war,
                'obp': player.obp,
                'slg': player.slg,
                'experience': player.years_of_experience,
                'age': person.age,
            },
        }, status=status.HTTP_200_OK)


class PlayerFichaView(APIView):
    """Descarga la ficha PDF registral de un jugador."""
    permission_classes = [AllowAny]

    def get(self, request, player_id):
        from .reports.player_ficha import build_player_ficha
        try:
            pdf_bytes = build_player_ficha(player_id)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="ficha-jugador-{player_id}.pdf"'
        return response


class TeamProfileView(APIView):
    """
    Perfil público de equipo: agrega franquicia, DT, récord, KPIs colectivos,
    campeonatos reales, roster con estadística clave, próximos juegos y
    desglose de temporada. Estilo refs stitch 17/18 (sección stats sin sidebar).
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    @staticmethod
    def _group_of(position_name):
        name = (position_name or '').lower()
        if 'pitcher' in name:
            return 'lanzadores'
        if 'catcher' in name:
            return 'receptores'
        if 'base' in name or 'shortstop' in name:
            return 'cuadro'
        if 'field' in name or 'outfield' in name:
            return 'jardineros'
        return 'otros'

    def _team_scores(self, team):
        """Agregados ganador/perdedor + puntos a favor/en contra del equipo."""
        base = Score.objects.filter(Q(winner=team) | Q(loser=team))
        wins = Score.objects.filter(winner=team).count()
        losses = Score.objects.filter(loser=team).count()
        games = wins + losses
        agg = base.aggregate(
            scored=Sum(Case(When(winner=team, then=F('w_points')), default=F('l_points'))),
            received=Sum(Case(When(winner=team, then=F('l_points')), default=F('w_points'))),
        )
        ca = agg['scored'] or 0
        cp = agg['received'] or 0
        pct = (wins / games) if games else None
        return {
            'wins': wins, 'losses': losses, 'games': games,
            'pct': round(pct, 3) if pct is not None else None,
            'ca': ca, 'cp': cp, 'diff': ca - cp,
        }

    def _team_rank(self, teams_agg, team_id, key, desc=True):
        ordered = sorted(teams_agg, key=lambda t: (t[key] is None, t[key]), reverse=desc)
        for i, t in enumerate(ordered):
            if t['team_id'] == team_id:
                return i + 1
        return None

    def get(self, request, team_id):
        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return Response({'error': 'Equipo no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        # Director Técnico real: Team → DirectionTeam → TechnicalDirector → Worker → Person
        dt = None
        try:
            td = team.directionteam.technicaldirector
            person = td.W_id.P_id if (td and td.W_id and td.W_id.P_id) else None
            if person:
                dt = {'name': person.name, 'lastname': person.lastname}
        except Exception:
            dt = None

        # Personas (ids) del roster vía BPParticipation
        bp_person_ids = list(
            BPParticipation.objects.filter(team_id=team)
            .values_list('BP_id', flat=True).distinct()
        )
        roster_bps = list(
            BaseballPlayer.objects.filter(P_id__in=bp_person_ids)
            .select_related('P_id').prefetch_related('playerinposition_bp__position')
        )

        pip_by_bp = {}
        for bp in roster_bps:
            pip = bp.playerinposition_bp.select_related('position').first()
            pip_by_bp[bp.id] = pip

        pitcher_by_bp = {}
        pitcher_rows = list(
            Pitcher.objects.filter(P_id__in=[bp.P_id_id for bp in roster_bps])
        )
        for p in pitcher_rows:
            pitcher_by_bp[p.P_id_id] = p

        star_bp_ids = set(
            StarPlayer.objects.filter(BP_id__in=[bp.id for bp in roster_bps])
            .values_list('BP_id_id', flat=True)
        )

        roster = []
        groups = {'todos': 0, 'lanzadores': 0, 'receptores': 0, 'cuadro': 0, 'jardineros': 0, 'otros': 0}
        ages = []
        for bp in roster_bps:
            person = bp.P_id
            pip = pip_by_bp.get(bp.id)
            position_name = pip.position.name if (pip and pip.position) else 'Sin posición'
            group = self._group_of(position_name)
            pitcher_o = pitcher_by_bp.get(bp.P_id_id)
            is_star = bp.id in star_bp_ids
            if pitcher_o is not None:
                status_label = 'ESTRELLA' if is_star else 'LANZADOR ACTIVO'
            else:
                eff = pip.effectiveness if pip and pip.effectiveness is not None else 0
                status_label = ('ESTRELLA' if is_star
                                else 'TITULAR INDISCUTIDO' if eff >= 0.9
                                else 'EN ROSTER')
            groups['todos'] += 1
            groups[group] += 1
            ages.append(person.age or 0)
            roster.append({
                'player_id': bp.id,
                'name': person.name,
                'lastname': person.lastname,
                'initials': f"{(person.name or '?')[0]}{(person.lastname or '?')[0]}".upper(),
                'position': position_name,
                'group': group,
                'bats': bp.get_bats_display() or bp.bats,
                'throws': bp.get_throws_display() or bp.throws,
                'age': person.age,
                'years': bp.years_of_experience,
                'effectiveness': round(pip.effectiveness, 3) if (pip and pip.effectiveness is not None) else None,
                'fielding_pct': pip.fielding_pct if pip else None,
                'is_star': is_star,
                'status': status_label,
                'batting': {
                    'avg': bp.batting_average, 'hr': bp.home_runs or 0, 'rbi': bp.rbi or 0,
                    'obp': bp.obp or 0, 'slg': bp.slg or 0, 'war': bp.war or 0,
                },
                'pitching': (
                    {
                        'w': pitcher_o.No_games_won or 0, 'l': pitcher_o.No_games_lost or 0,
                        'era': pitcher_o.running_average, 'k': pitcher_o.strikeouts or 0,
                        'whip': pitcher_o.whip, 'sv': pitcher_o.saves or 0,
                        'ip': pitcher_o.innings_pitched or 0, 'hand': pitcher_o.get_dominant_hand_display(),
                    } if pitcher_o else None
                ),
            })

        age_avg = round(sum(ages) / len(ages), 1) if ages else None
        pitchers = [p for p in pitcher_by_bp.values()]

        # KPIs colectivos
        avg_col = None
        if roster_bps:
            vals = [b.batting_average for b in roster_bps if b.batting_average is not None]
            avg_col = round(sum(vals) / len(vals), 3) if vals else None
            obp_vals = [b.obp for b in roster_bps if b.obp is not None]
            obp_col = round(sum(obp_vals) / len(obp_vals), 3) if obp_vals else None
        else:
            obp_col = None
        era_col = None
        if pitchers:
            eras = [p.running_average for p in pitchers if p.running_average is not None]
            era_col = round(sum(eras) / len(eras), 2) if eras else None
        hr_total = sum((b.home_runs or 0) for b in roster_bps)
        rbi_total = sum((b.rbi or 0) for b in roster_bps)
        fld_vals = [p.fielding_pct for p in pip_by_bp.values() if p and p.fielding_pct is not None]
        fld_col = round(sum(fld_vals) / len(fld_vals), 3) if fld_vals else None
        sb_total = sum((p.bases_stolen or 0) for p in pip_by_bp.values() if p)
        k_total = sum((p.strikeouts or 0) for p in pitchers)

        record = self._team_scores(team)

        # Split local / visitante
        tof_ids = list(TeamOnTheField.objects.filter(lineup_id__team_id=team).values_list('id', flat=True))
        local_games = list(Game.objects.filter(local_id__in=tof_ids, score__isnull=False).select_related('score'))
        visitor_games = list(Game.objects.filter(rival_id__in=tof_ids, score__isnull=False).select_related('score'))
        local_w = sum(1 for g in local_games if g.score.winner_id == team.id)
        visitor_w = sum(1 for g in visitor_games if g.score.winner_id == team.id)

        # Rankings de liga (por récord y agresivos)
        all_teams = list(Team.objects.all())
        teams_agg = []
        for t in all_teams:
            t_rec = self._team_scores(t)
            t_bps = list(BaseballPlayer.objects.filter(
                P_id__in=BPParticipation.objects.filter(team_id=t).values_list('BP_id', flat=True)
            ))
            v = [b.batting_average for b in t_bps if b.batting_average is not None]
            teams_agg.append({
                'team_id': t.id,
                'wins': t_rec['wins'],
                'games': t_rec['games'],
                'pct': t_rec['pct'],
                'avg': round(sum(v) / len(v), 3) if v else None,
            })
        record_rank = self._team_rank(teams_agg, team.id, 'pct')
        avg_rank = self._team_rank(teams_agg, team.id, 'avg')

        # Campeonatos (campeón por victorias puntuadas en la serie)
        championships = []
        series_qs = Series.objects.select_related('season').prefetch_related('game_series__score').order_by('season_id')
        for s in series_qs:
            wins_count = {}
            for g in s.game_series.all():
                if g.score:
                    wid = g.score.winner_id
                    wins_count[wid] = wins_count.get(wid, 0) + 1
            if not wins_count:
                continue
            champ_id = max(wins_count, key=wins_count.get)
            if champ_id == team.id:
                championships.append({
                    'season': s.season.name,
                    'serie': s.name,
                    'wins': wins_count[champ_id],
                })
        champ_count = len(championships)
        last_title = championships[-1] if championships else None

        # Próximos juegos
        upcoming = list(Game.objects.filter(
            Q(local_id__in=tof_ids) | Q(rival_id__in=tof_ids),
            date__gte=timezone.now(),
        ).select_related(
            'local__lineup_id__team_id', 'rival__lineup_id__team_id', 'series__season',
        ).order_by('date')[:4])
        upcoming_data = []
        for g in upcoming:
            is_local = g.local.lineup_id.team_id == team
            rival = g.rival.lineup_id.team_id if is_local else g.local.lineup_id.team_id
            upcoming_data.append({
                'date': g.date.strftime('%d/%m/%Y'),
                'time': g.date.strftime('%H:%M'),
                'home': is_local,
                'rival': rival.name,
                'rival_initials': rival.initials,
                'rival_color': rival.color,
                'series': g.series.name,
                'type': g.series.type,
                'season': g.series.season.name,
            })

        return Response({
            'id': team.id,
            'name': team.name,
            'initials': team.initials,
            'color': team.color,
            'representative_entity': team.representative_entity,
            'division': team.division or None,
            'stadium': team.stadium or None,
            'capacity': team.capacity,
            'founded_year': team.founded_year,
            'slogan': team.slogan or None,
            'dt': dt,
            'record': {**record, 'local': {'w': local_w, 'l': len(local_games) - local_w},
                       'visit': {'w': visitor_w, 'l': len(visitor_games) - visitor_w}},
            'kpis': {
                'avg': avg_col, 'era': era_col, 'hr': hr_total, 'rbi': rbi_total,
                'obp': obp_col, 'fld_pct': fld_col, 'diff': record['diff'],
                'rank_record': record_rank, 'rank_avg': avg_rank,
            },
            'championships': {'count': champ_count, 'last': last_title, 'titles': championships[:3]},
            'roster': roster,
            'groups': groups,
            'age_avg': age_avg,
            'upcoming': upcoming_data,
            'season': {
                'games': record['games'], 'ca': record['ca'], 'cp': record['cp'],
                'avg_for': round(record['ca'] / record['games'], 2) if record['games'] else None,
                'avg_against': round(record['cp'] / record['games'], 2) if record['games'] else None,
                'hr': hr_total, 'sb': sb_total, 'k': k_total, 'obp': obp_col,
            },
        }, status=status.HTTP_200_OK)


class TeamFichaView(APIView):
    """Descarga el roster oficial de un equipo en PDF (estilo LNB PRO)."""
    permission_classes = [AllowAny]

    def get(self, request, team_id):
        from .reports.team_ficha import build_team_ficha
        try:
            pdf_bytes = build_team_ficha(team_id)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="roster-{team_id}.pdf"'
        return response


class LoginView(APIView):
    """
    Vista para manejar el login de usuarios con validación de roles y permisos.
    """
    def post(self, request, *args, **kwargs):
        try:
            email = request.data.get('email')
            password = request.data.get('password')

            # Validación básica
            if not email or not password:
                return Response({'error': 'El correo y la contraseña son obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

            user = CustomUser.objects.filter(email=email).first()
            
            if not user:
                return Response({'error': 'El correo electrónico no está registrado.'}, status=status.HTTP_404_NOT_FOUND)

            if not user.check_password(password):
                return Response({'error': 'Contraseña incorrecta.'}, status=status.HTTP_401_UNAUTHORIZED)

            # Generación del token
            token, created = Token.objects.get_or_create(user=user)
            user_data = CustomUserSerializer(user).data
            return Response({
                'token': token.key, 
                'user': user_data,
                'team_id': user.get_team_id(),
                'role_name': user.get_role_name()
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            # Captura cualquier otro error inesperado
            return Response({'error': f'Error interno del servidor: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PlayerSwapByDTView(APIView):
    """
    View para manejar la lógica de intercambio de jugadores por el Director Técnico.
    """

    def get(self, request, team_id):
        """
        Obtiene los datos iniciales del equipo, alineación, participaciones y juegos relacionados.
        """
        try:
            team = Team.objects.get(id=team_id)
            team_data = {
                "name": team.name,
                "initials": team.initials,
                "representative_entity": team.representative_entity,
            }

            # Obtener alineación
            lineup = LineUp.objects.get(team_id=team_id)
            if not lineup:
                return Response({"error": "No se encontró alineación para el equipo."}, status=status.HTTP_404_NOT_FOUND)

            # Obtener juegos relacionados
            team_on_field_ids = TeamOnTheField.objects.filter(lineup_id=lineup).values_list('id', flat=True)
            now = timezone.now()

            def _game_card(game, is_local):
                """Devuelve el card de un juego solo si todavía no ha sucedido."""
                if game.date < now:
                    return None
                if is_local:
                    rival_team = f"{game.rival.lineup_id.team_id.name} ({game.rival.lineup_id.team_id.initials})"
                    return {
                        "game_id": game.local.id,
                        "date": game.date.strftime("%Y-%m-%d"),
                        "rival_team": rival_team,
                        "series_name": f"{game.series.type} - {game.series.season.name}",
                        "series_id": game.series.id,
                    }
                else:
                    rival_team = f"{game.local.lineup_id.team_id.name} ({game.local.lineup_id.team_id.initials})"
                    return {
                        "game_id": game.rival.id,
                        "date": game.date.strftime("%Y-%m-%d"),
                        "rival_team": rival_team,
                        "series_name": f"{game.series.type} - {game.series.season.name}",
                        "series_id": game.series.id,
                    }

            # Juegos donde el equipo es local (solo pendientes, próximos primero)
            local_games = Game.objects.filter(local_id__in=team_on_field_ids).order_by('date')
            local_game_data = [card for g in local_games if (card := _game_card(g, True)) is not None]

            # Juegos donde el equipo es rival (solo pendientes, próximos primero)
            rival_games = Game.objects.filter(rival_id__in=team_on_field_ids).order_by('date')
            rival_game_data = [card for g in rival_games if (card := _game_card(g, False)) is not None]

            # Combinar juegos en una sola lista y ordenar por fecha ascendente
            game_data = sorted(local_game_data + rival_game_data, key=lambda c: c["date"])


            return Response({
                "team_data": team_data,
                "game_data": game_data,
            }, status=status.HTTP_200_OK)

        except LineUp.DoesNotExist:
            return Response({"error": "No se encontró alineación para el equipo."}, status=status.HTTP_404_NOT_FOUND)
        except Team.DoesNotExist:
            return Response({"error": "Equipo no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    
    def post(self, request):
        """
        Realiza el cambio de jugadores en la tabla PlayerSwap.
        """
        try:
            data = request.data
            game_team = data.get("game_team")
            old_player = data.get("old_player")
            new_player = data.get("new_player")
            position = data.get("position")
            date = data.get("date")

            # Validar campos requeridos
            missing_fields = [field for field in ["game_team", "old_player", "new_player", "position", "date"] if not data.get(field)]
            if missing_fields:
                return Response({"error": f"Faltan campos requeridos: {', '.join(missing_fields)}"}, status=status.HTTP_400_BAD_REQUEST)

            # Validar que el juego aún no haya sucedido (solo se editan alineaciones de juegos pendientes)
            game_team_obj = TeamOnTheField.objects.filter(id=game_team).first()
            if not game_team_obj:
                return Response({"error": "No se encontró el juego."}, status=status.HTTP_400_BAD_REQUEST)
            game = Game.objects.filter(Q(local_id=game_team) | Q(rival_id=game_team)).first()
            if not game:
                return Response({"error": "No se encontró el juego asociado."}, status=status.HTTP_400_BAD_REQUEST)
            if game.date < timezone.now():
                return Response(
                    {"error": "No es posible registrar cambios para un juego ya disputado."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            serialized_data = {
                "game_team": game_team,
                "old_player": old_player,
                "new_player": new_player,
                "position": position,
                "date": date,
            }

            serializer = PlayerSwapSerializer(data=serialized_data)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "El cambio de jugador se ha creado exitosamente"}, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": f"Un error inesperado ocurrió: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class LineUpForTheGameView(APIView):
    """
    Endpoint para obtener los jugadores de la alineación relacionada a un juego.
    """

    def get(self, request, team_on_the_field):
        try:
            lineup = TeamOnTheField.objects.get(id=team_on_the_field)
            
            lineup_players = PlayerInLineUp.objects.filter(line_up=lineup.lineup_id.id)
            lineup_players = [
                {
                    "player_id": player.player_in_position.BP_id.id,
                    "player_name": f"{player.player_in_position.BP_id.P_id.name} {player.player_in_position.BP_id.P_id.lastname}",
                    "position_id": player.player_in_position.position.id,
                    "position_name": player.player_in_position.position.name,
                    "effectiveness": player.player_in_position.effectiveness,
                }
                for player in lineup_players
            ]


            return Response({
                "lineup_players": lineup_players,
                "lineup_id": lineup.lineup_id.id, 
            }, status=status.HTTP_200_OK)

        except TeamOnTheField.DoesNotExist:
            return Response({"error": "No se encontró alineación para el equipo."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Error al obtener jugadores disponibles: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class PlayersAvailableInPosition(APIView):
    """
    Endpoint para obtener jugadores disponibles en una posición específica y una serie específica.
    """

    def get(self, request, team_id, position_id, series_id, lineup_id):
        try:
            # Obtener todos los jugadores asociados al equipo y a la serie
            participations = BPParticipation.objects.filter(team_id=team_id, series=series_id)
            
            # Obtener IDs de jugadores que están en la alineación del equipo
            players_in_lineup_ids = PlayerInLineUp.objects.filter(line_up=lineup_id).values_list(
                'player_in_position__BP_id', flat=True
            )

            # Construir la lista de jugadores disponibles
            available_players = []
            for participation in participations:
                player = participation.BP_id
                if player.id in players_in_lineup_ids:
                    continue  # Excluir jugadores que ya están en la alineación
                
                # Obtener efectividad del jugador para la posición seleccionada
                effectiveness_obj = PlayerInPosition.objects.filter(BP_id=player, position_id=position_id).first()
                effectiveness = effectiveness_obj.effectiveness if effectiveness_obj else None

                # Agregar jugador a la lista de disponibles
                available_players.append({
                    "player_id": player.id,
                    "player_name": f"{player.P_id.name} {player.P_id.lastname}",
                    "effectiveness": effectiveness,
                })

            return Response({"available_players": available_players}, status=status.HTTP_200_OK)

        except LineUp.DoesNotExist:
            return Response({"error": "No se encontró alineación para el equipo."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Error al obtener jugadores disponibles: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PlayerSwapsForTeamView(APIView):
    """
    Obtiene los cambios de jugadores asociados a un equipo específico y permite eliminarlos.
    """

    def get(self, request, team_id):
        """
        Obtiene los cambios de jugadores del equipo basado en su team_id.
        """
        try:
            # Obtener información del equipo
            team = Team.objects.get(id=team_id)
            team_data = {
                "name": team.name,
                "initials": team.initials,
                "representative_entity": team.representative_entity,
            }

            # Obtener alineación del equipo
            lineup = LineUp.objects.get(team_id=team_id)

            # Obtener todos los equipos en el campo asociados a la alineación
            team_on_field_ids = TeamOnTheField.objects.filter(lineup_id=lineup).values_list('id', flat=True)

            # Obtener cambios de jugador que involucren estos equipos en el campo
            swaps = PlayerSwap.objects.filter(game_team__in=team_on_field_ids)

            # Serializar los datos
            swaps_data = [
                {
                    "id": swap.id,
                    "old_player_id": swap.old_player.id,
                    "old_player_name": f"{swap.old_player.P_id.name} {swap.old_player.P_id.lastname}",
                    "new_player_id": swap.new_player.id,
                    "new_player_name": f"{swap.new_player.P_id.name} {swap.new_player.P_id.lastname}",
                    "position_id": swap.position.id,
                    "position_name": swap.position.name,
                    "date": swap.date.strftime("%Y-%m-%d"),
                    "game_team": swap.game_team.id,
                }
                for swap in swaps
            ]

            return Response({
                "team_data": team_data,
                "player_swaps": swaps_data,
            }, status=status.HTTP_200_OK)

        except Team.DoesNotExist:
            return Response({"error": "Equipo no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except LineUp.DoesNotExist:
            return Response({"error": "No se encontró alineación para el equipo"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Error interno: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, swap_id):
        """
        Elimina un cambio de jugador específico.
        """
        try:
            swap = PlayerSwap.objects.get(id=swap_id)
            swap.delete()
            return Response({"message": "Cambio de jugador eliminado exitosamente."}, status=status.HTTP_200_OK)
        except PlayerSwap.DoesNotExist:
            return Response({"error": "Cambio de jugador no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Error interno: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            name = request.data.get('name', '').strip()
            lastname = request.data.get('lastname', '').strip()
            email = request.data.get('email', '').strip()
            password = request.data.get('password', '').strip()

            if not all([name, lastname, email, password]):
                return Response({'error': 'Todos los campos son obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

            if CustomUser.objects.filter(email=email).exists():
                return Response({'error': 'El correo ya está registrado.'}, status=status.HTTP_400_BAD_REQUEST)

            rol_general = Rol.objects.get(type='Usuario General')

            import random
            ci = random.randint(10000000, 99999999)
            while Person.objects.filter(CI=ci).exists():
                ci = random.randint(10000000, 99999999)

            Person.objects.create(
                CI=ci,
                age=0,
                name=name,
                lastname=lastname,
            )

            user = CustomUser.objects.create(
                email=email,
                password=password,
                rol=rol_general,
                TD_id=None,
            )

            token, _ = Token.objects.get_or_create(user=user)
            user_data = CustomUserSerializer(user).data
            return Response({
                'token': token.key,
                'user': user_data,
                'team_id': None,
                'role_name': 'Usuario General',
            }, status=status.HTTP_201_CREATED)

        except Rol.DoesNotExist:
            return Response({'error': 'Error de configuración: rol no encontrado.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f'Error interno del servidor: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            data = {}

            fav_team = FavoriteTeamModel.objects.filter(user_id=user.id).first()
            if fav_team:
                team = fav_team.team
                data['favorite_team'] = {
                    'id': team.id,
                    'name': team.name,
                    'initials': team.initials,
                }

                from db_structure.models import Game, TeamOnTheField
                team_on_field_ids = TeamOnTheField.objects.filter(
                    lineup_id__team_id=team
                ).values_list('id', flat=True)
                games = Game.objects.filter(
                    Q(local_id__in=team_on_field_ids) |
                    Q(rival_id__in=team_on_field_ids)
                ).order_by('-date')[:10]

                data['recent_games'] = []
                for game in games:
                    is_local = game.local.lineup_id.team_id == team
                    rival = game.rival.lineup_id.team_id if is_local else game.local.lineup_id.team_id
                    score = game.score
                    local_score = None
                    rival_score = None
                    if score:
                        if score.winner_id == team.id:
                            local_score = score.w_points if is_local else score.l_points
                            rival_score = score.l_points if is_local else score.w_points
                        else:
                            local_score = score.l_points if is_local else score.w_points
                            rival_score = score.w_points if is_local else score.l_points
                    data['recent_games'].append({
                        'game_id': game.id,
                        'date': game.date.strftime('%d/%m/%Y'),
                        'rival_name': rival.name,
                        'rival_initials': rival.initials,
                        'local_score': local_score,
                        'rival_score': rival_score,
                        'is_local': is_local,
                    })

            fav_players = FavoritePlayerModel.objects.filter(user_id=user.id).select_related('player__P_id')
            data['favorite_players'] = []
            for fp in fav_players:
                bp = fp.player
                data['favorite_players'].append({
                    'id': bp.id,
                    'name': f"{bp.P_id.name} {bp.P_id.lastname}",
                    'batting_average': bp.batting_average,
                    'experience': bp.years_of_experience,
                })

            data['unread_notifications'] = NotificationModel.objects.filter(
                user_id=user.id, is_read=False
            ).count()

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': f'Error al obtener dashboard: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorite_team(request):
    try:
        team_id = request.data.get('team_id')
        if not team_id:
            return Response({'error': 'team_id es requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        existing = FavoriteTeamModel.objects.filter(user_id=request.user.id, team_id=team_id).first()
        if existing:
            existing.delete()
            return Response({'favorited': False}, status=status.HTTP_200_OK)
        else:
            FavoriteTeamModel.objects.create(user_id=request.user.id, team_id=team_id)
            return Response({'favorited': True}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorite_player(request):
    try:
        player_id = request.data.get('player_id')
        if not player_id:
            return Response({'error': 'player_id es requerido.'}, status=status.HTTP_400_BAD_REQUEST)

        existing = FavoritePlayerModel.objects.filter(user_id=request.user.id, player_id=player_id).first()
        if existing:
            existing.delete()
            return Response({'favorited': False}, status=status.HTTP_200_OK)
        else:
            FavoritePlayerModel.objects.create(user_id=request.user.id, player_id=player_id)
            return Response({'favorited': True}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_favorites(request):
    try:
        fav_teams = FavoriteTeamModel.objects.filter(user_id=request.user.id).select_related('team')
        fav_players = FavoritePlayerModel.objects.filter(user_id=request.user.id).select_related('player__P_id')

        return Response({
            'teams': [{'id': ft.team.id, 'name': ft.team.name, 'initials': ft.team.initials} for ft in fav_teams],
            'players': [{'id': fp.player.id, 'name': f"{fp.player.P_id.name} {fp.player.P_id.lastname}"} for fp in fav_players],
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    try:
        notifs = NotificationModel.objects.filter(user_id=request.user.id)[:20]
        return Response({
            'notifications': [
                {
                    'id': n.id,
                    'message': n.message,
                    'link': n.link,
                    'is_read': n.is_read,
                    'created_at': n.created_at.isoformat(),
                }
                for n in notifs
            ],
            'unread_count': NotificationModel.objects.filter(user_id=request.user.id, is_read=False).count(),
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    try:
        notif = NotificationModel.objects.filter(user_id=request.user.id, id=notification_id).first()
        if not notif:
            return Response({'error': 'Notificación no encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        notif.is_read = True
        notif.save()
        return Response({'ok': True}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    try:
        NotificationModel.objects.filter(user_id=request.user.id, is_read=False).update(is_read=True)
        return Response({'ok': True}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
