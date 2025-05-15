from django.db import models
import uuid


# Create your models here.


class Event(models.Model):
    eventId = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    category = models.ForeignKey('categories.Category', to_field='categoryId', on_delete=models.CASCADE)
    pricePerTicket = models.IntegerField()
    ticketsSold = models.IntegerField(default=0)
    ticketLimit = models.IntegerField()
    posterImage = models.CharField(max_length=255, blank=True, null=True)
    hostedBy = models.ForeignKey('users.Users', to_field='user_id', on_delete=models.CASCADE, related_name='events_hosted')
    location = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField()
    cancellationPolicy = models.TextField(blank=True, null=True)
    termsAndConditions = models.TextField(blank=True, null=True)
    date = models.DateField()
    is_completed = models.BooleanField(default=False)
    on_hold = models.BooleanField(default=False)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

