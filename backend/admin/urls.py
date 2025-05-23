from django.urls import path
from .views import (
    AdminLoginView, UserListView, UserStatusUpdateView, PendingOrganizerProfilesView,
    EventHoldStatusView, AdminEventListView, EventSettlementView, AdminWalletView
)


urlpatterns = [
    path('login/', AdminLoginView.as_view(), name='admin-login'),
    path('user_list/', UserListView.as_view(), name='user-list'),
    path('users_status/<uuid:user_id>/', UserStatusUpdateView.as_view(), name='admin-user-status-update'),
    path('pending_organizers/', PendingOrganizerProfilesView.as_view(), name='pending-organizers'),
    path('events/', AdminEventListView.as_view(), name='event-detail'),
    path('toggle_hold/<uuid:event_id>/', EventHoldStatusView.as_view(), name='toggle_event_hold'),
    path('events/settle/', EventSettlementView.as_view(), name='event-settlement'),
    path('wallet/', AdminWalletView.as_view(), name='admin-wallet'),
]

