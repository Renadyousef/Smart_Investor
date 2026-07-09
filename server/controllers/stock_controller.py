from services.stock_prediction_service import get_stock_prediction

def predict_stock(stock_name):
    return get_stock_prediction(stock_name)