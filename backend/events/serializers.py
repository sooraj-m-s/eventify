from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    organizer_name = serializers.CharField(source='hostedBy.full_name', read_only=True)
    organizer_id = serializers.UUIDField(source='hostedBy.user_id', read_only=True)
    category_name = serializers.CharField(source='category.categoryName', read_only=True)
    tickets_available = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = '__all__'

    def get_tickets_available(self, obj):
        return obj.ticketLimit - obj.ticketsSold

