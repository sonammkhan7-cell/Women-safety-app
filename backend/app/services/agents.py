import json
import logging
from typing import List, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Gemini Client if API key is present
gemini_available = False
if settings.GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        gemini_available = True
        logger.info("Gemini API successfully configured.")
    except Exception as e:
        logger.error(f"Failed to configure Gemini API: {str(e)}")

def analyze_risk_with_ai(
    latitude: float,
    longitude: float,
    timestamp: str,
    device_motion: str = None,
    audio_transcript: str = None,
    route_deviation: bool = False
) -> Dict[str, Any]:
    """
    Risk Assessment Agent.
    Evaluates current metrics to determine risk level, utilizing Gemini LLM or rule-based fallback.
    """
    if gemini_available:
        try:
            import google.generativeai as genai
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt = (
                f"You are a Women's Safety Assessment Agent analyzing real-time safety metrics:\n"
                f"- Latitude/Longitude: {latitude}, {longitude}\n"
                f"- Timestamp: {timestamp}\n"
                f"- Device Motion Pattern: {device_motion}\n"
                f"- Transcribed Audio Snippet: '{audio_transcript}'\n"
                f"- Route Deviation Detected: {route_deviation}\n\n"
                f"Evaluate the threat level. Return a JSON object with strictly these keys:\n"
                f"1. 'risk_score' (integer 0-100)\n"
                f"2. 'risk_level' ('LOW', 'MEDIUM', 'HIGH')\n"
                f"3. 'risk_factors' (list of strings explaining details of threats detected)\n"
                f"4. 'recommended_action' (clear safety instructions for the user)\n"
                f"5. 'should_alert_guardians' (boolean)\n\n"
                f"Output valid JSON only."
            )
            response = model.generate_content(prompt)
            clean_text = response.text.strip().replace("```json", "").replace("```", "")
            return json.loads(clean_text)
        except Exception as e:
            logger.error(f"Error calling Gemini in Risk Assessment: {str(e)}")

    # Deterministic Rule-Based Fallback
    risk_score = 10
    risk_factors = []
    
    if device_motion == "shaking":
        risk_score += 25
        risk_factors.append("Unusual shaking of the device (potential panic/struggle)")
    elif device_motion == "sudden_acceleration":
        risk_score += 15
        risk_factors.append("Sudden acceleration or quick change in movement speed")

    if audio_transcript:
        danger_keywords = ["help", "stop", "please", "screaming", "run", "no", "emergency", "danger", "police", "leave", "stay away"]
        matched_words = [word for word in danger_keywords if word in audio_transcript.lower()]
        if matched_words:
            risk_score += 50
            risk_factors.append(f"Distress trigger phrases detected: {', '.join(matched_words)}")

    if route_deviation:
        risk_score += 30
        risk_factors.append("Active journey deviated significantly from the safest path")

    # Time of day risk (late night 10pm - 5am)
    try:
        from datetime import datetime
        current_hour = datetime.now().hour
        if current_hour >= 22 or current_hour <= 5:
            risk_score += 15
            risk_factors.append("Traveling late night / early morning hours")
    except Exception:
        pass

    risk_score = min(risk_score, 100)
    
    if risk_score >= 70:
        level = "HIGH"
        action = "CRITICAL RISK! Proactively launching emergency SOS. Alerting guardians and dispatching help."
        should_alert = True
    elif risk_score >= 35:
        level = "MEDIUM"
        action = "Potential threat. Keep app open, monitor your safe route, and consider simulating a fake call to deter strangers."
        should_alert = False
    else:
        level = "LOW"
        action = "Status Normal. Continue to your destination safely."
        should_alert = False

    return {
        "risk_score": risk_score,
        "risk_level": level,
        "risk_factors": risk_factors if risk_factors else ["None detected"],
        "recommended_action": action,
        "should_alert_guardians": should_alert
    }

def generate_safety_chat_response(
    message: str,
    lat: float = None,
    lng: float = None
) -> Dict[str, Any]:
    """
    AI Safety Assistant Agent.
    Handles general conversations, guides directions to safe havens, and analyzes query contexts.
    """
    if gemini_available:
        try:
            import google.generativeai as genai
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = (
                f"You are a compassionate, prompt, and intelligent Women's Safety Companion AI Assistant. "
                f"The user is asking: '{message}'.\n"
                f"User coordinates: Latitude {lat}, Longitude {lng}.\n\n"
                f"Return a JSON object with:\n"
                f"1. 'response': Conversational, reassuring advice and answers.\n"
                f"2. 'suggested_actions': List of quick buttons/actions (e.g. ['Call Police', 'Fake Incoming Call', 'Share Live Location'])\n"
                f"Output valid JSON only."
            )
            response = model.generate_content(prompt)
            clean_text = response.text.strip().replace("```json", "").replace("```", "")
            return json.loads(clean_text)
        except Exception as e:
            logger.error(f"Error calling Gemini in Safety Chat: {str(e)}")

    # Intelligent local matching fallback
    msg_lower = message.lower()
    
    if "police" in msg_lower or "station" in msg_lower:
        response_text = "I found the nearest Police Station. Tap 'Get Directions' to navigate there immediately."
        actions = ["Show Safe Route to Police Station", "Emergency SOS"]
    elif "safe" in msg_lower or "danger" in msg_lower:
        response_text = "Analyzing your immediate surroundings... Ensure you stay in well-lit, populated routes. I can notify your active guardians if you feel uncomfortable."
        actions = ["Notify Guardians", "Simulate Fake Call"]
    elif "call" in msg_lower or "fake" in msg_lower:
        response_text = "I can trigger an immediate simulated call from a 'Guardian' to help you excuse yourself from this situation safely."
        actions = ["Trigger Fake Call Now", "Silent Distress SOS"]
    else:
        response_text = "I am here with you. If you feel unsafe, click the SOS button to alert emergency services, or use our 'Fake Call' feature to excuse yourself from uncomfortable interactions."
        actions = ["Simulate Fake Call", "Check Nearby Safe Zones"]

    return {
        "response": response_text,
        "suggested_actions": actions
    }
