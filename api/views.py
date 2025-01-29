# api/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status
from db_structure.models import Team, LineUp, Game, PlayerInLineUp, BPParticipation, TeamOnTheField, PlayerInPosition
from .models import CustomUser
from .serializers import CustomUserSerializer
# from datetime import datetime
from db_structure.serializers import PlayerSwapSerializer


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





