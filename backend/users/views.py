from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User, Group
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework import status
from .models import SellerApplication
from .serializers import RegisterSerializer, UserSerializer, SellerApplicationSerializer


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # skip CSRF for API


# ── Register ──────────────────────────────────────────────
@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([AllowAny])
def register_view(request):
    """
    POST /api/users/register/
    Buyers  → account created, logged in immediately
    Sellers → account created + SellerApplication(pending) created
              user is logged in but role = seller_pending until admin approves
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        login(request, user)
        return Response(
            {'message': 'Account created!', 'user': UserSerializer(user).data},
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── Login ──────────────────────────────────────────────────
@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([AllowAny])
def login_view(request):
    """POST /api/users/login/  { email, password }"""
    email    = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')

    if not email or not password:
        return Response(
            {'error': 'Email and password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # FIX: Use filter().first() instead of .get() to avoid MultipleObjectsReturned
    users = User.objects.filter(email__iexact=email)

    if not users.exists():
        return Response(
            {'error': 'No account found with that email.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if users.count() > 1:
        # Duplicate email situation: try to authenticate each, return first match
        for candidate in users:
            user = authenticate(request, username=candidate.username, password=password)
            if user is not None:
                login(request, user)
                return Response({'message': 'Logged in!', 'user': UserSerializer(user).data})
        return Response(
            {'error': 'Incorrect password.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Normal path — single user found
    target_user = users.first()
    user = authenticate(request, username=target_user.username, password=password)
    if user is None:
        return Response(
            {'error': 'Incorrect password.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    login(request, user)
    return Response({'message': 'Logged in!', 'user': UserSerializer(user).data})


# ── Logout ─────────────────────────────────────────────────
@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logged out.'})


# ── Me ─────────────────────────────────────────────────────
@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response(UserSerializer(request.user).data)


# ── All users (admin only) ──────────────────────────────────
@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def all_users_view(request):
    if not request.user.is_staff:
        return Response({'error': 'Admins only.'}, status=status.HTTP_403_FORBIDDEN)
    users = User.objects.prefetch_related('groups', 'seller_application').filter(
        is_superuser=False).order_by('-date_joined')
    return Response(UserSerializer(users, many=True).data)


# ── Seller Applications (admin only) ───────────────────────
@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def seller_applications_view(request):
    """GET /api/users/seller-applications/  — all seller applications (all statuses)"""
    if not request.user.is_staff:
        return Response({'error': 'Admins only.'}, status=status.HTTP_403_FORBIDDEN)
    status_filter = request.query_params.get('status', 'pending')
    if status_filter == 'all':
        apps = SellerApplication.objects.select_related('user').order_by('-applied_at')
    else:
        apps = SellerApplication.objects.select_related('user').filter(
            status=status_filter).order_by('-applied_at')
    return Response(SellerApplicationSerializer(apps, many=True).data)


# ── Approve / Reject / Suspend / Remove seller ─────────────
@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def review_seller_view(request, pk):
    """
    POST /api/users/seller-applications/<id>/review/
    Body: { action: 'approve' | 'reject' | 'suspend' | 'remove', note: '...' }
    """
    if not request.user.is_staff:
        return Response({'error': 'Admins only.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        app = SellerApplication.objects.select_related('user').get(pk=pk)
    except SellerApplication.DoesNotExist:
        return Response({'error': 'Application not found.'}, status=status.HTTP_404_NOT_FOUND)

    action = request.data.get('action', 'approve')
    note   = request.data.get('note', '')
    seller_group, _ = Group.objects.get_or_create(name='Seller')

    app.admin_note  = note
    app.reviewed_at = timezone.now()

    if action == 'approve':
        app.status       = 'approved'
        app.is_suspended = False
        app.save()
        app.user.groups.add(seller_group)
        return Response({'message': f'✅ {app.shop_name} approved! Seller dashboard unlocked.'})

    elif action == 'reject':
        app.status = 'rejected'
        app.save()
        app.user.groups.remove(seller_group)
        return Response({'message': f'❌ {app.shop_name} rejected.'})

    elif action == 'suspend':
        app.status       = 'suspended'
        app.is_suspended = True
        app.save()
        app.user.groups.remove(seller_group)
        return Response({'message': f'⚠️ {app.shop_name} suspended.'})

    elif action == 'remove':
        shop_name = app.shop_name
        app.user.groups.remove(seller_group)
        app.delete()
        return Response({'message': f'🗑️ {shop_name} removed permanently.'})

    return Response({'error': 'Unknown action.'}, status=status.HTTP_400_BAD_REQUEST)


# ── Delete user (admin only) ───────────────────────────────
@api_view(['DELETE'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def delete_user_view(request, pk):
    """DELETE /api/users/<id>/delete/"""
    if not request.user.is_staff:
        return Response({'error': 'Admins only.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    if user.is_superuser:
        return Response({'error': 'Cannot delete superuser.'}, status=status.HTTP_403_FORBIDDEN)
    username = user.get_full_name() or user.username
    user.delete()
    return Response({'message': f'User "{username}" deleted.'})


# ── Orders (admin only) ────────────────────────────────────
@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def all_orders_view(request):
    """GET /api/users/orders/all/"""
    if not request.user.is_staff:
        return Response({'error': 'Admins only.'}, status=status.HTTP_403_FORBIDDEN)
    from orders.models import Order
    from orders.serializers import OrderSerializer
    orders = Order.objects.select_related('user').prefetch_related('items').order_by('-created_at')
    return Response(OrderSerializer(orders, many=True).data)


# ── Seller Self-Registration (logged-in buyer applies to be seller) ─
@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def seller_register_view(request):
    """
    POST /api/users/seller/register/
    Allows a logged-in buyer to submit a seller application.
    """
    from .serializers import SellerRegisterSerializer
    serializer = SellerRegisterSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        app = serializer.save()
        return Response(
            {
                'message': 'Seller application submitted! Awaiting admin approval.',
                'application_id': app.id,
                'status': app.status,
                'user': UserSerializer(request.user).data,
            },
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── Seller Application Status (for seller to check own status) ──────
@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def my_seller_status_view(request):
    """GET /api/users/seller/status/ — returns current seller application status"""
    if hasattr(request.user, 'seller_application'):
        return Response(SellerApplicationSerializer(request.user.seller_application).data)
    return Response({'status': 'none', 'message': 'No seller application found.'})
