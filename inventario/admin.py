from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Bien

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Información Adicional (Gestión Bienes)', {'fields': ('rol', 'cedula')}),
    )
    list_display = ('username', 'email', 'first_name', 'last_name', 'rol', 'is_staff')

admin.site.register(Usuario, CustomUserAdmin)
admin.site.register(Bien)