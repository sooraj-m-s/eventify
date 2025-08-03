from rest_framework_simplejwt.tokens import AccessToken, BlacklistedToken, TokenError
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import logging
from .models import Users


logger = logging.getLogger(__name__)

class JWTAuthenticationFromCookies(BaseAuthentication):
    def authenticate(self, request):
        if request.path in ['/users/login/', '/users/register/', '/users/refresh_token/']:
            return None
        
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
            logger.error("User not found for the provided token.")
            return None
        except TokenError as e:
            logger.error(f"TokenError: {str(e)}")
            raise AuthenticationFailed("Token is expired, please refresh")
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return None

        return (user, token)

