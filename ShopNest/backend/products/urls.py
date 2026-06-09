from django.urls import path
from . import views

urlpatterns = [
    # Public
    path('',                          views.product_list,           name='product-list'),
    path('<int:pk>/',                 views.product_detail,         name='product-detail'),
    path('categories/',               views.category_list,          name='category-list'),
    # Seller — /api/products/seller/my/ (GET list + POST create)
    path('seller/my/',                views.seller_my_and_create,   name='seller-my'),
    path('seller/my/<int:pk>/',       views.seller_product_manage,  name='seller-manage'),
    # Legacy aliases kept for compatibility
    path('seller/add/',               views.seller_add_product,     name='seller-add'),
    path('seller/mine/',              views.seller_my_products,     name='seller-mine'),
    path('seller/<int:pk>/',          views.seller_product_manage,  name='seller-manage-old'),
    # Admin
    path('admin/pending/',            views.admin_pending_products, name='admin-pending'),
    path('admin/all/',                views.admin_all_products,     name='admin-all'),
    path('admin/approve/<int:pk>/',   views.admin_approve_product,  name='admin-approve'),
    path('admin/<int:pk>/toggle/',    views.admin_toggle_product,   name='admin-toggle'),
    path('admin/stats/',              views.admin_dashboard_stats,  name='admin-stats'),
    path('admin/sales/',              views.admin_sales_stats,      name='admin-sales'),
]
