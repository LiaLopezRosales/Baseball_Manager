class BaseRepository:
    model = None  
    @classmethod
    def get_all(cls):
        return cls.model.objects.all()

    @classmethod
    def get_by_id(cls, obj_id):
        try:
            return cls.model.objects.get(id=obj_id)
        except cls.model.DoesNotExist:
            return None

    @classmethod
    def create(cls, data):
        return cls.model.objects.create(**data)

    @classmethod
    def update(cls, obj_id, data):
        obj = cls.get_by_id(obj_id)
        if obj:
            for key, value in data.items():
                setattr(obj, key, value)
            obj.save()
            return obj
        return None

    @classmethod
    def delete(cls, obj_id):
        obj = cls.get_by_id(obj_id)
        if obj:
            obj.delete()
            return True
        return False
