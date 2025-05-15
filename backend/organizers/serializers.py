from rest_framework import serializers
from users.serializers import UsersSerializer
from events.serializers import EventSerializer
from booking.models import Booking
from .models import OrganizerProfile


class OrganizerProfileSerializer(serializers.ModelSerializer):
    user = UsersSerializer(read_only=True)
    class Meta:
        model = OrganizerProfile
        fields = '__all__' 


class OrganizerBookingSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)
    user = UsersSerializer(read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'booking_id', 
            'event',
            'user',
            'booking_name',
            'total_price', 
            'booking_date', 
            'payment_status', 
            'is_booking_cancelled',
            'payment_id', 
            'notes', 
            'created_at'
        ]

