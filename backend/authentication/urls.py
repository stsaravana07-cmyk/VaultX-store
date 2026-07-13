from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, MyTokenObtainPairView, UserProfileView, LogoutView,
    SendOTPView, PasswordResetSendOTPView, PasswordResetVerifyOTPView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('otp/send/', SendOTPView.as_view(), name='send_otp'),
    path('password-reset/send-otp/', PasswordResetSendOTPView.as_view(), name='password_reset_send_otp'),
    path('password-reset/verify-otp/', PasswordResetVerifyOTPView.as_view(), name='password_reset_verify_otp'),
]
