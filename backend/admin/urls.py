from django.urls import path
from .views import (
    AdminLoginView, UserListView, UserStatusUpdateView, PendingOrganizerProfilesView,
    EventHoldStatusView, AdminEventListView, EventSettlementView, AdminWalletView,
    AdminDashboardView, AdminFiltersView, DownloadRevenueReportViewPDF, DownloadRevenueReportViewExcel
)


urlpatterns = [
    path('login/', AdminLoginView.as_view(), name='admin-login'),
    path('dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('dashboard/filters/', AdminFiltersView.as_view(), name='admin-filters'),
    path('dashboard/download-report-pdf/', DownloadRevenueReportViewPDF.as_view(), name='download-revenue-report-pdf'),
    path('dashboard/download-report-excel/', DownloadRevenueReportViewExcel.as_view(), name='download-revenue-report-excel'),
    path('user-list/', UserListView.as_view(), name='user-list'),
    path('users-status/<uuid:user_id>/', UserStatusUpdateView.as_view(), name='admin-user-status-update'),
    path('pending-organizers/', PendingOrganizerProfilesView.as_view(), name='pending-organizers'),
    path('events/', AdminEventListView.as_view(), name='event-detail'),
    path('toggle-hold/<uuid:event_id>/', EventHoldStatusView.as_view(), name='toggle_event_hold'),
    path('events/settle/', EventSettlementView.as_view(), name='event-settlement'),
    path('wallet/', AdminWalletView.as_view(), name='admin-wallet'),
]

