from rest_framework import viewsets, status
from rest_framework.response import Response

class BaseViewSet(viewsets.ViewSet):
    repository = None  
    serializer_class = None  

    def list(self, request):
        objs = self.repository.get_all()
        serializer = self.serializer_class(objs, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        obj = self.repository.get_by_id(pk)
        if obj:
            serializer = self.serializer_class(obj)
            return Response(serializer.data)
        return Response({'error': f'{self.repository.model.__name__} not found'}, status=status.HTTP_404_NOT_FOUND)

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            obj = self.repository.create(serializer.validated_data)
            return Response(self.serializer_class(obj).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            obj = self.repository.update(pk, serializer.validated_data)
            if obj:
                return Response(self.serializer_class(obj).data)
            return Response({'error': f'{self.repository.model.__name__} not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        if self.repository.delete(pk):
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'error': f'{self.repository.model.__name__} not found'}, status=status.HTTP_404_NOT_FOUND)
