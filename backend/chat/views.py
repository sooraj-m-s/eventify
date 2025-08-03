from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models import Q
from django.utils import timezone
import logging
from users.models import Users
from .models import ChatRoom
from .serializers import ChatRoomSerializer, MessageSerializer, CreateMessageSerializer


logger = logging.getLogger(__name__)

class ChatRoomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class MessagePagination(PageNumberPagination):
    page_size = 15
    page_size_query_param = 'page_size'
    max_page_size = 50


@permission_classes([IsAuthenticated])
class ChatRoomListView(APIView):
    pagination_class = ChatRoomPagination

    def get(self, request):
        try:
            search_query = request.GET.get('search', '').strip()
            chat_rooms = ChatRoom.objects.filter(participants=request.user).prefetch_related('participants', 'messages').order_by('-updated_at')
            
            if search_query:
                chat_rooms = chat_rooms.filter(
                    Q(participants__full_name__istartswith=search_query) |
                    Q(participants__email__icontains=search_query)
                ).distinct()
            paginator = self.pagination_class()
            result_page = paginator.paginate_queryset(chat_rooms, request)
            serializer = ChatRoomSerializer(result_page, many=True, context={'request': request})
            
            return paginator.get_paginated_response({'chat_rooms': serializer.data})
        except Exception as e:
            logger.error(f"Error fetching chat rooms: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@permission_classes([IsAuthenticated])
class StartChatView(APIView):
    def post(self, request):
        try:
            other_user_id = request.data.get('user_id')
            
            if not other_user_id:
                return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            if str(other_user_id) == str(request.user.user_id):
                return Response({'error': 'Cannot start chat with yourself'}, status=status.HTTP_400_BAD_REQUEST)
            
            other_user = get_object_or_404(Users, user_id=other_user_id)
            room, created = ChatRoom.get_or_create_room(request.user, other_user)
            serializer = ChatRoomSerializer(room, context={'request': request})
            
            return Response({'room': serializer.data, 'created': created}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error starting chat: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@permission_classes([IsAuthenticated])
class ChatMessagesView(APIView):
    pagination_class = MessagePagination
    
    def get(self, request, room_id):
        try:
            room = get_object_or_404(ChatRoom, room_id=room_id, participants=request.user)
            unread_messages = room.messages.filter(is_read=False).exclude(sender=request.user)
            
            for message in unread_messages:
                message.mark_as_read()
            
            paginator = self.pagination_class()
            messages = room.messages.select_related('sender')
            result_page = paginator.paginate_queryset(messages, request)
            serializer = MessageSerializer(result_page, many=True)
            
            return paginator.get_paginated_response(serializer.data)
        except Exception as e:
            logger.error(f"Error fetching messages for room {room_id}: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request, room_id):
        try:
            room = get_object_or_404(ChatRoom, room_id=room_id, participants=request.user)
            serializer = CreateMessageSerializer(data=request.data, context={'request': request, 'room': room})
            
            if serializer.is_valid():
                message = serializer.save()
                room.save(update_fields=['updated_at'])
                channel_layer = get_channel_layer()
                room_group_name = f'chat_{room_id}'
                message_data = MessageSerializer(message).data
                
                async_to_sync(channel_layer.group_send)(room_group_name, {'type': 'chat_message', 'message': message_data})
                
                other_participant = room.get_other_participant(request.user)
                if other_participant:
                    self.send_message_notification(message, other_participant, room)
                
                return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error sending message in room {room_id}: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def send_message_notification(self, message, recipient, room):
        try:
            # Create notification data
            notification_data = {
                'type': 'new_message',
                'message': f"You have a new message from {message.sender.full_name}",
                'sender_id': str(message.sender.user_id),
                'sender_name': message.sender.full_name,
                'sender_image': message.sender.profile_image or '',
                'room_id': str(room.room_id),
                'message_preview': message.content[:50] + ('...' if len(message.content) > 50 else '') if message.content else 'Sent an image',
                'message_type': message.message_type,
                'timestamp': timezone.now().isoformat()
            }
            
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'notifications_{recipient.user_id}',
                {
                    'type': 'send_notification',
                    'notification': notification_data
                }
            )
            logging.info(f"Notification sent to {recipient.full_name} for new message in room {room.room_id}")
            
        except Exception as e:
            logger.error(f"Error sending message notification: {e}")


@permission_classes([IsAuthenticated])
class MarkMessagesReadView(APIView):
    def post(self, request, room_id):
        try:
            room = get_object_or_404(ChatRoom, room_id=room_id, participants=request.user)
            
            unread_messages = room.messages.filter(is_read=False).exclude(sender=request.user)
            updated_count = unread_messages.update(is_read=True)
            
            return Response({'marked_read': updated_count}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error marking messages as read in room {room_id}: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

