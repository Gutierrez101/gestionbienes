from pathlib import Path

base = Path('inventario')

# Rewrite serializers.py with auditoria serializer
serializers_path = base / 'serializers.py'
serializers_path.write_text(
    "from rest_framework import serializers\n"
    "from .models import Bien, AuditoriaLog\n\n"
    "class BienSerializer(serializers.ModelSerializer):\n"
    "    class Meta:\n"
    "        model = Bien\n"
    "        fields = '__all__'\n\n"
    "class AuditoriaLogSerializer(serializers.ModelSerializer):\n"
    "    usuario = serializers.SerializerMethodField()\n\n"
    "    class Meta:\n"
    "        model = AuditoriaLog\n"
    "        fields = [\n"
    "            'id', 'usuario', 'accion', 'tabla', 'objeto_id', 'ip_address',\n"
    "            'user_agent', 'detalles', 'timestamp', 'previous_hash', 'hash'\n"
    "        ]\n\n"
    "    def get_usuario(self, obj):\n"
    "        return obj.usuario.username if obj.usuario else None\n",
    encoding='utf-8'
)
print('Wrote serializers.py')

# Patch views.py: insert AuditoriaChainView after UsuarioViewSet
views_path = base / 'views.py'
views_text = views_path.read_text(encoding='utf-8')
needle = 'class UsuarioViewSet(viewsets.ModelViewSet):\n    queryset = Usuario.objects.all()\n    serializer_class = UsuarioSerializer\n    permission_classes = [IsAdministrador]\n'
if needle not in views_text:
    raise SystemExit('Needle not found in views.py')
replacement = needle + '\nclass AuditoriaChainView(APIView):\n    permission_classes = [IsAuthenticated]\n\n    def get(self, request):\n        logs = AuditoriaLog.objects.order_by(\'timestamp\', \'id\')\n        serializer = AuditoriaLogSerializer(logs, many=True)\n        return Response(serializer.data)\n'
views_text = views_text.replace(needle, replacement, 1)
views_path.write_text(views_text, encoding='utf-8')
print('Patched views.py')

# Patch urls.py: insert route
urls_path = base / 'urls.py'
urls_text = urls_path.read_text(encoding='utf-8')
needle = "    path('crear-usuario/', CrearUsuarioView.as_view(), name='crear_usuario'),  # NIST IA-5\n"
if needle not in urls_text:
    raise SystemExit('Needle not found in urls.py')
urls_text = urls_text.replace(
    needle,
    needle + "    path('auditoria-chain/', AuditoriaChainView.as_view(), name='auditoria_chain'),\n"
)
urls_path.write_text(urls_text, encoding='utf-8')
print('Patched urls.py')
