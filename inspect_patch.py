from pathlib import Path

for rel in ['inventario/models.py', 'inventario/serializers.py', 'inventario/views.py', 'inventario/urls.py']:
    path = Path(rel)
    print('---', rel, '---')
    lines = path.read_text(encoding='utf-8', errors='replace').splitlines(True)
    for i, line in enumerate(lines, 1):
        if 'AuditoriaLog' in line or 'def __str__' in line or 'return f"{self.usuario}' in line or 'class BienSerializer' in line or 'class UsuarioViewSet' in line or 'AuditoriaChainView' in line or 'auditoria-chain' in line:
            print(f'{i}: {repr(line)}')
    print('')
