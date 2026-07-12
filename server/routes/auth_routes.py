from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.session import get_db
from database.models import User
from jose import jwt
from passlib.context import CryptContext
import os
import datetime
from pydantic import BaseModel

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

class LoginRequest(BaseModel):
    account_number: str
    password: str

class RegisterRequest(BaseModel):
    account_number: str
    password: str
    full_name: str

@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(User.account_number == request.account_number).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="رقم الحساب مسجل مسبقاً")
    
    hashed_password = pwd_context.hash(request.password)
    new_user = User(
        account_number=request.account_number,
        hashed_password=hashed_password,
        full_name=request.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "تم إنشاء الحساب بنجاح"}

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.account_number == request.account_number).first()
    if not user or not pwd_context.verify(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="رقم الحساب أو كلمة المرور غير صحيحة")
    
    # Generate JWT
    expires_delta = datetime.timedelta(minutes=60)
    expire = datetime.datetime.utcnow() + expires_delta
    to_encode = {"sub": str(user.id), "email": user.account_number, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return {
        "access_token": encoded_jwt,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "account_number": user.account_number,
            "full_name": user.full_name
        }
    }

from middleware.auth import get_current_user

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    return {
        "id": user.id,
        "account_number": user.account_number,
        "full_name": user.full_name
    }
