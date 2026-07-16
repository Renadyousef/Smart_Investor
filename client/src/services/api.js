import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const stockService = {
  getPrediction: (symbol) => api.get(`/stocks/predict/${symbol}`),
  getHistory: (symbol) => api.get(`/stocks/history/${symbol}`),
};

export const portfolioService = {
  getHoldings: () => api.get('/portfolio/holdings'),
  addHolding: (data) => api.post('/portfolio/holdings', data),
};

export const chatService = {
  sendMessage: (question) => api.post('/financial/chat', { question }),
};

export default api;
