from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
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

