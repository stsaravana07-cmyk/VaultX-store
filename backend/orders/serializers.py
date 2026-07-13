from rest_framework import serializers
from products.models import Product
from products.serializers import ProductSerializer
from .models import CartItem, WishlistItem, Order, OrderItem

class CartItemReadSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ('id', 'product', 'quantity', 'subtotal')

    def get_subtotal(self, obj):
        return round(float(obj.product.final_price) * obj.quantity, 2)

class CartItemWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ('product', 'quantity')

class WishlistItemReadSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = WishlistItem
        fields = ('id', 'product')

class WishlistItemWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = WishlistItem
        fields = ('product',)

class OrderItemSerializer(serializers.ModelSerializer):
    image_url = serializers.CharField(source='product.image_url', read_only=True)
    category = serializers.CharField(source='product.category.name', read_only=True)
    sku = serializers.CharField(source='product.SKU', read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'quantity', 'price', 'image_url', 'category', 'sku')

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'user', 'username', 'status', 'payment_method', 'full_name', 
            'email', 'phone', 'address', 'city', 'zip_code', 'total_amount', 
            'discount_amount', 'tax_amount', 'grand_total', 'coupon_code', 
            'items', 'created_at', 'updated_at'
        )
        read_only_fields = ('user', 'status', 'total_amount', 'grand_total', 'tax_amount', 'discount_amount')
