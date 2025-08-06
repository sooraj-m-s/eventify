from django.urls import path
from .views import BookEventView, UserBookingsView, CancelBookingView, BookingDetailView, DownloadTicketView


urlpatterns = [
    path('book/', BookEventView.as_view(), name='book-event'),
    path('detail/<uuid:booking_id>/', BookingDetailView.as_view(), name='booking-detail'),
    path('my-bookings/', UserBookingsView.as_view(), name='user-bookings'),
    path('cancel/<uuid:booking_id>/', CancelBookingView.as_view(), name='cancel-booking'),
    path('download-ticket/<uuid:booking_id>/', DownloadTicketView.as_view(), name='download-ticket'),
]

