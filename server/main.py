#app
from fastapi import FastAPI
from routes.stock_routes import router as stock_router
from routes.auth_routes import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from database.session import engine
from database.models import Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
)

app.include_router(
    stock_router,
    prefix="/stocks",
    tags=["Stocks"]
)

# Server running route 
@app.get("/")
def root():
    return {"message": "Smart Investor App is running"}

