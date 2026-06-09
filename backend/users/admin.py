from django.contrib import admin
from django.contrib.auth.models import Group
from .models import SellerApplication

@admin.register(SellerApplication)
class SellerApplicationAdmin(admin.ModelAdmin):
    list_display  = ['shop_name', 'user', 'phone', 'business_type', 'status', 'applied_at']
    list_filter   = ['status']
    actions       = ['approve_sellers', 'reject_sellers']

    def approve_sellers(self, request, queryset):
        group, _ = Group.objects.get_or_create(name='Seller')
        for app in queryset:
            app.status = 'approved'
            app.save()
            app.user.groups.add(group)
        self.message_user(request, f'{queryset.count()} seller(s) approved.')
    approve_sellers.short_description = 'Approve selected sellers'

    def reject_sellers(self, request, queryset):
        queryset.update(status='rejected')
        self.message_user(request, f'{queryset.count()} seller(s) rejected.')
    reject_sellers.short_description = 'Reject selected sellers'
