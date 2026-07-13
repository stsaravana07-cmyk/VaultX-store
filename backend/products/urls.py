from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, BannerViewSet, HeroAvatarViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'items', ProductViewSet, basename='product')
router.register(r'banners', BannerViewSet, basename='banner')
router.register(r'hero-avatars', HeroAvatarViewSet, basename='hero-avatar')

urlpatterns = [
    path('', include(router.urls)),
]
