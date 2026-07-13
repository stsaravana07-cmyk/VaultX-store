import logging
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def send_html_email(subject, template_name, context, to_email, text_fallback_message):
        """
        Renders an HTML template and transmits it via Django's SMTP Mailer.
        Provides a plain-text fallback for non-HTML email clients.
        Ensures the application never crashes on SMTP failure by logging exceptions.
        """
        try:
            # Render HTML content
            html_content = render_to_string(template_name, context)
            
            # Construct Email
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'VaultX <noreply@vaultx.com>')
            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_fallback_message,
                from_email=from_email,
                to=[to_email]
            )
            msg.attach_alternative(html_content, "text/html")
            
            # Transmit Email
            msg.send(fail_silently=False)
            logger.info(f"Successfully transmitted email '{subject}' to {to_email}")
            return True
        except Exception as e:
            # Robust logging to prevent application crashes
            logger.error(f"SMTP Transmission failure for '{subject}' to {to_email}: {str(e)}", exc_info=True)
            print(f"\n[SMTP ERROR] Failed to send email to {to_email}: {str(e)}\n")
            return False

    @classmethod
    def send_otp_email(cls, email, otp, expires_in_minutes=5):
        """
        Prepares and transmits the security verification OTP email.
        """
        subject = "VaultX Verification - Security Clearancecode"
        template_name = "authentication/otp_email.html"
        context = {
            'otp': otp,
            'expires_in': expires_in_minutes,
            'email': email
        }
        
        text_fallback = (
            f"VaultX Security Code\n\n"
            f"Your security verification code is: {otp}\n\n"
            f"This code will expire in {expires_in_minutes} minutes. "
            f"If you did not initiate this request, contact VaultX Command Center immediately."
        )
        
        # Sandbox Console fallback logging
        print("\n" + "="*80)
        print(f" [SANDBOX MAIL FALLBACK] OTP code for email {email} is: {otp}")
        print(" Enter this code in the frontend input field to verify.")
        print("="*80 + "\n")
        
        # We try to send the email, but even if it fails, we return the result of sending
        return cls.send_html_email(subject, template_name, context, email, text_fallback)

    @classmethod
    def send_welcome_email(cls, email, username):
        """
        Prepares and transmits the premium onboarding welcome email.
        """
        subject = "VaultX System Activation - Welcome, Operative!"
        template_name = "authentication/welcome_email.html"
        context = {
            'username': username,
            'email': email
        }
        
        text_fallback = (
            f"Welcome to VaultX, Agent {username}!\n\n"
            f"Your security credentials have been successfully cleared and initialized.\n"
            f"You have been granted access level 1 clearance to the Multiverse HQ catalog.\n\n"
            f"Log in to the portal to configure your coordinates, browse weapons, armor suits, and secure gear.\n\n"
            f"Stay vigilant. Secure the multiverse.\n\n"
            f"VaultX Administration Command"
        )
        
        return cls.send_html_email(subject, template_name, context, email, text_fallback)
