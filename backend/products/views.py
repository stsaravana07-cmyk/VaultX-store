from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Avg
from django.utils.text import slugify
from .models import Category, Product, ProductGallery, Review, Banner
from .serializers import (
    CategorySerializer, ProductSerializer, ProductWriteSerializer,
    ProductGallerySerializer, ReviewSerializer, BannerSerializer
)

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_admin

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-created_at')
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductWriteSerializer
        return ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.all().order_by('-created_at')
        
        # Search filter
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) |
                Q(SKU__icontains=search)
            )
            
        # Category filter
        category_slug = self.request.query_params.get('category', None)
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
            
        # Price filtering
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
            
        # Rating filtering
        min_rating = self.request.query_params.get('rating', None)
        if min_rating:
            queryset = queryset.filter(rating__gte=min_rating)

        # Ordering
        ordering = self.request.query_params.get('ordering', None)
        if ordering == 'price_asc':
            queryset = queryset.order_by('price')
        elif ordering == 'price_desc':
            queryset = queryset.order_by('-price')
        elif ordering == 'rating':
            queryset = queryset.order_by('-rating')
        elif ordering == 'newest':
            queryset = queryset.order_by('-created_at')

        return queryset

    # Search suggestions (for AI / live search)
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def suggestions(self, request):
        query = request.query_params.get('q', '')
        if len(query) < 2:
            return Response([])
        
        # Simulating AI suggestions + normal string matches
        products = Product.objects.filter(name__icontains=query)[:8]
        suggestions = []
        for p in products:
            suggestions.append({
                'id': p.id,
                'name': p.name,
                'slug': p.slug,
                'category': p.category.name,
                'image_url': p.image_url,
                'price': float(p.price)
            })
            
        # Add basic dynamic superhero suggestion prompts if it matches themes
        themes = ["suit", "weapon", "magic", "armor", "shield", "mask", "helmet"]
        for theme in themes:
            if query.lower() in theme:
                suggestions.append({
                    'id': None,
                    'name': f"Discover premium {theme} weapons & gear",
                    'is_prompt': True,
                    'theme': theme
                })
        return Response(suggestions)

    # Review addition
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_review(self, request, slug=None):
        product = self.get_object()
        data = request.data.copy()
        data['product'] = product.id
        
        serializer = ReviewSerializer(data=data)
        if serializer.is_valid():
            # Check if user already reviewed this product
            existing_review = Review.objects.filter(product=product, user=request.user).first()
            if existing_review:
                existing_review.rating = serializer.validated_data['rating']
                existing_review.comment = serializer.validated_data['comment']
                existing_review.save()
                review = existing_review
            else:
                review = serializer.save(user=request.user)
            
            # Recalculate product rating
            avg_rating = Review.objects.filter(product=product).aggregate(Avg('rating'))['rating__avg']
            product.rating = avg_rating if avg_rating is not None else 0.0
            product.save()
            
            return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Gallery upload/update (admin only)
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def upload_gallery(self, request, slug=None):
        if not request.user.is_admin:
            return Response({"detail": "Only admins can upload images"}, status=status.HTTP_403_FORBIDDEN)
            
        product = self.get_object()
        image_urls = request.data.get('image_urls', [])
        
        # Clear existing gallery if overwrite is specified
        if request.data.get('clear_existing', False):
            ProductGallery.objects.filter(product=product).delete()
            
        galleries = []
        for url in image_urls:
            gallery_item = ProductGallery.objects.create(product=product, image_url=url)
            galleries.append(gallery_item)
            
        return Response(ProductGallerySerializer(galleries, many=True).data, status=status.HTTP_201_CREATED)

    # Image upload from local storage (admin only)
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def upload_image(self, request):
        if not request.user.is_admin:
            return Response({"detail": "Only admins can upload images"}, status=status.HTTP_403_FORBIDDEN)
            
        file = request.FILES.get('file')
        if not file:
            return Response({"detail": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
            
        from django.core.files.storage import default_storage
        from django.conf import settings
        import uuid
        import os
        
        # Keep original extension, generate unique filename to avoid overwrites
        ext = os.path.splitext(file.name)[1]
        unique_name = f"uploads/{uuid.uuid4().hex}{ext}"
        
        filename = default_storage.save(unique_name, file)
        file_url = request.build_absolute_uri(settings.MEDIA_URL + filename)
        
        return Response({"image_url": file_url}, status=status.HTTP_201_CREATED)

class BannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.all().order_by('-created_at')
    serializer_class = BannerSerializer
    permission_classes = [IsAdminOrReadOnly]

from .models import HeroAvatar
from .serializers import HeroAvatarSerializer

class HeroAvatarViewSet(viewsets.ModelViewSet):
    queryset = HeroAvatar.objects.all().order_by('-created_at')
    serializer_class = HeroAvatarSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'hero_id'
