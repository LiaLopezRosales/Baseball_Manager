#Estructura que siguen todos los repositorios
class BaseRepository:
    #Definir el modelo con que se trabaja
    model = None  
    @classmethod
    def get_all(cls): #Conseguir todas las filas
        return cls.model.objects.all()

    @classmethod
    def get_by_id(cls, obj_id):#Consigue una fila específica
        try:
            return cls.model.objects.get(id=obj_id)
        except cls.model.DoesNotExist:
            return None

    @classmethod
    def create(cls, data):#Crear una nueva fila
        return cls.model.objects.create(**data)

    @classmethod
    def update(cls, obj_id, data): #Editar una fila
        obj = cls.get_by_id(obj_id)
        if obj:
            for key, value in data.items():
                setattr(obj, key, value)
            obj.save()
            return obj
        return None

    @classmethod
    def delete(cls, obj_id): #Eliminar una fila
        obj = cls.get_by_id(obj_id)
        if obj:
            obj.delete()
            return True
        return False
