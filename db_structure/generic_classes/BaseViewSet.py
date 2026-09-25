from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError as DRFValidationError
import re
from django.utils.translation import gettext as _
from api.permissions import IsAdmin

class BaseViewSet(viewsets.ViewSet):
    repository = None  
    serializer_class = None  

    def get_permissions(self):
        """
        Lectura pública; escritura (create/update/delete) solo Admin autenticado.
        """
        if self.action in {'create', 'update', 'partial_update', 'destroy'}:
            return [IsAdmin()]
        return [AllowAny()]  

    def list(self, request):#Listar todos los datos
        objs = self.repository.get_all()
        serializer = self.serializer_class(objs, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):#Conseguir los valores relacionados a un dato(GET)
        obj = self.repository.get_by_id(pk)
        if obj:
            serializer = self.serializer_class(obj)
            return Response(serializer.data)
        return Response({'error': f'{self.repository.model.__name__} not found'}, status=status.HTTP_404_NOT_FOUND)

    def create(self, request):#Crear nueva instancia(POST)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            try:
                obj = self.repository.create(serializer.validated_data)
                return Response(self.serializer_class(obj).data, status=status.HTTP_201_CREATED)

            except DjangoValidationError as e:
                return Response({"errors": e.message_dict}, status=status.HTTP_400_BAD_REQUEST)

            except IntegrityError as e:
                error_message = str(e)

                # 🔹 Extraer solo el nombre del constraint usando regex
                match = re.search(r'check constraint "(.*?)"', error_message)
                if match:
                    constraint_name = match.group(1)  # Obtener solo el nombre del constraint
                    translated_error = _(f"Error de restricción: {constraint_name}")
                else:
                    translated_error = _("Ocurrió un error de integridad en la base de datos.")

                return Response({"detail": translated_error}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):#Editar los valores de un dato(PUT)
        obj = self.repository.get_by_id(pk)
        if not obj:
            return Response({'error': f'{self.repository.model.__name__} not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.serializer_class(instance=obj, data=request.data)
        if serializer.is_valid():
            try:
                obj = serializer.save()
                return Response(self.serializer_class(obj).data, status=status.HTTP_201_CREATED)
            except (DjangoValidationError, DRFValidationError) as e:
                return Response({"errors": e.message_dict}, status=status.HTTP_400_BAD_REQUEST)
            except IntegrityError as e:
                error_message = str(e)
                match = re.search(r'check constraint "(.*?)"', error_message)
                if match:
                    constraint_name = match.group(1)
                    translated_error = _(f"Error de restricción: {constraint_name}")
                else:
                    translated_error = _("Ocurrió un error de integridad en la base de datos.")
                return Response({"detail": translated_error}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


    def destroy(self, request, pk=None):#Eliminar un dato(DESTROY)
        if self.repository.delete(pk):
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'error': f'{self.repository.model.__name__} not found'}, status=status.HTTP_404_NOT_FOUND)
