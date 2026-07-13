from rest_framework.views import APIView
from rest_framework import permissions, status
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.http import HttpResponse
from openpyxl import Workbook
from datetime import timedelta
import decimal

from products.models import Product, Category
from orders.models import Order, OrderItem

User = get_user_model()

class IsAdminUserCustom(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, 'is_admin', False))

class AdminRequiredMixin:
    permission_classes = [IsAdminUserCustom]

class DashboardStatsView(AdminRequiredMixin, APIView):
    def get(self, request):
        now = timezone.now()
        today = now.date()
        
        # Date boundaries
        start_of_week = today - timedelta(days=today.weekday())
        start_of_month = today.replace(day=1)
        start_of_year = today.replace(month=1, day=1)
        
        # Base orders (excluding cancelled)
        valid_orders = Order.objects.exclude(status='Cancelled')
        
        # Calculations
        today_sales = valid_orders.filter(created_at__date=today).aggregate(val=Sum('grand_total'))['val'] or 0.0
        weekly_sales = valid_orders.filter(created_at__date__gte=start_of_week).aggregate(val=Sum('grand_total'))['val'] or 0.0
        monthly_sales = valid_orders.filter(created_at__date__gte=start_of_month).aggregate(val=Sum('grand_total'))['val'] or 0.0
        yearly_sales = valid_orders.filter(created_at__date__gte=start_of_year).aggregate(val=Sum('grand_total'))['val'] or 0.0
        
        total_revenue = valid_orders.aggregate(val=Sum('grand_total'))['val'] or 0.0
        total_profit = float(total_revenue) * 0.40  # Mock 40% profit margin
        
        total_orders_count = Order.objects.count()
        total_customers_count = User.objects.filter(is_customer=True).count()
        
        # Stock checks
        low_stock_count = Product.objects.filter(stock__gt=0, stock__lte=5).count()
        out_of_stock_count = Product.objects.filter(stock=0).count()
        
        # Top products
        top_items = OrderItem.objects.values('product__name', 'product__image_url') \
            .annotate(qty=Sum('quantity'), rev=Sum('price')) \
            .order_by('-qty')[:5]
            
        top_products = []
        for item in top_items:
            if item['product__name']:
                top_products.append({
                    'name': item['product__name'],
                    'image_url': item['product__image_url'],
                    'sales_count': item['qty'],
                    'revenue': float(item['rev'] or 0)
                })

        # Chart data (Daily sales last 7 days)
        chart_data = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_orders = valid_orders.filter(created_at__date=day)
            sales = day_orders.aggregate(val=Sum('grand_total'))['val'] or 0.0
            order_count = day_orders.count()
            chart_data.append({
                'date': day.strftime('%a'),
                'sales': float(sales),
                'orders': order_count
            })

        return Response({
            'today_sales': float(today_sales),
            'weekly_sales': float(weekly_sales),
            'monthly_sales': float(monthly_sales),
            'yearly_sales': float(yearly_sales),
            'total_revenue': float(total_revenue),
            'total_profit': total_profit,
            'total_orders': total_orders_count,
            'total_customers': total_customers_count,
            'low_stock_count': low_stock_count,
            'out_of_stock_count': out_of_stock_count,
            'top_products': top_products,
            'chart_data': chart_data
        })

class CustomerManagementView(AdminRequiredMixin, APIView):
    def get(self, request):
        customers = User.objects.exclude(is_superuser=True).order_by('-id')
        data = []
        for c in customers:
            order_count = Order.objects.filter(user=c).count()
            total_spent = Order.objects.filter(user=c).exclude(status='Cancelled').aggregate(val=Sum('grand_total'))['val'] or 0.0
            data.append({
                'id': c.id,
                'email': c.email,
                'username': c.username,
                'phone': c.phone,
                'address': c.address,
                'is_active': c.is_active,
                'order_count': order_count,
                'total_spent': float(total_spent)
            })
        return Response(data)

    def post(self, request):
        customer_id = request.data.get('customer_id')
        action = request.data.get('action') # "block", "unblock", "delete"
        
        customer = get_user_model().objects.filter(id=customer_id).exclude(is_superuser=True).first()
        if not customer:
            return Response({"detail": "Customer not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if action == "block":
            customer.is_active = False
            customer.save()
            return Response({"message": "Customer blocked successfully"})
        elif action == "unblock":
            customer.is_active = True
            customer.save()
            return Response({"message": "Customer unblocked successfully"})
        elif action == "delete":
            customer.delete()
            return Response({"message": "Customer deleted successfully"})
            
        return Response({"detail": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

class ExportSalesReportView(AdminRequiredMixin, APIView):
    def get(self, request):
        # Generate Excel spreadsheet using openpyxl
        wb = Workbook()
        ws = wb.active
        ws.title = "Sales Report"

        # Headers
        headers = ["Order ID", "Date", "Customer", "Email", "Items Count", "Subtotal", "Discount", "Tax", "Grand Total", "Status", "Payment Method"]
        ws.append(headers)

        orders = Order.objects.all().order_by('-created_at')
        for order in orders:
            ws.append([
                order.id,
                order.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                order.full_name,
                order.email,
                order.items.count(),
                float(order.total_amount),
                float(order.discount_amount),
                float(order.tax_amount),
                float(order.grand_total),
                order.status,
                order.payment_method
            ])

        # Setup HTTP response
        response = HttpResponse(content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        response["Content-Disposition"] = "attachment; filename=superhero_sales_report.xlsx"
        
        wb.save(response)
        return response
