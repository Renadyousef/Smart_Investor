#Stock pred api route
from fastapi import APIRouter, Depends
from controllers.stock_controller import predict_stock, get_stock_history
from middleware.auth import get_current_user

router = APIRouter()


@router.get("/predict/{stock}")
def predict(
    stock: str,
    current_user=Depends(get_current_user)
):
    return predict_stock(
        stock,
        current_user["id"]
    )

@router.get("/history/{stock}")
def history(stock: str):
    # This endpoint is for real-time history used in Market Overview
    return get_stock_history(stock)
