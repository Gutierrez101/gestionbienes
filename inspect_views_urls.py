from pathlib import Path
for rel in ['inventario/views.py', 'inventario/urls.py']:
    path = Path(rel)
    print('---', rel, '---')
    text = path.read_text(encoding='utf-8', errors='replace')
    lines = text.splitlines(True)
    for i in range(len(lines)):
        if i >= 175 and i < 205:
            print(f'{i+1}: {repr(lines[i])}')
    if rel.endswith('urls.py'):
        for i in range(len(lines)):
            if 'auditoria-chain' in lines[i] or 'AuditoriaChainView' in lines[i]:
                print(f'{i+1}: {repr(lines[i])}')
    print()
