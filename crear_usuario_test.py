#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from inventario.models import Usuario

# Eliminar usuario de prueba si existe
Usuario.objects.filter(username='testuser').delete()

# Crear nuevo usuario con contraseña hasheada correctamente
user = Usuario.objects.create_user(
    username='testuser',
    password='123456',
    email='test@espe.edu.ec',
    rol='Administrador',
    cedula='1234567890'
)

print(f"✅ Usuario creado: {user.username}")
print(f"   Rol: {user.rol}")
print(f"   Cédula: {user.cedula}")
print(f"\n📝 Credenciales de prueba:")
print(f"   Usuario: testuser")
print(f"   Contraseña: 123456")
