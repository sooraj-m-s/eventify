from django.db import models
import uuid
from events.models import Event
from users.models import Users


# Create your models here.


class Coupon(models.Model):
    couponId = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=20, unique=True)
    organizer = models.ForeignKey(Users, on_delete=models.CASCADE, limit_choices_to={'role': 'organizer'}, related_name='coupons')
    discount_amount = models.PositiveIntegerField()
    minimum_purchase_amt = models.IntegerField()
    valid_from = models.DateField()
    valid_to = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.code


class CouponUsage(models.Model):
    couponUsageId = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE)
    eventId = models.ForeignKey(Event, on_delete=models.CASCADE)
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'coupon')

