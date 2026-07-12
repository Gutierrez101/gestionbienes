from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BienViewSet, UsuarioViewSet, LoginView, CrearUsuarioView, AuditoriaChainView

router = DefaultRouter()
router.register(r'bienes',BienViewSet)
router.register(r"usuarios",UsuarioViewSet)

urlpatterns = [
    path('login/',LoginView.as_view(), name='api_login'),
    path('crear-usuario/', CrearUsuarioView.as_view(), name='crear_usuario'),  # NIST IA-5
    path('auditoria-chain/', AuditoriaChainView.as_view(), name='auditoria_chain'),
    path('', include(router.urls)),
]