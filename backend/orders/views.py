from rest_framework import viewsets, permissions, status, decorators
from rest_framework.response import Response
from django.db import transaction
from django.shortcuts import get_object_or_404
from products.models import Product
from .models import CartItem, WishlistItem, Order, OrderItem
from support.models import Notification
from .serializers import (
    CartItemReadSerializer, CartItemWriteSerializer,
    WishlistItemReadSerializer, WishlistItemWriteSerializer,
    OrderSerializer, OrderItemSerializer
)

class CartViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CartItemWriteSerializer
        return CartItemReadSerializer

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        quantity = serializer.validated_data.get('quantity', 1)
        
        # Check if item already in cart
        existing = CartItem.objects.filter(user=self.request.user, product=product).first()
        if existing:
            existing.quantity += quantity
            existing.save()
        else:
            serializer.save(user=self.request.user)

    @decorators.action(detail=False, methods=['post'])
    def clear(self, request):
        self.get_queryset().delete()
        return Response({"message": "Cart cleared successfully"}, status=status.HTTP_200_OK)

class WishlistViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create']:
            return WishlistItemWriteSerializer
        return WishlistItemReadSerializer

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        # Toggle functionality for wishlist
        product_id = request.data.get('product')
        product = get_object_or_404(Product, id=product_id)
        
        existing = WishlistItem.objects.filter(user=request.user, product=product).first()
        if existing:
            existing.delete()
            return Response({"message": "Product removed from wishlist", "in_wishlist": False}, status=status.HTTP_200_OK)
        
        WishlistItem.objects.create(user=request.user, product=product)
        return Response({"message": "Product added to wishlist", "in_wishlist": True}, status=status.HTTP_201_CREATED)

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            # Admins see all orders for dashboard management
            return Order.objects.all().order_by('-created_at')
        return Order.objects.filter(user=user).order_by('-created_at')

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        user = request.user
        cart_items = CartItem.objects.filter(user=user)
        
        if not cart_items.exists():
            return Response({"detail": "Cannot place order with empty cart"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check stock levels first
        for item in cart_items:
            if item.product.stock < item.quantity:
                return Response({
                    "detail": f"Insufficient stock for {item.product.name}. Available: {item.product.stock}"
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Extract billing & shipping details
        full_name = request.data.get('full_name', f"{user.username}")
        email = request.data.get('email', user.email)
        phone = request.data.get('phone', user.phone or "")
        address = request.data.get('address', user.address or "")
        city = request.data.get('city', user.city or "")
        zip_code = request.data.get('zip_code', user.zip_code or "")
        payment_method = request.data.get('payment_method', 'COD')
        coupon_code = request.data.get('coupon_code', '')

        # Calculate totals
        total_amount = sum(item.product.final_price * item.quantity for item in cart_items)
        
        from decimal import Decimal
        
        # Apply coupon code discounts
        discount_amount = Decimal('0.00')
        if coupon_code:
            code = coupon_code.upper().strip()
            if code == "HERO20":
                discount_amount = total_amount * Decimal('0.20')
            elif code == "SUPER50":
                discount_amount = total_amount * Decimal('0.50')
            elif code == "AVENGERS10":
                discount_amount = total_amount * Decimal('0.10')

        tax_amount = (total_amount - discount_amount) * Decimal('0.05')  # 5% tax
        grand_total = total_amount - discount_amount + tax_amount

        # Create Order
        order = Order.objects.create(
            user=user,
            payment_method=payment_method,
            full_name=full_name,
            email=email,
            phone=phone,
            address=address,
            city=city,
            zip_code=zip_code,
            total_amount=total_amount,
            discount_amount=discount_amount,
            tax_amount=tax_amount,
            grand_total=grand_total,
            coupon_code=coupon_code
        )

        # Create Order Items and decrease inventory
        for item in cart_items:
            product = item.product
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                quantity=item.quantity,
                price=product.final_price
            )
            product.stock -= item.quantity
            product.save()

        # Clear cart
        cart_items.delete()

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # Cancel order endpoint
    @decorators.action(detail=True, methods=['post'])
    def cancel_order(self, request, pk=None):
        order = self.get_object()
        
        if order.status not in ['Pending', 'Packed']:
            return Response({"detail": "Orders that are already shipped or delivered cannot be cancelled"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Refund stock
        with transaction.atomic():
            for item in order.items.all():
                if item.product:
                    item.product.stock += item.quantity
                    item.product.save()
            
            order.status = 'Cancelled'
            order.save()
            
        return Response(self.get_serializer(order).data, status=status.HTTP_200_OK)

    # Admin status update
    @decorators.action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def update_status(self, request, pk=None):
        if not request.user.is_admin:
            return Response({"detail": "Only admins can change order status"}, status=status.HTTP_403_FORBIDDEN)
            
        order = self.get_object()
        new_status = request.data.get('status')
        
        valid_statuses = [choice[0] for choice in Order.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({"detail": f"Invalid status choice. Must be one of: {valid_statuses}"}, status=status.HTTP_400_BAD_REQUEST)
            
        old_status = order.status
        order.status = new_status
        order.save()
        
        # Create Notification
        if old_status != new_status and new_status in ['Packed', 'Shipped', 'Delivered']:
            msg_map = {
                'Packed': f"Your order #{order.id} has been packed and is ready for shipping.",
                'Shipped': f"Your order #{order.id} has been shipped! Tracking information will be available soon.",
                'Delivered': f"Your order #{order.id} has been delivered. Enjoy your premium gear!"
            }
            Notification.objects.create(
                user=order.user,
                title=f"Order {new_status}",
                message=msg_map[new_status]
            )
        
        return Response(self.get_serializer(order).data, status=status.HTTP_200_OK)

    # Invoice API
    @decorators.action(detail=True, methods=['get'])
    def invoice(self, request, pk=None):
        order = self.get_object()
        items_data = []
        for item in order.items.all():
            items_data.append({
                'name': item.product_name,
                'quantity': item.quantity,
                'price': float(item.price),
                'total': float(item.price * item.quantity)
            })

        invoice_data = {
            'order_id': order.id,
            'date': order.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'customer_name': order.full_name,
            'email': order.email,
            'phone': order.phone,
            'shipping_address': f"{order.address}, {order.city} - {order.zip_code}",
            'payment_method': order.get_payment_method_display(),
            'status': order.status,
            'items': items_data,
            'subtotal': float(order.total_amount),
            'discount': float(order.discount_amount),
            'tax': float(order.tax_amount),
            'grand_total': float(order.grand_total)
        }
        return Response(invoice_data)
