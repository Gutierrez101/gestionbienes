from django.db import models
from django.contrib.auth.models import AbstractUser

class Usuario(AbstractUser):
    ROLES = (
        ('Administrador', 'Administrador'),
        ('Docente', 'Docente'),
    )
    rol = models.CharField(max_length=20, choices=ROLES, default='Docente')
    cedula = models.CharField(max_length=10, unique=True, null=True, blank=True)

    def __str__(self):
        return f"{self.username} - {self.rol}"

class Bien(models.Model):
    codigo = models.CharField(max_length=50, unique=True)
    serie = models.CharField(max_length=100)
    modelo = models.CharField(max_length=100)
    marca = models.CharField(max_length=100)
    ubicacion = models.CharField(max_length=100)
    custodio = models.CharField(max_length=150)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.codigo} - {self.modelo}"