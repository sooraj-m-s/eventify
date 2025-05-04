from celery import shared_task
from django.core.mail import send_mail
from django.utils.html import strip_tags
from django.utils import timezone
from django.conf import settings
from .models import Users


@shared_task
def send_daily_morning_email():
    users = Users.objects.filter(is_blocked=False)
    
    # Get today's date for the email content
    today = timezone.now().strftime('%A, %B %d, %Y')
    
    for user in users:
        try:
            first_name = user.full_name.split()[0] if user.full_name else "there"
            
            html_message = f"""
            <html>
                <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                        <h2 style="color: #4CAF50; text-align: center;">Good Morning from Eventify!</h2>
                        <p>Hi {first_name.title()},</p>
                        <p>It's {today} and we wanted to share some updates with you:</p>
                        
                        <h3>Today's Highlights:</h3>
                        <ul>
                            <li>New events in your area</li>
                            <li>Special promotions for Eventify members</li>
                            <li>Tips for organizing successful events</li>
                        </ul>
                        
                        <p>Check out our website for more details and exciting events!</p>
                        <p style="margin-top: 20px;">Best regards,<br><strong>The Eventify Team</strong></p>
                    </div>
                    <footer style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">
                        © {timezone.now().year} Eventify. All rights reserved.<br>
                        <a href="[unsubscribe_link]">Unsubscribe</a> from these emails.
                    </footer>
                </body>
            </html>
            """
            
            plain_message = strip_tags(html_message)
            
            send_mail(
                f'Eventify Daily Update - {today}',
                plain_message,
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=True,  # Set to True so one failure doesn't stop other emails
                html_message=html_message,
            )
        except Exception as e:
            print(f"Error sending daily email to {user.email}: {str(e)}")
    
    return f"Daily morning emails sent to {users.count()} users"

