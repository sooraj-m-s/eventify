from django.urls import path
from .views import (
    OrganizerProfileView, OrganizerEventsView, OrganizerEventUpdateView, OrganizerBookingsView,
    OrganizerDashboardView, OrganizerRevenueReportViewPDF, OrganizerRevenueReportViewExcel
)


urlpatterns = [
    path('dashboard/', OrganizerDashboardView.as_view(), name='organizer-dashboard'),
    path('download_report_pdf/', OrganizerRevenueReportViewPDF.as_view(), name='organizer-download-report-pdf'),
    path('download_report_excel/', OrganizerRevenueReportViewExcel.as_view(), name='organizer-download-report-excel'),
    path('profile/', OrganizerProfileView.as_view(), name='organizer-profile'),
    path('organizer_events/', OrganizerEventsView.as_view(), name='organizer-events'),
    path('<uuid:pk>/', OrganizerEventUpdateView.as_view(), name='event-update'),
    path('organizer_bookings/', OrganizerBookingsView.as_view(), name='organizer-bookings'),
]

