from django.urls import path, include


urlpatterns = [
    path('', include('homepage.urls')),
    path('users/', include('users.urls')),
    path('admin/', include('admin.urls')),
    path('categories/', include('categories.urls')),
    path('events/', include('events.urls')),
    path('organizer/', include('organizers.urls')),
    path('booking/', include('booking.urls')),
    path('payments/', include('payments.urls')),
    path('wallet/', include('wallet.urls')),
    path('chat/', include('chat.urls')),
    path('coupon/', include('coupon.urls')),
    path('reviews/', include('reviews.urls')),
]

