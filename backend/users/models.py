from django.db import models
from django.contrib.auth.models import User

class SellerApplication(models.Model):
    """
    When someone registers as a seller, this record is created.
    Admin reviews it and approves or rejects.
    On approval, user is added to the Seller group.
    """
    STATUS_CHOICES = [
        ('pending',  'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('suspended','Suspended'),
    ]
    user          = models.OneToOneField(User, on_delete=models.CASCADE, related_name='seller_application')
    shop_name     = models.CharField(max_length=120)
    phone         = models.CharField(max_length=15)
    business_type = models.CharField(max_length=80, blank=True, default='')
    address       = models.TextField(blank=True, default='')
    description   = models.TextField(blank=True, default='')
    status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_suspended  = models.BooleanField(default=False)
    applied_at    = models.DateTimeField(auto_now_add=True)
    reviewed_at   = models.DateTimeField(null=True, blank=True)
    admin_note    = models.TextField(blank=True, default='')

    def __str__(self):
        return f'{self.shop_name} — {self.status}'
