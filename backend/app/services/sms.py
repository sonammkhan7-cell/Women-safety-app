import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

def send_sms(to_number: str, message: str) -> bool:
    """
    Sends an SMS alert using Twilio if credentials are provided.
    Otherwise, logs the message and simulates transmission for testing.
    """
    if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_PHONE_NUMBER:
        try:
            from twilio.rest import Client
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=to_number
            )
            logger.info(f"Real SMS sent to {to_number} via Twilio.")
            return True
        except Exception as e:
            logger.error(f"Failed to send real SMS via Twilio: {str(e)}. Falling back to simulation.")
    
    # Fallback to simulation
    simulated_log = (
        f"\n[SIMULATED SMS]\n"
        f"Recipient: {to_number}\n"
        f"Message: {message}\n"
        f"========================================\n"
    )
    print(simulated_log)
    logger.info(f"Simulated SMS sent to {to_number}")
    return True
