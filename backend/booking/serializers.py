from rest_framework import serializers
from events.serializers import EventSerializer
from .models import Booking


class UserBookingSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'booking_id',
            'event',
            'booking_name',
            'total_price',
            'booking_date',
            'payment_status',
            'is_booking_cancelled',
            'payment_id',
            'payment_date',
            'notes',
            'created_at'
        ]

