from django.urls import path
from .views import EventListView, OrganizerSearchView, OrganizerDetailView


urlpatterns = [
    path('events/', EventListView.as_view(), name='event-list'),
    path('organizers/', OrganizerSearchView.as_view(), name='organizer-search'),
    path('organizers/<uuid:user_id>/', OrganizerDetailView.as_view(), name='organizer-detail')
]

