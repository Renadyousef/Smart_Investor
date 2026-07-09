from fastapi import APIRouter
from controllers.stock_controller import predict_stock

router = APIRouter()

@router.get("/predict/{stock}")
def predict(stock: str):
    return predict_stock(stock)