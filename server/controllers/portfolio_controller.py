from sqlalchemy.orm import Session
from database.models import PortfolioHolding
import yfinance as yf
from services.stock_prediction_service import clean_float
import uuid

def fetch_holdings(current_user, db: Session):
    # Ensure user_id is a UUID object
    try:
        user_id = uuid.UUID(current_user["id"]) if isinstance(current_user["id"], str) else current_user["id"]
    except:
        user_id = current_user["id"]

    holdings = db.query(PortfolioHolding).filter(PortfolioHolding.investor_id == user_id).all()
    
    if not holdings:
        return []

    results = []
    unique_tickers = list(set(h.ticker for h in holdings))
    
    latest_prices = {}
    try:
        # Fetching for 5 days to ensure we get the latest closing price
        data = yf.download(unique_tickers, period="5d")["Close"]
        
        for ticker in unique_tickers:
            try:
                # Robustly handle yfinance DataFrame/Series results
                if hasattr(data, "columns"): # Multiple tickers returned a DataFrame
                    if ticker in data.columns:
                        series = data[ticker].dropna()
                        price = series.iloc[-1] if not series.empty else 0.0
                    else:
                        price = 0.0
                else: # Single ticker returned a Series
                    series = data.dropna()
                    price = series.iloc[-1] if not series.empty else 0.0
                
                latest_prices[ticker] = clean_float(price)
            except:
                latest_prices[ticker] = 0.0
    except Exception as e:
        print(f"ERROR: Failed to fetch portfolio prices: {e}")
        latest_prices = {ticker: 0.0 for ticker in unique_tickers}

    for h in holdings:
        current_price = latest_prices.get(h.ticker, 0.0)
        total_cost = h.quantity * h.average_purchase_price
        current_value = h.quantity * current_price
        profit_loss = current_value - total_cost
        pl_percentage = (profit_loss / total_cost * 100) if total_cost != 0 else 0.0

        results.append({
            "id": h.id,
            "stock_symbol": h.stock_symbol,
            "ticker": h.ticker,
            "quantity": h.quantity,
            "average_purchase_price": h.average_purchase_price,
            "current_price": round(current_price, 2),
            "total_value": round(current_value, 2),
            "profit_loss": round(profit_loss, 2),
            "pl_percentage": round(pl_percentage, 2)
        })

    return results

def get_portfolio_summary(current_user, db: Session):
    holdings = fetch_holdings(current_user, db)
    if not holdings:
        return {"total_market_value": 0.0, "total_profit_loss": 0.0, "pl_percentage": 0.0}
    
    total_market_value = sum(h["total_value"] for h in holdings)
    total_cost = sum(h["quantity"] * h["average_purchase_price"] for h in holdings)
    total_pl = total_market_value - total_cost
    total_pl_percentage = (total_pl / total_cost * 100) if total_cost != 0 else 0.0
    
    return {
        "total_market_value": round(total_market_value, 2),
        "total_profit_loss": round(total_pl, 2),
        "pl_percentage": round(total_pl_percentage, 2)
    }

def add_new_holding(request, current_user, db: Session):
    try:
        user_id = uuid.UUID(current_user["id"]) if isinstance(current_user["id"], str) else current_user["id"]
    except:
        user_id = current_user["id"]

    new_holding = PortfolioHolding(
        investor_id=user_id,
        stock_symbol=request.stock_symbol,
        ticker=request.ticker,
        quantity=request.quantity,
        average_purchase_price=request.average_purchase_price
    )
    db.add(new_holding)
    db.commit()
    db.refresh(new_holding)
    return new_holding

def sell_holding(holding_id: uuid.UUID, quantity: float, current_user, db: Session):
    try:
        user_id = uuid.UUID(current_user["id"]) if isinstance(current_user["id"], str) else current_user["id"]
    except:
        user_id = current_user["id"]

    holding = db.query(PortfolioHolding).filter(
        PortfolioHolding.id == holding_id,
        PortfolioHolding.investor_id == user_id
    ).first()

    if not holding:
        raise Exception("الاستثمار غير موجود")

    if quantity > holding.quantity:
        raise Exception("الكمية المطلوبة أكبر من الكمية المتوفرة")

    if quantity == holding.quantity:
        db.delete(holding)
    else:
        holding.quantity -= quantity
        db.add(holding)
    
    db.commit()
    return {"message": "تمت عملية البيع بنجاح"}
