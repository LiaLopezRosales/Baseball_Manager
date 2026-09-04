# api/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status
from db_structure.models import Team, LineUp, Game, PlayerInLineUp, BPParticipation, TeamOnTheField, PlayerInPosition, PlayerSwap, Person, Rol, FavoriteTeam as FavoriteTeamModel, FavoritePlayer as FavoritePlayerModel, Notification as NotificationModel
from .models import CustomUser
from .serializers import CustomUserSerializer
# from datetime import datetime
from db_structure.serializers import PlayerSwapSerializer
from db_structure.views import FavoriteTeamViewSet, FavoritePlayerViewSet, NotificationViewSet
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q


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
            
            # Juegos donde el equipo es local
            local_games = Game.objects.filter(local_id__in=team_on_field_ids)
            local_game_data = [
                {
                    "game_id": game.local.id,
                    "date": game.date.strftime("%Y-%m-%d"),
                    "rival_team": f"{game.rival.lineup_id.team_id.name} ({game.rival.lineup_id.team_id.initials})",
                    "series_name": f"{game.series.type} - {game.series.season.name}",
                    "series_id": game.series.id,
                }
                for game in local_games
            ]

            # Juegos donde el equipo es rival
            rival_games = Game.objects.filter(rival_id__in=team_on_field_ids)
            rival_game_data = [
                {
                    "game_id": game.rival.id,
                    "date": game.date.strftime("%Y-%m-%d"),
                    "rival_team": f"{game.local.lineup_id.team_id.name} ({game.local.lineup_id.team_id.initials})",
                    "series_name": f"{game.series.type} - {game.series.season.name}",
                    "series_id": game.series.id,
                }
                for game in rival_games
            ]

            # Combinar juegos en una sola lista
            game_data = local_game_data + rival_game_data


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
