from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- Token & Authentication ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str = "user"  # "user" or "guardian"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    safety_status: Optional[str] = None

class UserOut(UserBase):
    id: int
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    safety_status: str
    is_active: bool

    class Config:
        from_attributes = True

# --- Trusted Contact Schemas ---
class TrustedContactBase(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    priority: int = 1

class TrustedContactCreate(TrustedContactBase):
    pass

class TrustedContactOut(TrustedContactBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# --- Alert Schemas ---
class AlertBase(BaseModel):
    alert_type: str  # "SOS", "RISK_DEVIATION", "AUDIO"
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    audio_transcript: Optional[str] = None
    battery_level: Optional[int] = None

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    status: str  # "ACTIVE", "RESOLVED"
    evidence_file_url: Optional[str] = None

class AlertOut(AlertBase):
    id: int
    user_id: int
    status: str
    evidence_file_url: Optional[str] = None
    created_at: datetime
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True

# --- Location Log Schemas ---
class LocationLogBase(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    speed: Optional[float] = None
    bearing: Optional[float] = None

class LocationLogCreate(LocationLogBase):
    pass

class LocationLogOut(LocationLogBase):
    id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# --- Risk Assessment ---
class RiskAssessmentRequest(BaseModel):
    latitude: float
    longitude: float
    timestamp: str
    device_motion: Optional[str] = None  # e.g., "shaking", "stationary", "walking", "running", "sudden_acceleration"
    audio_snippet_base64: Optional[str] = None  # to simulate audio capture
    audio_transcript: Optional[str] = None  # to simulate voice processing
    route_deviation: Optional[bool] = False

class RiskAssessmentResponse(BaseModel):
    risk_score: int  # 0 to 100
    risk_level: str  # "LOW", "MEDIUM", "HIGH"
    risk_factors: List[str]
    recommended_action: str
    should_alert_guardians: bool

# --- Chat Assistance ---
class ChatRequest(BaseModel):
    message: str
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None

class ChatResponse(BaseModel):
    response: str
    suggested_actions: List[str]
    nearby_safe_places: Optional[List[dict]] = None
