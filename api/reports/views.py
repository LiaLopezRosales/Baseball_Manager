# api/reports/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from ..permissions import IsAdmin, IsDirectorTecnicoAndOwnTeam, IsUsuarioGeneral
from .serializers import ReportSerializer, TableStructureSerializer, DynamicFilterSerializer
from django.apps import apps
from .queries import *
from .filters import *


# Vista para manejar diferentes tipos de reportes basados en parámetros proporcionados por el usuario
class ReportsView(APIView):    
    def get(self, request):
        # Serializar y validar los parámetros de consulta (query params)
        serializer = ReportSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)  # Levanta una excepción si los datos no son válidos
        
        validated_data = serializer.validated_data  # Obtener los datos validados
        
        # Determinar el tipo de reporte según el valor de 'report_id'
        
        if validated_data.get('report_id') == 0:
            # Reporte: Obtener equipos ganadores y directores técnicos en series nacionales por temporada
            result = get_final_winner_teams_and_coaches(validated_data.get('season_id'))
        
        elif validated_data.get('report_id') == 1:
            # Reporte: Obtener nombres y posiciones de jugadores estrella y su efectividad por serie
            result = get_star_players_for_series(validated_data.get('season_id'))
        
        elif validated_data.get('report_id') == 2:
            # Reporte: Listar equipos en primer y último lugar por serie, clasificados por tipo
            result = get_teams_by_series(validated_data.get('season_id'))
        
        elif validated_data.get('report_id') == 3:
            # Reporte: Obtener series con mayor y menor cantidad de juegos celebrados
            result = get_max_min_game_per_series()
        
        elif validated_data.get('report_id') == 4:
            # Reporte: Obtener total de juegos ganados y promedio de carreras limpias permitidas por un lanzador
            result = get_pitcher_wins_and_running_average(validated_data.get('pitcher_id'))
        
        elif validated_data.get('report_id') == 5:
            # Reporte: Obtener los jugadores con mejor promedio de bateo.
            result = get_top_batting_average_players()
        
        elif validated_data.get('report_id') == 6:
            # Reporte: Obtener estadísticas de puntos ganados, perdidos y juegos jugados por equipo.
            result = get_team_score_statistics()
        
        elif validated_data.get('report_id') == 7:
            # Reporte: Obtener los jugadores con mayor efectividad por posición.
            result = get_player_effectiveness_by_position()
        
        elif validated_data.get('report_id') == 8:
            # Reporte: Obtener los jugadores de un equipo específico. 
            result = get_team_players_at_a_specified_serie(validated_data.get('team_id'))
        
        else:
            # Si el 'report_id' no coincide con ninguna opción válida, devolver error
            return Response(
                {"error": "El report_id proporcionado no es válido."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Retornar la respuesta con los datos del reporte generado
        return Response(result, status=status.HTTP_200_OK)

# Endpoint para devolver los campos relacionados de un modelo dado.

class TableStructureView(APIView):
    def get(self, request):
        
        # Serializar y validar los parámetros de consulta (query params)
        serializer = TableStructureSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)  # Levanta una excepción si los datos no son válidos
        
        try:
            # Obtener el modelo correspondiente al nombre de la tabla
            table_name = serializer.validated_data.get("table_name")
            model = apps.get_model('db_structure', table_name)
            if not model:
                return Response({"error": f"El modelo {table_name} no existe."}, status=status.HTTP_400_BAD_REQUEST)

            # Obtner los campos relacionados al modelo
            fields_info = get_related_fields( model=model, external_fields=serializer.validated_data.get("external_fields", False), show_ids=serializer.validated_data.get("show_ids", False))
            
            #Verificar si no una excepción durante la búsqueda de campos relacionados
            if isinstance(fields_info, Response):
                return fields_info
            
            return Response(fields_info, status=status.HTTP_200_OK)

        except LookupError:
            return Response({"error": f"El modelo {table_name} no existe."}, status=status.HTTP_400_BAD_REQUEST)

# Endpoint para realizar filtrado dinámico en base a los campos relacionados.
class DynamicFilterView(APIView):
    def post(self, request):
        
        # Serializar y validar el cuerpo de la consulta
        serializer = DynamicFilterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)  # Levanta una excepción si los datos no son válidos
        
        try:
            # Obtener el modelo correspondiente al nombre de la tabla
            table_name = serializer.validated_data.get("table_name")
            model = apps.get_model('db_structure', table_name)  
            if not model:
                return Response({"error": f"El modelo {table_name} no existe."}, status=status.HTTP_400_BAD_REQUEST)

            # Obtener del cuerpo de la consulta los campos seleccionados y los filtros
            filter = serializer.validated_data.get("filters", {})
            selected_fields = serializer.validated_data.get("fields")

            # Realizar el filtrado dinámico
            data = dynamic_filter(model, selected_fields, filter)
            
            #Verificar si no una excepción durante la búsqueda de campos relacionados
            if isinstance(data, Response):
                return data
            
            return Response(data, status=status.HTTP_200_OK)

        except LookupError:
            return Response({"error": f"El modelo {table_name} no existe."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)},  status=status.HTTP_500_INTERNAL_SERVER_ERROR)
