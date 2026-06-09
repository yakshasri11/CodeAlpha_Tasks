from django.db import models
from django.contrib.auth.models import User
from products.models import Product

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending',    'Pending'),
        ('confirmed',  'Confirmed'),
        ('shipped',    'Shipped'),
        ('delivered',  'Delivered'),
        ('cancelled',  'Cancelled'),
    ]
    PAYMENT_CHOICES = [
        ('upi', 'UPI'),
        ('cod', 'Cash on Delivery'),
    ]
    user            = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    subtotal        = models.PositiveIntegerField(default=0)
    tax             = models.PositiveIntegerField(default=0)
    shipping        = models.PositiveIntegerField(default=0)
    total           = models.PositiveIntegerField(default=0)
    order_id        = models.CharField(max_length=20, unique=True)
    # Shipping address (snapshot at time of order)
    address_name    = models.CharField(max_length=120, blank=True, default='')
    address_phone   = models.CharField(max_length=15,  blank=True, default='')
    address_line1   = models.CharField(max_length=200, blank=True, default='')
    address_line2   = models.CharField(max_length=200, blank=True, default='')
    address_city    = models.CharField(max_length=80,  blank=True, default='')
    address_state   = models.CharField(max_length=80,  blank=True, default='')
    address_pincode = models.CharField(max_length=10,  blank=True, default='')
    # Payment
    payment_method  = models.CharField(max_length=10, choices=PAYMENT_CHOICES, default='cod')
    created_at      = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Order {self.order_id} by {self.user.username}'

class OrderItem(models.Model):
    order    = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product  = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    name     = models.CharField(max_length=200)   # snapshot at time of purchase
    price    = models.PositiveIntegerField()       # snapshot
    quantity = models.PositiveIntegerField()
    emoji    = models.CharField(max_length=10, default='🛍️')

    def __str__(self):
        return f'{self.quantity}× {self.name}'
