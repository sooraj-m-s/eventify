from rest_framework import serializers
from .models import Users
from django.contrib.auth.hashers import make_password


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, required=True)
    user_id = serializers.UUIDField(read_only=True)

    class Meta:
        model = Users
        fields = ['user_id', 'full_name', 'email', 'password', 'confirm_password', 'mobile', 'profile_image', 'role']

    def validate(self, data):
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match'})

        if ' ' in data.get('password'):
            raise serializers.ValidationError({'password': 'Password cannot contain spaces'})

        if len(data.get('password')) < 8:
            raise serializers.ValidationError({'password': 'Password must be at least 8 characters long'})

        if Users.objects.filter(email=data.get('email', '').lower()).exists():
            raise serializers.ValidationError({'email': 'Email already exists'})

        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        validated_data['password'] = make_password(validated_data['password'])
        return Users.objects.create(
            role='user',
            **validated_data
        )


