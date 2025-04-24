from rest_framework import serializers
from .models import Users
from django.contrib.auth.hashers import make_password


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    user_id = serializers.UUIDField(read_only=True)

    class Meta:
        model = Users
        fields = ['user_id', 'email', 'password', 'phone', 'profile_image', 'role']

    def validate_email(self, value):
        value = value.lower()
        if Users.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

    def validate_password(self, value):
        if ' ' in value:
            raise serializers.ValidationError("Password cannot contain spaces")
        return make_password(value)

    def create(self, validated_data):
        return Users.objects.create(
            role='user',
            **validated_data
        )

