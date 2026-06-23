from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BienViewSet, UsuarioViewSet, LoginView

router = DefaultRouter()
router.register(r'bienes',BienViewSet)
router.register(r"usuarios",UsuarioViewSet)

urlpatterns = [
    path('login/',LoginView.as_view(), name='api_login'),
    path('', include(router.urls)),
]