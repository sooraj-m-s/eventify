from rest_framework.views import APIView
from rest_framework.decorators import permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.utils.html import strip_tags
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError as SimpleJWTTokenError, ExpiredTokenError
from django.core.cache import cache
import random, requests, json
from datetime import datetime
from django.conf import settings
from organizers.models import OrganizerProfile
from organizers.serializers import OrganizerProfileSerializer
from .email_templates import registration_email_template, resend_otp_email_template, password_reset_email_template
from .serializers import (
    UserRegistrationSerializer, LoginSerializer, CompleteRegistrationSerializer, UserProfileSerializer,
    ChangePasswordSerializer
)
from .models import Users


@permission_classes([AllowAny])
class RegisterView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email'].lower()
            mobile = serializer.validated_data['mobile']

            if Users.objects.filter(email=email).exists():
                return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
            if Users.objects.filter(mobile=mobile).exists():
                return Response({'error': 'Mobile number already exists'}, status=status.HTTP_400_BAD_REQUEST)

            otp = random.randint(100000, 999999)
            print(f"Generated OTP: {otp}")
            
            temp_user_id = str(random.randint(1000000000, 9999999999))
            redis_key = f"temp_user:{temp_user_id}"
            
            # Store user data in Redis
            user_data = {
                'temp_user_id': temp_user_id,
                'full_name': serializer.validated_data['full_name'],
                'email': email,
                'mobile': mobile,
                'password': serializer.validated_data['password'],
                'profile_image': serializer.validated_data.get('profile_image', None),
                'otp': otp,
                'otp_created_at': timezone.now().isoformat()
            }
            
            cache.set(redis_key, json.dumps(user_data), timeout=600)

            first_name = user_data['full_name'].split()[0]
            html_message = registration_email_template(first_name, otp)
            plain_message = strip_tags(html_message)
            send_mail(
                'Eventify: Verify Your Email Address',
                plain_message,
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
                html_message=html_message,
            )

            return Response({'temp_user_id': str(temp_user_id), 'message': 'OTP sent to your email'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@permission_classes([AllowAny])
class ResendOTPView(APIView):
    def post(self, request):
        temp_user_id = request.data.get('temp_user_id')
        redis_key = f"temp_user:{temp_user_id}"
        user_data_json = cache.get(redis_key)
        
        if not user_data_json:
            return Response({'error': 'Registration expired. Please register again.'}, 
                        status=status.HTTP_400_BAD_REQUEST)
        
        user_data = json.loads(user_data_json)
        new_otp = random.randint(100000, 999999)
        print(f"Generated new OTP: {new_otp}")
        
        user_data['otp'] = new_otp
        user_data['otp_created_at'] = timezone.now().isoformat()
        cache.set(redis_key, json.dumps(user_data), timeout=300)
        
        first_name = user_data['full_name'].split()[0]
        html_message = resend_otp_email_template(first_name, new_otp)
        plain_message = strip_tags(html_message)
        send_mail(
            'Eventify: Your New Verification Code',
            plain_message,
            settings.EMAIL_HOST_USER,
            [user_data['email']],
            fail_silently=False,
            html_message=html_message,
        )
        
        return Response({'message': 'New OTP sent to your email'}, status=status.HTTP_200_OK)


@permission_classes([AllowAny])
class VerifyOTPView(APIView):
    def post(self, request):
        temp_user_id = request.data.get('temp_user_id')
        otp = int(request.data.get('otp'))
        redis_key = f"temp_user:{temp_user_id}"
        user_data_json = cache.get(redis_key)

        if not otp:
            return Response({'error': 'OTP is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not user_data_json:
            return Response({'error': 'Registration expired. Please register again.'}, 
                        status=status.HTTP_400_BAD_REQUEST)

        user_data = json.loads(user_data_json)

        if str(user_data['otp']) != str(otp):
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
        
        otp_created_at = datetime.fromisoformat(user_data['otp_created_at'])
        otp_age_seconds = (timezone.now() - otp_created_at).total_seconds()
        
        if otp_age_seconds > 120:
            return Response({'error': 'OTP has expired. Please request a new one.', 'expired': True}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = Users.objects.create_user(
                email=user_data['email'],
                password=user_data['password'],
                full_name=user_data['full_name'],
                mobile=user_data['mobile'],
                profile_image=user_data.get('profile_image')
            )
        except Exception as e:
            return Response({'error': f'Failed to create user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        cache.delete(redis_key)
    
        refresh = RefreshToken.for_user(user)
        response = Response(
            {
                'detail': 'Successful',
                'user_id': user.user_id,
                'full_name': user.full_name,
                'email': user.email,
                'profile_image': user.profile_image,
                'role': user.role
            },
            status=status.HTTP_200_OK
        )
        response.set_cookie(key='access_token', value=str(refresh.access_token), httponly=True, secure=True, samesite='None')
        response.set_cookie(key='refresh_token', value=str(refresh), httponly=True, secure=True, samesite='None')

        return response


@permission_classes([AllowAny])
class ForgotPasswordEmailCheckView(APIView):
    def post(self, request):
        email = request.data.get('email')
        
        try:
            user = Users.objects.get(email=email)
        except Users.DoesNotExist:
            return Response({"message": "If your email is registered, you will receive an OTP shortly"}, status=status.HTTP_200_OK)
        
        otp = random.randint(100000, 999999)
        print(f"Generated OTP: {otp}")
        
        temp_user_id = str(random.randint(1000000000, 9999999999))
        redis_key = f"temp_user:{temp_user_id}"
        
        # Store data in Redis
        reset_data = {
            'temp_user_id': temp_user_id,
            'full_name': user.full_name,
            'email': user.email,
            'otp': otp,
            'otp_created_at': timezone.now().isoformat(),
        }
        cache.set(redis_key, json.dumps(reset_data), timeout=600)
        
        html_message = password_reset_email_template(user.full_name, otp)
        plain_message = strip_tags(html_message)
        send_mail(
            'Eventify: Password Reset OTP',
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
            html_message=html_message,
        )
        return Response({'temp_user_id': str(temp_user_id), 'message': 'OTP sent to your email'}, status=status.HTTP_200_OK)


@permission_classes([AllowAny])
class ForgotPasswordSetView(APIView):
    def post(self, request):
        temp_user_id = request.data.get('temp_user_id')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirmPassword')
        redis_key = f"temp_user:{temp_user_id}"
        reset_data_json = cache.get(redis_key)

        if not new_password:
            return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 8:
            return Response({'error': 'Password should be at least 8 characters long'}, status=status.HTTP_400_BAD_REQUEST)
        if new_password != confirm_password:
            return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)
        if not reset_data_json:
            return Response({'error': 'Password reset session expired. Please try again.'}, status=status.HTTP_400_BAD_REQUEST)
        
        reset_data = json.loads(reset_data_json)
        
        if str(reset_data['otp']) != str(otp):
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
        
        otp_created_at = datetime.fromisoformat(reset_data['otp_created_at'])
        otp_age_seconds = (timezone.now() - otp_created_at).total_seconds()
        
        if otp_age_seconds > 120:
            return Response({'error': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = Users.objects.get(email=reset_data['email'])
            user.password = make_password(new_password)
            user.save()
            cache.delete(redis_key)
            
            return Response({"message": "Password reset successfully"}, status=status.HTTP_200_OK)
        except Users.DoesNotExist:
            return Response({"error": "Unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@permission_classes([AllowAny])
class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        refresh = RefreshToken.for_user(user)
        response = Response(
            {
                'detail': 'Login successful',
                'user_id': user.user_id,
                'full_name': user.full_name,
                'email': user.email,
                'profile_image': user.profile_image,
                'role': user.role
            },
            status=status.HTTP_200_OK
        )
        response.set_cookie(key='access_token', value=str(refresh.access_token), httponly=True, secure=True, samesite='None')
        response.set_cookie(key='refresh_token', value=str(refresh), httponly=True, secure=True, samesite='None')

        return response


@permission_classes([IsAuthenticated])
class UserProfileView(APIView):
    def get(self, request):
        try:
            user = request.user
            serializer = UserProfileSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"Failed to retrieve profile: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request):
        try:
            user = request.user
            serializer = UserProfileSerializer(user, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": f"Failed to update profile: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@permission_classes([IsAuthenticated])
class ChangePasswordView(APIView):
    def post(self, request):
        try:
            serializer = ChangePasswordSerializer(data=request.data, context={'user': request.user})
            
            if serializer.is_valid():
                user = request.user
                user.password = make_password(serializer.validated_data['new_password'])
                user.save()
                
                return Response({"detail": "Password changed successfully"}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Failed to change password: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@permission_classes([IsAuthenticated])
class LogoutView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except ExpiredTokenError:
                print("Token already expired — skipping blacklist.")
            except SimpleJWTTokenError as e:
                print("Other token error:", e)
            except Exception as e:
                print("Unexpected logout error:", e)

        response = Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        response.set_cookie(key='access_token', value='', httponly=True, secure=True, samesite='None')
        response.set_cookie(key='refresh_token', value='', httponly=True, secure=True, samesite='None')

        return response


@permission_classes([AllowAny])
class RefreshTokenView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            return Response({'detail': 'Refresh token not found'}, status=status.HTTP_401_UNAUTHORIZED)
            
        try:
            token = RefreshToken(refresh_token)
            
            response = Response({'detail': 'Token refreshed successfully'}, status=status.HTTP_200_OK)
            response.set_cookie(key='access_token', value=str(token.access_token), httponly=True, secure=True, samesite='None')
            
            return response
        except Exception as e:
            return Response({'detail': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)


@permission_classes([AllowAny])
class GoogleAuthView(APIView):
    def post(self, request):
        id_token = request.data.get('id_token')
        try:
            response = requests.get(f'https://oauth2.googleapis.com/tokeninfo?id_token={id_token}')
            if response.status_code != 200:
                return Response({'detail': 'Invalid ID token'}, status=status.HTTP_400_BAD_REQUEST)
            token_data = response.json()

            email = token_data.get('email')
            name = token_data.get('name', '')
            picture = token_data.get('picture', '')
        except requests.RequestException:
            return Response({'detail': 'Failed to verify token'}, status=status.HTTP_400_BAD_REQUEST)
        user = Users.objects.filter(email=email).first()
        if user:
            refresh = RefreshToken.for_user(user)
            response = Response(
                {
                    'status': 'exists',
                    'user_id': user.user_id,
                    'full_name': user.full_name,
                    'email': user.email,
                    'profile_image': user.profile_image,
                    'role': user.role
                },
                status=status.HTTP_200_OK
            )
            response.set_cookie(key='access_token', value=str(refresh.access_token), httponly=True, secure=True, samesite='None')
            response.set_cookie(key='refresh_token', value=str(refresh), httponly=True, secure=True, samesite='None')
            return response
        else:
            user_data = {
                'status': 'new',
                'email': email,
                'name': name,
                'picture': picture
            }
            return Response({'status': 'new','redirect': 'complete_registration','user_data': user_data}, status=status.HTTP_200_OK)


@permission_classes([AllowAny])
class CompleteRegistrationView(APIView):
    def post(self, request):
        serializer = CompleteRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.create(serializer.validated_data)
            
            refresh = RefreshToken.for_user(user)
            response = Response({
                    'detail': 'Successful',
                    'user_id': user.user_id,
                    'full_name': user.full_name,
                    'email': user.email,
                    'profile_image': user.profile_image,
                    'role': user.role
                }, status=status.HTTP_200_OK)
            response.set_cookie(key='access_token', value=str(refresh.access_token), httponly=True, secure=True, samesite='None')
            response.set_cookie(key='refresh_token', value=str(refresh), httponly=True, secure=True, samesite='None')
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@permission_classes([AllowAny])
class OrganizerListView(APIView):
    def get(self, request):
        organizers = OrganizerProfile.objects.select_related('user').all()
        serializer = OrganizerProfileSerializer(organizers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

