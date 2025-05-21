from django.core.mail import send_mail
from django.utils.html import strip_tags
from django.conf import settings
from django.utils import timezone


def send_organizer_approval_email(email, first_name):
    html_message = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #4CAF50; text-align: center;">Organizer Application Approved!</h2>
                <p>Hi {first_name.title()},</p>
                <p>Congratulations! Your application to become an organizer on Eventify has been <strong>approved</strong>.</p>
                <p>You now have access to all organizer features, including:</p>
                <ul>
                    <li>Creating and managing events</li>
                    <li>Accessing the organizer dashboard</li>
                    <li>Managing ticket sales and attendees</li>
                    <li>Receiving payments through your organizer wallet</li>
                </ul>
                <p>Log in to your account to start creating amazing events!</p>
                <div style="text-align: center; margin: 25px 0;">
                    <a href="{settings.FRONTEND_URL}/login" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                        Log In Now
                    </a>
                </div>
                <p>Thank you for choosing Eventify!</p>
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
        'Eventify: Organizer Application Approved!',
        plain_message,
        settings.EMAIL_HOST_USER,
        [email],
        fail_silently=False,
        html_message=html_message,
    )

def send_organizer_rejection_email(email, first_name, reason):
    html_message = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #e74c3c; text-align: center;">Organizer Application Status Update</h2>
                <p>Hi {first_name.title()},</p>
                <p>Thank you for your interest in becoming an organizer on Eventify. After careful review, we regret to inform you that your application has not been approved at this time.</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #e74c3c; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Reason:</strong> {reason or "Your application did not meet our current requirements."}</p>
                </div>
                <p>You are welcome to apply again in the future with updated information. If you have any questions or need further clarification, please don't hesitate to contact our support team.</p>
                <p>Thank you for your understanding.</p>
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
        'Eventify: Organizer Application Status Update',
        plain_message,
        settings.EMAIL_HOST_USER,
        [email],
        fail_silently=False,
        html_message=html_message,
    )

