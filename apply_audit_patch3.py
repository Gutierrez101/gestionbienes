from pathlib import Path

base = Path('inventario')

# Patch serializers.py
serializers_path = base / 'serializers.py'
serializers_text = serializers_path.read_text(encoding='utf-8')
serializers_new = '''from rest_framework import serializers
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
            'user_agent', 'detalles', 'timestamp', 'previous_hash', 'hash'
        ]

    def get_usuario(self, obj):
        return obj.usuario.username if obj.usuario else None
'''
serializers_path.write_text(serializers_new, encoding='utf-8')
print('Written serializers.py')

# Patch views.py
views_path = base / 'views.py'
views_text = views_path.read_text(encoding='utf-8')
needle = '''class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAdministrador]
'''
replacement = '''class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAdministrador]

class AuditoriaChainView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logs = AuditoriaLog.objects.order_by('timestamp', 'id')
        serializer = AuditoriaLogSerializer(logs, many=True)
        return Response(serializer.data)
'''
if needle not in views_text:
    raise SystemExit('Needle not found in views.py')
views_text = views_text.replace(needle, replacement)
views_path.write_text(views_text, encoding='utf-8')
print('Patched views.py')

# Patch urls.py
urls_path = base / 'urls.py'
urls_text = urls_path.read_text(encoding='utf-8')
if "path('auditoria-chain/'" not in urls_text:
    urls_text = urls_text.replace(
        "    path('crear-usuario/', CrearUsuarioView.as_view(), name='crear_usuario'),  # NIST IA-5\n",
        "    path('crear-usuario/', CrearUsuarioView.as_view(), name='crear_usuario'),  # NIST IA-5\n    path('auditoria-chain/', AuditoriaChainView.as_view(), name='auditoria_chain'),\n"
    )
urls_path.write_text(urls_text, encoding='utf-8')
print('Patched urls.py')
