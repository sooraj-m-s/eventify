from django.db import models
from django.db import models
import uuid


# Create your models here.


class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    )
    
    booking_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='bookings')
    user = models.ForeignKey('users.Users', on_delete=models.CASCADE, related_name='bookings')
    booking_name = models.CharField(max_length=55)
    total_price = models.IntegerField()
    booking_date = models.DateTimeField(auto_now_add=True)
    payment_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_booking_cancelled = models.BooleanField(default=False)
    payment_id = models.CharField(max_length=100, null=True, blank=True)
    payment_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Booking {self.booking_id} - {self.user.full_name} for {self.event.title}"
    
    @property
    def is_confirmed(self):
        return self.status == 'confirmed'
    
    @property
    def is_cancelled(self):
        return self.status == 'cancelled'
    
    @property
    def is_refunded(self):
        return self.status == 'refunded'
    
    def confirm(self):
        self.status = 'confirmed'
        self.save()
    
    def cancel(self):
        self.status = 'cancelled'
        self.save()
    
    def refund(self):
        self.status = 'refunded'
        self.save()

