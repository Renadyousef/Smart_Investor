from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.session import get_db
from middleware.auth import get_current_user
from controllers.portfolio_controller import fetch_holdings, add_new_holding
from pydantic import BaseModel
from typing import List
import uuid

router = APIRouter()

class HoldingCreate(BaseModel):
    stock_symbol: str
    ticker: str
    quantity: float
    average_purchase_price: float

class HoldingResponse(BaseModel):
    id: uuid.UUID
    stock_symbol: str
    ticker: str
    quantity: float
    average_purchase_price: float
    
    class Config:
        from_attributes = True

@router.get("/holdings", response_model=List[HoldingResponse])
def get_holdings(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return fetch_holdings(current_user, db)

@router.post("/holdings", response_model=HoldingResponse)
def add_holding(request: HoldingCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return add_new_holding(request, current_user, db)
