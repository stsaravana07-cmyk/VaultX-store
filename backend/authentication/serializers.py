from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'is_customer', 'is_admin', 'phone', 'address', 'city', 'zip_code')
        read_only_fields = ('id', 'email', 'is_customer', 'is_admin')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'phone', 'address', 'city', 'zip_code', 'is_admin')
        extra_kwargs = {
            'phone': {'required': False},
            'address': {'required': False},
            'city': {'required': False},
            'zip_code': {'required': False},
            'is_admin': {'required': False},
        }
        
    def create(self, validated_data):
        password = validated_data.pop('password')
        is_admin = validated_data.get('is_admin', False)
        # Check if email contains admin keywords or it's requested, but default is customer
        # We allow setting is_admin if register payload sends it, or is_customer = True if not.
        is_customer = not is_admin
        
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=password,
            is_admin=is_admin,
            is_customer=is_customer,
            phone=validated_data.get('phone', ''),
            address=validated_data.get('address', ''),
            city=validated_data.get('city', ''),
            zip_code=validated_data.get('zip_code', ''),
        )
        return user
