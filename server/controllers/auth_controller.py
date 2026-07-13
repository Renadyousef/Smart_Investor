from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from database.models import User
from jose import jwt
from passlib.context import CryptContext
import os
import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

def register_user(request, db: Session):
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

def login_user(request, db: Session):
    user = db.query(User).filter(User.account_number == request.account_number).first()
    if not user or not pwd_context.verify(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="رقم الحساب أو كلمة المرور غير صحيحة")
    
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

def get_user_profile(current_user, db: Session):
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")
    return {
        "id": user.id,
        "account_number": user.account_number,
        "full_name": user.full_name
    }
