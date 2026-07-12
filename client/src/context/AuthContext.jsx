import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Fetch fresh user data from server on startup
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const signUp = async (accountNumber, password, fullName) => {
    try {
      const response = await api.post('/auth/register', {
        account_number: accountNumber,
        password,
        full_name: fullName,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'فشل إنشاء الحساب';
    }
  };

  const signIn = async (accountNumber, password) => {
    try {
      const response = await api.post('/auth/login', {
        account_number: accountNumber,
        password,
      });

      const { access_token, user: userData } = response.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'فشل تسجيل الدخول';
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
