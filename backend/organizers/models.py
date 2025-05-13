from django.db import models
import uuid
from users.models import Users


# Create your models here.


class OrganizerProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(Users, on_delete=models.CASCADE, related_name='organizer_profiles')
    place = models.CharField(max_length=255)
    about = models.TextField()
    id_proof = models.CharField(max_length=255)
    is_approved = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
    is_rejected = models.BooleanField(default=False)
    rejected_reason = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"OrganizerProfile of {self.user.email}"

