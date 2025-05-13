from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['categoryId', 'categoryName', 'image', 'is_listed', 'created_at']
        read_only_fields = ['categoryId', 'created_at']

