from fastapi import APIRouter, Depends
from middleware.auth import get_current_user

from controllers.financial_advisor.chat_bot_controller import (
    chat_with_financial_advisor
)

router = APIRouter()

@router.post("/chat")
def financial_chat(
    request: dict,
    current_user = Depends(get_current_user)
):

    user_query = request.get("question")

    if not user_query:
        return {
            "error": "Question is required"
        }


    response = chat_with_financial_advisor(
        user_query
    )

    return response

