from django.urls import path
from .views import DashboardStatsView, CustomerManagementView, ExportSalesReportView

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('customers/', CustomerManagementView.as_view(), name='dashboard_customers'),
    path('reports/sales/', ExportSalesReportView.as_view(), name='dashboard_export_sales'),
]
