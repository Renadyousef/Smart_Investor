# 📈 Smart Investor

> AI-powered Saudi stock market assistant combining Machine Learning, RAG, and financial intelligence to support data-driven investment decisions.

## 📌 Overview

Smart Investor is an AI financial assistant specialized in the Saudi market. It combines:

- 📈 LSTM stock price prediction
- 📊 MAE& Growth Predicitions-based Recommendations
-  AI financial advisor using RAG
- Live Saudi stock market data
- Smart investment notifications

Supported companies:

- Saudi Aramco (2222.SR)
- SABIC (2010.SR)
- Al Rajhi Bank (1120.SR)

---

# Features

## 📈 Stock Prediction

Uses LSTM time-series models to predict next-day stock prices using historical market data.

---

## 📊 Risk Evaluation (MAE)

Each model is evaluated using Mean Absolute Error (MAE).

| Stock | MAE |
|---|---:|
| SABIC | 7.2642 |
| Aramco | 2.9739 |
| Al Rajhi | 5.8926 |

MAE is converted into a percentage to estimate prediction uncertainty.


## 💡 Recommendation Engine

Generates recommendations based on:

- Predicted growth %
- Model error (MAE)
- User portfolio ownership

Examples:

- BUY / WATCH / NEUTRAL / AVOID
- KEEP / SELL / HIGH RISK

---

## 🤖 AI Financial Advisor (RAG)

A Retrieval-Augmented Generation system that answers Saudi market questions using:

- Annual reports
- Quarterly reports
- Financial documents

Workflow:

```
User Question
      |
      v
Document Retrieval
      |
      v
Relevant Context
      |
      v
NVIDIA Nemotron LLM
      |
      v
Financial Answer
```

The advisor is designed to:
- Use only retrieved information
- Reduce hallucination
- Provide evidence-based explanations

---

## RAG Evaluation

The RAG system is evaluated using:

**Retrieval Evaluation**
- Checks if relevant documents are retrieved.

**LLM-as-a-Judge**
- Evaluates answer accuracy, faithfulness, and completeness.

---

# 🛠️ Technologies Used

### Frontend
- React.js
- Vite

### Backend
- FastAPI
- Python
- SQLAlchemy
- PostgreSQL

### Machine Learning
- PyTorch
- LSTM Neural Networks
- Scikit-learn
- Joblib

### Generative AI / RAG
- LangChain
- NVIDIA Nemotron LLM
- NVIDIA Embeddings
- Chroma Vector Database

### Data Sources
- Yahoo Finance API (yfinance)
- Saudi company financial reports

### Deployment
- Docker
- GitHub Actions

---

# 🏗️ Architecture

```
             User
              |
        React Frontend
              |
        FastAPI Backend
              |
    --------------------
    |                  |
 LSTM Model          RAG Advisor
    |                  |
Stock Data       Financial Reports
    |                  |
    --------------------
              |
             LLM
```

---

# 🔮 Future Improvements

- More Tadawul companies
- News sentiment analysis
- Portfolio optimization


---

# 👥 Team

Smart Investor Hackathon Project

Developed by:
**Renad Alotaibi**
**Leen**
**Aryam**
**Sarah**

---

## Disclaimer

Smart Investor is an AI decision-support tool and does not guarantee investment returns.
