"""
NIST AU-2: Middleware para logging y auditoría
"""
from inventario.models import AuditoriaLog
import logging

logger = logging.getLogger(__name__)


def get_client_ip(request):
    """Obtener dirección IP del cliente"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', '0.0.0.0')
    return ip


class AuditoriaMiddleware:
    """NIST AU: Registrar todas las acciones del usuario"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.rutas_excluidas = [
            '/admin/',
            '/static/',
            '/media/',
            '/api/login/',
        ]
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Solo registrar rutas importantes
        debe_registrar = not any(request.path.startswith(ruta) for ruta in self.rutas_excluidas)
        
        if debe_registrar and request.user.is_authenticated:
            try:
                ip = get_client_ip(request)
                user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]
                
                # Mapear métodos HTTP a acciones
                accion_map = {
                    'POST': 'CREATE',
                    'GET': 'READ',
                    'PUT': 'UPDATE',
                    'PATCH': 'UPDATE',
                    'DELETE': 'DELETE',
                }
                accion = accion_map.get(request.method, 'READ')
                
                mitre_tactic = 'Persistence'
                mitre_technique = 'T1078'

                if accion == 'READ':
                    mitre_tactic = 'Discovery'
                    mitre_technique = 'T1082'
                elif accion == 'UPDATE':
                    mitre_tactic = 'Defense Evasion'
                    mitre_technique = 'T1562'
                elif accion == 'DELETE':
                    mitre_tactic = 'Impact'
                    mitre_technique = 'T1485'

                audit = AuditoriaLog.objects.create(
                    usuario=request.user,
                    accion=accion,
                    tabla=request.path[:100],
                    ip_address=ip,
                    user_agent=user_agent,
                    detalles=f"Status: {response.status_code}",
                    mitre_tactic=mitre_tactic,
                    mitre_technique=mitre_technique,
                )
                logger.info(
                    f"Auditoría creada: usuario={request.user} acción={accion} path={request.path} "
                    f"status={response.status_code} mitre_tactic={mitre_tactic} "
                    f"mitre_technique={mitre_technique} id={audit.id}"
                )
            except Exception as e:
                logger.error(f"Error registrando auditoría: {str(e)}")
        
        return response


class SeguridadHeadersMiddleware:
    """NIST SC: Agregar headers de seguridad"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Headers de seguridad NIST
        response['X-Content-Type-Options'] = 'nosniff'  # Prevenir MIME type sniffing
        response['X-Frame-Options'] = 'DENY'  # Prevenir Clickjacking
        response['X-XSS-Protection'] = '1; mode=block'  # Protección XSS
        response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'  # HTTPS only
        
        return response
