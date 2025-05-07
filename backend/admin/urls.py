from django.urls import path
from .views import  AdminLoginView, UserListView, UserStatusUpdateView


urlpatterns = [
    path('login/', AdminLoginView.as_view(), name='admin-login'),
    path('user_list/', UserListView.as_view(), name='user-list'),
    path('users_status/<uuid:user_id>/', UserStatusUpdateView.as_view(), name='admin-user-status-update'),
]

