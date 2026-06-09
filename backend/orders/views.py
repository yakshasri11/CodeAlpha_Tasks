import uuid
from users.views import CsrfExemptSessionAuthentication
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Order, OrderItem
from .serializers import OrderSerializer


@api_view(['GET', 'POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def order_list_create(request):
    """
    GET  /api/orders/  — list current user's orders
    POST /api/orders/  — place a new order
    Body: {
      items: [{id, name, price, emoji, qty}],
      subtotal, tax, shipping, total,
      payment_method: 'upi' | 'cod',
      address: {
        name, phone, line1, line2, city, state, pincode
      }
    }
    """
    if request.method == 'GET':
        orders = Order.objects.filter(user=request.user).prefetch_related('items').order_by('-created_at')
        return Response(OrderSerializer(orders, many=True).data)

    # POST — create order
    items = request.data.get('items', [])
    if not items:
        return Response({'error': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

    def to_int(val, default=0):
        try:
            return int(round(float(val)))
        except (TypeError, ValueError):
            return default

    subtotal       = to_int(request.data.get('subtotal', 0))
    tax            = to_int(request.data.get('tax', 0))
    shipping       = to_int(request.data.get('shipping', 0))
    total          = to_int(request.data.get('total', 0))
    payment_method = request.data.get('payment_method', 'cod')
    order_id       = 'SN' + uuid.uuid4().hex[:8].upper()

    # Address
    addr = request.data.get('address', {})
    if not addr:
        return Response({'error': 'Delivery address is required.'}, status=status.HTTP_400_BAD_REQUEST)

    order = Order.objects.create(
        user=request.user,
        order_id=order_id,
        subtotal=subtotal,
        tax=tax,
        shipping=shipping,
        total=total,
        status='confirmed',
        payment_method=payment_method,
        address_name=addr.get('name', ''),
        address_phone=addr.get('phone', ''),
        address_line1=addr.get('line1', ''),
        address_line2=addr.get('line2', ''),
        address_city=addr.get('city', ''),
        address_state=addr.get('state', ''),
        address_pincode=addr.get('pincode', ''),
    )
    for item in items:
        OrderItem.objects.create(
            order=order,
            product_id=item.get('id'),
            name=item.get('name', ''),
            price=to_int(item.get('price', 0)),
            quantity=to_int(item.get('qty', 1), 1),
            emoji=item.get('emoji', '🛍️'),
        )
    return Response(
        {'message': 'Order placed!', 'order': OrderSerializer(order).data},
        status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def order_detail(request, pk):
    """GET /api/orders/<id>/"""
    try:
        order = Order.objects.prefetch_related('items').get(pk=pk, user=request.user)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(OrderSerializer(order).data)
