from django.urls import re_path
from chat import consumers as chat_consumers
from notifications import consumers as notification_consumers


websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_id>[0-9a-f-]+)/$', chat_consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/notifications/$', notification_consumers.NotificationConsumer.as_asgi()),
]

