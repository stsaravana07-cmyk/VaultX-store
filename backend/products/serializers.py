from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Category, Product, ProductGallery, Review, Banner

User = get_user_model()

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductGallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductGallery
        fields = ('id', 'image_url')

class UserReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Review
        fields = ('id', 'username', 'rating', 'comment', 'created_at')

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Review
        fields = ('id', 'product', 'user', 'username', 'rating', 'comment', 'created_at')
        read_only_fields = ('user',)

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    gallery = ProductGallerySerializer(many=True, read_only=True)
    reviews = UserReviewSerializer(many=True, read_only=True)
    final_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'category', 'category_name', 'description', 
            'price', 'discount', 'final_price', 'stock', 'SKU', 'rating', 
            'image_url', 'gallery', 'reviews', 'created_at'
        )

class ProductWriteSerializer(serializers.ModelSerializer):
    # This serializer handles writes (create/update) for Products, with category ID
    class Meta:
        model = Product
        fields = '__all__'

class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = '__all__'

from .models import HeroAvatar
class HeroAvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroAvatar
        fields = '__all__'
