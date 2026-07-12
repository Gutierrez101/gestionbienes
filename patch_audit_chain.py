from pathlib import Path

BASE = Path('inventario')

replacements = [
    {
        'path': BASE / 'models.py',
        'old': "    class Meta:\n        ordering = ['-timestamp']\n        verbose_name = 'Auditoría'\n        verbose_name_plural = 'Auditorías'\n    \n    def __str__(self):\n        return f\"{self.usuario} - {self.accion} en {self.tabla}\"\n",
        'new': "    class Meta:\n        ordering = ['-timestamp']\n        verbose_name = 'Auditoría'\n        verbose_name_plural = 'Auditorías'\n    \n    def __str__(self):\n        usuario_text = self.usuario.username if self.usuario else 'Sin usuario'\n        return f\"{usuario_text} - {self.accion} en {self.tabla}\"\n\n    def compute_hash(self):\n        timestamp = self.timestamp.isoformat() if self.timestamp else timezone.now().isoformat()\n        contenido = (\n            f\"{self.usuario_id or 'anon'}|{self.accion}|{self.tabla}|{self.objeto_id or ''}|\"\n            f\"{self.ip_address}|{self.user_agent}|{self.detalles}|{timestamp}|{self.previous_hash}\"\n        )\n        return hashlib.sha256(contenido.encode('utf-8')).hexdigest()\n\n    def save(self, *args, **kwargs):\n        if not self.timestamp:\n            self.timestamp = timezone.now()\n\n        if self.previous_hash == '':\n            previous = AuditoriaLog.objects.order_by('timestamp', 'id').last()\n            if previous and previous.hash:\n                self.previous_hash = previous.hash\n            elif previous:\n                self.previous_hash = ''\n\n        if not self.hash:\n            self.hash = self.compute_hash()\n\n        super().save(*args, **kwargs)\n        recomputed = self.compute_hash()\n        if self.hash != recomputed:\n            self.hash = recomputed\n            super().save(update_fields=['hash'])\n"
    },
    {
        'path': BASE / 'serializers.py',
        'old': "from rest_framework import serializers\nfrom .models import Bien\n\nclass BienSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = Bien\n        fields = '__all__'\n",
        'new': "from rest_framework import serializers\nfrom .models import Bien, AuditoriaLog\n\nclass BienSerializer(serializers.ModelSerializer):\n    class Meta:\n        model = Bien\n        fields = '__all__'\n\nclass AuditoriaLogSerializer(serializers.ModelSerializer):\n    usuario = serializers.SerializerMethodField()\n\n    class Meta:\n        model = AuditoriaLog\n        fields = [\n            'id', 'usuario', 'accion', 'tabla', 'objeto_id', 'ip_address',\n            'user_agent', 'detalles', 'timestamp', 'previous_hash', 'hash'\n        ]\n\n    def get_usuario(self, obj):\n        return obj.usuario.username if obj.usuario else None\n"
    },
    {
        'path': BASE / 'views.py',
        'old': "class UsuarioViewSet(viewsets.ModelViewSet):\n    queryset = Usuario.objects.all()\n    serializer_class = UsuarioSerializer\n    permission_classes = [IsAdministrador]\n",
        'new': "class UsuarioViewSet(viewsets.ModelViewSet):\n    queryset = Usuario.objects.all()\n    serializer_class = UsuarioSerializer\n    permission_classes = [IsAdministrador]\n\nclass AuditoriaChainView(APIView):\n    permission_classes = [IsAuthenticated]\n\n    def get(self, request):\n        logs = AuditoriaLog.objects.order_by('timestamp', 'id')\n        serializer = AuditoriaLogSerializer(logs, many=True)\n        return Response(serializer.data)\n"
    },
    {
        'path': BASE / 'urls.py',
        'old': "urlpatterns = [\n    path('login/',LoginView.as_view(), name='api_login'),\n    path('crear-usuario/', CrearUsuarioView.as_view(), name='crear_usuario'),  # NIST IA-5\n    path('', include(router.urls)),\n]\n",
        'new': "urlpatterns = [\n    path('login/',LoginView.as_view(), name='api_login'),\n    path('crear-usuario/', CrearUsuarioView.as_view(), name='crear_usuario'),  # NIST IA-5\n    path('auditoria-chain/', AuditoriaChainView.as_view(), name='auditoria_chain'),\n    path('', include(router.urls)),\n]\n"
    }
]

for rep in replacements:
    path = rep['path']
    text = path.read_text(encoding='utf-8')
    if rep['old'] not in text:
        raise SystemExit(f"Missing exact match in {path}")
    path.write_text(text.replace(rep['old'], rep['new']), encoding='utf-8')
    print(f"Patched {path}")
