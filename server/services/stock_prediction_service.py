import yfinance as yf
import torch
import torch.nn as nn
import joblib
from database.session import SessionLocal
from sqlalchemy import text
import os
# Base directory for the server
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def clean_float(value):
    """Ensure a float value is JSON compliant (no NaN or Inf)."""
    try:
        val = float(value)
        # Robust NaN check
        if val != val or val == float('inf') or val == float('-inf'):
            return 0.0
        return val
    except:
        return 0.0

# User owned stock check
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
    except:
        return False
    finally:
        db.close()

# LSTM Architecture
class StockLSTM(nn.Module):
    def __init__(self, input_size=1, hidden_layer_size=50, output_size=1):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_layer_size, batch_first=True)
        self.linear = nn.Linear(hidden_layer_size, output_size)

    def forward(self, input_seq):
        lstm_out, _ = self.lstm(input_seq)
        return self.linear(lstm_out[:, -1, :])

# Models Mapping with Absolute Paths
MODELS = {
    "2010.SR": os.path.join(BASE_DIR, "models", "lstm_Sabic_model .pth"),
    "2222.SR": os.path.join(BASE_DIR, "models", "lstm_Aramco_stock_model.pth"),
    "1120.SR": os.path.join(BASE_DIR, "models", "lstm_AlRajhi_stock_model.pth")
}

SCALERS = {
    "2010.SR": os.path.join(BASE_DIR, "models", "sabic_scaler.pkl"),
    "2222.SR": os.path.join(BASE_DIR, "models", "scaler_Aramco_model.pkl"),
    "1120.SR": os.path.join(BASE_DIR, "models", "scaler_AlRajhi_stock_model.pkl")
}

MAE = {
    "2010.SR": 7.2642,
    "2222.SR": 2.9739,
    "1120.SR": 5.8926
}

def load_stock_model(stock_name):
    model_path = MODELS[stock_name]
    model = StockLSTM()
    model.load_state_dict(torch.load(model_path, map_location="cpu"))
    model.eval()
    return model

def load_stock_scaler(stock_name):
    scaler_path = SCALERS[stock_name]
    return joblib.load(scaler_path)

def get_last_sixty_days_data(stock_name):
    data = yf.download(stock_name, period="3mo")

    # yf.download often returns a MultiIndex DataFrame.
    # Extract the 'Close' column for the specific ticker.
    if "Close" in data:
        close_data = data["Close"]
        # If it's still a DataFrame (MultiIndex), take the first column
        if hasattr(close_data, "iloc"):
            if len(close_data.shape) > 1:
                close_data = close_data.iloc[:, 0]

        # Filter out NaN values (like incomplete today's data)
        valid_prices = close_data.dropna()

        # Ensure we have at least 60 days
        return valid_prices.tail(60)

    return []

def generate_recommendation(growth_pct, mae_percent, owns_stock):
    if owns_stock:
        if growth_pct > mae_percent:
            return ("احتفاظ", "تشير التوقعات إلى إمكانية ارتفاع السهم خلال الفترة القادمة.")
        elif growth_pct < (-2 * mae_percent):
            return ("مخاطرة عالية", "تشير التوقعات إلى احتمال انخفاض ملحوظ في سعر السهم.")
        elif growth_pct < (-mae_percent):
            return ("بيع", "تشير التوقعات إلى انخفاض محتمل في سعر السهم.")
        else:
            return ("احتفاظ", "لا توجد مؤشرات قوية على ارتفاع أو انخفاض كبير في السعر.")
    else:
        if growth_pct > mae_percent:
            return ("شراء", "تشير التوقعات إلى فرصة جيدة لنمو السهم.")
        elif growth_pct > 0:
            return ("مراقبة", "هناك مؤشرات إيجابية، لكن يفضل متابعة السهم قبل اتخاذ قرار الشراء.")
        elif growth_pct > -mae_percent:
            return ("محايد", "لا توجد حالياً مؤشرات واضحة تدعم الشراء أو تجنب السهم.")
        else:
            return ("تجنب", "تشير التوقعات إلى احتمال انخفاض السهم خلال الفترة القادمة.")

def get_stock_prediction(stock_name, user_id):
    try:
        prices = get_last_sixty_days_data(stock_name)
        if len(prices) < 60:
            return {"stock": stock_name, "error": "Insufficient market data (need 60 days)"}

        current_price = clean_float(prices.iloc[-1])
        model = load_stock_model(stock_name)
        scaler = load_stock_scaler(stock_name)

        scaled_prices = scaler.transform(prices.values.reshape(-1, 1))
        input_tensor = torch.tensor(scaled_prices).float().reshape(1, 60, 1)

        with torch.no_grad():
            prediction = model(input_tensor)

        predicted_scaled = float(prediction.item())
        predicted_price = clean_float(scaler.inverse_transform([[predicted_scaled]])[0][0])

        if current_price != 0:
            growth_pct = ((predicted_price - current_price) / current_price) * 100
        else:
            growth_pct = 0.0
        growth_pct = clean_float(growth_pct)

        model_mae = MAE.get(stock_name, 0.0)
        mae_percent = (model_mae / current_price) * 100 if current_price != 0 else 0.0
        mae_percent = clean_float(mae_percent)

        owns_stock = user_owns_stock(user_id, stock_name)
        recommendation, reason = generate_recommendation(growth_pct, mae_percent, owns_stock)

        try:
            save_recommendation(user_id, stock_name, recommendation, growth_pct, reason)
        except:
            pass

        return {
            "stock": stock_name,
            "current_price": round(current_price, 2),
            "predicted_price": round(predicted_price, 2),
            "growth_pct": round(growth_pct, 2),
            "mae_percent": round(mae_percent, 2),
            "recommendation": recommendation,
            "reason": reason
        }
    except Exception as e:
        return {"stock": stock_name, "error": str(e)}

def save_recommendation(investor_id, stock_name, recommendation, growth_pct, reason):
    db = SessionLocal()
    try:
        db.execute(
            text("""
                INSERT INTO recommendations
                (investor_id, ticker, recommendation_type, predicted_growth, reason)
                VALUES
                (:investor_id, :ticker, :recommendation_type, :predicted_growth, :reason)
            """),
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
