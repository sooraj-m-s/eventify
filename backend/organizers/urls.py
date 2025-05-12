from django.urls import path
from .views import OrganizerProfileView


urlpatterns = [
    path('profile/', OrganizerProfileView.as_view(), name='organizer-profile'),
]

