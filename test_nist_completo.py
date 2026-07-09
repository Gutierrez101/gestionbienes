import requests
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from inventario.models import AuditoriaLog

BASE = 'http://localhost:8000/api'

print("\n" + "="*70)
print("🔐 PRUEBAS DE NIST - Gestión de Bienes ESPE")
print("="*70)

# 1. LOGIN
print("\n[✓] Test 1: LOGIN (NIST IA)")
r = requests.post(f'{BASE}/login/', json={'username':'testuser','password':'123456'})
if r.status_code == 200:
    data = r.json()
    token = data['token']
    print(f"    ✅ Token: {token[:20]}...")
    print(f"    ✅ Usuario: {data['username']}")
    print(f"    ✅ Rol: {data['rol']}")
else:
    print(f"    ❌ Error: {r.json()}")
    token = None

# 2. CREAR USUARIO VÁLIDO
if token:
    print("\n[✓] Test 2: CREAR USUARIO (NIST IA-5 - Contraseña fuerte)")
    r = requests.post(
        f'{BASE}/crear-usuario/',
        headers={'Authorization': f'Token {token}'},
        json={
            'username': 'docente_test',
            'password': 'Docente@2024',
            'email': 'docente@espe.edu.ec',
            'rol': 'Docente',
            'cedula': '1234567890'
        }
    )
    if r.status_code == 201:
        print(f"    ✅ Usuario creado: {r.json()['usuario']['username']}")
    else:
        print(f"    ❌ Error: {r.json()}")

# 3. RECHAZAR CONTRASEÑA DÉBIL
if token:
    print("\n[✓] Test 3: RECHAZO DE CONTRASEÑA DÉBIL (NIST IA-5)")
    r = requests.post(
        f'{BASE}/crear-usuario/',
        headers={'Authorization': f'Token {token}'},
        json={
            'username': 'usuario_debil',
            'password': '123',
            'email': 'test@espe.edu.ec',
            'rol': 'Docente',
            'cedula': '1111111111'
        }
    )
    if r.status_code != 201:
        print(f"    ✅ Contraseña rechazada (correcto)")
        print(f"    ℹ️  Motivo: Contraseña no cumple requisitos de seguridad")
    else:
        print(f"    ❌ Debería haber rechazado la contraseña débil")

# 4. AUDITORÍA
print("\n[✓] Test 4: AUDITORÍA (NIST AU-2)")
logs = AuditoriaLog.objects.all().order_by('-timestamp')[:5]
print(f"    📊 Últimos {len(logs)} eventos registrados:")
for log in logs:
    print(f"    • [{log.timestamp.strftime('%H:%M:%S')}] {log.usuario.username} - {log.accion} - IP: {log.ip_address}")

# 5. HEADERS SEGURIDAD
print("\n[✓] Test 5: HEADERS DE SEGURIDAD (NIST SC)")
r = requests.get('http://localhost:8000/admin/')
headers_nist = {
    'X-Content-Type-Options': r.headers.get('X-Content-Type-Options'),
    'X-Frame-Options': r.headers.get('X-Frame-Options'),
    'X-XSS-Protection': r.headers.get('X-XSS-Protection'),
}
for header, value in headers_nist.items():
    status = "✅" if value else "❌"
    print(f"    {status} {header}: {value}")

print("\n" + "="*70)
print("✅ PRUEBAS COMPLETADAS")
print("="*70 + "\n")
