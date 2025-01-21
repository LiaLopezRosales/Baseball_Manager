from django.db.models import Q, ForeignKey, OneToOneField
from rest_framework.response import Response
from django.db.models import Model

def get_related_fields(model: Model, visited=set(), path_prefix="", table_path=""):
    if model.__name__ in ['Rol', 'User']:
        return {"error": f"El modelo {model.__name__} no se puede serializar"}
    
    visited.add(model)

    fields = []

    for field in model._meta.get_fields():
        
        if field.name == 'id':
            continue
        
        current_path = f"{path_prefix}{field.name}"

        if not field.is_relation:
            # Campo local
            fields.append({"name": field.name, "path": current_path, "tables path": table_path})
        elif isinstance(field, (ForeignKey, OneToOneField)):
            # Campo relacionado
            if field.related_model not in visited:  # Verifica que sea un modelo relacionado válido
                related_fields = get_related_fields(field.related_model, visited, path_prefix=f"{current_path}__", table_path=f"{table_path} -> {field.related_model.__name__}")
                fields += related_fields
    
    visited.remove(model)
    
    return fields

def dynamic_filter(model: Model, selected_fields: list, filters={}):
    query = Q()
    for path, condition in filters.items():
        model_shadow = model
        fields = path.split("__")
        for field in fields:
            if not hasattr(model_shadow, field):
                return Response({"error": f"El campo {field} no existe en {model.__name__}."}, status=400)

            field = model_shadow._meta.get_field(field)

            if isinstance(field, (ForeignKey, OneToOneField)):
                model_shadow = field.related_model
        
        # Soporte para diferentes condiciones
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

    queryset = model.objects.filter(query)

    # Realiza los `select_related` para optimizar las consultas de campos foráneos
    if selected_fields:
        queryset = queryset.values(*selected_fields)

    data = [
        {
            field: obj[field]
            for field in selected_fields
        }
        for obj in queryset
    ]
    return data

