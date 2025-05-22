from rest_framework import serializers
from django.contrib.auth.hashers import make_password, check_password
from .models import Users


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


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        user = Users.objects.filter(email=email).first()
        if not user:
            raise serializers.ValidationError({'detail': 'Invalid email or password'})
        if not check_password(password, user.password):
            raise serializers.ValidationError({'detail': 'Invalid email or password'})
        if user.is_blocked:
            raise serializers.ValidationError({'detail': 'Your account is blocked, please contact support'})

        data['user'] = user
        return data


class CompleteRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    name = serializers.CharField(required=True)
    picture = serializers.URLField(required=False, allow_blank=True)
    mobile = serializers.CharField(required=True)
    password = serializers.CharField(required=True, min_length=8)
    confirm_password = serializers.CharField(required=True)

    def validate(self, data):
        if len(data['password']) < 8:
            raise serializers.ValidationError({'password': 'Password must be at least 8 characters long'})
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match'})
        if ' ' in data['password']:
            raise serializers.ValidationError({'password': 'Password cannot contain spaces'})
        if Users.objects.filter(email=data['email'].lower()).exists():
            raise serializers.ValidationError({'email': 'Email already exists'})
        if Users.objects.filter(mobile=data['mobile']).exists():
            raise serializers.ValidationError({'mobile': 'Mobile number already exists'})

        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        validated_data['password'] = make_password(validated_data['password'])
        return Users.objects.create(
            email=validated_data['email'].lower(),
            full_name=validated_data['name'],
            profile_image=validated_data['picture'],
            mobile=validated_data['mobile'],
            password=validated_data['password']
        )


class UserProfileSerializer(serializers.ModelSerializer):
    created_at = serializers.SerializerMethodField()
    
    class Meta:
        model = Users
        fields = [
            'user_id', 
            'full_name', 
            'email', 
            'mobile',
            'profile_image',
            'created_at',
        ]
        read_only_fields = ['user_id', 'email', 'created_at']

    def get_created_at(self, obj):
        if hasattr(obj, 'created_at'):
            return obj.created_at.strftime('%b %d, %Y')
        return None
    
    def validate_mobile(self, value):
        if not value:
            return value
        
        user = self.instance
        if len(str(value)) != 10:
            raise serializers.ValidationError({'error': 'Enter a valid mobile number!'})
        if Users.objects.exclude(user_id=user.user_id).filter(mobile=value).exists():
            raise serializers.ValidationError("This mobile number is already registered with another account.")
        return value


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        if len(data.get('new_password')) < 8:
            raise serializers.ValidationError({'password': 'Password must be at least 8 characters long'})
        if data.get('new_password') != data.get('confirm_password'):
            raise serializers.ValidationError({'confirm_password': 'New password and confirm password do not match'})
        if ' ' in data.get('new_password'):
            raise serializers.ValidationError({'new_password': 'Password cannot contain spaces'})
        
        user = self.context.get('user')
        if user and check_password(data.get('new_password'), user.password):
            raise serializers.ValidationError({'new_password': 'New password must be different from current password'})
            
        return data

