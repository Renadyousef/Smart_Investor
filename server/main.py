#app
from fastapi import FastAPI
from routes.stock_routes import router as stock_router
from fastapi.middleware.cors import CORSMiddleware
#from routes.stock_routes import router as stock_router This is how er import our routes
# as backend using FastApi
app = FastAPI()

#allow cors 
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # React/Vite frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# including other routes when we import them 
# app.include_router(stock_router)

app.include_router(
    stock_router,
    prefix="/stocks",
    tags=["Stocks"]
)

# Server running route 
@app.get("/")
def root():
    return {"message": "Smart Investor App is running"}

