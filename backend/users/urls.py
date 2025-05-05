from django.urls import path
from .views import RegisterView, VerifyOTPView, GoogleAuthView, LoginView, CompleteRegistrationView, OrganizerListView, RefreshTokenView, LogoutView, UserMeView


urlpatterns = [
    path('register/', RegisterView.as_view(), name='user-register'),
    path('verify_otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('auth/google/', GoogleAuthView.as_view(), name='google-login'),
    path('login/', LoginView.as_view(), name='user-login'),
    path('complete_registration/', CompleteRegistrationView.as_view(), name='complete-registration'),
    path('organizers/', OrganizerListView.as_view(), name='organizer-list'),
    path('refresh_token/', RefreshTokenView.as_view(), name='refresh-token'),
    path('logout/', LogoutView.as_view(), name='user-logout'),
    path('me/', UserMeView.as_view(), name='user-me'),
]

