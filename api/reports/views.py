# api/reports/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from ..permissions import IsAdmin, IsDirectorTecnicoAndOwnTeam, IsUsuarioGeneral
from .serializers import ReportSerializer
from django.apps import apps
import queries
import filters


# Vista para manejar diferentes tipos de reportes basados en parámetros proporcionados por el usuario
class ReportsView(APIView):
    permission_classes = [IsUsuarioGeneral]
    
    def get(self, request):
        # Serializar y validar los parámetros de consulta (query params)
        serializer = ReportSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)  # Levanta una excepción si los datos no son válidos
        
        validated_data = serializer.validated_data  # Obtener los datos validados
        
        # Determinar el tipo de reporte según el valor de 'report_id'
        
        if validated_data.get('report_id') == 0:
            # Reporte: Obtener equipos ganadores y directores técnicos en series nacionales por temporada
            result = queries.get_final_winner_teams_and_coaches(validated_data.get('season_id'))
        
        elif validated_data.get('report_id') == 1:
            # Reporte: Obtener nombres y posiciones de jugadores estrella y su efectividad por serie
            result = queries.get_star_players_for_series(validated_data.get('season_id'))
        
        elif validated_data.get('report_id') == 2:
            # Reporte: Listar equipos en primer y último lugar por serie, clasificados por tipo
            result = queries.get_teams_by_series(validated_data.get('season_id'))
        
        elif validated_data.get('report_id') == 3:
            # Reporte: Obtener series con mayor y menor cantidad de juegos celebrados
            result = queries.get_max_min_game_per_series()
        
        elif validated_data.get('report_id') == 4:
            # Reporte: Obtener total de juegos ganados y promedio de carreras limpias permitidas por un lanzador
            result = queries.get_pitcher_wins_and_running_average(validated_data.get('pitcher_id'))
        
        elif validated_data.get('report_id') == 5:
            # Reporte: Obtener los jugadores con mejor promedio de bateo.
            result = queries.get_top_batting_average_players()
        
        elif validated_data.get('report_id') == 6:
            # Reporte: Obtener estadísticas de puntos ganados, perdidos y juegos jugados por equipo.
            result = queries.get_team_score_statistics()
        
        elif validated_data.get('report_id') == 7:
            # Reporte: Obtener los jugadores con mayor efectividad por posición.
            result = queries.get_player_effectiveness_by_position()
        
        elif validated_data.get('report_id') == 8:
            # Reporte: Obtener los jugadores de un equipo específico que participaron en una serie dada. 
            result = queries.get_team_players_at_a_specified_serie(validated_data.get('team_id'))
        
        else:
            # Si el 'report_id' no coincide con ninguna opción válida, devolver error
            return Response(
                {"error": "El report_id proporcionado no es válido."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Retornar la respuesta con los datos del reporte generado
        return Response(result)

# Endpoint para devolver los campos relacionados de un modelo dado.

class TableStructureView(APIView):
    def get(self, request):
        
        # Serializar y validar los parámetros de consulta (query params)
        serializer = ReportSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)  # Levanta una excepción si los datos no son válidos
        
        table_name = serializer.validated_data.get("table_name")
        
        try:
            model = apps.get_model('db_structure', table_name)
            if not model:
                return Response({"error": f"El modelo {table_name} no existe."}, status=400)

            fields_info = filters.get_related_fields(model)
            return Response(fields_info)

        except LookupError:
            return Response({"error": f"El modelo {table_name} no existe."}, status=400)

# Endpoint para realizar filtrado dinámico en base a los campos relacionados.
class DynamicFilterView(APIView):
    def get(self, request):
        
        serializer = ReportSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)  # Levanta una excepción si los datos no son válidos
        
        table_name = serializer.validated_data.get("table_name")
        
        try:
            model = apps.get_model('db_structure', table_name)  
            if not model:
                return Response({"error": f"El modelo {table_name} no existe."}, status=400)

            filter = serializer.validated_data.get("filters", {})
            selected_fields = serializer.validated_data.get("fields")

            data = filters.dynamic_filter(model, selected_fields, filter)
            return Response(data)

        except LookupError:
            return Response({"error": f"El modelo {table_name} no existe."}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
