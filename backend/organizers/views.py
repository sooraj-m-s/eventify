from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from events.serializers import EventSerializer
from events.models import Event
from .models import OrganizerProfile


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
                return Response({
                    "error": "place, about, and id_proof are required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
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


permission_classes([IsAuthenticated])
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
        
        serializer = EventSerializer(data=data)
        if serializer.is_valid():
            event = serializer.save()
            
            return Response({
                'success': True,
                'message': 'Event created successfully',
                'data': EventSerializer(event).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Failed to create event',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


permission_classes([IsAuthenticated])
class OrganizerEventUpdateView(APIView):
    def patch(self, request, pk, format=None):
        try:
            event = Event.objects.get(eventId=pk, hostedBy=request.user)
            
            serializer = EventSerializer(event, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()

                return Response({"success": True, "message": "Event updated successfully", "event": serializer.data}, status=status.HTTP_200_OK)
            return Response({"success": False, "message": "Failed to update event", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Event.DoesNotExist:
            return Response({"success": False, "message": "Event not found or you don't have permission"}, status=status.HTTP_404_NOT_FOUND)

