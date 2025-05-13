from django.db import models
import uuid


# Create your models here.


class Category(models.Model):
    categoryId = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    categoryName = models.CharField(max_length=255)
    image = models.CharField(max_length=255, blank=True, null=True)
    is_listed = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.categoryName

