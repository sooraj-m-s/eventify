from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from datetime import date, timedelta
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from users.models import Users
from events.models import Event
from events.serializers import EventSerializer
from .serializers import OrganizerListSerializer


# Create your views here.


class EventPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


@permission_classes([AllowAny])
class EventListView(ListAPIView):
    serializer_class = EventSerializer
    pagination_class = EventPagination
    
    def get_queryset(self):
        tomorrow = date.today() + timedelta(days=1)
        
        queryset = Event.objects.filter(
            date__gte=tomorrow,
            on_hold=False
        ).select_related('hostedBy', 'category').order_by('date')
        
        organizer_id = self.request.query_params.get('organizer', None)
        if organizer_id:
            queryset = queryset.filter(hostedBy__user_id=organizer_id)
        
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(title__istartswith=search_query)
        
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
        
        organizers = Users.objects.filter(
            role='organizer',
            is_blocked=False,
            events_hosted__isnull=False
        ).distinct()
        
        organizers_serializer = OrganizerListSerializer(organizers, many=True)
        
        response_data = {
            'events': events_data,
            'organizers': organizers_serializer.data
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
        })

