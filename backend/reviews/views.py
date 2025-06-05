from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from events.models import Event
from .models import OrganizerReview
from .serializers import OrganizerReviewSerializer


# Create your views here.


class OrganizerReviewView(APIView):
    def get(self, request):
        organizer_id = request.query_params.get('organizer')
        event_id = request.query_params.get('event')
        reviews = OrganizerReview.objects.all()

        if organizer_id:
            reviews = reviews.filter(organizer__id=organizer_id)
        if event_id:
            reviews = reviews.filter(event__id=event_id)

        serializer = OrganizerReviewSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = OrganizerReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        review = get_object_or_404(OrganizerReview, pk=pk)
        if review.user != request.user:
            return Response({"detail": "Not allowed to update this review."}, status=status.HTTP_403_FORBIDDEN)

        serializer = OrganizerReviewSerializer(review, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@permission_classes([IsAuthenticated])
class SingleReviewView(APIView):
    def get(self, request):
        user_id = request.query_params.get('userId')
        event_id = request.query_params.get('eventId')

        try:
            event = Event.objects.get(eventId=event_id)
        except Event.DoesNotExist:
            return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

        if not event.is_completed:
            return Response({"detail": "Event is not completed yet."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            review = OrganizerReview.objects.get(user__user_id=user_id, event__eventId=event_id)
            serializer = OrganizerReviewSerializer(review)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except OrganizerReview.DoesNotExist:
            return Response({"detail": "Review not found."}, status=status.HTTP_404_NOT_FOUND)

