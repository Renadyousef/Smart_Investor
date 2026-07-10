import yfinance as yf
import torch
import torch.nn as nn



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



# Load Model


def load_stock_model(stock_name):

    model_path = MODELS[stock_name]

    model = StockLSTM()

    model.load_state_dict(
        torch.load(model_path, map_location="cpu")
    )

    model.eval() # for evaluting 

    return model



# Fetch Last 60 Trading Days Helper func


def get_last_sixty_days_data(stock_name):

    data = yf.download(
        stock_name,
        period="3mo"
    )

    return data["Close"].tail(60) # getting last 60 days  it comes as dates, prices



# Generate Recommendation (Initial not yet final algo)

def generate_recommendation(growth_pct): # Add check if user owned stock then sell,keep, or risk alert
    #if not we do Buy Avoid maybe more 

    if growth_pct >= 5:
        return "Strong Buy"

    elif growth_pct >= 2:
        return "Buy"

    elif growth_pct > -2:
        return "Hold"

    elif growth_pct > -5:
        return "Risky"

    else:
        return "Sell"


#Getting the next day predicition
def get_stock_prediction(stock_name):

    # 1. Fetch latest 60 days
    prices = get_last_sixty_days_data(stock_name)

    # 2. Current stock price
    current_price = float(prices.iloc[-1])

    # 3. Load correct model
    model = load_stock_model(stock_name)

    # 4. Prepare input tensor
    input_tensor = (
        torch.tensor(prices.values)
        .float()
        .reshape(1, 60, 1)
    )

    # 5. Predict next day
    with torch.no_grad():
        prediction = model(input_tensor)

    predicted_price = float(prediction.item())

    # 6. Growth rate  %
    growth_pct = (
        (predicted_price - current_price)
        / current_price
    ) * 100

    # 7. Recommendation call the recom algorithm
    recommendation = generate_recommendation(
        growth_pct
    )

    # 8. Return result
    return {
        "stock": stock_name,
        "current_price": round(current_price, 2),
        "predicted_price": round(predicted_price, 2),
        "growth_pct": round(growth_pct, 2),
        "recommendation": recommendation
    }



# Local Test on aramco stock-- i need same sclaer in training to use it here + transform stocks back to real numbers at return


if __name__ == "__main__":

    result = get_stock_prediction("2222.SR")

    print(result)