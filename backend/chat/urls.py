from django.urls import path
from .views import ChatRoomListView, StartChatView, ChatMessagesView, MarkMessagesReadView


urlpatterns = [
    path('rooms/', ChatRoomListView.as_view(), name='chat-rooms'),
    path('start/', StartChatView.as_view(), name='start-chat'),
    path('rooms/<uuid:room_id>/messages/', ChatMessagesView.as_view(), name='chat-messages'),
    path('rooms/<uuid:room_id>/mark_read/', MarkMessagesReadView.as_view(), name='mark-messages-read'),
]

