from rest_framework_simplejwt.tokens import AccessToken, BlacklistedToken
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import Users


class JWTAuthenticationFromCookies(BaseAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get("access_token")
        if not access_token:
            return None

        try:
            token = AccessToken(access_token)
            user = Users.objects.get(user_id=token["user_id"])

            if BlacklistedToken.objects.filter(token__jti=token["jti"]).exists():
                raise AuthenticationFailed("Token has been blacklisted.")
            
            if user.is_blocked:
                raise AuthenticationFailed("User is blocked.")

        except Users.DoesNotExist:
            return None  
        except Exception as e:
            return None 

        return (user, token)

