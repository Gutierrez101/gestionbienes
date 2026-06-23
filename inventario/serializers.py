from rest_framework import serializers
from .models import Bien

class BienSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bien
        fields = '__all__'