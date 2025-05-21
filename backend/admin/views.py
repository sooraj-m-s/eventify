from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import Q, Sum
from django.db import transaction
from datetime import timedelta
from django.shortcuts import get_object_or_404
from users.models import Users
from organizers.models import OrganizerProfile
from organizers.serializers import OrganizerProfileSerializer
from events.models import Event
from events.serializers import EventSerializer
from wallet.models import OrganizerWallet, OrganizerWalletTransaction, CompanyWallet
from .permissions import IsAdminUser
from .serializers import UserListSerializer, EventDetailWithHostSerializer


@permission_classes([AllowAny])
class AdminLoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        user = authenticate(username=email, password=password)
        if not user:
            return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        if user.role != 'admin':
            return Response({"error": "Access denied. Admin privileges required."}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        response = Response(
            {
                'detail': 'Login successful',
                'user_id': user.user_id,
                'full_name': user.full_name,
                'profile_image': user.profile_image,
                'email': user.email,
                'role': user.role
            },
            status=status.HTTP_200_OK
        )
        
        response.set_cookie(key='access_token', value=str(refresh.access_token), httponly=True, secure=True, samesite='None')
        response.set_cookie(key='refresh_token', value=str(refresh), httponly=True, secure=True, samesite='None')
        return response


class PaginationData(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
    page_query_param = 'page'


@permission_classes([IsAdminUser])
class UserListView(APIView):
    pagination_class = PaginationData
    
    def get(self, request):
        search_query = request.query_params.get('search', '')
        role = request.query_params.get('role')
        page = request.query_params.get('page', 1)
        
        queryset = Users.objects.exclude(role='admin')
        
        if search_query:
            queryset = queryset.filter(full_name__icontains=search_query)
        
        queryset = queryset.filter(role=role).order_by('-created_at')
        
        paginator = PaginationData()
        page = paginator.paginate_queryset(queryset, request)
        
        if page is not None:
            serializer = UserListSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        serializer = UserListSerializer(queryset, many=True)
        return Response({'count': queryset.count(), 'results': serializer.data})


@permission_classes([IsAdminUser])
class UserStatusUpdateView(APIView):
    def patch(self, request, user_id):
        try:
            user = Users.objects.get(user_id=user_id)
            is_blocked = request.data.get('is_blocked')
            
            if is_blocked is not None:
                user.is_blocked = is_blocked
                user.save()
                
                serializer = UserListSerializer(user)
                return Response({
                    'status': 'success',
                    'message': f"User {'blocked' if is_blocked else 'unblocked'} successfully",
                    'data': serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({'status': 'error', 'message': "is_blocked field is required"}, status=status.HTTP_400_BAD_REQUEST)
        except Users.DoesNotExist:
            return Response({'status': 'error', 'message': "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@permission_classes([IsAdminUser])
class PendingOrganizerProfilesView(APIView):
    def get(self, request):
        try:
            profiles = OrganizerProfile.objects.filter(is_approved=False)
            serializer = OrganizerProfileSerializer(profiles, many=True)
            
            return Response({"count": profiles.count(), "profiles": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            profile_id = request.data.get('profile_id')
            action = request.data.get('action')
            reason = request.data.get('reason', None)
            
            try:
                organizer_profile = OrganizerProfile.objects.get(id=profile_id)
                
                if action == 'approve':
                    user = Users.objects.get(user_id=organizer_profile.user.user_id)
                    user.role = 'organizer'
                    user.save()
                    
                    organizer_profile.is_approved = True
                    organizer_profile.approved_at = timezone.now()

                    # Create organizer wallet
                    OrganizerWallet.objects.create(
                        user=user,
                        balance=0
                    )
                elif action == 'reject':
                    organizer_profile.is_rejected = True
                    organizer_profile.rejected_reason = reason
                else:
                    return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
                organizer_profile.save()

                return Response({"message": "Profile updated successfully"}, status=status.HTTP_200_OK)
            except OrganizerProfile.DoesNotExist:
                return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@permission_classes([IsAdminUser])
class AdminEventListView(APIView):
    pagination_class = PaginationData
    
    def get(self, request):
        try:
            paginator = self.pagination_class()
            organizer_id = request.query_params.get('organizer_id', None)
            event_status = request.query_params.get('status', None)
            settlement_status = request.query_params.get('settlement_status', None)
            search = request.query_params.get('search', None)
            
            events = Event.objects.all().order_by('-createdAt')
            if organizer_id:
                events = events.filter(hostedBy__user_id=organizer_id)
            
            if event_status:
                today = timezone.now().date()
                if event_status == 'active':
                    events = events.filter(date__gte=today, on_hold=False, is_completed=False)
                elif event_status == 'on_hold':
                    events = events.filter(on_hold=True)
                elif event_status == 'completed':
                    events = events.filter(is_completed=True)
                elif event_status == 'expired':
                    events = events.filter(date__lt=today, is_completed=False)
            
            if settlement_status:
                today = timezone.now().date()
                if settlement_status == 'settled':
                    events = events.filter(is_settled_to_organizer=True)
                elif settlement_status == 'unsettled':
                    events = events.filter(is_settled_to_organizer=False)
                elif settlement_status == 'available_for_settlement':
                    events = events.filter(is_settled_to_organizer=False, date__lt=today, on_hold=False)
            
            if search:
                events = events.filter(Q(title__icontains=search) | Q(location__icontains=search))
            
            page = paginator.paginate_queryset(events, request)
            serializer = EventDetailWithHostSerializer(page, many=True)
            
            return Response({
                'success': True,
                'count': events.count(),
                'events': serializer.data,
                'next': paginator.get_next_link(),
                'previous': paginator.get_previous_link()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error in AdminEventListView: {str(e)}")
            return Response({
                'success': False,
                'message': 'An error occurred while fetching events',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@permission_classes([IsAdminUser])
class EventHoldStatusView(APIView):
    def patch(self, request, event_id):
        try:
            event = Event.objects.get(pk=event_id)
            
            if 'on_hold' in request.data:
                event.on_hold = request.data['on_hold']
            else:
                event.on_hold = not event.on_hold
            
            event.save()
            serializer = EventSerializer(event)
            
            return Response({
                "success": True,
                "message": f"Event {'put on hold' if event.on_hold else 'removed from hold'} successfully",
                "event": serializer.data
            }, status=status.HTTP_200_OK)
            
        except Event.DoesNotExist:
            return Response({"success": False, "message": "Event not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"success": False, "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@permission_classes([IsAdminUser])
class EventSettlementView(APIView):
    def post(self, request):
        try:
            event_id = request.data.get('event_id')
            event = get_object_or_404(Event, eventId=event_id)
            today = timezone.now().date()
            settlement_date = event.date + timedelta(days=1)
            
            if event.is_settled_to_organizer:
                return Response({"error": "This event has already been settled"}, status=status.HTTP_400_BAD_REQUEST)
            if event.on_hold:
                return Response({"error": "This event is on hold and cannot be settled"}, status=status.HTTP_400_BAD_REQUEST)
            if today < settlement_date:
                return Response({
                    "error": f"Settlement can only be processed one day after the event. Please try again on {settlement_date.strftime('%d/%m/%Y')}"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Calculate total revenue from confirmed bookings
            total_revenue = event.bookings.filter(payment_status='confirmed', is_booking_cancelled=False).aggregate(total=Sum('total_price'))['total'] or 0
            
            if total_revenue < 0:
                return Response({"error": "No revenue to settle for this event"}, status=status.HTTP_400_BAD_REQUEST)
            
            organizer_share = int(total_revenue * 0.9)  # 90% to organizer
            platform_fee = total_revenue - organizer_share  # 10% to platform
            organizer_wallet = OrganizerWallet.objects.get(user=event.hostedBy)
            
            with transaction.atomic():
                organizer_wallet.balance += organizer_share
                organizer_wallet.save()
                
                OrganizerWalletTransaction.objects.create(
                    wallet=organizer_wallet,
                    event=event,
                    amount=organizer_share,
                    transaction_type='CREDIT',
                )
                
                latest_company_wallet = CompanyWallet.objects.order_by('-wallet_id').first()
                if not latest_company_wallet:
                    latest_company_wallet = 0
                CompanyWallet.objects.create(
                    event=event,
                    total_balance=latest_company_wallet + platform_fee,
                    transaction_amount=platform_fee,
                    transaction_type='CREDIT',
                    reference_id=f"FEE-{event.eventId}"
                )
                
                event.is_settled_to_organizer = True
                event.is_completed = True
                event.save()
            
            return Response({
                "message": "Event settled successfully",
                "event_title": event.title,
                "total_revenue": total_revenue,
                "organizer_share": organizer_share,
                "platform_fee": platform_fee,
                "settlement_date": today.strftime('%d/%m/%Y')
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

