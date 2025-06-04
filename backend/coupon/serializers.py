from rest_framework import serializers
from datetime import datetime, timedelta
from .models import Coupon


class CouponSerializer(serializers.ModelSerializer):
    organizer_name = serializers.SerializerMethodField()

    class Meta:
        model = Coupon
        fields = [
            'couponId',
            'code',
            'organizer',
            'organizer_name',
            'discount_amount',
            'minimum_purchase_amt',
            'valid_from',
            'valid_to',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['couponId', 'created_at', 'updated_at']
    
    def get_organizer_name(self, obj):
        return obj.organizer.full_name

    def validate(self, data):
        is_update = self.instance is not None

        valid_from = data.get('valid_from')
        valid_to = data.get('valid_to')
        now = datetime.now().date()

        if not is_update:
            if valid_from and valid_from < now:
                raise serializers.ValidationError({'error': "Valid from date must be in the future."})
        if valid_from and valid_to and valid_to <= valid_from + timedelta(days=1):
            raise serializers.ValidationError({'error': "Valid to date must be at least 1 day after valid from date."})

        return data

