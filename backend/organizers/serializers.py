from rest_framework import serializers
from decimal import Decimal
from users.serializers import UserProfileSerializer
from events.models import Event
from events.serializers import EventSerializer
from booking.models import Booking
from .models import OrganizerProfile


class OrganizerProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    class Meta:
        model = OrganizerProfile
        fields = '__all__'


class OrganizerEventSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.categoryName', read_only=True)
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    organizer_revenue = serializers.SerializerMethodField()
    platform_fee = serializers.SerializerMethodField()
    confirmed_bookings = serializers.IntegerField(read_only=True)
    pending_bookings = serializers.IntegerField(read_only=True)
    cancelled_bookings = serializers.IntegerField(read_only=True)
    tickets_available = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'eventId', 'title', 'category_name', 'pricePerTicket', 'ticketsSold', 
            'ticketLimit', 'tickets_available', 'posterImage', 'location', 
            'description', 'date', 'is_completed', 'on_hold', 'is_settled_to_organizer',
            'total_revenue', 'organizer_revenue', 'platform_fee', 
            'confirmed_bookings', 'pending_bookings', 'cancelled_bookings',
            'createdAt', 'updatedAt'
        ]
    
    def get_organizer_revenue(self, obj):
        total_revenue = getattr(obj, 'total_revenue', 0) or 0
        return round(Decimal(str(total_revenue)) * Decimal('0.90'), 2)
    
    def get_platform_fee(self, obj):
        total_revenue = getattr(obj, 'total_revenue', 0) or 0
        return round(Decimal(str(total_revenue)) * Decimal('0.10'), 2)
    
    def get_tickets_available(self, obj):
        return obj.ticketLimit - obj.ticketsSold


class OrganizerBookingSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)
    user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'booking_id', 'event', 'user', 'booking_name', 'total_price',
            'booking_date', 'payment_status', 'is_booking_cancelled',
            'payment_id', 'notes', 'created_at'
        ]

    def get_organizer_amount(self, obj):
        return round(Decimal(str(obj.total_price)) * Decimal('0.90'), 2)
    
    def get_platform_fee(self, obj):
        return round(Decimal(str(obj.total_price)) * Decimal('0.10'), 2)

