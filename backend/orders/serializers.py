from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model  = OrderItem
        fields = ['id', 'name', 'price', 'quantity', 'emoji']

class OrderSerializer(serializers.ModelSerializer):
    items     = OrderItemSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    # Full address as a single formatted string for display
    address_display = serializers.SerializerMethodField()

    class Meta:
        model  = Order
        fields = [
            'id', 'order_id', 'user_name', 'status',
            'subtotal', 'tax', 'shipping', 'total',
            'address_name', 'address_phone',
            'address_line1', 'address_line2',
            'address_city', 'address_state', 'address_pincode',
            'address_display',
            'payment_method',
            'items', 'created_at',
        ]

    def get_address_display(self, obj):
        parts = [
            obj.address_name,
            obj.address_phone,
            obj.address_line1,
            obj.address_line2,
            obj.address_city,
            obj.address_state,
            obj.address_pincode,
        ]
        return ', '.join(p for p in parts if p)
