from sqlalchemy import Column, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "investors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_number = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    portfolios = relationship("PortfolioHolding", back_populates="owner")

class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, unique=True, index=True, nullable=False)
    name_ar = Column(String, nullable=False)
    current_price = Column(Float, nullable=False)
    change_percentage = Column(Float, nullable=False)
    recommendation = Column(String) # buy, keep, sell, risky, avoid, hold
    history = Column(String) # JSON string of historical prices
    mae_percent = Column(Float)

class PortfolioHolding(Base):
    __tablename__ = "portfolio_holdings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    investor_id = Column(UUID(as_uuid=True), ForeignKey("investors.id"))
    stock_symbol = Column(String, nullable=False) # e.g., "Aramco"
    ticker = Column(String, nullable=False)       # e.g., "2222.SR"
    quantity = Column(Float, default=0)
    average_purchase_price = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    owner = relationship("User", back_populates="portfolios")
