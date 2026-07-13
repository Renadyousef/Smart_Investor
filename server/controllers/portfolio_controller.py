from sqlalchemy.orm import Session
from database.models import PortfolioHolding

def fetch_holdings(current_user, db: Session):
    return db.query(PortfolioHolding).filter(PortfolioHolding.investor_id == current_user["id"]).all()

def add_new_holding(request, current_user, db: Session):
    new_holding = PortfolioHolding(
        investor_id=current_user["id"],
        stock_symbol=request.stock_symbol,
        ticker=request.ticker,
        quantity=request.quantity,
        average_purchase_price=request.average_purchase_price
    )
    db.add(new_holding)
    db.commit()
    db.refresh(new_holding)
    return new_holding
