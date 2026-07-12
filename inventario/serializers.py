from rest_framework import serializers
from .models import Bien, AuditoriaLog

class BienSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bien
        fields = '__all__'

class AuditoriaLogSerializer(serializers.ModelSerializer):
    usuario = serializers.SerializerMethodField()

    class Meta:
        model = AuditoriaLog
        fields = [
            'id', 'usuario', 'accion', 'tabla', 'objeto_id', 'ip_address',
            'user_agent', 'detalles', 'mitre_tactic', 'mitre_technique',
            'timestamp', 'previous_hash', 'hash'
        ]

    def get_usuario(self, obj):
        return obj.usuario.username if obj.usuario else None
