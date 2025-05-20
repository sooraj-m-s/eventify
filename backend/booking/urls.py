from django.urls import path
from .views import BookEventView, UserBookingsView, CancelBookingView, BookingDetailView


urlpatterns = [
    path('book/', BookEventView.as_view(), name='book-event'),
    path('detail/<uuid:booking_id>/', BookingDetailView.as_view(), name='booking-detail'),
    path('my_bookings/', UserBookingsView.as_view(), name='user-bookings'),
    path('cancel/<uuid:booking_id>/', CancelBookingView.as_view(), name='cancel-booking'),
]

