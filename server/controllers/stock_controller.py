# controller for predicting stock
from services.stock_prediction_service import get_stock_prediction


def predict_stock(stock_name, user_id):
    return get_stock_prediction(
        stock_name,
        user_id #This is from the JWT
    )