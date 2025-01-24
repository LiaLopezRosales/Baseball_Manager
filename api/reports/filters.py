# api/reports/filters.py

from django.db.models import Q, ForeignKey, OneToOneField
from rest_framework.response import Response
from django.db.models import Model
from rest_framework import status


def get_related_fields(model: Model, external_fields=False, show_ids=False, visited=set(), path_prefix="", table_path=""):
    # Agrega el modelo actual al conjunto de modelos visitados para evitar ciclos
    visited.add(model)
    fields = []

    # Recorre todos los campos del modelo
    for field in model._meta.get_fields():
        # Si el campo es 'id' y no se deben mostrar los IDs, continúa con el siguiente campo
        if field.name == 'id' and not show_ids:
            continue
        
        # Construye la ruta actual del campo
        current_path = f"{path_prefix}{field.name}"

        if not field.is_relation:
            # Si el campo no es una relación, es un campo local
            fields.append({"name": field.name, "path": current_path, "tables path": table_path})
        elif isinstance(field, (ForeignKey, OneToOneField)) and external_fields:
            # Si el campo es una relación y se deben incluir campos externos
            if field.related_model not in visited:  # Verifica que sea un modelo relacionado válido
                # Llama recursivamente para obtener los campos relacionados del modelo relacionado
                related_fields = get_related_fields(
                    model=field.related_model,
                    external_fields=external_fields,
                    show_ids=show_ids,
                    visited=visited,
                    path_prefix=f"{current_path}__",
                    table_path=f"{table_path} -> {field.related_model.__name__}"
                )
                fields += related_fields
    
    # Remueve el modelo actual del conjunto de modelos visitados
    visited.remove(model)
    
    return fields

def dynamic_filter(model: Model, selected_fields: list, filters={}):
    query = Q()  # Inicializa un objeto Q vacío para construir la consulta
    for path, condition in filters.items():
        model_shadow = model
        fields = path.split("__")  # Divide el path en campos individuales
        for field in fields:
            if not hasattr(model_shadow, field):
                return Response({"error": f"El campo {field} no existe en {model.__name__}."}, status=400)

            field = model_shadow._meta.get_field(field)

            if isinstance(field, (ForeignKey, OneToOneField)):
                model_shadow = field.related_model
        
        # Soporte para diferentes condiciones de filtrado
        if isinstance(condition, dict):
            for lookup, value in condition.items():
                if lookup in ["lt", "lte", "gt", "gte", "day", "year", "month"]:
                    if not isinstance(value, (int, float)):
                        raise ValueError(f"La columna {lookup} es de tipo numérico.")
                elif lookup in ['contains', 'startswith', 'endswith']:
                    if not isinstance(value, (str)):
                        raise ValueError(f"La columna {lookup} es de tipo string.")
                query &= Q(**{f"{path}__{lookup}": value})
        else:  # Igualdad simple
            query &= Q(**{path: condition})

    queryset = model.objects.filter(query)  # Filtra el queryset del modelo utilizando el objeto Q

    # Realiza los `select_related` para optimizar las consultas de campos foráneos
    if selected_fields:
        queryset = queryset.values(*selected_fields)

    # Construye la lista de resultados con los campos seleccionados
    data = [
        {
            field: obj[field]
            for field in selected_fields
        }
        for obj in queryset
    ]
    return data