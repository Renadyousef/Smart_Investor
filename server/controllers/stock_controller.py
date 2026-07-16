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
    
    # Prices could be a Series or DataFrame from yfinance.
    # Convert to standard list of floats for JSON compliance.
    if hasattr(prices, "values"):
        # flattening values in case it's a 1-column DataFrame
        history_list = [float(p) for p in prices.values.flatten()]
    else:
        # standard list conversion
        history_list = [float(p) for p in prices]

    return {
        "stock": stock_name,
        "history": history_list,
        "current_price": round(float(history_list[-1]), 2) if history_list else 0.0
    }
