from fastapi import APIRouter, Depends, Query
from typing import List, Dict, Any
from app.api.auth import get_current_user
from app.models.models import User
from app.services.maps import get_safe_routes, get_nearby_safe_places

router = APIRouter(prefix="/routes", tags=["routes"])

@router.get("/safe")
def fetch_safe_routes(
    origin_lat: float = Query(...),
    origin_lng: float = Query(...),
    dest_lat: float = Query(...),
    dest_lng: float = Query(...),
    current_user: User = Depends(get_current_user)
):
    """
    Computes alternate routes comparing safest vs shortest pathways
    """
    return get_safe_routes(origin_lat, origin_lng, dest_lat, dest_lng)

@router.get("/safe-places")
def fetch_nearby_safe_places(
    lat: float = Query(...),
    lng: float = Query(...),
    current_user: User = Depends(get_current_user)
):
    """
    Finds hospitals, police stations, and safe havens nearby
    """
    return get_nearby_safe_places(lat, lng)
