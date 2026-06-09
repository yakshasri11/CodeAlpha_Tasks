from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name


class Product(models.Model):
    BADGE_CHOICES = [('Sale', 'Sale'), ('New', 'New'), ('', 'None')]

    name        = models.CharField(max_length=200)
    category    = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    seller      = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    description = models.TextField()
    price       = models.PositiveIntegerField(help_text='Price in INR')
    old_price   = models.PositiveIntegerField(null=True, blank=True)
    emoji       = models.CharField(max_length=10, default='🛍️')
    badge       = models.CharField(max_length=10, choices=BADGE_CHOICES, blank=True, default='')
    rating      = models.PositiveSmallIntegerField(default=4)
    stock       = models.PositiveIntegerField(default=10)
    sku         = models.CharField(max_length=20, unique=True)
    is_approved = models.BooleanField(default=False, help_text='Admin must approve before going live')
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        status = '✅' if self.is_approved else '⏳'
        return f'{status} {self.name}'
