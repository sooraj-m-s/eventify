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

