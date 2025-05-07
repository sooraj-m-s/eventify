from django.http import JsonResponse
from users.authentication import JWTAuthenticationFromCookies
from rest_framework_simplejwt.tokens import AccessToken


class BlockedUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.jwt_auth = JWTAuthenticationFromCookies()

    def __call__(self, request):
        excluded_paths = [
            '/users/login/',
            '/users/register/',
            '/users/verify_otp/',
            '/users/resend_otp/',
            '/admin/login/'
        ]
        
        if request.path not in excluded_paths:
            try:
                auth_result = self.jwt_auth.authenticate(request)
                
                if auth_result:
                    user, token = auth_result
                    
                    # Check if user is blocked
                    if user.is_blocked:
                        # Clear the auth cookies in the response
                        response = JsonResponse({
                            'error': 'Your account has been blocked. Please contact customer service.',
                            'code': 'user_blocked'
                        }, status=403)
                        
                        # Delete the cookies
                        response.delete_cookie('access_token')
                        response.delete_cookie('refresh_token')
                        return response
            except Exception as e:
                pass
                
        response = self.get_response(request)
        return response

