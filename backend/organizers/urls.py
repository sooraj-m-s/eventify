from django.urls import path
from .views import (
    OrganizerProfileView, OrganizerEventsView, OrganizerEventUpdateView, OrganizerBookingsView,
    OrganizerDashboardView, OrganizerRevenueReportView
)


urlpatterns = [
    path('dashboard/', OrganizerDashboardView.as_view(), name='organizer-dashboard'),
    path('dashboard/download_report/', OrganizerRevenueReportView.as_view(), name='organizer-download-report'),
    path('profile/', OrganizerProfileView.as_view(), name='organizer-profile'),
    path('organizer_events/', OrganizerEventsView.as_view(), name='organizer-events'),
    path('<uuid:pk>/', OrganizerEventUpdateView.as_view(), name='event-update'),
    path('organizer_bookings/', OrganizerBookingsView.as_view(), name='organizer-bookings'),
]

