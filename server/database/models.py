from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    account_number = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    portfolios = relationship("Portfolio", back_populates="owner")

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

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    stock_symbol = Column(String, nullable=False)
    quantity = Column(Float, default=0)
    average_purchase_price = Column(Float, default=0)
    
    owner = relationship("User", back_populates="portfolios")
