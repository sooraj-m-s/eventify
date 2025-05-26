from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
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
        
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
    
    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')
            
            if message_type == 'typing':
                await self.channel_layer.group_send(
                    self.room_group_name,{
                        'type': 'typing_indicator',
                        'user_id': str(self.user.user_id),
                        'is_typing': text_data_json.get('is_typing', False)
                    }
                )
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
    
    @database_sync_to_async
    def check_room_participant(self):
        from .models import ChatRoom
        
        try:
            room = ChatRoom.objects.get(room_id=self.room_id)
            return room.participants.filter(user_id=self.user.user_id).exists()
        except ChatRoom.DoesNotExist:
            return False

