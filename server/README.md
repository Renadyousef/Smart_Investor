# Smart Investor - Python Backend 🧠

The core intelligence and database management system for the Smart Investor app. Built with **FastAPI**, **SQLAlchemy**, and **PyTorch**, this server provides LSTM-based stock predictions and secure data handling for the Saudi Stock Market.

## 🚀 Key Features

*   **AI Stock Predictions**: LSTM deep learning models for Aramco, SABIC, and Al Rajhi.
*   **Unified Authentication**: Secure Sign In/Up via **Account Number** with `bcrypt` password hashing.
*   **Security Layer**: 
    *   **JWT Protection**: Token-based authentication for all sensitive API endpoints.
    *   **SQL Injection Prevention**: Full use of **parameterized queries** via SQLAlchemy.
*   **Automated DB Management**: Automatic table creation on startup using SQLAlchemy models.
*   **CORS Ready**: Configured for seamless communication with the React frontend.

## 🛠 Tech Stack

*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
*   **Database ORM**: [SQLAlchemy](https://www.sqlalchemy.org/)
*   **Security**: [python-jose](https://python-jose.readthedocs.io/) (JWT), [passlib](https://passlib.readthedocs.io/) (Bcrypt)
*   **AI/ML**: [PyTorch](https://pytorch.org/), [yfinance](https://github.com/ranaroussi/yfinance)
*   **Environment**: [python-dotenv](https://github.com/theskumar/python-dotenv)

## 📁 Directory Structure

```text
server/
├── database/       # SQLAlchemy Models, Session, and Connection logic
├── middleware/     # JWT Authentication verification
├── models/         # Pre-trained LSTM (.pth) and Scalers (.pkl)
├── routes/         # Stock prediction and Unified Auth endpoints
├── services/       # LSTM prediction and recommendation algorithms
├── .env            # Database and Security configurations
└── main.py         # App entry point and route registration
```

## ⚙️ Getting Started

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment
Ensure the `.env` file exists in this directory:
```env
DATABASE_URL=postgresql://user:pass@host:port/dbname
SECRET_KEY=your_secure_jwt_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### 3. Run the Server
```bash
uvicorn main:app --reload
```

## 📊 API Endpoints

*   `POST /auth/register`: Create a new user account via account number.
*   `POST /auth/login`: Authenticate and receive a JWT access token.
*   `GET /stocks/predict/{symbol}`: Get LSTM prediction and AI recommendation (Requires JWT).

---
Built to empower Saudi investors with AI-driven security.
