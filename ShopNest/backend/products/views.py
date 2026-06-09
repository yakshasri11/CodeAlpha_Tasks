from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from users.views import CsrfExemptSessionAuthentication
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer


def is_approved_seller(user):
    """Only fully approved sellers (in Seller group) OR admin"""
    return user.is_staff or user.is_superuser or user.groups.filter(name='Seller').exists()


# ── Public ────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def product_list(request):
    qs = Product.objects.select_related('category').filter(is_approved=True)
    category = request.query_params.get('category')
    if category and category != 'All':
        qs = qs.filter(category__name=category)
    search = request.query_params.get('search', '')
    if search:
        qs = qs.filter(name__icontains=search)
    return Response(ProductSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def product_detail(request, pk):
    try:
        product = Product.objects.select_related('category').get(pk=pk, is_approved=True)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response(ProductSerializer(product).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def category_list(request):
    return Response(CategorySerializer(Category.objects.all(), many=True).data)


# ── Seller — combined list + create at /products/seller/my/ ───────────────────
@api_view(['GET', 'POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def seller_my_and_create(request):
    """
    GET  /api/products/seller/my/  — list seller's own products
    POST /api/products/seller/my/  — create a new product
    """
    if not is_approved_seller(request.user):
        return Response({'error': 'Only approved sellers can access this.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        qs = Product.objects.select_related('category').all() if request.user.is_staff \
             else Product.objects.select_related('category').filter(seller=request.user)
        return Response(ProductSerializer(qs, many=True).data)

    # POST — create
    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(seller=request.user, is_approved=request.user.is_staff)
        msg = 'Product added!' if request.user.is_staff else 'Product submitted for admin approval.'
        return Response({'message': msg, 'product': serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── Seller (approved only) — legacy endpoints ──────────────────────────────────
@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def seller_add_product(request):
    if not is_approved_seller(request.user):
        return Response({'error': 'Only approved sellers can add products.'}, status=status.HTTP_403_FORBIDDEN)
    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(seller=request.user, is_approved=request.user.is_staff)
        msg = 'Product added!' if request.user.is_staff else 'Product submitted for admin approval.'
        return Response({'message': msg, 'product': serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def seller_my_products(request):
    if not is_approved_seller(request.user):
        return Response({'error': 'Approved sellers only.'}, status=status.HTTP_403_FORBIDDEN)
    qs = Product.objects.select_related('category').all() if request.user.is_staff \
         else Product.objects.select_related('category').filter(seller=request.user)
    return Response(ProductSerializer(qs, many=True).data)


@api_view(['PUT', 'PATCH', 'DELETE'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def seller_product_manage(request, pk):
    if not is_approved_seller(request.user):
        return Response({'error': 'Approved sellers only.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        product = Product.objects.get(pk=pk) if request.user.is_staff \
                  else Product.objects.get(pk=pk, seller=request.user)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'DELETE':
        product.delete()
        return Response({'message': 'Product deleted.'})
    serializer = ProductSerializer(product, data=request.data, partial=(request.method == 'PATCH'))
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Product updated.', 'product': serializer.data})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── Admin ──────────────────────────────────────────────────
@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def admin_pending_products(request):
    if not request.user.is_staff:
        return Response({'error': 'Admins only.'}, status=status.HTTP_403_FORBIDDEN)
    qs = Product.objects.select_related('category', 'seller').filter(is_approved=False)
    return Response(ProductSerializer(qs, many=True).data)


@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def admin_all_products(request):
    """GET /api/products/admin/all/ — all products (approved + pending) for admin view"""
    if not request.user.is_staff:
        return Response({'error': 'Admins only.'}, status=status.HTTP_403_FORBIDDEN)
    qs = Product.objects.select_related('category', 'seller').order_by('-created_at')
    return Response(ProductSerializer(qs, many=True).data)


@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def admin_approve_product(request, pk):
    if not request.user.is_staff:
        return Response({'error': 'Admins only.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.data.get('action') == 'approve':
        product.is_approved = True
        product.save()
        return Response({'message': f'"{product.name}" is now live.'})
    product.delete()
    return Response({'message': 'Product rejected.'})


@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def admin_toggle_product(request, pk):
    """POST /api/products/admin/<id>/toggle/ — toggle product approval"""
    if not request.user.is_staff:
        return Response({'error': 'Admins only.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
    product.is_approved = not product.is_approved
    product.save()
    state = 'live' if product.is_approved else 'hidden'
    return Response({'message': f'"{product.name}" is now {state}.', 'is_approved': product.is_approved})


@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def admin_dashboard_stats(request):
    if not request.user.is_staff:
        return Response({'error': 'Admins only.'}, status=status.HTTP_403_FORBIDDEN)
    from django.contrib.auth.models import User, Group
    from orders.models import Order
    from users.models import SellerApplication
    seller_group    = Group.objects.filter(name='Seller').first()
    pending_sellers = SellerApplication.objects.filter(status='pending').count()
    return Response({
        'total_products':   Product.objects.filter(is_approved=True).count(),
        'pending_products': Product.objects.filter(is_approved=False).count(),
        'total_users':      User.objects.filter(is_staff=False).count(),
        'total_sellers':    seller_group.user_set.count() if seller_group else 0,
        'pending_sellers':  pending_sellers,
        'total_orders':     Order.objects.count(),
        'total_categories': Category.objects.count(),
    })


@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def admin_sales_stats(request):
    """GET /api/products/admin/sales/ — revenue breakdown for admin dashboard"""
    if not request.user.is_staff:
        return Response({'error': 'Admins only.'}, status=status.HTTP_403_FORBIDDEN)
    from orders.models import Order, OrderItem
    from django.db.models import Sum, Count
    from users.models import SellerApplication

    orders = Order.objects.all()
    total_revenue = orders.aggregate(t=Sum('total'))['t'] or 0
    monthly = {}
    for o in orders:
        key = o.created_at.strftime('%b %Y')
        monthly[key] = monthly.get(key, 0) + o.total

    top_products = (
        OrderItem.objects
        .values('name', 'emoji')
        .annotate(qty=Sum('quantity'), rev=Sum('price'))
        .order_by('-rev')[:5]
    )

    return Response({
        'total_revenue':   total_revenue,
        'total_orders':    orders.count(),
        'monthly_revenue': monthly,
        'top_products':    list(top_products),
    })



