from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Alert, TrustedContact
from app.schemas.schemas import AlertCreate, AlertOut, AlertUpdate, RiskAssessmentRequest, RiskAssessmentResponse
from app.services.agents import analyze_risk_with_ai
from app.services.sms import send_sms

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.post("/", response_model=AlertOut)
def trigger_sos(
    alert_in: AlertCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Set user safety status to danger
    current_user.safety_status = "DANGER"
    if alert_in.location_lat:
        current_user.current_lat = alert_in.location_lat
    if alert_in.location_lng:
        current_user.current_lng = alert_in.location_lng
        
    alert = Alert(
        user_id=current_user.id,
        alert_type=alert_in.alert_type,
        status="ACTIVE",
        location_lat=alert_in.location_lat,
        location_lng=alert_in.location_lng,
        audio_transcript=alert_in.audio_transcript,
        battery_level=alert_in.battery_level
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    
    # Notify Trusted Contacts
    contacts = db.query(TrustedContact).filter(TrustedContact.user_id == current_user.id).all()
    tracking_link = f"http://localhost:3000/guardian?userId={current_user.id}"
    
    message_body = (
        f"CRITICAL: {current_user.name} has triggered an SOS alert! "
        f"Location: Lat {alert.location_lat}, Lng {alert.location_lng}. "
        f"Battery: {alert.battery_level or 'Unknown'}%. "
        f"Track here: {tracking_link}"
    )
    
    if alert.audio_transcript:
        message_body += f" Detected audio transcript: '{alert.audio_transcript}'"

    for contact in contacts:
        send_sms(contact.phone, message_body)
        
    return alert

@router.get("/active", response_model=List[AlertOut])
def get_active_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Returns all active alerts for general guardian overview, or for self
    if current_user.role == "guardian":
        # Guardian sees active alerts
        return db.query(Alert).filter(Alert.status == "ACTIVE").all()
    else:
        # User sees their own active alerts
        return db.query(Alert).filter(
            Alert.user_id == current_user.id, 
            Alert.status == "ACTIVE"
        ).all()

@router.put("/{alert_id}/resolve", response_model=AlertOut)
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Revert user safety status
    current_user.safety_status = "SAFE"
    
    alert = db.query(Alert).filter(
        Alert.id == alert_id, 
        Alert.user_id == current_user.id
    ).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    alert.status = "RESOLVED"
    db.commit()
    db.refresh(alert)
    
    # Notify contacts that user is safe now
    contacts = db.query(TrustedContact).filter(TrustedContact.user_id == current_user.id).all()
    message_body = f"UPDATE: {current_user.name} is now SAFE. The emergency alert has been resolved."
    for contact in contacts:
        send_sms(contact.phone, message_body)
        
    return alert

@router.post("/risk-check", response_model=RiskAssessmentResponse)
def evaluate_realtime_risk(
    req: RiskAssessmentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Call the AI Risk Assessment service
    res = analyze_risk_with_ai(
        latitude=req.latitude,
        longitude=req.longitude,
        timestamp=req.timestamp,
        device_motion=req.device_motion,
        audio_transcript=req.audio_transcript,
        route_deviation=req.route_deviation
    )
    
    # Update safety status on user model based on threat assessment level
    if res["risk_level"] == "HIGH":
        current_user.safety_status = "DANGER"
    elif res["risk_level"] == "MEDIUM":
        current_user.safety_status = "WARNING"
    else:
        current_user.safety_status = "SAFE"
        
    db.commit()
    
    # Automatically spawn SOS Alert if risk is HIGH
    if res["should_alert_guardians"]:
        # Check if an active SOS already exists
        existing = db.query(Alert).filter(
            Alert.user_id == current_user.id,
            Alert.status == "ACTIVE",
            Alert.alert_type == "RISK_ENGINE"
        ).first()
        if not existing:
            alert = Alert(
                user_id=current_user.id,
                alert_type="RISK_ENGINE",
                status="ACTIVE",
                location_lat=req.latitude,
                location_lng=req.longitude,
                audio_transcript=req.audio_transcript or "AI automatic risk trigger",
                battery_level=None
            )
            db.add(alert)
            db.commit()
            
            # Notify contacts
            contacts = db.query(TrustedContact).filter(TrustedContact.user_id == current_user.id).all()
            tracking_link = f"http://localhost:3000/guardian?userId={current_user.id}"
            message = (
                f"ALERT: AI Safety Risk Engine has detected HIGH risk for {current_user.name}!\n"
                f"Factors: {', '.join(res['risk_factors'])}\n"
                f"Track here: {tracking_link}"
            )
            for contact in contacts:
                send_sms(contact.phone, message)
                
    return res
