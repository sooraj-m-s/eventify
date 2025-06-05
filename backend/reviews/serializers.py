from rest_framework import serializers
from .models import OrganizerReview


class OrganizerReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizerReview
        fields = '__all__'

