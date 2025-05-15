from django.urls import path
from .views import OrganizerProfileView, OrganizerEventsView, OrganizerEventUpdateView, OrganizerBookingsView


urlpatterns = [
    path('profile/', OrganizerProfileView.as_view(), name='organizer-profile'),
    path('organizer_events/', OrganizerEventsView.as_view(), name='organizer-events'),
    path('<uuid:pk>/', OrganizerEventUpdateView.as_view(), name='event-update'),
    path('organizer_bookings/', OrganizerBookingsView.as_view(), name='organizer-bookings'),
]

