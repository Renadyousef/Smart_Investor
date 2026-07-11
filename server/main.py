#app
from fastapi import FastAPI
from routes.stock_routes import router as stock_router
#from routes.stock_routes import router as stock_router This is how er import our routes
# as backend using FastApi
app = FastAPI()

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

