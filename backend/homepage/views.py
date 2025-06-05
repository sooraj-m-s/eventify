from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from datetime import date, timedelta, datetime
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from django.db.models import Q, Min, Max, Avg
from categories.models import Category
from users.models import Users
from events.models import Event
from events.serializers import EventSerializer
from organizers.models import OrganizerProfile
from organizers.serializers import OrganizerProfileSerializer
from reviews.models import OrganizerReview
from .serializers import OrganizerListSerializer


# Create your views here.


class EventPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100


@permission_classes([AllowAny])
class EventListView(ListAPIView):
    serializer_class = EventSerializer
    pagination_class = EventPagination
    
    def get_queryset(self):
        queryset = Event.objects.filter(date__gt=date.today(), on_hold=False).select_related('hostedBy', 'category').order_by('date')
        
        organizer_id = self.request.query_params.get('organizer', None)
        if organizer_id:
            queryset = queryset.filter(hostedBy__user_id=organizer_id)
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(title__istartswith=search_query)
        start_date = self.request.query_params.get('start_date', None)
        if start_date:
            try:
                start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(date__gte=start_date_obj)
            except ValueError:
                pass
        
        end_date = self.request.query_params.get('end_date', None)
        if end_date:
            try:
                end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(date__lte=end_date_obj)
            except ValueError:
                pass
        
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category__categoryId=category_id)
        
        location = self.request.query_params.get('location', None)
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        min_price = self.request.query_params.get('min_price', None)
        if min_price:
            try:
                min_price_val = float(min_price)
                queryset = queryset.filter(pricePerTicket__gte=min_price_val)
            except ValueError:
                pass
        
        max_price = self.request.query_params.get('max_price', None)
        if max_price:
            try:
                max_price_val = float(max_price)
                queryset = queryset.filter(pricePerTicket__lte=max_price_val)
            except ValueError:
                pass
        
        date_filter = self.request.query_params.get('date_filter', None)
        if date_filter:
            today = date.today()
            if date_filter == 'this_week':
                week_start = today
                week_end = today + timedelta(days=7)
                queryset = queryset.filter(date__range=[week_start, week_end])
            elif date_filter == 'next_week':
                next_week_start = today + timedelta(days=7)
                next_week_end = today + timedelta(days=14)
                queryset = queryset.filter(date__range=[next_week_start, next_week_end])
            elif date_filter == 'this_month':
                month_start = today.replace(day=1)
                if today.month == 12:
                    month_end = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
                else:
                    month_end = today.replace(month=today.month + 1, day=1) - timedelta(days=1)
                queryset = queryset.filter(date__range=[month_start, month_end])
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            events_data = serializer.data
        else:
            serializer = self.get_serializer(queryset, many=True)
            events_data = serializer.data
        
        organizers = Users.objects.filter(role='organizer', is_blocked=False).distinct()
        organizers_serializer = OrganizerListSerializer(organizers, many=True)
        
        categories = Category.objects.filter(is_listed=True).values('categoryId', 'categoryName')
        
        locations = Event.objects.filter(
            date__gt=date.today(),
            on_hold=False,
            location__isnull=False
        ).exclude(location='').values_list('location', flat=True).distinct()
        
        price_range = Event.objects.filter(
            date__gt=date.today(),
            on_hold=False
        ).aggregate(
            min_price=Min('pricePerTicket'),
            max_price=Max('pricePerTicket')
        )
        
        response_data = {
            'events': events_data,
            'organizers': organizers_serializer.data,
            'categories': list(categories),
            'locations': list(locations),
            'price_range': price_range,
            'filters_applied': {
                'organizer': request.query_params.get('organizer'),
                'search': request.query_params.get('search'),
                'start_date': request.query_params.get('start_date'),
                'end_date': request.query_params.get('end_date'),
                'category': request.query_params.get('category'),
                'location': request.query_params.get('location'),
                'min_price': request.query_params.get('min_price'),
                'max_price': request.query_params.get('max_price'),
                'date_filter': request.query_params.get('date_filter'),
            }
        }
        
        if page is not None:
            return self.get_paginated_response(response_data)
        return Response(response_data)
    
    def get_paginated_response(self, data):
        return Response({
            'count': self.paginator.page.paginator.count,
            'next': self.paginator.get_next_link(),
            'previous': self.paginator.get_previous_link(),
            'events': data['events'],
            'organizers': data['organizers'],
            'categories': data['categories'],
            'locations': data['locations'],
            'price_range': data['price_range'],
            'filters_applied': data['filters_applied'],
        })


@permission_classes([AllowAny])
class OrganizerSearchView(ListAPIView):
    serializer_class = OrganizerListSerializer
    pagination_class = EventPagination
    
    def get_queryset(self):
        queryset = Users.objects.filter(
            role='organizer',
            is_blocked=False,
            organizer_profiles__is_approved=True
        ).select_related()
        
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(Q(full_name__istartswith=search_query))
        
        return queryset.order_by('full_name')
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({'success': True, 'count': queryset.count(), 'organizers': serializer.data})


@permission_classes([AllowAny])
class OrganizerDetailView(RetrieveAPIView):
    serializer_class = OrganizerProfileSerializer
    lookup_field = 'user__user_id'
    lookup_url_kwarg = 'user_id'
    
    def get_queryset(self):
        return OrganizerProfile.objects.filter(is_approved=True, user__is_blocked=False).select_related('user')
    
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            organizer_id = kwargs.get('user_id')
            serializer = self.get_serializer(instance)

            avg_rating = (OrganizerReview.objects.filter(organizer=organizer_id).aggregate(avg=Avg('rating'))['avg'])
            return Response({'success': True, 'organizer': serializer.data, 'average_rating': avg_rating}, status=status.HTTP_200_OK)
        except OrganizerProfile.DoesNotExist:
            return Response({'success': False, 'error': 'Organizer not found or not approved'}, status=status.HTTP_404_NOT_FOUND)

