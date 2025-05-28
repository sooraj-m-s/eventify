from rest_framework import serializers
from users.models import Users


class OrganizerListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['user_id', 'full_name', 'email', 'profile_image']

