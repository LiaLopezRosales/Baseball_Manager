# api/reports/serializers.py

from rest_framework import serializers
from django.core.validators import MinValueValidator, MaxValueValidator

# Serializador para los reportes.
class ReportSerializer(serializers.Serializer):
    report_id = serializers.IntegerField(
        required=True,
        validators=[MinValueValidator(0), MaxValueValidator(8)]
    )
    season_name = serializers.CharField(required=False, allow_null=True)  # Opcional
    pitcher_name = serializers.CharField(required=False, allow_null=True)  # Opcional
    pitcher_lastname = serializers.CharField(required=False, allow_null=True)  # Opcional
    team_name = serializers.CharField(required=False, allow_null=True)  # Opcional
    serie_name = serializers.CharField(required=False, allow_null=True)
    
    def validate(self, data):
        # Validar exclusividad entre season_name y pitcher_name y team_name
        season_name = data.get('season_name')
        pitcher_name = data.get('pitcher_name')
        pitcher_lastname = data.get('pitcher_lastname')
        team_name = data.get('team_name')
        serie_name = data.get('serie_name')
        report_id = data.get('report_id')
        
        if season_name and report_id not in [0,2]:
            raise serializers.ValidationError(f"season_id no es un parámetro del reporte {report_id}")
        if serie_name and report_id != 1:
            raise serializers.ValidationError(f"serie_name no es un parámetro del reporte {report_id}")
        if (pitcher_name or pitcher_lastname) and report_id != 4:
            raise serializers.ValidationError(f"pitcher_name no es un parámetro del reporte {report_id}")
        if team_name and report_id != 8:
            raise serializers.ValidationError(f"team_name no es un parámetro del reporte {report_id}")

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
    format = serializers.CharField(required=False, default="pdf")  # Opcional
    filename = serializers.CharField(required=False, default="report")  # Opcional