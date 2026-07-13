from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.session import get_db
from middleware.auth import get_current_user
from controllers.auth_controller import register_user, login_user, get_user_profile
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    account_number: str
    password: str

class RegisterRequest(BaseModel):
    account_number: str
    password: str
    full_name: str

@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    return register_user(request, db)

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    return login_user(request, db)

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_user_profile(current_user, db)
