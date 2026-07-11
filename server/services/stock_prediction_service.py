import yfinance as yf
import torch
import torch.nn as nn
import joblib

#User owned stock check
def user_owns_stock(user_id, stock_name): #BTW NAME IS ALWAYS TICKER CODE

    # TODO:
    # Query portfolio table

    return False

# LSTM Architecture to work with it while loading the models

class StockLSTM(nn.Module):
    def __init__(self, input_size=1, hidden_layer_size=50, output_size=1):
        super().__init__()

        self.lstm = nn.LSTM(
            input_size,
            hidden_layer_size,
            batch_first=True
        )

        self.linear = nn.Linear(
            hidden_layer_size,
            output_size
        )

    def forward(self, input_seq):
        lstm_out, _ = self.lstm(input_seq)
        return self.linear(lstm_out[:, -1, :])



# Models Mapping ***Ticker as input*** and model path output to use

MODELS = {
    "2010.SR": "models/lstm_Sabic_model.pth",
    "2222.SR": "models/lstm_Aramco_model.pth",
    "7010.SR": "models/lstm_STC_model.pth"
}

SCALERS = {
    "2010.SR": "models/sabic_scaler.pkl",
    "2222.SR": "models/scaler_Aramco_model.pkl",
    "7010.SR": "models/scaler_AlRajhi_stock_model.pkl"
}

#From the models to work on the algoritm
MAE={
    "2010.SR":7.2642,
    "2222.SR":2.9739,
    "7010.SR":5.8926

}




# Load Model


def load_stock_model(stock_name):

    model_path = MODELS[stock_name]

    model = StockLSTM()

    model.load_state_dict(
        torch.load(model_path, map_location="cpu")
    )

    model.eval() # for evaluting 

    return model

 #Loading scaler by model name
def load_stock_scaler(stock_name):

    scaler_path = SCALERS[stock_name]

    scaler = joblib.load(scaler_path)

    return scaler

# Fetch Last 60 Trading Days Helper func


def get_last_sixty_days_data(stock_name):

    data = yf.download(
        stock_name,
        period="3mo"
    )

    return data["Close"].tail(60) # getting last 60 days  it comes as dates, prices



# Generate Recommendation (Initial not yet final algo)
# Add check if user owned stock then sell,keep, or risk alert
 #if not we do Buy Avoid maybe more 
 
def generate_recommendation(
    growth_pct,
    mae_percent,
    owns_stock
):

    if owns_stock:

        if growth_pct > mae_percent:
            return "KEEP"

        elif growth_pct < (-2 * mae_percent):
            return "HIGH RISK"

        elif growth_pct < (-mae_percent):
            return "SELL"

        else:
            return "HOLD"

    else:

        if growth_pct > mae_percent:
            return "BUY"

        else:
            return "AVOID"




#Getting the next day predicition
def get_stock_prediction(stock_name,user_id):

    # 1. Fetch latest 60 days
    prices = get_last_sixty_days_data(stock_name)

    # 2. Current stock price
    current_price = float(prices.iloc[-1])

    # 3. Load correct model
    model = load_stock_model(stock_name)


    # 4. Load scaler used during training
    scaler = load_stock_scaler(stock_name)

    # 5. Scale latest 60 prices
    scaled_prices = scaler.transform(
    prices.values.reshape(-1, 1)
)


    # 6. Prepare input tensor
    input_tensor = (
        torch.tensor(scaled_prices)
        .float()
        .reshape(1, 60, 1)
    )

    # 7. Predict next day
    with torch.no_grad():
        prediction = model(input_tensor)

    predicted_scaled = float(prediction.item())


    #8.transform the pred back to normal price

    predicted_price = scaler.inverse_transform(
        [[predicted_scaled]]
        )[0][0]

    # 6. Growth rate  %
    growth_pct = (
        (predicted_price - current_price)
        / current_price
    ) * 100

#MAE precentage by models
    model_mae = MAE[stock_name]
    mae_percent = (
         model_mae
         / current_price
         ) * 100
    
#Does the user Own the stock
    owns_stock = user_owns_stock(
    user_id,
    stock_name
)



    # 7. Recommendation call the recom algorithm
    recommendation = generate_recommendation(growth_pct,mae_percent,owns_stock)

    # 8. Return result btw name is the ticker code 
    return {
        "stock": stock_name,
        "current_price": round(current_price, 2),
        "predicted_price": round(predicted_price, 2),
        "growth_pct": round(growth_pct, 2), # How is this exactly retruned can it be -?
        "mae_percent": round(mae_percent, 2), #Model error precantage
        "recommendation": recommendation
    }



# Local Test on aramco stock-- i need same sclaer in training to use it here + transform stocks back to real numbers at return


if __name__ == "__main__":

    result = get_stock_prediction("2222.SR")

    print(result)