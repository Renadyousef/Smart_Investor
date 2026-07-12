# Smart Investor - React Client 📈

The frontend for the Smart Investor app, a modern fintech dashboard designed for the Saudi Stock Market (Tadawul). Built with **React 19**, **Vite**, and **Tailwind CSS**, featuring full Arabic RTL support and real-time AI insights.

## ✨ Features

*   **Arabic RTL UI**: Professional Middle Eastern user experience with Cairo typography and right-to-left layout.
*   **AI Stock Insights**: Interactive charts powered by **Recharts**, visualizing LSTM predictions and risk analysis.
*   **Unified Auth**: Secure authentication via **Account Number** (رقم الحساب) communicating directly with the Python backend.
*   **Full Functional Suite**:
    *   **Dashboard**: Market overview with live-style charts.
    *   **Portfolio**: Detailed investment tracking with growth/decline indicators.
    *   **Notifications**: AI-driven risk alerts and recommendation history.
    *   **Smart Assistant**: Interactive chatbot interface for market queries.
    *   **Comparison**: Side-by-side growth vs. risk analysis for top stocks.
*   **Mobile-First Design**: Sleek "Dark Fintech" aesthetic optimized for all devices.

## 🛠 Tech Stack

*   **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Charts**: [Recharts](https://recharts.org/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Navigation**: [React Router 7](https://reactrouter.com/)
*   **API Communication**: [Axios](https://axios-http.com/) (with JWT interceptors)

## 📁 Directory Structure

```text
src/
├── components/     # Reusable UI components (Charts, Layout, StockCards)
├── context/        # Global state management (AuthContext)
├── pages/          # Feature screens (Home, Portfolio, Chatbot, Notifications, Compare, Auth)
├── services/       # API configuration and JWT handling
├── index.css       # Tailwind & Global RTL styles
└── main.jsx        # App entry point
```

## ⚙️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file or update `src/services/api.js`:
```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Run Development Server
```bash
npm run dev
```

## 🔒 Security

This client is integrated with a secure **JWT-based** Python backend. 
- Authentication tokens are stored securely in `localStorage`.
- All requests to the FastAPI server automatically include the JWT in the `Authorization` header.

---
Part of the **Smart Investor** unified full-stack ecosystem.
