from rest_framework import serializers
from .models import Product, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = ['id', 'name']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    seller_name   = serializers.SerializerMethodField()

    class Meta:
        model  = Product
        fields = [
            'id', 'name', 'category', 'category_name',
            'seller_name', 'description', 'price', 'old_price',
            'emoji', 'badge', 'rating', 'stock', 'sku', 'is_approved',
        ]

    def get_seller_name(self, obj):
        if obj.seller:
            return (obj.seller.first_name + ' ' + obj.seller.last_name).strip() or obj.seller.username
        return 'ShopNest'
