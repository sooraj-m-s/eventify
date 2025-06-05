from rest_framework import serializers
from events.serializers import EventSerializer
from .models import Booking
from .ticket_generator import TicketPermissions


class UserBookingSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)
    can_download_ticket = serializers.SerializerMethodField()
    can_cancel = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'booking_id', 'user', 'event', 'booking_name', 'total_price',
            'booking_date', 'payment_status', 'is_booking_cancelled',
            'payment_id', 'payment_date', 'notes', 'created_at',
            'can_download_ticket', 'can_cancel'
        ]
    
    def get_can_download_ticket(self, obj):
        permission_check = TicketPermissions.can_download_ticket(obj)
        return permission_check["allowed"]
    
    def get_can_cancel(self, obj):
        permission_check = TicketPermissions.can_cancel_booking(obj)
        return permission_check["allowed"]

