from rest_framework import serializers
from users.models import Users


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['user_id', 'full_name', 'email', 'mobile', 'role', 'profile_image', 'is_blocked']

