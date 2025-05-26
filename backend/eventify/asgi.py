import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

import notifications.routing
from chat.routing import websocket_urlpatterns as chat_websocket_urlpatterns


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eventify.settings')

all_websocket_urlpatterns = (
    notifications.routing.websocket_urlpatterns +
    chat_websocket_urlpatterns
)

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            all_websocket_urlpatterns
        )
    ),
})

