from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
import uuid


# Create your models here.


class UsersManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class Users(AbstractBaseUser, BaseUserManager):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('organizer', 'Organizer'),
        ('admin', 'Admin')
    ]

    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255, null=False)
    email = models.EmailField(max_length=255, unique=True, null=False)
    password = models.TextField(null=False)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='user')
    profile_image = models.CharField(max_length=255, null=True, blank=True)
    mobile = models.BigIntegerField(unique=True, null=False)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_blocked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UsersManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

