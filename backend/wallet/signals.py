from django.db.models.signals import post_save
from django.dispatch import receiver
from users.models import Users
from wallet.models import Wallet


@receiver(post_save, sender=Users)
def create_user_wallet(sender, instance, created, **kwargs):
    if created:
        Wallet.objects.create(user=instance, balance=0)

