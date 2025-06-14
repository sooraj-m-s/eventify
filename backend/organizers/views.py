from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import datetime, timedelta, date
from django.http import HttpResponse
from decimal import Decimal
from rest_framework.permissions import IsAuthenticated
from dateutil.parser import parse as parse_date
from events.serializers import EventSerializer
from booking.models import Booking
from events.models import Event
from .permissions import IsOrganizerUser
from .validators import validate_event
from .serializers import OrganizerBookingSerializer, OrganizerEventSerializer
from .models import OrganizerProfile
from .organizer_report_generators import OrganizerExcelGenerator, OrganizerPDFGenerator


@permission_classes([IsOrganizerUser])
class OrganizerDashboardView(APIView):
    def get(self, request):
        try:
            filters = self._get_filter_parameters(request)
            dashboard_data = self._get_dashboard_data(request.user, filters)
            
            return Response({"success": True, "data": dashboard_data, "filters_applied": filters}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"success": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_filter_parameters(self, request):
        return {
            'start_date': request.GET.get('start_date'),
            'end_date': request.GET.get('end_date'),
            'event_status': request.GET.get('event_status'),
            'payment_status': request.GET.get('payment_status'),
            'event_id': request.GET.get('event_id'),
            'search': request.GET.get('search', '').strip()
        }
    
    def _get_dashboard_data(self, user, filters):
        events_qs = Event.objects.filter(hostedBy=user).select_related('category')
        bookings_qs = Booking.objects.filter(event__hostedBy=user).select_related(
            'event', 'user', 'event__category'
        )
        
        events_qs, bookings_qs = self._apply_filters(events_qs, bookings_qs, filters)
        events_data = self._get_events_with_revenue(events_qs, bookings_qs)
        bookings_data = self._get_bookings_data(bookings_qs)
        revenue_summary = self._get_revenue_summary(bookings_qs)
        booking_summary = self._get_booking_summary(bookings_qs)
        monthly_revenue = self._get_monthly_revenue(user, filters)
        top_events = self._get_top_events(user, filters)
        
        return {
            'events': events_data,
            'bookings': bookings_data,
            'revenue_summary': revenue_summary,
            'booking_summary': booking_summary,
            'monthly_revenue': monthly_revenue,
            'top_events': top_events
        }
    
    def _apply_filters(self, events_qs, bookings_qs, filters):
        if filters['start_date']:
            start_date = datetime.strptime(filters['start_date'], '%Y-%m-%d').date()
            bookings_qs = bookings_qs.filter(booking_date__date__gte=start_date)
        if filters['end_date']:
            end_date = datetime.strptime(filters['end_date'], '%Y-%m-%d').date()
            bookings_qs = bookings_qs.filter(booking_date__date__lte=end_date)
        if filters['event_status']:
            today = timezone.now().date()
            if filters['event_status'] == 'completed':
                events_qs = events_qs.filter(Q(is_completed=True) | Q(date__lt=today))
            elif filters['event_status'] == 'upcoming':
                events_qs = events_qs.filter(date__gte=today, is_completed=False, on_hold=False)
            elif filters['event_status'] == 'on_hold':
                events_qs = events_qs.filter(on_hold=True)
        if filters['payment_status']:
            bookings_qs = bookings_qs.filter(payment_status=filters['payment_status'])
        if filters['event_id']:
            events_qs = events_qs.filter(eventId=filters['event_id'])
            bookings_qs = bookings_qs.filter(event__eventId=filters['event_id'])
        if filters['search']:
            search_q = Q(title__icontains=filters['search']) | \
                      Q(category__categoryName__icontains=filters['search']) | \
                      Q(location__icontains=filters['search'])
            events_qs = events_qs.filter(search_q)
            
            booking_search_q = Q(event__title__icontains=filters['search']) | \
                              Q(booking_name__icontains=filters['search']) | \
                              Q(user__full_name__icontains=filters['search'])
            bookings_qs = bookings_qs.filter(booking_search_q)
        
        return events_qs, bookings_qs
    
    def _get_events_with_revenue(self, events_qs, bookings_qs):
        events = events_qs.annotate(
            total_revenue=Sum(
                'bookings__total_price',
                filter=Q(bookings__payment_status='confirmed')
            ),
            confirmed_bookings=Count(
                'bookings',
                filter=Q(bookings__payment_status='confirmed')
            ),
            pending_bookings=Count(
                'bookings',
                filter=Q(bookings__payment_status='pending')
            ),
            cancelled_bookings=Count(
                'bookings',
                filter=Q(bookings__payment_status='cancelled')
            )
        ).order_by('-createdAt')
        
        return OrganizerEventSerializer(events, many=True).data
    
    def _get_bookings_data(self, bookings_qs):
        bookings = bookings_qs.order_by('-booking_date')
        return OrganizerBookingSerializer(bookings, many=True).data
    
    def _get_revenue_summary(self, bookings_qs):
        confirmed_bookings = bookings_qs.filter(payment_status='confirmed')
        
        total_revenue = confirmed_bookings.aggregate(
            total=Sum('total_price')
        )['total'] or 0
        
        organizer_revenue = round(Decimal(str(total_revenue)) * Decimal('0.90'), 2)
        platform_fee = round(Decimal(str(total_revenue)) * Decimal('0.10'), 2)
        
        pending_revenue = bookings_qs.filter(payment_status='pending').aggregate(
            total=Sum('total_price')
        )['total'] or 0
        
        return {
            'total_revenue': float(total_revenue),
            'organizer_revenue': float(organizer_revenue),
            'platform_fee': float(platform_fee),
            'pending_revenue': float(pending_revenue),
            'revenue_split_percentage': {
                'organizer': 90,
                'platform': 10
            }
        }
    
    def _get_booking_summary(self, bookings_qs):
        summary = bookings_qs.aggregate(
            total_bookings=Count('booking_id'),
            confirmed_bookings=Count('booking_id', filter=Q(payment_status='confirmed')),
            pending_bookings=Count('booking_id', filter=Q(payment_status='pending')),
            cancelled_bookings=Count('booking_id', filter=Q(payment_status='cancelled'))
        )
        
        return summary
    
    def _get_monthly_revenue(self, user, filters):
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=365)
        monthly_data = []
        current_date = start_date.replace(day=1)
        
        while current_date <= end_date:
            next_month = (current_date.replace(day=28) + timedelta(days=4)).replace(day=1)
            
            month_bookings = Booking.objects.filter(
                event__hostedBy=user,
                payment_status='confirmed',
                booking_date__date__gte=current_date,
                booking_date__date__lt=next_month
            )
            
            total_revenue = month_bookings.aggregate(Sum('total_price'))['total_price__sum'] or 0
            organizer_revenue = round(Decimal(str(total_revenue)) * Decimal('0.90'), 2)
            
            monthly_data.append({
                'month': current_date.strftime('%Y-%m'),
                'month_name': current_date.strftime('%B %Y'),
                'total_revenue': float(total_revenue),
                'organizer_revenue': float(organizer_revenue),
                'bookings_count': month_bookings.count()
            })
            
            current_date = next_month
        return monthly_data
    
    def _get_top_events(self, user, filters):
        events = Event.objects.filter(hostedBy=user).annotate(
            total_revenue=Sum(
                'bookings__total_price',
                filter=Q(bookings__payment_status='confirmed')
            ),
            confirmed_bookings=Count(
                'bookings',
                filter=Q(bookings__payment_status='confirmed')
            )
        ).filter(total_revenue__gt=0).order_by('-total_revenue')[:5]
        
        return OrganizerEventSerializer(events, many=True).data


@permission_classes([IsOrganizerUser])
class OrganizerRevenueReportViewPDF(APIView):
    def get(self, request):
        try:
            bookings_qs = Booking.objects.filter(
                event__hostedBy=request.user
            ).select_related('event', 'user', 'event__category')
            report_data = prepare_report_data(request.user, bookings_qs)
            
            pdf_generator = OrganizerPDFGenerator()
            pdf_buffer = pdf_generator.generate_revenue_report(report_data)
            
            response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="organizer_revenue_report_{timezone.now().strftime("%Y%m%d_%H%M%S")}.pdf"'
            
            return response
        except Exception as e:
            return Response({"success": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@permission_classes([IsOrganizerUser])
class OrganizerRevenueReportViewExcel(APIView):
    def get(self, request):
        try:
            bookings_qs = Booking.objects.filter(
                event__hostedBy=request.user
            ).select_related('event', 'user', 'event__category')
            report_data = prepare_report_data(request.user, bookings_qs)
            
            excel_generator = OrganizerExcelGenerator()
            excel_buffer = excel_generator.generate_revenue_report(report_data)
            
            response = HttpResponse(
                excel_buffer.getvalue(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename="organizer_revenue_report_{timezone.now().strftime("%Y%m%d_%H%M%S")}.xlsx"'
            
            return response
        except Exception as e:
            return Response({"success": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def prepare_report_data(user, bookings_qs):
    total_revenue = bookings_qs.aggregate(Sum('total_price'))['total_price__sum'] or 0
    organizer_revenue = round(Decimal(str(total_revenue)) * Decimal('0.90'), 2)
    platform_fee = round(Decimal(str(total_revenue)) * Decimal('0.10'), 2)
    generated_at = safe_make_naive(timezone.now())
    
    summary = {
        'organizer_name': user.full_name,
        'organizer_email': user.email,
        'total_bookings': bookings_qs.count(),
        'total_revenue': float(total_revenue),
        'organizer_revenue': float(organizer_revenue),
        'platform_fee': float(platform_fee),
        'revenue_split': {'organizer': 90, 'platform': 10},
        'report_period': {
            'start_date': 'All time',
            'end_date': 'All time'
        },
        'generated_at':     generated_at
    }
    
    bookings_data = bookings_qs.values(
        'booking_id', 'booking_name', 'total_price', 'booking_date',
        'payment_date', 'payment_status', 'event__title', 'event__date',
        'user__full_name', 'user__email', 'notes'
    ).order_by('-booking_date')
    
    enhanced_bookings = []
    for booking in bookings_data:
        for field in ['booking_date', 'payment_date', 'event__date']:
            if field in booking:
                booking[field] = safe_make_naive(booking[field])
        
        booking['organizer_amount'] = float(round(Decimal(str(booking['total_price'])) * Decimal('0.90'), 2))
        booking['platform_fee'] = float(round(Decimal(str(booking['total_price'])) * Decimal('0.10'), 2))
        enhanced_bookings.append(booking)
    
    event_revenue = bookings_qs.values(
        'event__title', 'event__date', 'event__pricePerTicket'
    ).annotate(
        total_bookings=Count('booking_id'),
        total_revenue=Sum('total_price'),
        organizer_revenue=Sum('total_price') * Decimal('0.90'),
        platform_fee=Sum('total_price') * Decimal('0.10')
    ).order_by('-total_revenue')

    event_revenue_list = list(event_revenue)
    for event in event_revenue_list:
        if 'event__date' in event:
            event['event__date'] = safe_make_naive(event['event__date'])
    
    return {
        'summary': summary,
        'bookings': enhanced_bookings,
        'event_revenue': event_revenue_list,
    }


def safe_make_naive(dt_obj):
    if dt_obj is None:
        return None
    if isinstance(dt_obj, datetime):
        if timezone.is_aware(dt_obj):
            return timezone.make_naive(dt_obj)
        else:
            return dt_obj
    elif isinstance(dt_obj, date):
        return dt_obj
    else:
        return dt_obj


@permission_classes([IsAuthenticated])
class OrganizerProfileView(APIView):
    def get(self, request):
        try:
            user = request.user
            try:
                organizer_profile = OrganizerProfile.objects.get(user=user)
                return Response({
                    "id": organizer_profile.id,
                    "user_id": user.user_id,
                    "place": organizer_profile.place,
                    "about": organizer_profile.about,
                    "id_proof": organizer_profile.id_proof,
                    "is_approved": organizer_profile.is_approved,
                    "approved_at": organizer_profile.approved_at,
                    "is_rejected": organizer_profile.is_rejected,
                    "rejected_reason": organizer_profile.rejected_reason
                }, status=status.HTTP_200_OK)
            except OrganizerProfile.DoesNotExist:
                return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        try:
            user = request.user
            place = request.data.get('place')
            about = request.data.get('about')
            id_proof = request.data.get('id_proof')
            
            if not place or not about or not id_proof:
                return Response({"error": "place, about, and id_proof are required"}, status=status.HTTP_400_BAD_REQUEST)
            if OrganizerProfile.objects.filter(user=user).exists():
                return Response({"message": "Organizer profile already exists."}, status=status.HTTP_400_BAD_REQUEST)
            
            organizer_profile = OrganizerProfile(
                user=user,
                place=place,
                about=about,
                id_proof=id_proof
            )
            organizer_profile.save()
            
            return Response({
                "message": "Organizer profile updated successfully",
                "profile": {
                    "place": organizer_profile.place,
                    "about": organizer_profile.about,
                    "id_proof": organizer_profile.id_proof,
                    "is_approved": organizer_profile.is_approved,
                    "approved_at": organizer_profile.approved_at,
                    "is_rejected": organizer_profile.is_rejected,
                    "rejected_reason": organizer_profile.rejected_reason
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EventPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
    page_query_param = 'page'


@permission_classes([IsOrganizerUser])
class OrganizerEventsView(APIView):
    pagination_class = EventPagination

    def get(self, request, format=None):
        events = Event.objects.filter(hostedBy=request.user)
        
        is_completed = request.query_params.get('is_completed', None)
        if is_completed is not None:
            is_completed = is_completed.lower() == 'true'
            events = events.filter(is_completed=is_completed)
        
        events = events.order_by('-date')
        paginator = self.pagination_class()
        paginated_events = paginator.paginate_queryset(events, request)
        serializer = EventSerializer(events, many=True)
        
        return paginator.get_paginated_response({'success': True, 'count': events.count(), 'events': serializer.data})
    
    def post(self, request, format=None):
        data = request.data.copy()
        data['hostedBy'] = request.user.user_id

        try:
            event_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            today = timezone.now().date()
            if event_date < today:
                return Response({'errors': 'Event date cannot be in the past'}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({'errors': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate event data
        validation_error = validate_event(data)
        if validation_error:
            return validation_error
        
        serializer = EventSerializer(data=data)
        if serializer.is_valid():
            event = serializer.save()
            
            return Response({'success': True, 'message': 'Event created successfully', 'data': EventSerializer(event).data}, status=status.HTTP_201_CREATED)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@permission_classes([IsOrganizerUser])
class OrganizerEventUpdateView(APIView):
    def patch(self, request, pk, format=None):
        try:
            event = Event.objects.get(eventId=pk, hostedBy=request.user)
            data = request.data

            immutable_fields = ['location', 'date', 'pricePerTicket', 'cancellationAvailable']
            for field in immutable_fields:
                if field in data and str(getattr(event, field)) != str(data[field]):
                    return Response({"success": False, "errors": f"{field} cannot be modified after event creation."}, status=status.HTTP_400_BAD_REQUEST)

            if 'ticketLimit' in data:
                if int(data['ticketLimit']) < event.ticketsSold:
                    return Response({
                        "success": False,
                        "errors": "Ticket limit cannot be less than tickets already sold."
                    }, status=status.HTTP_400_BAD_REQUEST)

            if data['is_completed']:
                event_date = parse_date(data['date']).date()
                today = date.today()
                if today < event_date:
                    return Response({
                        "success": False,
                        "errors": "You can only mark the event as completed on or after the event date."
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Validate event data
            validation_error = validate_event(data)
            if validation_error:
                return validation_error
            
            serializer = EventSerializer(event, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()

                return Response({"success": True, "message": "Event updated successfully", "event": serializer.data}, status=status.HTTP_200_OK)
            return Response({"success": False, "message": "Failed to update event", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Event.DoesNotExist:
            return Response({"success": False, "message": "Event not found or you don't have permission"}, status=status.HTTP_404_NOT_FOUND)


@permission_classes([IsOrganizerUser])
class OrganizerBookingsView(APIView):
    pagination_class = EventPagination
    
    def get(self, request):
        try:
            organizer_events = Event.objects.filter(hostedBy=request.user)
            
            if not organizer_events.exists():
                return Response({
                    "success": False,
                    "message": "You don't have any events yet"
                }, status=status.HTTP_404_NOT_FOUND)
            
            event_id = request.query_params.get('event_id')
            status_filter = request.query_params.get('status')
            search_query = request.query_params.get('search', '')
            
            bookings_query = Booking.objects.filter(event__in=organizer_events).order_by('-created_at')
            
            if event_id:
                bookings_query = bookings_query.filter(event__eventId=event_id)
                
            if status_filter:
                bookings_query = bookings_query.filter(payment_status=status_filter)
                
            if search_query:
                bookings_query = bookings_query.filter(
                    Q(booking_name__icontains=search_query) | 
                    Q(user__full_name__icontains=search_query) |
                    Q(user__email__icontains=search_query)
                )
            
            paginator = self.pagination_class()
            paginated_bookings = paginator.paginate_queryset(bookings_query, request)
            serializer = OrganizerBookingSerializer(paginated_bookings, many=True)
            
            return Response({
                "success": True,
                "count": bookings_query.count(),
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "bookings": serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"success": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

