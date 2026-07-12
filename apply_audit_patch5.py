from pathlib import Path
urls_path = Path('inventario/urls.py')
text = urls_path.read_text(encoding='utf-8')
needle = "    path('crear-usuario/', CrearUsuarioView.as_view(), name='crear_usuario'),  # NIST IA-5\n"
if needle not in text:
    print('needles not found, printing contents:')
    print(repr(text))
    raise SystemExit('Needle not found')
text = text.replace(needle, needle + "    path('auditoria-chain/', AuditoriaChainView.as_view(), name='auditoria_chain'),\n")
urls_path.write_text(text, encoding='utf-8')
print('Patched urls.py')
