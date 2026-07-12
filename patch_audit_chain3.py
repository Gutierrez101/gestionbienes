from pathlib import Path

files = {
    'models.py': Path('inventario/models.py'),
    'serializers.py': Path('inventario/serializers.py'),
    'views.py': Path('inventario/views.py'),
    'urls.py': Path('inventario/urls.py'),
}

# 1) Patch models.py by replacing the exact __str__ block and inserting new methods.
models_path = files['models.py']
models_text = models_path.read_text(encoding='utf-8')
needle = '    def __str__(self):\n        return f"{self.usuario} - {self.accion} en {self.tabla}"\n'
if needle not in models_text:
    raise SystemExit('Needle not found in models.py')
replacement = (
    '    def __str__(self):\n'
    '        usuario_text = self.usuario.username if self.usuario else \'Sin usuario\'\n'
    '        return f"{usuario_text} - {self.accion} en {self.tabla}"\n\n'
    '    def compute_hash(self):\n'
    '        timestamp = self.timestamp.isoformat() if self.timestamp else timezone.now().isoformat()\n'
    '        contenido = (\n'
    '            f"{self.usuario_id or \'anon\'}|{self.accion}|{self.tabla}|{self.objeto_id or \'\'}|"\n'
    '            f"{self.ip_address}|{self.user_agent}|{self.detalles}|{timestamp}|{self.previous_hash}"\n'
    '        )\n'
    '        return hashlib.sha256(contenido.encode(\'utf-8\')).hexdigest()\n\n'
    '    def save(self, *args, **kwargs):\n'
    '        if not self.timestamp:\n'
    '            self.timestamp = timezone.now()\n\n'
    '        if self.previous_hash == \'\':\n'
'
    '            previous = AuditoriaLog.objects.order_by(\'timestamp\', \'id\').last()\n'
    '            if previous and previous.hash:\n'
'
    '                self.previous_hash = previous.hash\n'
    '            elif previous:\n'
'
    '                self.previous_hash = \'\'\n\n'
    '        if not self.hash:\n'
'
    '            self.hash = self.compute_hash()\n\n'
    '        super().save(*args, **kwargs)\n'
    '        recomputed = self.compute_hash()\n'
'
    '        if self.hash != recomputed:\n'
'
    '            self.hash = recomputed\n'
'
    '            super().save(update_fields=[\'hash\'])\n'
)
models_text = models_text.replace(needle, replacement)
models_path.write_text(models_text, encoding='utf-8')
print('Patched models.py')

# 2) Patch serializers.py to add AuditoriaLogSerializer.
serializers_path = files['serializers.py']
serializers_text = serializers_path.read_text(encoding='utf-8')
needle2 = 'from rest_framework import serializers\nfrom .models import Bien\n\nclass BienSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = Bien\n        fields = \'__all__\'\n'
if needle2 not in serializers_text:
    raise SystemExit('Needle not found in serializers.py')
replacement2 = (
    'from rest_framework import serializers\n'
    'from .models import Bien, AuditoriaLog\n\n'
    'class BienSerializer(serializers.ModelSerializer):\n'
    '    class Meta:\n'
    '        model = Bien\n'
    '        fields = \'__all__\'\n\n'
    'class AuditoriaLogSerializer(serializers.ModelSerializer):\n'
    '    usuario = serializers.SerializerMethodField()\n\n'
    '    class Meta:\n'
    '        model = AuditoriaLog\n'
    '        fields = [\n'
    '            \'id\', \'usuario\', \'accion\', \'tabla\', \'objeto_id\', \'ip_address\',\n'
    '            \'user_agent\', \'detalles\', \'timestamp\', \'previous_hash\', \'hash\'\n'
    '        ]\n\n'
    '    def get_usuario(self, obj):\n'
    '        return obj.usuario.username if obj.usuario else None\n'
)
serializers_text = serializers_text.replace(needle2, replacement2)
serializers_path.write_text(serializers_text, encoding='utf-8')
print('Patched serializers.py')

# 3) Patch views.py to add AuditoriaChainView class before UsuarioViewSet.
views_path = files['views.py']
views_text = views_path.read_text(encoding='utf-8')
needle3 = 'class UsuarioViewSet(viewsets.ModelViewSet):\n    queryset = Usuario.objects.all()\n    serializer_class = UsuarioSerializer\n    permission_classes = [IsAdministrador]\n'
if needle3 not in views_text:
    raise SystemExit('Needle not found in views.py')
replacement3 = (
    'class UsuarioViewSet(viewsets.ModelViewSet):\n'
    '    queryset = Usuario.objects.all()\n'
    '    serializer_class = UsuarioSerializer\n'
    '    permission_classes = [IsAdministrador]\n\n'
    'class AuditoriaChainView(APIView):\n'
    '    permission_classes = [IsAuthenticated]\n\n'
    '    def get(self, request):\n'
    '        logs = AuditoriaLog.objects.order_by(\'timestamp\', \'id\')\n'
    '        serializer = AuditoriaLogSerializer(logs, many=True)\n'
    '        return Response(serializer.data)\n'
)
views_text = views_text.replace(needle3, replacement3)
views_path.write_text(views_text, encoding='utf-8')
print('Patched views.py')

# 4) Patch urls.py to add route if not already present.
urls_path = files['urls.py']
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
