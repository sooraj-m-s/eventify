from celery import shared_task
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from booking.models import Booking
from .models import Event


@shared_task
def send_event_reminder_emails():
    tomorrow = timezone.now().date() + timedelta(days=1)
    
    tomorrow_events = Event.objects.filter(
        date=tomorrow,
        is_completed=False,
        on_hold=False
    )
    
    for event in tomorrow_events:
        bookings = Booking.objects.filter(event_id=event.eventId)
        
        for booking in bookings:
            user_email = booking.user.email if hasattr(booking, 'user') and booking.user else booking.email
            user_name = booking.user.full_name if hasattr(booking, 'user') and booking.user else booking.booking_name
            
            if user_email:
                context = {
                    'user_name': user_name,
                    'event_title': event.title,
                    'event_date': event.date,
                    'event_location': event.location,
                    'year': timezone.now().year
                }
                html_message = render_to_string('event_reminder.html', context)
                plain_message = strip_tags(html_message)
                
                send_mail(
                    f'Reminder: Your event "{event.title}" is tomorrow!',
                    plain_message,
                    settings.EMAIL_HOST_USER,
                    [user_email],
                    fail_silently=False,
                    html_message=html_message,
                )
                
                print(f"Reminder email sent to {user_email} for event {event.title}")
    
    return f"Processed {tomorrow_events.count()} events for tomorrow"

