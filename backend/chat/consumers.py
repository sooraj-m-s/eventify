from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from django.contrib.auth import get_user_model
import json


User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user_id = None
        
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to chat room'
        }))
    
    async def disconnect(self, close_code):
        if self.user_id:
            await self.update_user_status(self.user_id, False)
            await self.broadcast_user_status(self.user_id, False)
        
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')
            
            if message_type == 'user_connected':
                user_id = text_data_json.get('user_id')
                if user_id:
                    self.user_id = user_id
                    await self.update_user_status(user_id, True)
                    await self.broadcast_user_status(user_id, True)
                    
            elif message_type == 'typing':
                user_id = text_data_json.get('user_id')
                if user_id:
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'typing_indicator',
                            'user_id': user_id,
                            'is_typing': text_data_json.get('is_typing', False)
                        }
                    )
                    
            elif message_type == 'ping':
                user_id = text_data_json.get('user_id')
                if user_id:
                    await self.update_last_activity(user_id)
                    
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': timezone.now().isoformat()
                }))
                
            elif message_type == 'message':
                content = text_data_json.get('content', '').strip()
                sender_id = text_data_json.get('user_id')
                if content and sender_id:
                    await self.update_last_activity(sender_id)
                    message = await self.create_message(content, sender_id)
                    if message:
                        await self.channel_layer.group_send(
                            self.room_group_name,
                            {
                                'type': 'chat_message',
                                'message': message
                            }
                        )
        except json.JSONDecodeError:
            print("Invalid JSON received")
        except Exception as e:
            print(f"Error in receive: {e}")
    
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({'type': 'message', 'message': event['message']}))
    
    async def typing_indicator(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user_id': event['user_id'],
            'is_typing': event['is_typing']
        }))
    
    async def user_status_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'user_id': event['user_id'],
            'is_online': event['is_online'],
            'status_text': event['status_text'],
            'last_seen': event.get('last_seen')
        }))
    
    @database_sync_to_async
    def update_user_status(self, user_id, is_online):
        try:
            user = User.objects.get(user_id=user_id)
            user.set_online_status(is_online)
            return True
        except User.DoesNotExist:
            return False
    
    @database_sync_to_async
    def update_last_activity(self, user_id):
        try:
            user = User.objects.get(user_id=user_id)
            user.update_last_seen()
            return True
        except User.DoesNotExist:
            return False
    
    @database_sync_to_async
    def get_user_status(self, user_id):
        try:
            user = User.objects.get(user_id=user_id)
            return {
                'is_online': user.is_online,
                'status_text': user.get_online_status(),
                'last_seen': user.last_seen.isoformat() if user.last_seen else None
            }
        except User.DoesNotExist:
            return None
    
    async def broadcast_user_status(self, user_id, is_online):
        status_info = await self.get_user_status(user_id)
        if status_info:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_status_update',
                    'user_id': user_id,
                    'is_online': status_info['is_online'],
                    'status_text': status_info['status_text'],
                    'last_seen': status_info['last_seen']
                }
            )
    
    @database_sync_to_async
    def create_message(self, content, sender_id):
        return {
            'message_id': str(timezone.now().timestamp()),
            'content': content,
            'sender': {'user_id': sender_id},
            'created_at': timezone.now().isoformat()
        }

