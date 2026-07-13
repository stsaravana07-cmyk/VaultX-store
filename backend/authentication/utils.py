import random
from django.core.mail import send_mail
from django.conf import settings

def generate_otp():
    return str(random.randint(100000, 999999))

def send_email_otp(email, otp, is_register=True):
    try:
        # Console output fallback for developer testing
        print("\n" + "="*80)
        print(f" [SANDBOX MAIL FALLBACK] OTP code for email {email} is: {otp}")
        print(" Enter this code in the frontend input field to verify.")
        print("="*80 + "\n")
        
        if is_register:
            subject = "VaultX Enlistment - Registration Verification Code"
            message = (
                f"Greetings Operative,\n\n"
                f"Your security verification code for VaultX enlistment is: {otp}.\n\n"
                f"Enter this code in the registration portal to complete your registration protocol.\n\n"
                f"Regards,\n"
                f"VaultX Command Center"
            )
        else:
            subject = "VaultX Access - Password Override Verification Code"
            message = (
                f"Greetings Operative,\n\n"
                f"Your security override verification code is: {otp}.\n\n"
                f"Enter this code in the password recovery portal to authorize password replacement.\n\n"
                f"If you did not initiate this request, contact administrative command immediately.\n\n"
                f"Regards,\n"
                f"VaultX Command Center"
            )
            
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print("SMTP Email sending error (but sandbox fallback is active):", e)
        # We return True so the user can still verify using the console OTP fallback!
        return True

def send_welcome_email(email, username):
    try:
        subject = "VaultX System Activation - Welcome, Operative!"
        message = (
            f"============================================================\n"
            f"                VAULTX SECURITY INITIATIVE                   \n"
            f"============================================================\n\n"
            f"Agent {username},\n\n"
            f"Your security credentials have been successfully cleared and initialized.\n"
            f"You have been granted access level 1 clearance to the Multiverse HQ catalog.\n\n"
            f"OPERATIVE DOSSIER:\n"
            f"---------------------------------\n"
            f"Codename: {username}\n"
            f"System Status: Active & Secured\n"
            f"Security Key: [CONFIDENTIAL]\n"
            f"---------------------------------\n\n"
            f"You are now authorized to browse our tactical weapons, armored suits, and multiverse gear.\n"
            f"Please log in to the portal to configure your coordinates and initialize your loadout.\n\n"
            f"Stay vigilant. Secure the multiverse.\n\n"
            f"Regards,\n"
            f"VaultX Administration Command\n"
            f"multiverse.vaultx.com"
        )
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print("Welcome Email sending error:", e)
        return False
