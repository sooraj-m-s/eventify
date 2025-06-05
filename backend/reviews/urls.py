from django.urls import path
from .views import OrganizerReviewView, SingleReviewView


urlpatterns = [
    path('', OrganizerReviewView.as_view(), name='organizer-review'),
    path('reviews/<int:pk>/', OrganizerReviewView.as_view(), name='update-review'),
    path('single/', SingleReviewView.as_view(), name='single-review'),
]

