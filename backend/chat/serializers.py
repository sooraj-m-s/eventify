from rest_framework import serializers
from .models import ChatRoom, Message
from users.serializers import UserProfileSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = ['message_id', 'content', 'sender', 'is_read', 'created_at']


class ChatRoomSerializer(serializers.ModelSerializer):
    other_participant = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = ['room_id', 'other_participant', 'last_message', 'unread_count', 'updated_at']
    
    def get_other_participant(self, obj):
        request_user = self.context['request'].user
        other_user = obj.get_other_participant(request_user)
        return UserProfileSerializer(other_user).data if other_user else None
    
    def get_last_message(self, obj):
        last_message = obj.get_last_message()
        return MessageSerializer(last_message).data if last_message else None
    
    def get_unread_count(self, obj):
        request_user = self.context['request'].user
        return obj.messages.filter(is_read=False).exclude(sender=request_user).count()


class CreateMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['content']
    
    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        validated_data['room'] = self.context['room']
        return super().create(validated_data)

