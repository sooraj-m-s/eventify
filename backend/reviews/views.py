from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
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

