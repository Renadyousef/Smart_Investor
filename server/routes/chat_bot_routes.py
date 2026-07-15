#Stock pred api route
from fastapi import APIRouter, Depends
from middleware.auth import get_current_user

router = APIRouter()


# @router.post("/chat/")

