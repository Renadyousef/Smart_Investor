from fastapi import APIRouter, Depends
from middleware.auth import get_current_user

from controllers.financial_advisor.chat_bot_controller import (
    chat_with_financial_advisor,
    ingest_documents
)

router = APIRouter()

@router.post("/ingest")
def trigger_ingestion(current_user = Depends(get_current_user)):
    # This rebuilds the vector database from PDF files
    try:
        ingest_documents()
        return {"message": "Ingestion successful"}
    except Exception as e:
        return {"error": str(e)}

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

