from rest_framework import serializers
from users.models import Users
from events.models import Event


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['user_id', 'full_name', 'email', 'mobile', 'role', 'profile_image']


class EventDetailWithHostSerializer(serializers.ModelSerializer):
    hostedBy = UserListSerializer(read_only=True)
    
    class Meta:
        model = Event
        fields = '__all__'


class OrganizerStatsSerializer(serializers.ModelSerializer):
    total_events = serializers.IntegerField(read_only=True)
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_bookings = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Users
        fields = [
            'user_id', 'full_name', 'email', 'mobile', 'profile_image',
            'created_at', 'total_events', 'total_revenue', 'total_bookings'
        ]


class EventStatsSerializer(serializers.ModelSerializer):
    organizer_name = serializers.CharField(source='hostedBy.full_name', read_only=True)
    category_name = serializers.CharField(source='category.categoryName', read_only=True)
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    confirmed_bookings = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'eventId', 'title', 'organizer_name', 'category_name', 'pricePerTicket',
            'ticketsSold', 'ticketLimit', 'date', 'location', 'is_completed',
            'on_hold', 'total_revenue', 'confirmed_bookings', 'createdAt'
        ]

