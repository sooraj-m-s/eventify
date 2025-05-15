from rest_framework import serializers
from users.models import Users
from users.serializers import UsersSerializer
from events.models import Event


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['user_id', 'full_name', 'email', 'mobile', 'role', 'profile_image', 'is_blocked']


class EventDetailWithHostSerializer(serializers.ModelSerializer):
    hostedBy = UsersSerializer(read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'eventId', 
            'title',
            'pricePerTicket', 
            'ticketsSold', 
            'ticketLimit', 
            'posterImage', 
            'hostedBy',
            'location', 
            'description', 
            'cancellationPolicy', 
            'termsAndConditions', 
            'date',
            'is_completed',
            'on_hold', 
            'createdAt', 
        ]

