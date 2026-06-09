from django.contrib import admin
from .models import Product, Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display  = ['id', 'name', 'category', 'seller', 'price', 'stock', 'badge', 'is_approved']
    list_filter   = ['category', 'badge', 'is_approved']
    list_editable = ['is_approved']
    search_fields = ['name', 'sku']
    actions       = ['approve_products']

    def approve_products(self, request, queryset):
        queryset.update(is_approved=True)
        self.message_user(request, f'{queryset.count()} products approved.')
    approve_products.short_description = 'Approve selected products'
