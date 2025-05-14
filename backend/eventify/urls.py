from django.urls import path, include


urlpatterns = [
    path('users/', include('users.urls')),
    path('categories/', include('categories.urls')),
    path('events/', include('events.urls')),
    path('admin/', include('admin.urls')),
    path('organizer/', include('organizers.urls')),
    path('booking/', include('booking.urls')),
]

