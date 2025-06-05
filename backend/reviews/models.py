from django.db import models
from users.models import Users
from events.models import Event


# Create your models here.


class OrganizerReview(models.Model):
    user = models.ForeignKey(Users, on_delete=models.CASCADE, related_name='reviews_by_user')
    organizer = models.ForeignKey(Users, on_delete=models.CASCADE, related_name='reviews_for_organizer')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='reviews')
    title = models.CharField(max_length=255, blank=True, null=True)
    comment = models.TextField()
    rating = models.IntegerField(choices=[(i, f"{i} Star") for i in range(1, 6)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Review by {self.user.full_name} on {self.event.title}"

