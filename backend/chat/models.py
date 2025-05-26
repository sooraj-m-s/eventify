from django.db import models
from django.db.models import Count
import uuid
from django.conf import settings


# Create your models here.


class ChatRoom(models.Model):
    room_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='chat_rooms')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Chat Room {self.room_id}"
    
    @classmethod
    def get_or_create_room(cls, user1, user2):
        existing_room = cls.objects.filter(
            participants=user1
        ).filter(
            participants=user2
        ).annotate(
            participant_count=Count('participants')
        ).filter(
            participant_count=2
        ).first()
        
        if existing_room:
            return existing_room, False
        room = cls.objects.create()
        room.participants.add(user1, user2)
        return room, True
    
    def get_other_participant(self, user):
        return self.participants.exclude(user_id=user.user_id).first()
    
    def get_last_message(self):
        return self.messages.first()


class Message(models.Model):
    message_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Message from {self.sender.email} in {self.room.room_id}"
    
    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.save(update_fields=['is_read'])

