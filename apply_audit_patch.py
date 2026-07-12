from pathlib import Path

BASE = Path('inventario')

# 1) Patch models.py
models_path = BASE / 'models.py'
models_text = models_path.read_text(encoding='utf-8')
needle = '    def __str__(self):\n        return f"{self.usuario} - {self.accion} en {self.tabla}"\n'
if needle not in models_text:
    raise SystemExit('Missing exact needle in models.py')
replacement = '''    def __str__(self):
        usuario_text = self.usuario.username if self.usuario else 'Sin usuario'
        return f"{usuario_text} - {self.accion} en {self.tabla}"

    def compute_hash(self):
        timestamp = self.timestamp.isoformat() if self.timestamp else timezone.now().isoformat()
        contenido = (
            f"{self.usuario_id or 'anon'}|{self.accion}|{self.tabla}|{self.objeto_id or ''}|"
            f"{self.ip_address}|{self.user_agent}|{self.detalles}|{timestamp}|{self.previous_hash}"
        )
        return hashlib.sha256(contenido.encode('utf-8')).hexdigest()

    def save(self, *args, **kwargs):
        if not self.timestamp:
            self.timestamp = timezone.now()

        if self.previous_hash == '':
            previous = AuditoriaLog.objects.order_by('timestamp', 'id').last()
            if previous and previous.hash:
                self.previous_hash = previous.hash
            elif previous:
                self.previous_hash = ''

        if not self.hash:
            self.hash = self.compute_hash()

        super().save(*args, **kwargs)
        recomputed = self.compute_hash()
        if self.hash != recomputed:
            self.hash = recomputed
            super().save(update_fields=['hash'])
'''
models_text = models_text.replace(needle, replacement)
models_path.write_text(models_text, encoding='utf-8')
print('Patched models.py')

# 2) Patch serializers.py
serializers_path = BASE / 'serializers.py'
serializers_text = serializers_path.read_text(encoding='utf-8')
needle = 'from rest_framework import serializers\nfrom .models import Bien\n\nclass BienSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = Bien\n        fields = \"__all__\"\n'
if needle not in serializers_text:
    raise SystemExit('Missing exact needle in serializers.py')
replacement = '''from rest_framework import serializers
from .models import Bien, AuditoriaLog

class BienSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bien
        fields = "__all__"

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
serializers_text = serializers_text.replace(needle, replacement)
serializers_path.write_text(serializers_text, encoding='utf-8')
print('Patched serializers.py')

# 3) Patch views.py
views_path = BASE / 'views.py'
views_text = views_path.read_text(encoding='utf-8')
needle = 'class UsuarioViewSet(viewsets.ModelViewSet):\n    queryset = Usuario.objects.all()\n    serializer_class = UsuarioSerializer\n    permission_classes = [IsAdministrador]\n'
if needle not in views_text:
    raise SystemExit('Missing exact needle in views.py')
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
views_text = views_text.replace(needle, replacement)
views_path.write_text(views_text, encoding='utf-8')
print('Patched views.py')

# 4) Patch urls.py
urls_path = BASE / 'urls.py'
urls_text = urls_path.read_text(encoding='utf-8')
if 'AuditoriaChainView' not in urls_text:
    urls_text = urls_text.replace(
        'from .views import BienViewSet, UsuarioViewSet, LoginView, CrearUsuarioView, AuditoriaChainView\n',
        'from .views import BienViewSet, UsuarioViewSet, LoginView, CrearUsuarioView, AuditoriaChainView\n'
    )
if "path('auditoria-chain/'" not in urls_text:
    urls_text = urls_text.replace(
        "    path('crear-usuario/', CrearUsuarioView.as_view(), name='crear_usuario'),  # NIST IA-5\n",
        "    path('crear-usuario/', CrearUsuarioView.as_view(), name='crear_usuario'),  # NIST IA-5\n    path('auditoria-chain/', AuditoriaChainView.as_view(), name='auditoria_chain'),\n"
    )
urls_path.write_text(urls_text, encoding='utf-8')
print('Patched urls.py')
