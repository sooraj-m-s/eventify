from django.urls import path
from .views import EventListView, OrganizerSearchView, OrganizerDetailView, PlatformStatsView


urlpatterns = [
    path('stats/', PlatformStatsView.as_view(), name='platform-stats'),
    path('events/', EventListView.as_view(), name='event-list'),
    path('organizers/', OrganizerSearchView.as_view(), name='organizer-search'),
    path('organizers/<uuid:user_id>/', OrganizerDetailView.as_view(), name='organizer-detail')
]

