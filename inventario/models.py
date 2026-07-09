from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

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

class AuditoriaLog(models.Model):
    """NIST AU - Auditoría y Accountability"""
    ACCIONES = (
        ('CREATE', 'Crear'),
        ('READ', 'Leer'),
        ('UPDATE', 'Actualizar'),
        ('DELETE', 'Eliminar'),
        ('LOGIN', 'Inicio de Sesión'),
        ('LOGOUT', 'Cierre de Sesión'),
    )
    
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='logs')
    accion = models.CharField(max_length=20, choices=ACCIONES)
    tabla = models.CharField(max_length=100)
    objeto_id = models.IntegerField(null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    detalles = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Auditoría'
        verbose_name_plural = 'Auditorías'
    
    def __str__(self):
        return f"{self.usuario} - {self.accion} en {self.tabla}"