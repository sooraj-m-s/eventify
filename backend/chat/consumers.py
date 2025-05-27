from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.utils import timezone
import json


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user = self.scope['user']
        
        from django.contrib.auth.models import AnonymousUser
        if isinstance(self.user, AnonymousUser):
            await self.close()
            return
        
        is_participant = await self.check_room_participant()
        if not is_participant:
            await self.close()
            return
        
        await self.set_user_online(True)
        
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_status_update',
                'user_id': str(self.user.user_id),
                'is_online': True,
                'last_seen': None
            }
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        await self.set_user_online(False)
        
        last_seen = await self.get_user_last_seen()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_status_update',
                'user_id': str(self.user.user_id),
                'is_online': False,
                'last_seen': last_seen.isoformat() if last_seen else None
            }
        )
        
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
    
    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')
            await self.update_last_seen()
            
            if message_type == 'typing':
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'typing_indicator',
                        'user_id': str(self.user.user_id),
                        'is_typing': text_data_json.get('is_typing', False)
                    }
                )
            elif message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': timezone.now().isoformat()
                }))
        except json.JSONDecodeError:
            pass
    
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({'type': 'message', 'message': event['message']}))
    
    async def typing_indicator(self, event):
        if str(self.user.user_id) != event['user_id']:
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'user_id': event['user_id'],
                'is_typing': event['is_typing']
            }))
    
    async def user_status_update(self, event):
        if str(self.user.user_id) != event['user_id']:
            await self.send(text_data=json.dumps({
                'type': 'user_status',
                'user_id': event['user_id'],
                'is_online': event['is_online'],
                'last_seen': event['last_seen']
            }))
    
    @database_sync_to_async
    def check_room_participant(self):
        from .models import ChatRoom
        
        try:
            room = ChatRoom.objects.get(room_id=self.room_id)
            return room.participants.filter(user_id=self.user.user_id).exists()
        except ChatRoom.DoesNotExist:
            return False
    
    @database_sync_to_async
    def set_user_online(self, is_online):
        User = get_user_model()
        
        try:
            user = User.objects.get(user_id=self.user.user_id)
            user.set_online_status(is_online)
        except User.DoesNotExist:
            pass
    
    @database_sync_to_async
    def update_last_seen(self):
        User = get_user_model()
        
        try:
            user = User.objects.get(user_id=self.user.user_id)
            user.update_last_seen()
        except User.DoesNotExist:
            pass
    
    @database_sync_to_async
    def get_user_last_seen(self):
        User = get_user_model()
        
        try:
            user = User.objects.get(user_id=self.user.user_id)
            return user.last_seen
        except User.DoesNotExist:
            return None
    
    @database_sync_to_async
    def get_user_status_text(self):
        User = get_user_model()
        
        try:
            if hasattr(self.user, 'user_id'):
                user = User.objects.get(user_id=self.user.user_id)
                return user.get_online_status() if hasattr(user, 'get_online_status') else 'offline'
        except User.DoesNotExist:
            pass
        except Exception as e:
            print(f"Error getting status text: {e}")
        return 'offline'


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        
        # Send a welcome message
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'message': 'Notifications connected successfully'
        }))
    
    async def disconnect(self, close_code):
        print(f"🔔 Notification WebSocket disconnected: {close_code}")
    
    async def receive(self, text_data):
        print(f"🔔 Notification received: {text_data}")
        
        # Echo back for now
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'message': 'Notification received'
        }))

