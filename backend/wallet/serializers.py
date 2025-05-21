from rest_framework import serializers
from events.serializers import EventSerializer
from .models import Wallet, WalletTransaction, OrganizerWallet, OrganizerWalletTransaction


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

