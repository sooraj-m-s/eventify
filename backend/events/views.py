from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.utils import timezone
from .models import Event
from .serializers import EventSerializer


@permission_classes([AllowAny])
class EventListView(APIView):
    def get(self, request):
        today = timezone.now().date()

        events = Event.objects.filter(on_hold=False, date__gt=today)
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)


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
            return Response({'success': False, 'message': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)

