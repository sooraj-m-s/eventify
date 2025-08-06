from django.urls import path
from .views import (
    OrganizerProfileView, OrganizerEventsView, OrganizerEventUpdateView, OrganizerBookingsView,
    OrganizerDashboardView, OrganizerRevenueReportViewPDF, OrganizerRevenueReportViewExcel
)


urlpatterns = [
    path('dashboard/', OrganizerDashboardView.as_view(), name='organizer-dashboard'),
    path('download-report-pdf/', OrganizerRevenueReportViewPDF.as_view(), name='organizer-download-report-pdf'),
    path('download-report-excel/', OrganizerRevenueReportViewExcel.as_view(), name='organizer-download-report-excel'),
    path('profile/', OrganizerProfileView.as_view(), name='organizer-profile'),
    path('organizer-events/', OrganizerEventsView.as_view(), name='organizer-events'),
    path('<uuid:pk>/', OrganizerEventUpdateView.as_view(), name='event-update'),
    path('organizer-bookings/', OrganizerBookingsView.as_view(), name='organizer-bookings'),
]

