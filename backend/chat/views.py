from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from users.models import Users
from .models import ChatRoom
from .serializers import ChatRoomSerializer, MessageSerializer, CreateMessageSerializer


# Create your views here.


class MessagePagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 50


@permission_classes([IsAuthenticated])
class ChatRoomListView(APIView):
    def get(self, request):
        try:
            chat_rooms = ChatRoom.objects.filter(participants=request.user).prefetch_related('participants', 'messages')
            serializer = ChatRoomSerializer(chat_rooms, many=True, context={'request': request})
            
            return Response({'chat_rooms': serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
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
            print(f"Error starting chat: {e}")
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
            
            # Get paginated messages
            paginator = self.pagination_class()
            messages = room.messages.select_related('sender')
            result_page = paginator.paginate_queryset(messages, request)
            serializer = MessageSerializer(result_page, many=True)
            
            return paginator.get_paginated_response(serializer.data)
            
        except Exception as e:
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
                
                return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@permission_classes([IsAuthenticated])
class MarkMessagesReadView(APIView):
    def post(self, request, room_id):
        try:
            room = get_object_or_404(ChatRoom, room_id=room_id, participants=request.user)
            
            unread_messages = room.messages.filter(is_read=False).exclude(sender=request.user)
            updated_count = unread_messages.update(is_read=True)
            
            return Response({'marked_read': updated_count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

