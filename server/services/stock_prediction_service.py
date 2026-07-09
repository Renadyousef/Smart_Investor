#get_stock_prediction(stock) ->fetch last 60 days ->load correct model by type ->predict next day
        
#calculate growth % also we fetch current day stock ->generate recommendation
# services/stock_prediction_service.py

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