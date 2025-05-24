from rest_framework import serializers
from events.serializers import EventSerializer
from .models import Wallet, WalletTransaction, OrganizerWallet, OrganizerWalletTransaction, CompanyWallet


class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ['wallet_id', 'balance', 'created_at', 'updated_at']


class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = ['transaction_id', 'amount', 'transaction_type', 'reference_id', 'created_at']


class OrganizerWalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizerWallet
        fields = ['wallet_id', 'balance', 'created_at', 'updated_at']


class OrganizerWalletTransactionSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)

    class Meta:
        model = OrganizerWalletTransaction
        fields = ['transaction_id', 'amount', 'transaction_type', 'reference_id', 'created_at', 'event']


class CompanyWalletSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_date = serializers.DateField(source='event.date', read_only=True)
    formatted_created_at = serializers.SerializerMethodField()
    
    class Meta:
        model = CompanyWallet
        fields = '__all__'

    def get_formatted_created_at(self, obj):
        return obj.created_at.strftime("%d %b %Y, %I:%M %p")


class WithdrawAllMoneySerializer(serializers.Serializer):
    confirm_withdrawal = serializers.BooleanField(required=True)
    
    def validate_confirm_withdrawal(self, value):
        if not value:
            raise serializers.ValidationError("Something went wrong. Please try again.")
        return value

