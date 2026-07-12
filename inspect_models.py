from pathlib import Path

path = Path('inventario/models.py')
text = path.read_text(encoding='utf-8')
lines = text.splitlines()
for i, line in enumerate(lines, start=1):
    if 'return f"{self.usuario} - {self.accion} en {self.tabla}"' in line or 'def __str__' in line:
        print(i, repr(line))
        for j in range(max(1, i-3), min(len(lines)+1, i+6)):
            print(f'{j}: {repr(lines[j-1])}')
        break
