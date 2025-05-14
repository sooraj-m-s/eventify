from django.urls import path
from .views import BookEventView, UserBookingsView, CancelBookingView


urlpatterns = [
    path('book/', BookEventView.as_view(), name='book-event'),
    path('my_bookings/', UserBookingsView.as_view(), name='user-bookings'),
    path('cancel/<uuid:booking_id>/', CancelBookingView.as_view(), name='cancel-booking'),
]

