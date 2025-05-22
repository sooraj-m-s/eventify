from django.utils import timezone


def registration_email_template(first_name, otp):
    return f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #4CAF50; text-align: center;">Verify Your Email Address</h2>
                <p>Hi {first_name.title()},</p>
                <p>Thank you for signing up with Eventify! To complete your registration, please use the verification code below. <strong>Note: This code will expire in 2 minutes.</strong></p>
                <p style="font-size: 24px; font-weight: bold; text-align: center; color: #4CAF50; margin: 20px 0;">{otp}</p>
                <p>If you didn't request this email, no action is needed. Simply ignore this message.</p>
                <p>Thank you for choosing Eventify!</p>
                <p style="margin-top: 20px;">Best regards,<br><strong>The Eventify Team</strong></p>
            </div>
            <footer style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">
                © {timezone.now().year} Eventify. All rights reserved.
            </footer>
        </body>
    </html>
    """


def resend_otp_email_template(first_name, otp):
    return f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #4CAF50; text-align: center;">Your New Verification Code</h2>
                <p>Hi {first_name.title()},</p>
                <p>You requested a new verification code. Please use the code below to complete your registration. <strong>Note: This code will expire in 2 minutes.</strong></p>
                <p style="font-size: 24px; font-weight: bold; text-align: center; color: #4CAF50; margin: 20px 0;">{otp}</p>
                <p>If you didn't request this email, no action is needed. Simply ignore this message.</p>
                <p>Thank you for choosing Eventify!</p>
                <p style="margin-top: 20px;">Best regards,<br><strong>The Eventify Team</strong></p>
            </div>
            <footer style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">
                © {timezone.now().year} Eventify. All rights reserved.
            </footer>
        </body>
    </html>
    """


def password_reset_email_template(full_name, otp):
    return f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #FF5722; text-align: center;">Password Reset Request</h2>
                <p>Hi {full_name.title()},</p>
                <p>We received a request to reset your password. Use the OTP below to proceed. <strong>This code will expire in 2 minutes.</strong></p>
                <p style="font-size: 24px; font-weight: bold; text-align: center; color: #FF5722; margin: 20px 0;">{otp}</p>
                <p>If you did not request this, please ignore this email. Your account is still safe.</p>
                <p style="margin-top: 20px;">Best regards,<br><strong>The Eventify Team</strong></p>
            </div>
            <footer style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">
                © {timezone.now().year} Eventify. All rights reserved.
            </footer>
        </body>
    </html>
    """

