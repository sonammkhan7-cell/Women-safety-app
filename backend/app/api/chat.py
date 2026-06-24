from fastapi import APIRouter, Depends
from app.api.auth import get_current_user
from app.models.models import User
from app.schemas.schemas import ChatRequest, ChatResponse
from app.services.agents import generate_safety_chat_response

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/ask", response_model=ChatResponse)
def ask_assistant(
    req: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Asks the safety companion chatbot for safety suggestions, local directories, or quick actions.
    """
    res = generate_safety_chat_response(
        message=req.message,
        lat=req.current_lat,
        lng=req.current_lng
    )
    return ChatResponse(
        response=res["response"],
        suggested_actions=res["suggested_actions"],
        nearby_safe_places=res.get("nearby_safe_places")
    )
