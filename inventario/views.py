import hashlib
import base64
import time
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import Bien, Usuario
from .serializers import BienSerializer
from rest_framework import serializers
from cryptography.fernet import Fernet

KERBEROS_KDC_KEY = Fernet.generate_key()
cipher_suite = Fernet(KERBEROS_KDC_KEY)

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

        token, _ = Token.objects.get_or_create(user=user)

        access_token_bytes = hashlib.sha256(f"{username}{time.time()}".encode()).digest()
        oauth_access_token = base64.b64encode(access_token_bytes).decode('utf-8')
        timestamp_actual = str(int(time.time()))
        ticket_data = f"REALM=ESPE.EDU.EC|PRINCIPAL={username}|AUTH_TIME={timestamp_actual}"
        kerberos_ticket_encrypted = cipher_suite.encrypt(ticket_data.encode()).decode('utf-8')
        
        return Response({
            'authentication_status': 'SUCCESS',
            'username': user.username,
            'rol': getattr(user, 'rol', 'Administrador'),
            'token': token.key,
            'oauth_2.0': {
                'token_type': 'Bearer',
                'access_token': f"eyXo.{oauth_access_token}",
                'expires_in': 3600
            },
            'kerberos_auth': {
                'realm': 'ESPE.EDU.EC',
                'service_principal': 'HTTP/localhost@ESPE.EDU.EC',
                'ticket_tgs_encrypted': kerberos_ticket_encrypted,
                'anti_replay_timestamp': timestamp_actual
            }
        }, status=status.HTTP_200_OK)

class BienViewSet(viewsets.ModelViewSet):
    queryset = Bien.objects.all()
    serializer_class = BienSerializer
    permission_classes = [IsAuthenticated]

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAdministrador]
import hashlib
import base64
import time
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import Bien, Usuario
from .serializers import BienSerializer
from rest_framework import serializers
from cryptography.fernet import Fernet

KERBEROS_KDC_KEY = Fernet.generate_key()
cipher_suite = Fernet(KERBEROS_KDC_KEY)

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

        token, _ = Token.objects.get_or_create(user=user)

        access_token_bytes = hashlib.sha256(f"{username}{time.time()}".encode()).digest()
        oauth_access_token = base64.b64encode(access_token_bytes).decode('utf-8')
        timestamp_actual = str(int(time.time()))
        ticket_data = f"REALM=ESPE.EDU.EC|PRINCIPAL={username}|AUTH_TIME={timestamp_actual}"
        kerberos_ticket_encrypted = cipher_suite.encrypt(ticket_data.encode()).decode('utf-8')
        
        return Response({
            'authentication_status': 'SUCCESS',
            'username': user.username,
            'rol': getattr(user, 'rol', 'Administrador'),
            'token': token.key,
            'oauth_2.0': {
                'token_type': 'Bearer',
                'access_token': f"eyXo.{oauth_access_token}",
                'expires_in': 3600
            },
            'kerberos_auth': {
                'realm': 'ESPE.EDU.EC',
                'service_principal': 'HTTP/localhost@ESPE.EDU.EC',
                'ticket_tgs_encrypted': kerberos_ticket_encrypted,
                'anti_replay_timestamp': timestamp_actual
            }
        }, status=status.HTTP_200_OK)

class BienViewSet(viewsets.ModelViewSet):
    queryset = Bien.objects.all()
    serializer_class = BienSerializer
    permission_classes = [IsAuthenticated]

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAdministrador]