# api/reports/serializers.py

from rest_framework import serializers
from django.core.validators import MinValueValidator, MaxValueValidator

# Serializador para los reportes.
class ReportSerializer(serializers.Serializer):
    report_id = serializers.IntegerField(
        required=True,
        validators=[MinValueValidator(0), MaxValueValidator(8)]
    )
    season_id = serializers.IntegerField(required=False, allow_null=True)  # Opcional
    pitcher_id = serializers.IntegerField(required=False, allow_null=True)  # Opcional
    team_id = serializers.IntegerField(required=False, allow_null=True)  # Opcional
    
    def validate(self, data):
        # Validar exclusividad entre season_id y pitcher_id
        season_id = data.get('season_id')
        pitcher_id = data.get('pitcher_id')
        team_id = data.get('team_id')
        if season_id is not None and pitcher_id is not None and team_id is not None:
            raise serializers.ValidationError(
                "No se pueden pasar ambos parámetros 'season_id' y 'pitcher_id' al mismo tiempo."
            )
        return data

# Serializador para las obtener de una tabla todos sus campos relacionados
class TableStructureSerializer(serializers.Serializer):
    table_name = serializers.CharField(required=True)
    external_fields = serializers.BooleanField(required=False, default=False) # Opcional
    show_ids = serializers.BooleanField(required=False, default=False) # Opcional

# Serializador para filtrado dinámico
class DynamicFilterSerializer(serializers.Serializer):
    table_name = serializers.CharField(required=True)
    fields = serializers.ListField(child=serializers.CharField(), required=True)
    filters = serializers.DictField(required=False, allow_null=True)  # Opcional

# Serializador para la exportación de reportes

class ExportSerializer(serializers.Serializer):
    data = serializers.DictField(required=True)
    format = serializers.CharField(required=False, default="PDFExporter")  # Opcional
    filename = serializers.CharField(required=False, default="report")  # Opcional