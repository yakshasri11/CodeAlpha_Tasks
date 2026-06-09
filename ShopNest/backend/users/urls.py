from django.urls import path
from . import views

urlpatterns = [
    path('register/',                              views.register_view,            name='register'),
    path('login/',                                 views.login_view,               name='login'),
    path('logout/',                                views.logout_view,              name='logout'),
    path('me/',                                    views.me_view,                  name='me'),
    path('all/',                                   views.all_users_view,           name='all-users'),
    path('<int:pk>/delete/',                        views.delete_user_view,         name='delete-user'),
    path('orders/all/',                            views.all_orders_view,          name='all-orders'),
    path('seller-applications/',                   views.seller_applications_view, name='seller-apps'),
    path('seller-applications/<int:pk>/review/',   views.review_seller_view,       name='review-seller'),
    # Seller self-service
    path('seller/register/',                       views.seller_register_view,     name='seller-register'),
    path('seller/status/',                         views.my_seller_status_view,    name='seller-status'),
]
