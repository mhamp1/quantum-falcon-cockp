# LICENSE AUTHORITY v2: Now full paywall + onboarding brain — November 19, 2025
# renewal_service.py - Automated renewal reminder system

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .models import License, LicenseTier
from .database import get_db_session
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os


def send_renewal_reminder_email(license: License, days_left: int):
    """Send renewal reminder email to user"""
    
    # Email configuration (use environment variables in production)
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    from_email = os.getenv("FROM_EMAIL", "noreply@quantumfalcon.com")
    
    if not smtp_user or not smtp_password:
        print("SMTP credentials not configured - skipping email")
        return False
    
    subject = f"🦅 Quantum Falcon License Expiring in {days_left} Days"
    
    # Email body
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">🦅 Quantum Falcon</h1>
            <p style="color: white; margin: 5px 0;">Trading Cockpit v2025.1.0</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Your License is Expiring Soon</h2>
            
            <p style="font-size: 16px; color: #666;">
                Hello,
            </p>
            
            <p style="font-size: 16px; color: #666;">
                Your <strong>{license.tier.upper()}</strong> license will expire in <strong>{days_left} days</strong> 
                on <strong>{license.expires_at.strftime('%B %d, %Y')}</strong>.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #333;">License Details</h3>
                <p style="margin: 5px 0;"><strong>User ID:</strong> {license.user_id}</p>
                <p style="margin: 5px 0;"><strong>Tier:</strong> {license.tier.upper()}</p>
                <p style="margin: 5px 0;"><strong>Expires:</strong> {license.expires_at.strftime('%B %d, %Y')}</p>
            </div>
            
            <p style="font-size: 16px; color: #666;">
                Don't lose access to your premium features! Renew now to continue enjoying:
            </p>
            
            <ul style="font-size: 14px; color: #666;">
                <li>Advanced trading strategies</li>
                <li>Multiple autonomous agents</li>
                <li>Real-time analytics</li>
                <li>Priority support</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://quantumfalcon.com/renew?key={license.license_key[:20]}" 
                   style="background: #667eea; color: white; padding: 15px 40px; text-decoration: none; 
                          border-radius: 5px; font-weight: bold; display: inline-block;">
                    Renew Now
                </a>
            </div>
            
            <p style="font-size: 14px; color: #999; text-align: center;">
                Questions? Contact us at support@quantumfalcon.com
            </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
                © 2025 Quantum Falcon. All rights reserved.
            </p>
        </div>
    </body>
    </html>
    """
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = from_email
        msg['To'] = license.email or license.user_id
        
        # Attach HTML body
        html_part = MIMEText(html_body, 'html')
        msg.attach(html_part)
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        
        print(f"✓ Renewal reminder sent to {license.email or license.user_id}")
        return True
        
    except Exception as e:
        print(f"✗ Failed to send renewal reminder: {e}")
        return False


def check_and_send_renewal_reminders():
    """
    Check for licenses expiring soon and send reminders
    Run this as a cron job or scheduled task
    
    Sends reminders at:
    - 7 days before expiry
    - 3 days before expiry
    - 1 day before expiry
    """
    db = get_db_session()
    
    try:
        now = datetime.utcnow()
        
        # Define reminder windows
        reminder_days = [7, 3, 1]
        
        for days in reminder_days:
            target_date = now + timedelta(days=days)
            
            # Find licenses expiring around this date (within 12 hours)
            start_window = target_date - timedelta(hours=12)
            end_window = target_date + timedelta(hours=12)
            
            licenses = db.query(License).filter(
                License.expires_at >= start_window,
                License.expires_at <= end_window,
                License.is_active == True,
                License.is_revoked == False,
                License.renewal_reminder_sent == False,
                License.tier.in_([
                    LicenseTier.PRO.value,
                    LicenseTier.ELITE.value
                ])
            ).all()
            
            for license in licenses:
                days_left = (license.expires_at - now).days
                
                if send_renewal_reminder_email(license, days_left):
                    # Mark as reminder sent
                    license.renewal_reminder_sent = True
                    db.commit()
        
        print(f"✓ Renewal reminder check completed at {now.isoformat()}")
        
    except Exception as e:
        print(f"✗ Error checking renewal reminders: {e}")
        db.rollback()
    finally:
        db.close()


def reset_renewal_reminders():
    """
    Reset renewal reminder flags for licenses that have been renewed
    Run this periodically
    """
    db = get_db_session()
    
    try:
        now = datetime.utcnow()
        
        # Find licenses that have been renewed (expiry is far in future)
        licenses = db.query(License).filter(
            License.expires_at > now + timedelta(days=14),
            License.renewal_reminder_sent == True
        ).all()
        
        for license in licenses:
            license.renewal_reminder_sent = False
        
        db.commit()
        print(f"✓ Reset {len(licenses)} renewal reminder flags")
        
    except Exception as e:
        print(f"✗ Error resetting renewal reminders: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("=== License Authority v2 - Renewal Reminder Service ===")
    print("Checking for licenses requiring renewal reminders...")
    check_and_send_renewal_reminders()
    print("\nResetting renewal flags for renewed licenses...")
    reset_renewal_reminders()
    print("\n✓ Done")
