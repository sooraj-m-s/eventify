from django.utils import timezone
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from urllib.parse import parse_qs
import jwt
from django.conf import settings


class UserActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        if request.user.is_authenticated:
            now = timezone.now()
            if not hasattr(request.user, 'last_seen') or \
               (now - request.user.last_seen).total_seconds() > 300:
                User = get_user_model()
                User.objects.filter(pk=request.user.pk).update(
                    last_seen=now,
                    last_activity=now
                )
        
        return response


class JWTAuthMiddleware(BaseMiddleware):
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        if scope['type'] != 'websocket':
            return await self.inner(scope, receive, send)

        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]

        if not token:
            cookies = {}
            for header_name, header_value in scope.get('headers', []):
                if header_name == b'cookie':
                    cookie_header = header_value.decode()
                    for cookie in cookie_header.split(';'):
                        if '=' in cookie:
                            key, value = cookie.strip().split('=', 1)
                            cookies[key] = value
            
            token = cookies.get('access_token') or cookies.get('accessToken')
        scope['user'] = await self.get_user_from_token(token)
        return await self.inner(scope, receive, send)

    @database_sync_to_async
    def get_user_from_token(self, token):
        if not token:
            return AnonymousUser()

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            
            user_id = payload.get('user_id')
            if not user_id:
                return AnonymousUser()

            User = get_user_model()
            user = User.objects.get(user_id=user_id)
            return user

        except jwt.ExpiredSignatureError:
            print("JWT token has expired")
            return AnonymousUser()
        except jwt.InvalidTokenError:
            print("Invalid JWT token")
            return AnonymousUser()
        except User.DoesNotExist:
            print(f"User with ID {user_id} not found")
            return AnonymousUser()
        except Exception as e:
            print(f"Error authenticating user: {e}")
            return AnonymousUser()


def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner)

