from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.session import get_db
from middleware.auth import get_current_user
from controllers.portfolio_controller import fetch_holdings, add_new_holding, get_portfolio_summary
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
    current_price: float = 0.0
    total_value: float = 0.0
    profit_loss: float = 0.0
    pl_percentage: float = 0.0
    
    class Config:
        from_attributes = True

@router.get("/holdings", response_model=List[HoldingResponse])
def get_holdings(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return fetch_holdings(current_user, db)

@router.get("/summary")
def get_summary(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_portfolio_summary(current_user, db)

@router.post("/holdings", response_model=HoldingResponse)
def add_holding(request: HoldingCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return add_new_holding(request, current_user, db)
