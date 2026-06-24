import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eventify.settings')

import django
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from chat.middleware import JWTAuthMiddlewareStack
from .routing import websocket_urlpatterns


application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    # Wrap websocket app with origin and auth middleware
    "websocket": AllowedHostsOriginValidator(
        JWTAuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        )
    ),
})

