# backend/inventario/views.py
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import Bien, Usuario, AuditoriaLog
from .serializers import BienSerializer
from rest_framework import serializers
from inventario.middleware import get_client_ip


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'password', 'rol', 'cedula', 'first_name', 'last_name', 'email']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = Usuario.objects.create_user(**validated_data)
        return user

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
            detalles='Login exitoso'
        )
        
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
                detalles=f'Usuario creado: {username} con rol {rol}'
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