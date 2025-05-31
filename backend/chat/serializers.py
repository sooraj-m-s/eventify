from rest_framework import serializers
from users.models import Users
from .models import ChatRoom, Message


class ChatUserSerializer(serializers.ModelSerializer):
    online_status = serializers.SerializerMethodField()
    last_seen_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Users
        fields = [
            'user_id', 'full_name', 'email', 'profile_image', 'role',
            'is_online', 'last_seen', 'online_status', 'last_seen_display'
        ]
    
    def get_online_status(self, obj):
        return obj.get_online_status()
    
    def get_last_seen_display(self, obj):
        if obj.is_online:
            return "Online"
        
        status = obj.get_online_status()
        status_map = {
            "recently_active": "Active recently",
            "today": "Last seen today", 
            "yesterday": "Last seen yesterday",
            "long_time_ago": "Last seen long ago"
        }
        
        return status_map.get(status, status)


class MessageSerializer(serializers.ModelSerializer):
    sender = ChatUserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'message_id', 'content', 'message_type', 'media_url', 
            'media_filename', 'sender', 'is_read', 'created_at'
        ]


class ChatRoomSerializer(serializers.ModelSerializer):
    other_participant = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    other_participant_online_status = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = [
            'room_id', 'other_participant', 'last_message', 'unread_count',
            'updated_at', 'other_participant_online_status'
        ]
    
    def get_other_participant(self, obj):
        request_user = self.context['request'].user
        other_user = obj.get_other_participant(request_user)
        return ChatUserSerializer(other_user).data if other_user else None
    
    def get_last_message(self, obj):
        last_message = obj.get_last_message()
        return MessageSerializer(last_message).data if last_message else None
    
    def get_unread_count(self, obj):
        request_user = self.context['request'].user
        return obj.messages.filter(is_read=False).exclude(sender=request_user).count()
    
    def get_other_participant_online_status(self, obj):
        request_user = self.context['request'].user
        other_user = obj.get_other_participant(request_user)
        
        if not other_user:
            return {'is_online': False, 'last_seen': None, 'status_text': 'Unknown'}
        
        return {
            'is_online': other_user.is_online,
            'last_seen': other_user.last_seen.isoformat() if other_user.last_seen else None,
            'status_text': other_user.get_online_status()
        }


class CreateMessageSerializer(serializers.ModelSerializer):
    content = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Message
        fields = ['content', 'message_type', 'media_url', 'media_filename']
    
    def validate(self, data):
        message_type = data.get('message_type', 'text')
        content = data.get('content', '').strip()
        media_url = data.get('media_url')
        
        if message_type == 'text' and not content:
            raise serializers.ValidationError("Text messages must have content")
        
        if message_type in ['image', 'document'] and not media_url:
            raise serializers.ValidationError("Media messages must have a media URL")
        
        return data
    
    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        validated_data['room'] = self.context['room']
        return super().create(validated_data)

