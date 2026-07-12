# backend/inventario/views.py
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import Bien, Usuario, AuditoriaLog
from .serializers import BienSerializer, AuditoriaLogSerializer
from rest_framework import serializers
from inventario.middleware import get_client_ip
import logging

logger = logging.getLogger(__name__)
from django.core.cache import cache
from django.core.mail import send_mail
from django.conf import settings


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'password', 'rol', 'cedula', 'first_name', 'last_name', 'email']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = Usuario(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password is not None and password != '':
            instance.set_password(password)
        instance.save()
        return instance

class IsAdministrador(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'Administrador'

class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if not user:
            # Registrar intento fallido en auditoría
            ip = get_client_ip(request)
            try:
                AuditoriaLog.objects.create(
                    usuario=Usuario.objects.filter(username=username).first() or Usuario.objects.filter(cedula=username).first() or None,
                    accion='LOGIN',
                    tabla='auth',
                    ip_address=ip,
                    user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                    detalles='Login fallido',
                    mitre_tactic='Credential Access',
                    mitre_technique='T1110'
                )
            except Exception:
                pass
            logger.warning(
                f"ESP - Login fallido: usuario={username} ip={ip} "
                f"mitre_tactic=Credential Access mitre_technique=T1110"
            )

            # Contador en cache por IP
            cache_key = f"failed_login:{ip}"
            count = cache.get(cache_key, 0) + 1
            cache.set(cache_key, count, timeout=getattr(settings, 'FAILED_LOGIN_WINDOW', 300))

            # Si supera umbral, enviar alerta (por consola/email)
            if count >= getattr(settings, 'FAILED_LOGIN_THRESHOLD', 5):
                subject = f"Alerta: {count} intentos fallidos de login desde {ip}"
                message = (
                    f"Se han detectado {count} intentos fallidos de inicio de sesión desde la IP {ip} "
                    f"en el sistema GestionBienes.\nUsuario objetivo: {username}\nTiempo: {timezone.now()}"
                )
                logger.warning(f"ESP ALERT - {subject}")
                try:
                    send_mail(subject, message, None, [a[1] for a in getattr(settings, 'ADMINS', [])])
                except Exception:
                    # fallback to print
                    print(f"ESP ALERT - {subject} | {message}")

            return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_400_BAD_REQUEST)

        token, created = Token.objects.get_or_create(user=user)
        
        # NIST AU-2: Registrar login exitoso
        ip = get_client_ip(request)
        AuditoriaLog.objects.create(
            usuario=user,
            accion='LOGIN',
            tabla='auth',
            ip_address=ip,
            user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
            detalles='Login exitoso',
            mitre_tactic='Credential Access',
            mitre_technique='T1110'
        )

        # Mensaje en logs y consola para facilitar pruebas (muestra ESP)
        logger.info(
            f"ESP - Login exitoso: {user.username} desde {ip} "
            f"mitre_tactic=Credential Access mitre_technique=T1110"
        )
        try:
            print(f"ESP - Login exitoso: {user.username} desde {ip}")
        except Exception:
            pass
        
        return Response({
            'token': token.key,
            'username': user.username,
            'rol': getattr(user, 'rol', 'Docente')
        }, status=status.HTTP_200_OK)

class CrearUsuarioView(APIView):
    """NIST IA-5: Gestión de Autenticación"""
    permission_classes = [IsAdministrador]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        rol = request.data.get('rol', 'Docente')
        cedula = request.data.get('cedula')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')

        if not username or not password:
            return Response(
                {'error': 'Usuario y contraseña son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # NIST IA-5: Validar contraseña fuerte
        try:
            validate_password(password, user=Usuario(username=username))
        except ValidationError as e:
            return Response(
                {'error': 'Contraseña no cumple requisitos de seguridad: ' + str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar usuario no exista
        if Usuario.objects.filter(username=username).exists():
            return Response(
                {'error': 'El usuario ya existe'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = Usuario.objects.create_user(
                username=username,
                password=password,
                email=email,
                rol=rol,
                cedula=cedula,
                first_name=first_name,
                last_name=last_name
            )
            
            # NIST AU-2: Registrar creación de usuario
            ip = get_client_ip(request)
            AuditoriaLog.objects.create(
                usuario=request.user,
                accion='CREATE',
                tabla='usuario',
                objeto_id=user.id,
                ip_address=ip,
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                detalles=f'Usuario creado: {username} con rol {rol}',
                mitre_tactic='Persistence',
                mitre_technique='T1136'
            )
            logger.info(
                f"ESP - Usuario creado: {username} por {request.user} "
                f"mitre_tactic=Persistence mitre_technique=T1136"
            )
            
            return Response({
                'mensaje': 'Usuario creado exitosamente',
                'usuario': {
                    'id': user.id,
                    'username': user.username,
                    'rol': user.rol,
                    'email': user.email
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': f'Error creando usuario: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class BienViewSet(viewsets.ModelViewSet):
    queryset = Bien.objects.all()
    serializer_class = BienSerializer
    permission_classes = [IsAuthenticated]

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAdministrador]

class AuditoriaChainView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logs = AuditoriaLog.objects.order_by('timestamp', 'id')
        serializer = AuditoriaLogSerializer(logs, many=True)
        return Response(serializer.data)