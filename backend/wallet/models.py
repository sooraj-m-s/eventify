from django.db import models
import uuid


# Create your models here.


class Wallet(models.Model):
    wallet_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField('users.Users', on_delete=models.CASCADE, related_name='wallet')
    balance = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email}'s Wallet - ₹{self.balance}"


class WalletTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('CREDIT', 'Credit'),
        ('DEBIT', 'Debit'),
        ('REFUND', 'Refund'),
        ('WITHDRAWAL', 'Withdrawal'),
    ]
    
    transaction_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='wallet_transactions')
    amount = models.IntegerField()
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    reference_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.reference_id:
            self.reference_id = "EVNT" + uuid.uuid4().hex[:10].upper()
        super().save(*args, **kwargs)


class OrganizerWallet(models.Model):
    wallet_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField('users.Users', on_delete=models.CASCADE, related_name='organizer_wallet')
    balance = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email}'s Wallet - ₹{self.balance}"


class OrganizerWalletTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('CREDIT', 'Credit'),
        ('DEBIT', 'Debit'),
        ('WITHDRAWAL', 'Withdrawal'),
    ]
    
    transaction_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='organizer_wallet_transactions')
    wallet = models.ForeignKey(OrganizerWallet, on_delete=models.CASCADE, related_name='organizer_wallet_transactions')
    amount = models.IntegerField()
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    reference_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.reference_id:
            self.reference_id = "EVNT" + uuid.uuid4().hex[:10].upper()
        super().save(*args, **kwargs)


class CompanyWallet(models.Model):
    TRANSACTION_TYPES = [
        ('CREDIT', 'Credit'),
        ('WITHDRAWAL', 'Withdrawal'),
    ]
    
    wallet_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='company_wallet')
    total_balance = models.IntegerField()
    transaction_amount = models.IntegerField()
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    reference_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.reference_id:
            self.reference_id = "EVNT" + uuid.uuid4().hex[:10].upper()
        super().save(*args, **kwargs)

