from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, LocationLog, TrustedContact
from app.schemas.schemas import LocationLogCreate, LocationLogOut, TrustedContactCreate, TrustedContactOut

router = APIRouter(prefix="/location", tags=["location"])

@router.post("/logs", response_model=LocationLogOut)
def log_location(
    log_in: LocationLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Update current location coordinates on user
    current_user.current_lat = log_in.latitude
    current_user.current_lng = log_in.longitude
    
    log = LocationLog(
        user_id=current_user.id,
        latitude=log_in.latitude,
        longitude=log_in.longitude,
        accuracy=log_in.accuracy,
        speed=log_in.speed,
        bearing=log_in.bearing
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

@router.get("/logs", response_model=List[LocationLogOut])
def get_location_logs(
    user_id: int = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Guardians or self can query history
    target_id = user_id if user_id else current_user.id
    logs = db.query(LocationLog).filter(LocationLog.user_id == target_id).order_by(LocationLog.timestamp.desc()).limit(50).all()
    return logs

@router.post("/contacts", response_model=TrustedContactOut)
def add_contact(
    contact_in: TrustedContactCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify contact count is under threshold (e.g. 5)
    existing_count = db.query(TrustedContact).filter(TrustedContact.user_id == current_user.id).count()
    if existing_count >= 5:
        raise HTTPException(status_code=400, detail="Cannot exceed 5 trusted contacts.")
        
    contact = TrustedContact(
        user_id=current_user.id,
        name=contact_in.name,
        phone=contact_in.phone,
        email=contact_in.email,
        priority=contact_in.priority
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact

@router.get("/contacts", response_model=List[TrustedContactOut])
def get_contacts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(TrustedContact).filter(TrustedContact.user_id == current_user.id).all()

@router.delete("/contacts/{contact_id}")
def delete_contact(
    contact_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contact = db.query(TrustedContact).filter(
        TrustedContact.id == contact_id, 
        TrustedContact.user_id == current_user.id
    ).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
        
    db.delete(contact)
    db.commit()
    return {"message": "Contact deleted successfully"}

@router.get("/tracking-link")
def get_tracking_link(
    current_user: User = Depends(get_current_user)
):
    base_url = settings.FRONTEND_URL.rstrip("/")
    tracking_url = f"{base_url}/guardian?userId={current_user.id}"
    return {"tracking_url": tracking_url}
