from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Bien, AuditoriaLog

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Información Adicional (Gestión Bienes)', {'fields': ('rol', 'cedula')}),
    )
    list_display = ('username', 'email', 'first_name', 'last_name', 'rol', 'is_staff')

class AuditoriaLogAdmin(admin.ModelAdmin):
    """NIST AU-2: Panel de auditoría"""
    list_display = ('usuario', 'accion', 'tabla', 'ip_address', 'timestamp')
    list_filter = ('accion', 'tabla', 'timestamp', 'usuario')
    search_fields = ('usuario__username', 'ip_address', 'tabla')
    readonly_fields = ('usuario', 'accion', 'tabla', 'objeto_id', 'ip_address', 'user_agent', 'detalles', 'timestamp')
    
    def has_delete_permission(self, request):
        return False  # No permitir borrar logs de auditoría
    
    def has_add_permission(self, request):
        return False  # No permitir agregar logs manualmente

admin.site.register(Usuario, CustomUserAdmin)
admin.site.register(Bien)
admin.site.register(AuditoriaLog, AuditoriaLogAdmin)