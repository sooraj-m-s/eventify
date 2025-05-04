# users/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.utils.html import strip_tags
from django.utils import timezone
from django.conf import settings
from .models import Users


@receiver(post_save, sender=Users)
def handle_user_email_notifications(sender, instance, created, **kwargs):
    if created:
        send_welcome_email(instance)
    else:
        send_profile_update_email(instance)


def send_welcome_email(user):
    try:
        user_email = user.email
        full_name = user.full_name
        first_name = full_name.split()[0] if full_name else "there"
        
        html_message = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #4CAF50; text-align: center;">Welcome to Eventify!</h2>
                    <p>Hi {first_name.title()},</p>
                    <p>Thank you for joining Eventify! We're excited to have you as part of our community.</p>
                    <p>With Eventify, you can:</p>
                    <ul>
                        <li>Discover amazing events in your area</li>
                        <li>Book tickets seamlessly</li>
                        <li>Connect with event organizers</li>
                        <li>Create and manage your own events</li>
                    </ul>
                    <p>If you have any questions or need assistance, feel free to contact our support team.</p>
                    <p style="margin-top: 20px;">Best regards,<br><strong>The Eventify Team</strong></p>
                </div>
                <footer style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">
                    © {timezone.now().year} Eventify. All rights reserved.
                </footer>
            </body>
        </html>
        """
        
        plain_message = strip_tags(html_message)
        send_mail(
            'Welcome to Eventify!',
            plain_message,
            settings.EMAIL_HOST_USER,
            [user_email],
            fail_silently=False,
            html_message=html_message,
        )
    except Exception as e:
        print(f"Error sending welcome email to {user.email}: {str(e)}")

def send_profile_update_email(user):
    try:
        user_email = user.email
        full_name = user.full_name
        first_name = full_name.split()[0] if full_name else "there"
        
        html_message = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #4CAF50; text-align: center;">Profile Updated</h2>
                    <p>Hi {first_name.title()},</p>
                    <p>Your Eventify profile has been successfully updated.</p>
                    <p>If you did not make these changes or if you believe there has been an unauthorized access to your account, please contact our support team immediately.</p>
                    <p style="margin-top: 20px;">Best regards,<br><strong>The Eventify Team</strong></p>
                </div>
                <footer style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">
                    © {timezone.now().year} Eventify. All rights reserved.
                </footer>
            </body>
        </html>
        """
        
        plain_message = strip_tags(html_message)
        send_mail(
            'Eventify: Profile Updated',
            plain_message,
            settings.EMAIL_HOST_USER,
            [user_email],
            fail_silently=False,
            html_message=html_message,
        )
    except Exception as e:
        print(f"Error sending profile update email to {user.email}: {str(e)}")

