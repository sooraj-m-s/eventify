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
import random, requests
from django.conf import settings
from .serializers import UserRegistrationSerializer, LoginSerializer, CompleteRegistrationSerializer, UserProfileSerializer
from .models import TemporaryUserOTP, Users, OrganizerProfile
from .serializers import OrganizerProfileSerializer


# Create your views here.


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
            
            temp_user = TemporaryUserOTP.objects.filter(email=email).first()
            if temp_user:
                temp_user.otp = otp
                temp_user.created_at = timezone.now() 
                temp_user.password = serializer.validated_data['password']
                temp_user.save()
            else:
                temp_user = TemporaryUserOTP(
                    full_name=serializer.validated_data['full_name'],
                    email=email,
                    mobile=mobile,
                    password=serializer.validated_data['password'],
                    profile_image=serializer.validated_data.get('profile_image', None),
                    otp=otp
                )
                temp_user.save()
            first_name = temp_user.full_name.split()[0]
            html_message = f"""
            <html>
                <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                        <h2 style="color: #4CAF50; text-align: center;">Verify Your Email Address</h2>
                        <p>Hi {first_name.title()},</p>
                        <p>Thank you for signing up with Eventify! To complete your registration, please use the verification code below. <strong>Note: This code will expire in 2 minutes.</strong></p>
                        <p style="font-size: 24px; font-weight: bold; text-align: center; color: #4CAF50; margin: 20px 0;">{otp}</p>
                        <p>If you didn’t request this email, no action is needed. Simply ignore this message.</p>
                        <p>Thank you for choosing Eventify!</p>
                        <p style="margin-top: 20px;">Best regards,<br><strong>The Eventify Team</strong></p>
                    </div>
                    <footer style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">
                        © {timezone.now().year} Eventify. All rights reserved.
                    </footer>
                </body>
            </html>
            """
            plain_message = strip_tags(html_message)
            send_mail(
                'Eventify: Verify Your Email Address',
                plain_message,
                settings.EMAIL_HOST_USER,
                [temp_user.email],
                fail_silently=False,
                html_message=html_message,
            )

            return Response({
                'temp_user_id': str(temp_user.temp_user_id),
                'message': 'OTP sent to your email'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@permission_classes([AllowAny])
class ResendOTPView(APIView):
    def post(self, request):
        temp_user_id = request.data.get('temp_user_id')
        
        try:
            temp_user = TemporaryUserOTP.objects.get(temp_user_id=temp_user_id)

            otp = random.randint(100000, 999999)
            print(f"Generated new OTP: {otp}")
            
            temp_user.otp = otp
            temp_user.created_at = timezone.now()
            temp_user.save()
            
            first_name = temp_user.full_name.split()[0]
            html_message = f"""
            <html>
                <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                        <h2 style="color: #4CAF50; text-align: center;">Your New Verification Code</h2>
                        <p>Hi {first_name.title()},</p>
                        <p>You requested a new verification code. Please use the code below to complete your registration. <strong>Note: This code will expire in 2 minutes.</strong></p>
                        <p style="font-size: 24px; font-weight: bold; text-align: center; color: #4CAF50; margin: 20px 0;">{otp}</p>
                        <p>If you didn't request this email, no action is needed. Simply ignore this message.</p>
                        <p>Thank you for choosing Eventify!</p>
                        <p style="margin-top: 20px;">Best regards,<br><strong>The Eventify Team</strong></p>
                    </div>
                    <footer style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">
                        © {timezone.now().year} Eventify. All rights reserved.
                    </footer>
                </body>
            </html>
            """
            plain_message = strip_tags(html_message)
            send_mail(
                'Eventify: Your New Verification Code',
                plain_message,
                settings.EMAIL_HOST_USER,
                [temp_user.email],
                fail_silently=False,
                html_message=html_message,
            )
            
            return Response({'message': 'New OTP sent to your email'}, status=status.HTTP_200_OK)
        except TemporaryUserOTP.DoesNotExist:
            return Response({'error': 'Invalid temporary user ID'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Failed to resend OTP: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@permission_classes([AllowAny])
class VerifyOTPView(APIView):
    def post(self, request):
        temp_user_id = request.data.get('temp_user_id')
        otp = int(request.data.get('otp'))

        try:
            temp_user = TemporaryUserOTP.objects.get(temp_user_id=temp_user_id)

            if temp_user.otp != otp:
                return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
            if temp_user.is_expired():
                temp_user.delete()
                return Response({'error': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)

            user = Users.objects.create_user(
                email=temp_user.email,
                password=temp_user.password,
                full_name=temp_user.full_name,
                mobile=temp_user.mobile,
                profile_image=temp_user.profile_image,
            )
            temp_user.delete()

            return Response({
                'user_id': str(user.user_id),
                'message': 'Account created successfully'
            }, status=status.HTTP_200_OK)

        except TemporaryUserOTP.DoesNotExist:
            return Response({'error': 'Invalid temporary user ID'}, status=status.HTTP_400_BAD_REQUEST)


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
        
        try:
            temp = TemporaryUserOTP.objects.get(email=email)
            temp.otp = otp
            temp.created_at = timezone.now()
            temp.save()
        except TemporaryUserOTP.DoesNotExist:
            temp = TemporaryUserOTP(
                full_name=user.full_name,
                email=user.email,
                mobile=user.mobile,
                password=user.password,
                profile_image=user.profile_image,
                otp=otp
            )
            temp.save()
        
        html_message = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #FF5722; text-align: center;">Password Reset Request</h2>
                    <p>Hi {user.full_name.title()},</p>
                    <p>We received a request to reset your password. Use the OTP below to proceed. <strong>This code will expire in 2 minutes.</strong></p>
                    <p style="font-size: 24px; font-weight: bold; text-align: center; color: #FF5722; margin: 20px 0;">{otp}</p>
                    <p>If you did not request this, please ignore this email. Your account is still safe.</p>
                    <p style="margin-top: 20px;">Best regards,<br><strong>The Eventify Team</strong></p>
                </div>
                <footer style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">
                    © {timezone.now().year} Eventify. All rights reserved.
                </footer>
            </body>
        </html>
        """

        plain_message = strip_tags(html_message)
        send_mail(
            'Eventify: Password Reset OTP',
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
            html_message=html_message,
        )
        return Response({'temp_user_id': str(temp.temp_user_id), 'message': 'OTP sent to your email'}, status=status.HTTP_200_OK)


@permission_classes([AllowAny])
class ForgotPasswordSetView(APIView):
    def post(self, request):
        temp_user_id = request.data.get('temp_user_id')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')
        
        try:
            temp_user = TemporaryUserOTP.objects.get(temp_user_id=temp_user_id, otp=otp)
        except TemporaryUserOTP.DoesNotExist:
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)
        
        if temp_user.is_expired():
            return Response({'error': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = Users.objects.get(email=temp_user.email)
        except Users.DoesNotExist:
            return Response({{"error": "Unexpected error occurred"}}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        user.password = make_password(new_password)
        user.save()
        temp_user.delete()
        
        return Response({"message": "Password reset successfully"}, status=status.HTTP_200_OK)


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
class UserMeView(APIView):
    def get(self, request):
        user = request.user
        return Response({
            'user_id': user.user_id,
            'full_name': user.full_name,
            'email': user.email,
            'profile_image': user.profile_image,
            'role': user.role
        }, status=status.HTTP_200_OK)


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
            return Response({
                'user_id': str(user.user_id),
                'message': 'Account created successfully'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@permission_classes([AllowAny])
class OrganizerListView(APIView):
    def get(self, request):
        organizers = OrganizerProfile.objects.select_related('user').all()
        serializer = OrganizerProfileSerializer(organizers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

