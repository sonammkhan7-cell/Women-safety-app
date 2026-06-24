import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    role = Column(String, default="user")  # "user" or "guardian"
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    safety_status = Column(String, default="SAFE")  # "SAFE", "WARNING", "DANGER"
    is_active = Column(Boolean, default=True)

    contacts = relationship("TrustedContact", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="user", cascade="all, delete-orphan")
    location_logs = relationship("LocationLog", back_populates="user", cascade="all, delete-orphan")


class TrustedContact(Base):
    __tablename__ = "trusted_contacts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=True)
    priority = Column(Integer, default=1)

    user = relationship("User", back_populates="contacts")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    alert_type = Column(String, nullable=False)  # "SOS", "RISK_DEVIATION", "AUDIO"
    status = Column(String, default="ACTIVE")  # "ACTIVE", "RESOLVED"
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    audio_transcript = Column(String, nullable=True)
    evidence_file_url = Column(String, nullable=True)
    battery_level = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="alerts")


class LocationLog(Base):
    __tablename__ = "location_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    accuracy = Column(Float, nullable=True)
    speed = Column(Float, nullable=True)
    bearing = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="location_logs")
