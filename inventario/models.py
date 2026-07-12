from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import hashlib

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
    
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, related_name='logs', null=True, blank=True)
    accion = models.CharField(max_length=20, choices=ACCIONES)
    tabla = models.CharField(max_length=100)
    objeto_id = models.IntegerField(null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    detalles = models.TextField(blank=True)
    mitre_tactic = models.CharField(max_length=100, blank=True)
    mitre_technique = models.CharField(max_length=50, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    previous_hash = models.CharField(max_length=64, blank=True, default='')
    hash = models.CharField(max_length=64, unique=True, blank=True, null=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Auditoría'
        verbose_name_plural = 'Auditorías'
    
    def __str__(self):
        usuario_text = self.usuario.username if self.usuario else 'Sin usuario'
        return f"{usuario_text} - {self.accion} en {self.tabla}"

    def compute_hash(self):
        timestamp = self.timestamp.isoformat() if self.timestamp else timezone.now().isoformat()
        contenido = (
            f"{self.usuario_id or 'anon'}|{self.accion}|{self.tabla}|{self.objeto_id or ''}|"
            f"{self.ip_address}|{self.user_agent}|{self.detalles}|{self.mitre_tactic}|{self.mitre_technique}|{timestamp}|{self.previous_hash}"
        )
        return hashlib.sha256(contenido.encode('utf-8')).hexdigest()

    def save(self, *args, **kwargs):
        if not self.timestamp:
            self.timestamp = timezone.now()

        if self.previous_hash == '':
            previous = AuditoriaLog.objects.order_by('timestamp', 'id').last()
            if previous and previous.hash:
                self.previous_hash = previous.hash
            elif previous:
                self.previous_hash = ''

        if not self.hash:
            self.hash = self.compute_hash()

        super().save(*args, **kwargs)
        recomputed = self.compute_hash()
        if self.hash != recomputed:
            self.hash = recomputed
            super().save(update_fields=['hash'])
