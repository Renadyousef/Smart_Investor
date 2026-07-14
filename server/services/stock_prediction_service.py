import yfinance as yf
import torch
import torch.nn as nn
import joblib
from database.session import SessionLocal
from sqlalchemy import text

#User owned stock check
def user_owns_stock(user_id, stock_name):
    db = SessionLocal()

    try:
        result = db.execute(
            text("""
                SELECT 1
                FROM portfolio_holdings
                WHERE investor_id = :user_id
                AND ticker = :ticker
                LIMIT 1
            """),
            {
                "user_id": user_id,
                "ticker": stock_name
            }
        ).first()

        return result is not None

    finally:
        db.close()

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
    "2010.SR": "models/lstm_Sabic_model .pth",
    "2222.SR": "models/lstm_Aramco_stock_model.pth",
    "1120.SR": "models/lstm_AlRajhi_stock_model.pth"
}

SCALERS = {
    "2010.SR": "models/sabic_scaler.pkl",
    "2222.SR": "models/scaler_Aramco_model.pkl",
    "1120.SR": "models/scaler_AlRajhi_stock_model.pkl"
}

#From the models to work on the algoritm
MAE={
    "2010.SR":7.2642,
    "2222.SR":2.9739,
    "1120.SR":5.8926

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
            return (
                "احتفاظ",
                "تشير التوقعات إلى إمكانية ارتفاع السهم خلال الفترة القادمة."
            )

        elif growth_pct < (-2 * mae_percent):
            return (
                "مخاطرة عالية",
                "تشير التوقعات إلى احتمال انخفاض ملحوظ في سعر السهم."
            )

        elif growth_pct < (-mae_percent):
            return (
                "بيع",
                "تشير التوقعات إلى انخفاض محتمل في سعر السهم."
            )

        else:
            return (
                "احتفاظ",
                "لا توجد مؤشرات قوية على ارتفاع أو انخفاض كبير في السعر."
            )

    else:

        if growth_pct > mae_percent:
            return (
                "شراء",
                "تشير التوقعات إلى فرصة جيدة لنمو السهم."
            )

        elif growth_pct > 0:
            return (
                "مراقبة",
                "هناك مؤشرات إيجابية، لكن يفضل متابعة السهم قبل اتخاذ قرار الشراء."
            )

        elif growth_pct > -mae_percent:
            return (
                "محايد",
                "لا توجد حالياً مؤشرات واضحة تدعم الشراء أو تجنب السهم."
            )

        else:
            return (
                "تجنب",
                "تشير التوقعات إلى احتمال انخفاض السهم خلال الفترة القادمة."
            )




#Getting the next day predicition
def get_stock_prediction(stock_name,user_id):

    # 1. Fetch latest 60 days
    prices = get_last_sixty_days_data(stock_name)

    # 2. Current stock price
    current_price = prices.iloc[-1].item()

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
# 7. Recommendation call the recom algorithm
    recommendation, reason = generate_recommendation(growth_pct,mae_percent,owns_stock)

# Save recommendation to DB do try and catch
    save_recommendation(user_id,stock_name,recommendation,growth_pct,reason)


    # 8. Return result btw name is the ticker code
    return {
    "stock": stock_name,
    "current_price": round(current_price, 2),
    "predicted_price": round(predicted_price, 2),
    "growth_pct": round(growth_pct, 2),
    "mae_percent": round(mae_percent, 2),
    "recommendation": recommendation,
    "reason": reason}







def save_recommendation(
    investor_id,
    stock_name,
    recommendation,
    growth_pct,
    reason
):
    db = SessionLocal()

    try:

        db.execute(
            text(
                """
                INSERT INTO recommendations
                (
                    investor_id,
                    ticker,
                    recommendation_type,
                    predicted_growth,
                    reason
                )
                VALUES
                (
                    :investor_id,
                    :ticker,
                    :recommendation_type,
                    :predicted_growth,
                    :reason
                )
                """
            ),
            {
                "investor_id": investor_id,
                "ticker": stock_name,
                "recommendation_type": recommendation,
                "predicted_growth": round(growth_pct, 2),
                "reason": reason
            }
        )

        db.commit()

    finally:
        db.close()

#Local Test on aramco stock--


if __name__ == "__main__":

    result = get_stock_prediction("2222.SR",None)

    print(result)