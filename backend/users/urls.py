from django.urls import path
from .views import (
    RegisterView, VerifyOTPView, GoogleAuthView, LoginView, CompleteRegistrationView, OrganizerListView,
    RefreshTokenView, LogoutView, UserProfileView, ResendOTPView, ForgotPasswordEmailCheckView,
    ForgotPasswordSetView, ChangePasswordView
)


urlpatterns = [
    path('register/', RegisterView.as_view(), name='user-register'),
    path('verify_otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('auth/google/', GoogleAuthView.as_view(), name='google-login'),
    path('login/', LoginView.as_view(), name='user-login'),
    path('complete_registration/', CompleteRegistrationView.as_view(), name='complete-registration'),
    path('organizers/', OrganizerListView.as_view(), name='organizer-list'),
    path('refresh_token/', RefreshTokenView.as_view(), name='refresh-token'),
    path('resend_otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('logout/', LogoutView.as_view(), name='user-logout'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('forgot_password/', ForgotPasswordEmailCheckView.as_view(), name='forgot-password-email-check'),
    path('change_password/', ForgotPasswordSetView.as_view(), name='forgot-password-set'),
]

