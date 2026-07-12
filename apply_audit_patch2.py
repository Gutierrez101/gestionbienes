from pathlib import Path

BASE = Path('inventario')

# 1) Patch models.py by line index
models_path = BASE / 'models.py'
models_lines = models_path.read_text(encoding='utf-8').splitlines()
needle = '        return f"{self.usuario} - {self.accion} en {self.tabla}"'
for idx, line in enumerate(models_lines):
    if line == needle:
        insert_at = idx
        break
else:
    raise SystemExit('Needle not found in models.py')

models_lines[idx] = "        usuario_text = self.usuario.username if self.usuario else 'Sin usuario'"
models_lines.insert(idx + 1, "        return f\"{usuario_text} - {self.accion} en {self.tabla}\"")
models_lines.insert(idx + 2, '')
models_lines.insert(idx + 3, '    def compute_hash(self):')
models_lines.insert(idx + 4, '        timestamp = self.timestamp.isoformat() if self.timestamp else timezone.now().isoformat()')
models_lines.insert(idx + 5, '        contenido = (')
models_lines.insert(idx + 6, '            f"{self.usuario_id or \'anon\'}|{self.accion}|{self.tabla}|{self.objeto_id or \'\'}|"')
models_lines.insert(idx + 7, '            f"{self.ip_address}|{self.user_agent}|{self.detalles}|{timestamp}|{self.previous_hash}"')
models_lines.insert(idx + 8, '        )')
models_lines.insert(idx + 9, '        return hashlib.sha256(contenido.encode(\'utf-8\')).hexdigest()')
models_lines.insert(idx + 10, '')
models_lines.insert(idx + 11, '    def save(self, *args, **kwargs):')
models_lines.insert(idx + 12, '        if not self.timestamp:')
models_lines.insert(idx + 13, '            self.timestamp = timezone.now()')
models_lines.insert(idx + 14, '')
models_lines.insert(idx + 15, '        if self.previous_hash == \'\':')
models_lines.insert(idx + 16, '            previous = AuditoriaLog.objects.order_by(\'timestamp\', \'id\').last()')
models_lines.insert(idx + 17, '            if previous and previous.hash:')
models_lines.insert(idx + 18, '                self.previous_hash = previous.hash')
models_lines.insert(idx + 19, '            elif previous:')
models_lines.insert(idx + 20, '                self.previous_hash = \'\'')
models_lines.insert(idx + 21, '')
models_lines.insert(idx + 22, '        if not self.hash:')
models_lines.insert(idx + 23, '            self.hash = self.compute_hash()')
models_lines.insert(idx + 24, '')
models_lines.insert(idx + 25, '        super().save(*args, **kwargs)')
models_lines.insert(idx + 26, '        recomputed = self.compute_hash()')
models_lines.insert(idx + 27, '        if self.hash != recomputed:')
models_lines.insert(idx + 28, '            self.hash = recomputed')
models_lines.insert(idx + 29, '            super().save(update_fields=[\'hash\'])')

models_path.write_text('\n'.join(models_lines) + '\n', encoding='utf-8')
print('Patched models.py')

# 2) Patch serializers.py
serializers_path = BASE / 'serializers.py'
serializers_text = serializers_path.read_text(encoding='utf-8')
needle_import = 'from .models import Bien\n'
if needle_import not in serializers_text:
    raise SystemExit('Needle import not found in serializers.py')
serializers_text = serializers_text.replace(needle_import, 'from .models import Bien, AuditoriaLog\n')
needle_class = 'class BienSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = Bien\n        fields = \'__all__\'\n'
if needle_class not in serializers_text:
    raise SystemExit('Needle class not found in serializers.py')
serializers_text = serializers_text.replace(needle_class, needle_class + '\nclass AuditoriaLogSerializer(serializers.ModelSerializer):\n    usuario = serializers.SerializerMethodField()\n\n    class Meta:\n        model = AuditoriaLog\n        fields = [\n            \'id\', \'usuario\', \'accion\', \'tabla\', \'objeto_id\', \'ip_address\',\n            \'user_agent\', \'detalles\', \'timestamp\', \'previous_hash\', \'hash\'\n        ]\n\n    def get_usuario(self, obj):\n        return obj.usuario.username if obj.usuario else None\n')
serializers_path.write_text(serializers_text, encoding='utf-8')
print('Patched serializers.py')

# 3) Patch views.py
views_path = BASE / 'views.py'
views_text = views_path.read_text(encoding='utf-8')
needle_view = 'class UsuarioViewSet(viewsets.ModelViewSet):\n    queryset = Usuario.objects.all()\n    serializer_class = UsuarioSerializer\n    permission_classes = [IsAdministrador]\n'
if needle_view not in views_text:
    raise SystemExit('Needle view not found in views.py')
replacement_view = needle_view + '\nclass AuditoriaChainView(APIView):\n    permission_classes = [IsAuthenticated]\n\n    def get(self, request):\n        logs = AuditoriaLog.objects.order_by(\'timestamp\', \'id\')\n        serializer = AuditoriaLogSerializer(logs, many=True)\n        return Response(serializer.data)\n'
views_text = views_text.replace(needle_view, replacement_view)
views_path.write_text(views_text, encoding='utf-8')
print('Patched views.py')

# 4) Patch urls.py
urls_path = BASE / 'urls.py'
urls_text = urls_path.read_text(encoding='utf-8')
if "path('auditoria-chain/'" not in urls_text:
    urls_text = urls_text.replace(
        "    path('crear-usuario/', CrearUsuarioView.as_view(), name='crear_usuario'),  # NIST IA-5\n",
        "    path('crear-usuario/', CrearUsuarioView.as_view(), name='crear_usuario'),  # NIST IA-5\n    path('auditoria-chain/', AuditoriaChainView.as_view(), name='auditoria_chain'),\n"
    )
urls_path.write_text(urls_text, encoding='utf-8')
print('Patched urls.py')
