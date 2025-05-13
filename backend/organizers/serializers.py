from rest_framework import serializers
from users.serializers import UsersSerializer
from .models import OrganizerProfile


class OrganizerProfileSerializer(serializers.ModelSerializer):
    user = UsersSerializer(read_only=True)
    class Meta:
        model = OrganizerProfile
        fields = '__all__' 

