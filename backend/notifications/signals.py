from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from events.models import Event


@receiver(post_save, sender=Event)
def send_event_notification(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        
        # Create notification data
        notification_data = {
            'event_id': str(instance.eventId),
            'title': instance.title,
            'image': instance.posterImage if instance.posterImage else None,
            'type': 'new_event',
            'message': f'A new event "{instance.title}" has just been published. Check it out!'
        }
        
        # Send notification to the group
        async_to_sync(channel_layer.group_send)(
            'notifications',
            {
                'type': 'notification_message',
                'message': notification_data
            }
        )

