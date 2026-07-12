from pathlib import Path

files = {
    'models.py': Path('inventario/models.py'),
    'serializers.py': Path('inventario/serializers.py'),
    'views.py': Path('inventario/views.py'),
}

for name, path in files.items():
    text = path.read_text(encoding='utf-8')
    print(f'--- {name} ---')
    print(repr(text[:400]))
    print('')
