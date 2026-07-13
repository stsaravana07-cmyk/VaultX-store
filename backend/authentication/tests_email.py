from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from authentication.models import OTPVerification
from authentication.email_service import EmailService
from django.contrib.auth import get_user_model
from django.core import mail

User = get_user_model()

class EmailSystemTest(TestCase):
    def setUp(self):
        self.email = "testagent@vaultx.com"
        self.username = "TestAgent"
        self.password = "securityclearance123"

    def test_otp_generation_and_expiry(self):
        # Create OTP record
        otp = "123456"
        otp_entry = OTPVerification.objects.create(email=self.email, otp=otp)
        
        # Verify it exists and is not expired
        self.assertFalse(otp_entry.is_expired())
        
        # Simulate expiry by setting created_at into the past (e.g. 6 minutes ago)
        otp_entry.created_at = timezone.now() - timedelta(minutes=6)
        otp_entry.save()
        
        # Verify it is now expired
        self.assertTrue(otp_entry.is_expired())

    def test_otp_email_rendering_and_sending(self):
        # Trigger sending using the django test outbox
        otp = "987654"
        success = EmailService.send_otp_email(self.email, otp, expires_in_minutes=5)
        
        # The service returns True
        self.assertTrue(success)
        
        # Check in-memory mail outbox
        self.assertEqual(len(mail.outbox), 1)
        email_sent = mail.outbox[0]
        self.assertEqual(email_sent.subject, "VaultX Verification - Security Clearancecode")
        self.assertIn("987654", email_sent.body)
        self.assertIn("EXPIRES IN 5 MINUTES", email_sent.alternatives[0][0])  # HTML content check

    def test_welcome_email_rendering_and_sending(self):
        # Trigger welcome email sending
        success = EmailService.send_welcome_email(self.email, self.username)
        self.assertTrue(success)
        
        # Check in-memory mail outbox
        self.assertEqual(len(mail.outbox), 1)
        email_sent = mail.outbox[0]
        self.assertEqual(email_sent.subject, "VaultX System Activation - Welcome, Operative!")
        self.assertIn(self.username, email_sent.body)
        self.assertIn("Access Granted, Agent TestAgent!", email_sent.alternatives[0][0])
