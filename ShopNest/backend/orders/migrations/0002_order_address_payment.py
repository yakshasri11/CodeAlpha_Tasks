from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='address_name',
            field=models.CharField(blank=True, default='', max_length=120),
        ),
        migrations.AddField(
            model_name='order',
            name='address_phone',
            field=models.CharField(blank=True, default='', max_length=15),
        ),
        migrations.AddField(
            model_name='order',
            name='address_line1',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AddField(
            model_name='order',
            name='address_line2',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AddField(
            model_name='order',
            name='address_city',
            field=models.CharField(blank=True, default='', max_length=80),
        ),
        migrations.AddField(
            model_name='order',
            name='address_state',
            field=models.CharField(blank=True, default='', max_length=80),
        ),
        migrations.AddField(
            model_name='order',
            name='address_pincode',
            field=models.CharField(blank=True, default='', max_length=10),
        ),
        migrations.AddField(
            model_name='order',
            name='payment_method',
            field=models.CharField(
                choices=[('upi', 'UPI'), ('cod', 'Cash on Delivery')],
                default='cod',
                max_length=10,
            ),
        ),
    ]
