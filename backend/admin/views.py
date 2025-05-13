from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from users.models import Users
from organizers.models import OrganizerProfile
from organizers.serializers import OrganizerProfileSerializer
from .permissions import IsAdminUser
from .serializers import UserListSerializer


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
                'email': user.email,
                'role': user.role
            },
            status=status.HTTP_200_OK
        )
        
        response.set_cookie(key='access_token', value=str(refresh.access_token), httponly=True, secure=True, samesite='None')
        response.set_cookie(key='refresh_token', value=str(refresh), httponly=True, secure=True, samesite='None')
        return response


class UserPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
    page_query_param = 'page'


@permission_classes([IsAdminUser])
class UserListView(APIView):
    pagination_class = UserPagination
    
    def get(self, request):
        search_query = request.query_params.get('search', '')
        role = request.query_params.get('role')
        page = request.query_params.get('page', 1)
        page_size = request.query_params.get('page_size', 10)
        
        queryset = Users.objects.exclude(role='admin')
        
        if search_query:
            queryset = queryset.filter(full_name__icontains=search_query)
        
        queryset = queryset.filter(role=role).order_by('-created_at')
        
        # Apply pagination
        paginator = UserPagination()
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


permission_classes([IsAdminUser])
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
                
                if action == 'approve':
                    user = Users.objects.get(user_id=organizer_profile.user.user_id)
                    user.role = 'organizer'
                    user.save()
                    organizer_profile.is_approved = True
                    organizer_profile.approved_at = timezone.now()
                elif action == 'reject':
                    organizer_profile.is_rejected = True
                    organizer_profile.rejected_reason = reason
                else:
                    return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
                organizer_profile.save()

                return Response({"message": "Profile updated successfully"}, status=status.HTTP_200_OK)
            except OrganizerProfile.DoesNotExist:
                return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

