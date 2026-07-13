from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.db.models import Q
from .serializers import RegisterSerializer, UserSerializer
from .models import OTPVerification
from .utils import generate_otp
from .email_service import EmailService

User = get_user_model()

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'username': self.user.username,
            'is_customer': self.user.is_customer,
            'is_admin': self.user.is_admin,
            'phone': self.user.phone,
            'address': self.user.address,
            'city': self.user.city,
            'zip_code': self.user.zip_code
        }
        return data

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        email = request.data.get('email')
        otp = request.data.get('otp')
        
        if not email or not otp:
            return Response({"error": "Multiverse email and OTP verification code are required for enlistment."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Verify OTP
        otp_entry = OTPVerification.objects.filter(email=email, otp=otp).first()
        if not otp_entry:
            return Response({"error": "Access Denied: Invalid or expired email OTP verification code."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Check Expiry
        if otp_entry.is_expired():
            otp_entry.delete()
            return Response({"error": "Access Denied: Email OTP verification code has expired (5-minute limit reached)."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Create user
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Send Welcome Email
        EmailService.send_welcome_email(user.email, user.username)
        
        # Invalidate OTP on successful verification to prevent reuse
        otp_entry.delete()
        
        user_data = UserSerializer(user).data
        return Response({
            "message": "User registered successfully",
            "user": user_data
        }, status=status.HTTP_201_CREATED)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

class LogoutView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)

class SendOTPView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Multiverse email address is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Verify if email already exists
        if User.objects.filter(email=email).exists():
            return Response({"error": "Coordinates already linked to an active operative (Email already exists)."}, status=status.HTTP_400_BAD_REQUEST)
            
        otp = generate_otp()
        # Save OTP in database
        OTPVerification.objects.filter(email=email).delete()
        OTPVerification.objects.create(email=email, otp=otp)
        
        # Reusable service transmits HTML email and returns success
        success = EmailService.send_otp_email(email, otp)
        
        if success:
            return Response({"message": "OTP verification code transmitted to your email successfully."})
        else:
            # We return 200/success anyway to allow sandbox testing using the console logging OTP fallback
            return Response({
                "message": "OTP generated. (Gmail SMTP rate limits active - check console terminal log fallback for code)."
            })

class PasswordResetSendOTPView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        identity = request.data.get('identity')
        if not identity:
            return Response({"error": "Credential Identity (Email or Phone) is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Find user
        user = User.objects.filter(Q(email=identity) | Q(phone=identity)).first()
        if not user:
            return Response({"error": "No registered operative matching credentials found."}, status=status.HTTP_404_NOT_FOUND)
            
        email = user.email
        otp = generate_otp()
        
        # Save OTP in database using email
        OTPVerification.objects.filter(email=email).delete()
        OTPVerification.objects.create(email=email, otp=otp)
        
        # Transmit password reset OTP
        success = EmailService.send_otp_email(email, otp)
        
        if success:
            return Response({"message": f"Password reset OTP transmitted to your registered email ({email}) successfully."})
        else:
            return Response({
                "message": f"Password reset OTP generated. (Gmail SMTP rate limits active - check console terminal log fallback for code)."
            })

class PasswordResetVerifyOTPView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        identity = request.data.get('identity')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')
        
        if not identity or not otp or not new_password:
            return Response({"error": "Verification matrix incomplete (identity, otp, new_password are required)."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Find user
        user = User.objects.filter(Q(email=identity) | Q(phone=identity)).first()
        if not user:
            return Response({"error": "Operative credentials matching identity not found."}, status=status.HTTP_404_NOT_FOUND)
            
        email = user.email
        
        # Verify OTP
        otp_entry = OTPVerification.objects.filter(email=email, otp=otp).first()
        if not otp_entry:
            return Response({"error": "Access Denied: Invalid or expired email OTP verification code."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Check Expiry
        if otp_entry.is_expired():
            otp_entry.delete()
            return Response({"error": "Access Denied: Email OTP verification code has expired (5-minute limit reached)."}, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(new_password)
        user.save()
        
        # Invalidate OTP on successful verification to prevent reuse
        otp_entry.delete()
        return Response({"message": "Clearance override successful. Password updated."})
