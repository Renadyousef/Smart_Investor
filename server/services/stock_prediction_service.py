#get_stock_prediction(stock) ->fetch last 60 days ->load correct model by type ->predict next day
        
#calculate growth % also we fetch current day stock ->generate recommendation
# services/stock_prediction_service.py
import yfinance as yf

def get_last_sixty_days_data(stock_name):
     data = yf.download(
        stock_name,
        period="3mo"  # roughly 60 trading days
    )
     return data["Close"].tail(60)  #returns the last 60 rows of the DataFrame

# Test for aramco ticker is 2222.SR
if __name__ == "__main__":
    prices = get_last_sixty_days_data("2222.SR")

    print(prices)
    print(type(prices))

def get_stock_prediction(stock_name):
    # fetch last 60 days
    # get current price
    # load model
    # predict next day
    # calculate growth
    # generate recommendation

    return {
        "stock": stock_name,
        "current_price": 10,
        "predicted_price": 5,
        "growth_pct": -50,
        "recommendation": "Sell"
    }