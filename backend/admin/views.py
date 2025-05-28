from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import Q, Sum, Count
from django.db import transaction, models
from datetime import datetime, timedelta
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from users.models import Users
from organizers.models import OrganizerProfile
from organizers.serializers import OrganizerProfileSerializer
from events.models import Event
from events.serializers import EventSerializer
from wallet.models import OrganizerWallet, OrganizerWalletTransaction, CompanyWallet
from wallet.serializers import CompanyWalletSerializer
from categories.models import Category
from booking.models import Booking
from .permissions import IsAdminUser
from .serializers import UserListSerializer, EventDetailWithHostSerializer, OrganizerStatsSerializer, EventStatsSerializer
from .email_utils import send_organizer_approval_email, send_organizer_rejection_email
from .report_generators import ExcelReportGenerator, PDFReportGenerator


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



@permission_classes([IsAdminUser])
class AdminDashboardView(APIView):
    def get(self, request):
        try:
            filters = self._get_filter_parameters(request)
            dashboard_data = self._get_dashboard_data(filters)
            
            return Response({
                "success": True,
                "data": dashboard_data,
                "filters_applied": filters
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "success": False,
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_filter_parameters(self, request):
        return {
            'start_date': request.GET.get('start_date'),
            'end_date': request.GET.get('end_date'),
            'organizer_id': request.GET.get('organizer_id'),
            'category_id': request.GET.get('category_id'),
            'event_status': request.GET.get('event_status'),
            'search': request.GET.get('search', '').strip()
        }
    
    def _get_dashboard_data(self, filters):
        events_qs = Event.objects.select_related('hostedBy', 'category')
        bookings_qs = Booking.objects.select_related('event', 'user', 'event__hostedBy', 'event__category')
        
        events_qs, bookings_qs = self._apply_filters(events_qs, bookings_qs, filters)
        organizers_data = self._get_organizers_data(events_qs, bookings_qs)
        events_data = self._get_events_data(events_qs, bookings_qs)
        revenue_data = self._get_revenue_analytics(bookings_qs)
        categories_data = self._get_categories_data(events_qs, bookings_qs)
        summary_stats = self._get_summary_statistics(events_qs, bookings_qs)
        
        return {
            'organizers': organizers_data,
            'events': events_data,
            'revenue': revenue_data,
            'categories': categories_data,
            'summary': summary_stats
        }
    
    def _apply_filters(self, events_qs, bookings_qs, filters):
        if filters['start_date']:
            start_date = datetime.strptime(filters['start_date'], '%Y-%m-%d').date()
            events_qs = events_qs.filter(date__gte=start_date)
            bookings_qs = bookings_qs.filter(event__date__gte=start_date)
        if filters['end_date']:
            end_date = datetime.strptime(filters['end_date'], '%Y-%m-%d').date()
            events_qs = events_qs.filter(date__lte=end_date)
            bookings_qs = bookings_qs.filter(event__date__lte=end_date)
        if filters['organizer_id']:
            events_qs = events_qs.filter(hostedBy__user_id=filters['organizer_id'])
            bookings_qs = bookings_qs.filter(event__hostedBy__user_id=filters['organizer_id'])
        if filters['category_id']:
            events_qs = events_qs.filter(category__categoryId=filters['category_id'])
            bookings_qs = bookings_qs.filter(event__category__categoryId=filters['category_id'])
        if filters['event_status']:
            today = timezone.now().date()
            if filters['event_status'] == 'completed':
                events_qs = events_qs.filter(Q(is_completed=True) | Q(date__lt=today))
                bookings_qs = bookings_qs.filter(Q(event__is_completed=True) | Q(event__date__lt=today))
            elif filters['event_status'] == 'upcoming':
                events_qs = events_qs.filter(date__gte=today, is_completed=False, on_hold=False)
                bookings_qs = bookings_qs.filter(event__date__gte=today, event__is_completed=False, event__on_hold=False)
            elif filters['event_status'] == 'on_hold':
                events_qs = events_qs.filter(on_hold=True)
                bookings_qs = bookings_qs.filter(event__on_hold=True)
        if filters['search']:
            search_q = Q(title__icontains=filters['search']) | \
                      Q(hostedBy__full_name__icontains=filters['search']) | \
                      Q(category__categoryName__icontains=filters['search'])
            events_qs = events_qs.filter(search_q)
            
            booking_search_q = Q(event__title__icontains=filters['search']) | \
                              Q(event__hostedBy__full_name__icontains=filters['search']) | \
                              Q(event__category__categoryName__icontains=filters['search'])
            bookings_qs = bookings_qs.filter(booking_search_q)
        
        return events_qs, bookings_qs
    
    def _get_organizers_data(self, events_qs, bookings_qs):
        organizers = Users.objects.filter(role='organizer').annotate(
            total_events=Count('events_hosted', filter=Q(events_hosted__in=events_qs)),
            total_revenue=Sum('events_hosted__bookings__total_price', 
                            filter=Q(events_hosted__bookings__in=bookings_qs, 
                                    events_hosted__bookings__payment_status='confirmed')),
            total_bookings=Count('events_hosted__bookings', 
                               filter=Q(events_hosted__bookings__in=bookings_qs,
                                       events_hosted__bookings__payment_status='confirmed'))
        ).order_by('-total_revenue')
        
        return OrganizerStatsSerializer(organizers, many=True).data
    
    def _get_events_data(self, events_qs, bookings_qs):
        events = events_qs.annotate(
            total_revenue=Sum('bookings__total_price', 
                            filter=Q(bookings__in=bookings_qs, bookings__payment_status='confirmed')),
            confirmed_bookings=Count('bookings', 
                                   filter=Q(bookings__in=bookings_qs, bookings__payment_status='confirmed'))
        ).order_by('-total_revenue')
        
        return EventStatsSerializer(events, many=True).data
    
    def _get_revenue_analytics(self, bookings_qs):
        confirmed_bookings = bookings_qs.filter(payment_status='confirmed')
        
        total_revenue = confirmed_bookings.aggregate(
            total=Sum('total_price')
        )['total'] or 0
        
        revenue_by_status = bookings_qs.values('payment_status').annotate(
            count=Count('booking_id'),
            revenue=Sum('total_price')
        ).order_by('-revenue')
        
        daily_revenue = confirmed_bookings.extra(
            select={'day': 'DATE(booking_date)'}
        ).values('day').annotate(
            revenue=Sum('total_price'),
            bookings_count=Count('booking_id')
        ).order_by('day')
        
        return {
            'total_revenue': total_revenue,
            'by_status': list(revenue_by_status),
            'daily_breakdown': list(daily_revenue)
        }
    
    def _get_categories_data(self, events_qs, bookings_qs):
        categories = Category.objects.annotate(
            total_events=Count('event', filter=Q(event__in=events_qs)),
            total_revenue=Sum('event__bookings__total_price', 
                            filter=Q(event__bookings__in=bookings_qs, 
                                    event__bookings__payment_status='confirmed')),
            total_bookings=Count('event__bookings', 
                               filter=Q(event__bookings__in=bookings_qs,
                                       event__bookings__payment_status='confirmed'))
        ).filter(total_events__gt=0).order_by('-total_revenue')
        
        return [{
            'category_id': str(cat.categoryId),
            'category_name': cat.categoryName,
            'total_events': cat.total_events,
            'total_revenue': cat.total_revenue or 0,
            'total_bookings': cat.total_bookings
        } for cat in categories]
    
    def _get_summary_statistics(self, events_qs, bookings_qs):
        confirmed_bookings = bookings_qs.filter(payment_status='confirmed')
        
        return {
            'total_events': events_qs.count(),
            'total_organizers': events_qs.values('hostedBy').distinct().count(),
            'total_bookings': confirmed_bookings.count(),
            'total_revenue': confirmed_bookings.aggregate(Sum('total_price'))['total_price__sum'] or 0,
            'pending_bookings': bookings_qs.filter(payment_status='pending').count(),
            'cancelled_bookings': bookings_qs.filter(payment_status='cancelled').count(),
        }


@permission_classes([IsAdminUser])
class DownloadRevenueReportView(APIView):
    def get(self, request):
        try:
            report_format = request.GET.get('format', 'excel')
            filters = self._get_filter_parameters(request)
            
            events_qs = Event.objects.select_related('hostedBy', 'category')
            bookings_qs = Booking.objects.select_related('event', 'user', 'event__hostedBy', 'event__category')
            events_qs, bookings_qs = self._apply_filters(events_qs, bookings_qs, filters)
            
            report_data = self._prepare_report_data(events_qs, bookings_qs, filters)
            
            if report_format.lower() == 'pdf':
                pdf_generator = PDFReportGenerator()
                pdf_buffer = pdf_generator.generate_revenue_report(report_data)
                
                response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
                response['Content-Disposition'] = f'attachment; filename="revenue_report_{timezone.now().strftime("%Y%m%d_%H%M%S")}.pdf"'
                
            else:
                excel_generator = ExcelReportGenerator()
                excel_buffer = excel_generator.generate_revenue_report(report_data)
                
                response = HttpResponse(
                    excel_buffer.getvalue(),
                    content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                )
                response['Content-Disposition'] = f'attachment; filename="revenue_report_{timezone.now().strftime("%Y%m%d_%H%M%S")}.xlsx"'
            
            return response
        except Exception as e:
            return Response({"success": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_filter_parameters(self, request):
        return {
            'start_date': request.GET.get('start_date'),
            'end_date': request.GET.get('end_date'),
            'organizer_id': request.GET.get('organizer_id'),
            'category_id': request.GET.get('category_id'),
            'event_status': request.GET.get('event_status'),
            'search': request.GET.get('search', '').strip()
        }
    
    def _apply_filters(self, events_qs, bookings_qs, filters):
        dashboard_view = AdminDashboardView()
        return dashboard_view._apply_filters(events_qs, bookings_qs, filters)
    
    def _prepare_report_data(self, events_qs, bookings_qs, filters):
        confirmed_bookings = bookings_qs.filter(payment_status='confirmed')
        
        summary = {
            'total_events': events_qs.count(),
            'total_revenue': confirmed_bookings.aggregate(Sum('total_price'))['total_price__sum'] or 0,
            'total_bookings': confirmed_bookings.count(),
            'report_period': {
                'start_date': filters.get('start_date', 'All time'),
                'end_date': filters.get('end_date', 'All time')
            },
            'generated_at': timezone.now()
        }
    
        bookings_data = confirmed_bookings.values(
            'booking_id', 'booking_name', 'total_price', 'booking_date',
            'event__title', 'event__hostedBy__full_name', 'event__category__categoryName',
            'event__date', 'event__location', 'payment_id', 'payment_date'
        ).order_by('-booking_date')
        
        organizer_revenue = confirmed_bookings.values(
            'event__hostedBy__full_name', 'event__hostedBy__email'
        ).annotate(
            total_revenue=Sum('total_price'),
            total_bookings=Count('booking_id'),
            total_events=Count('event', distinct=True)
        ).order_by('-total_revenue')
        
        category_revenue = confirmed_bookings.values(
            'event__category__categoryName'
        ).annotate(
            total_revenue=Sum('total_price'),
            total_bookings=Count('booking_id'),
            total_events=Count('event', distinct=True)
        ).order_by('-total_revenue')
        
        daily_revenue = confirmed_bookings.extra(
            select={'day': 'DATE(booking_date)'}
        ).values('day').annotate(
            revenue=Sum('total_price'),
            bookings_count=Count('booking_id')
        ).order_by('day')
        
        return {
            'summary': summary,
            'bookings': list(bookings_data),
            'organizer_revenue': list(organizer_revenue),
            'category_revenue': list(category_revenue),
            'daily_revenue': list(daily_revenue),
            'filters': filters
        }


@permission_classes([IsAdminUser])
class AdminFiltersView(APIView):
    def get(self, request):
        try:
            organizers = Users.objects.filter(role='organizer').values(
                'user_id', 'full_name', 'email'
            ).order_by('full_name')
            categories = Category.objects.filter(is_listed=True).values(
                'categoryId', 'categoryName'
            ).order_by('categoryName')
            date_range = Event.objects.aggregate(
                min_date=models.Min('date'),
                max_date=models.Max('date')
            )
            
            return Response({
                "success": True,
                "data": {
                    "organizers": list(organizers),
                    "categories": list(categories),
                    "date_range": date_range,
                    "event_status_options": [
                        {"value": "upcoming", "label": "Upcoming"},
                        {"value": "completed", "label": "Completed"},
                        {"value": "on_hold", "label": "On Hold"}
                    ]
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"success": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
                user = Users.objects.get(user_id=organizer_profile.user.user_id)
                first_name = user.full_name.split()[0]
                
                if action == 'approve':
                    user.role = 'organizer'
                    user.save()
                    
                    organizer_profile.is_approved = True
                    organizer_profile.approved_at = timezone.now()

                    # Create organizer wallet
                    OrganizerWallet.objects.create(
                        user=user,
                        balance=0
                    )

                    # Send approval email
                    send_organizer_approval_email(user.email, first_name)

                elif action == 'reject':
                    organizer_profile.is_rejected = True
                    organizer_profile.rejected_reason = reason

                    # Send rejection email
                    send_organizer_rejection_email(user.email, first_name, reason)
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
                
                last = CompanyWallet.objects.order_by('-created_at').first()
                previous_balance = last.total_balance if last else 0
                CompanyWallet.objects.create(
                    event=event,
                    total_balance=previous_balance + platform_fee,
                    transaction_amount=platform_fee,
                    transaction_type='CREDIT',
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


@permission_classes([IsAdminUser])
class AdminWalletView(APIView):
    pagination_class = PaginationData
    
    def get(self, request):
        try:
            paginator = self.pagination_class()
            transaction_type = request.query_params.get('transaction_type', None)
            search = request.query_params.get('search', None)
            start_date = request.query_params.get('start_date', None)
            end_date = request.query_params.get('end_date', None)
            
            transactions = CompanyWallet.objects.all().order_by('-created_at')
            
            if transaction_type:
                transactions = transactions.filter(transaction_type=transaction_type)
                
            if search:
                transactions = transactions.filter(
                    Q(reference_id__icontains=search) | 
                    Q(event__title__icontains=search)
                )
                
            if start_date:
                transactions = transactions.filter(created_at__date__gte=start_date)
            if end_date:
                transactions = transactions.filter(created_at__date__lte=end_date)
            
            latest_wallet = CompanyWallet.objects.order_by('-created_at').first()
            current_balance = latest_wallet.total_balance if latest_wallet else 0
            
            total_credits = CompanyWallet.objects.filter(transaction_type='CREDIT').aggregate(total=Sum('transaction_amount'))['total'] or 0
            total_withdrawals = CompanyWallet.objects.filter(transaction_type='WITHDRAWAL').aggregate(total=Sum('transaction_amount'))['total'] or 0
            
            page = paginator.paginate_queryset(transactions, request)
            serializer = CompanyWalletSerializer(page, many=True)
            
            return Response({
                'success': True,
                'current_balance': current_balance,
                'total_credits': total_credits,
                'total_withdrawals': total_withdrawals,
                'transactions': serializer.data,
                'count': transactions.count(),
                'next': paginator.get_next_link(),
                'previous': paginator.get_previous_link()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': 'An error occurred while fetching wallet data',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

