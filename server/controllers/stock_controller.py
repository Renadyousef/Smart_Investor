# controller for predicting stock
from services.stock_prediction_service import get_stock_prediction, get_last_sixty_days_data


def predict_stock(stock_name, user_id):
    return get_stock_prediction(
        stock_name,
        user_id #This is from the JWT
    )

def get_stock_history(stock_name):
    # Fetching real market history for charts
    prices = get_last_sixty_days_data(stock_name)
    
    # Converting Series to a clean list of floats for JSON
    return {
        "stock": stock_name,
        "history": [float(p) for p in prices.tolist()],
        "current_price": round(float(prices.iloc[-1]), 2)
    }
