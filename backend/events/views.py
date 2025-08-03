from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.utils import timezone
import logging
from .models import Event
from .serializers import EventSerializer


logger = logging.getLogger(__name__)

@permission_classes([AllowAny])
class EventListView(APIView):
    def get(self, request):
        try:
            today = timezone.now().date()
            events = Event.objects.filter(on_hold=False, date__gt=today)[:6] 
            serializer = EventSerializer(events, many=True)

            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error fetching events: {e}")
            return Response({'success': False, 'message': 'An error occurred while fetching events'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@permission_classes([AllowAny])
class EventDetailView(APIView):
    def get(self, request, event_id, format=None):
        try:
            event = Event.objects.get(pk=event_id)
            serializer = EventSerializer(event)
            host = event.hostedBy
            
            host_data = {
                'full_name': host.full_name,
                'email': host.email,
                'phone_number': host.mobile,
            }

            return Response({'success': True, 'data': serializer.data, 'host': host_data}, status=status.HTTP_200_OK)
        except Event.DoesNotExist:
            logger.error(f"Event with id {event_id} not found")
            return Response({'success': False, 'message': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error fetching event details: {e}")
            return Response({'success': False, 'message': 'An error occurred while fetching event details'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

