import os, django
from django.core.asgi import get_asgi_application
django.setup()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from chat.middleware import JWTAuthMiddlewareStack
from .routing import websocket_urlpatterns


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eventify.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket":  URLRouter(websocket_urlpatterns)
})

