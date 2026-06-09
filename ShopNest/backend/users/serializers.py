from django.contrib.auth.models import User
from rest_framework import serializers
from .models import SellerApplication


class SellerApplicationSerializer(serializers.ModelSerializer):
    user_name  = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    user_id    = serializers.SerializerMethodField()

    class Meta:
        model  = SellerApplication
        fields = ['id', 'user', 'user_id', 'user_name', 'user_email',
                  'shop_name', 'phone', 'business_type', 'address',
                  'description', 'status', 'is_suspended',
                  'applied_at', 'reviewed_at', 'admin_note']

    def get_user_name(self, obj):
        return (obj.user.first_name + ' ' + obj.user.last_name).strip() or obj.user.username

    def get_user_email(self, obj):
        return obj.user.email

    def get_user_id(self, obj):
        return obj.user.id


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)
    role      = serializers.ChoiceField(choices=['buyer', 'seller'], default='buyer')
    # Seller-only fields (optional for buyers)
    shop_name        = serializers.CharField(required=False, allow_blank=True, default='')
    phone            = serializers.CharField(required=False, allow_blank=True, default='')
    business_type    = serializers.CharField(required=False, allow_blank=True, default='')
    address          = serializers.CharField(required=False, allow_blank=True, default='')
    shop_description = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model  = User
        fields = ['first_name', 'last_name', 'email', 'username', 'password', 'password2',
                  'role', 'shop_name', 'phone', 'business_type', 'address', 'shop_description']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Passwords do not match.'})
        # Enforce unique email (case-insensitive)
        email = data.get('email', '').strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({'email': 'This email is already registered.'})
        if data.get('role') == 'seller':
            if not data.get('shop_name', '').strip():
                raise serializers.ValidationError({'shop_name': 'Shop name is required for sellers.'})
            if not data.get('phone', '').strip():
                raise serializers.ValidationError({'phone': 'Phone number is required for sellers.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        role             = validated_data.pop('role', 'buyer')
        shop_name        = validated_data.pop('shop_name', '')
        phone            = validated_data.pop('phone', '')
        business_type    = validated_data.pop('business_type', '')
        address          = validated_data.pop('address', '')
        shop_description = validated_data.pop('shop_description', '')
        password         = validated_data.pop('password')

        # Normalise email to lowercase
        validated_data['email'] = validated_data.get('email', '').strip().lower()

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if role == 'seller':
            SellerApplication.objects.create(
                user=user,
                shop_name=shop_name,
                phone=phone,
                business_type=business_type,
                address=address,
                description=shop_description,
                status='pending'
            )
        return user


class SellerRegisterSerializer(serializers.Serializer):
    """
    Allows an existing buyer to submit a seller application,
    OR a new user to register directly as a seller (pending approval).
    """
    shop_name     = serializers.CharField(min_length=2)
    phone         = serializers.CharField(min_length=5)
    business_type = serializers.CharField(required=False, allow_blank=True, default='')
    address       = serializers.CharField(required=False, allow_blank=True, default='')
    description   = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, data):
        user = self.context['request'].user
        if hasattr(user, 'seller_application'):
            raise serializers.ValidationError(
                'You already have a seller application (status: %s).' %
                user.seller_application.status
            )
        return data

    def save(self):
        user = self.context['request'].user
        return SellerApplication.objects.create(
            user=user,
            shop_name=self.validated_data['shop_name'],
            phone=self.validated_data['phone'],
            business_type=self.validated_data.get('business_type', ''),
            address=self.validated_data.get('address', ''),
            description=self.validated_data.get('description', ''),
            status='pending',
        )


class UserSerializer(serializers.ModelSerializer):
    full_name     = serializers.SerializerMethodField()
    role          = serializers.SerializerMethodField()
    seller_status = serializers.SerializerMethodField()
    shop_name     = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'full_name', 'role', 'seller_status', 'shop_name', 'date_joined']

    def get_full_name(self, obj):
        return (obj.first_name + ' ' + obj.last_name).strip() or obj.username

    def get_role(self, obj):
        if obj.is_staff or obj.is_superuser:
            return 'admin'
        if obj.groups.filter(name='Seller').exists():
            if hasattr(obj, 'seller_application') and obj.seller_application.is_suspended:
                return 'seller_pending'
            return 'seller'
        if hasattr(obj, 'seller_application'):
            return 'seller_pending'
        return 'buyer'

    def get_seller_status(self, obj):
        if hasattr(obj, 'seller_application'):
            return obj.seller_application.status
        if obj.groups.filter(name='Seller').exists():
            return 'approved'
        return 'none'

    def get_shop_name(self, obj):
        if hasattr(obj, 'seller_application'):
            return obj.seller_application.shop_name
        return ''
